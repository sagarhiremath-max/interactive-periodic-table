// Master Generator & Importer for exactly 100,000 Chemistry Questions into SQLite
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { TOPICS, createPRNG } from './questionGenerator/generatorEngine.js';
import { generatePart1 } from './questionGenerator/expandedPart1.js';
import { generatePart2 } from './questionGenerator/expandedPart2.js';
import { generatePart3 } from './questionGenerator/expandedPart3.js';
import { generatePart4 } from './questionGenerator/expandedPart4.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'questions.db');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Clean previous DB if any
if (fs.existsSync(DB_PATH)) {
  try {
    fs.unlinkSync(DB_PATH);
  } catch {}
}

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA synchronous = NORMAL;');
db.exec('PRAGMA cache_size = -64000;');

db.exec(`
  CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    topic TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    format TEXT NOT NULL,
    question TEXT NOT NULL,
    options TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    explanation TEXT NOT NULL,
    formula TEXT,
    hash TEXT UNIQUE NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic);
  CREATE INDEX IF NOT EXISTS idx_questions_diff ON questions(difficulty);
  CREATE INDEX IF NOT EXISTS idx_questions_format ON questions(format);
  CREATE INDEX IF NOT EXISTS idx_questions_topic_diff ON questions(topic, difficulty);
`);

const insertStmt = db.prepare(`
  INSERT INTO questions (id, topic, difficulty, format, question, options, correct_answer, explanation, formula, hash)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

console.log('======================================================');
console.log('ELEMENTS LAB: GENERATING & IMPORTING 100,000 QUESTIONS');
console.log('======================================================');

const TOTAL_TARGET = 100000;
const rng = createPRNG(987654321);
const existingHashes = new Set();

let totalImported = 0;
let totalDuplicatesRejected = 0;
let totalInvalidRejected = 0;
const topicCounts = {};
const diffCounts = {};
const formatCounts = {};

const startTime = Date.now();

for (let topicIdx = 0; topicIdx < TOPICS.length; topicIdx++) {
  const topicName = TOPICS[topicIdx];
  // 12 topics get 3,572 questions, 16 topics get 3,571 questions -> exactly 100,000!
  const targetForTopic = topicIdx < 12 ? 3572 : 3571;
  topicCounts[topicName] = 0;

  let topicQuestions = [];
  const startId = totalImported + 1;

  if (topicIdx < 7) {
    topicQuestions = generatePart1(topicName, targetForTopic, rng, existingHashes, startId);
  } else if (topicIdx < 14) {
    topicQuestions = generatePart2(topicName, targetForTopic, rng, existingHashes, startId);
  } else if (topicIdx < 21) {
    topicQuestions = generatePart3(topicName, targetForTopic, rng, existingHashes, startId);
  } else {
    topicQuestions = generatePart4(topicName, targetForTopic, rng, existingHashes, startId);
  }

  db.exec('BEGIN TRANSACTION');
  for (const q of topicQuestions) {
    // Validate
    if (!q.question || q.question.trim().length === 0) {
      totalInvalidRejected++;
      continue;
    }
    if (!Array.isArray(q.options) || q.options.length < 2) {
      totalInvalidRejected++;
      continue;
    }
    const optSet = new Set(q.options);
    if (optSet.size !== q.options.length) {
      totalInvalidRejected++;
      continue;
    }
    if (!optSet.has(q.correctAnswer)) {
      totalInvalidRejected++;
      continue;
    }
    if (!q.explanation || q.explanation.trim().length === 0) {
      totalInvalidRejected++;
      continue;
    }

    try {
      insertStmt.run(
        q.id,
        q.topic,
        q.difficulty,
        q.format,
        q.question,
        JSON.stringify(q.options),
        JSON.stringify(q.correctAnswer),
        q.explanation,
        q.formula || null,
        q.hash
      );

      totalImported++;
      topicCounts[topicName]++;
      diffCounts[q.difficulty] = (diffCounts[q.difficulty] || 0) + 1;
      formatCounts[q.format] = (formatCounts[q.format] || 0) + 1;
    } catch (err) {
      if (err.message && err.message.includes('UNIQUE constraint')) {
        totalDuplicatesRejected++;
      } else {
        totalInvalidRejected++;
      }
    }
  }
  db.exec('COMMIT');

  console.log(`[${String(topicIdx + 1).padStart(2, '0')}/28] ${topicName}: ${topicCounts[topicName]} questions imported (Cumulative: ${totalImported})`);
}

const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);

// Verification query
const finalCountRow = db.prepare('SELECT count(*) as count FROM questions').get();
const integrityRow = db.prepare('PRAGMA integrity_check').get();

console.log('======================================================');
console.log('GENERATION & IMPORT COMPLETE');
console.log(`Total questions in database: ${finalCountRow.count}`);
console.log(`Database integrity: ${integrityRow.integrity_check}`);
console.log(`Time elapsed: ${elapsedSec} seconds`);
console.log(`Duplicates rejected: ${totalDuplicatesRejected}`);
console.log(`Invalid rejected: ${totalInvalidRejected}`);
console.log('======================================================');

// Save a summary JSON report
const summaryReport = {
  totalQuestions: finalCountRow.count,
  targetReached: finalCountRow.count === TOTAL_TARGET,
  timeElapsedSeconds: parseFloat(elapsedSec),
  duplicatesRejected: totalDuplicatesRejected,
  invalidRejected: totalInvalidRejected,
  byTopic: topicCounts,
  byDifficulty: diffCounts,
  byFormat: formatCounts
};

fs.writeFileSync(path.join(DATA_DIR, 'quiz_summary.json'), JSON.stringify(summaryReport, null, 2), 'utf8');
console.log('Summary report saved to data/quiz_summary.json');
