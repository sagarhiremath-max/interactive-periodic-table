import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = path.resolve(process.cwd(), 'data/questions.db');

let db = null;

function getDb() {
  if (!db) {
    if (!fs.existsSync(DB_PATH)) {
      throw new Error('Questions database not found at ' + DB_PATH);
    }
    db = new DatabaseSync(DB_PATH);
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA cache_size = -32000;');
  }
  return db;
}

export function getQuizStats() {
  const database = getDb();
  const totalRow = database.prepare('SELECT count(*) as total FROM questions').get();

  const topicRows = database.prepare('SELECT topic, count(*) as count FROM questions GROUP BY topic').all();
  const byTopic = {};
  for (const r of topicRows) {
    byTopic[r.topic] = r.count;
  }

  const diffRows = database.prepare('SELECT difficulty, count(*) as count FROM questions GROUP BY difficulty').all();
  const byDifficulty = {};
  for (const r of diffRows) {
    byDifficulty[r.difficulty] = r.count;
  }

  const formatRows = database.prepare('SELECT format, count(*) as count FROM questions GROUP BY format').all();
  const byFormat = {};
  for (const r of formatRows) {
    byFormat[r.format] = r.count;
  }

  return {
    totalQuestions: totalRow.total,
    byTopic,
    byDifficulty,
    byFormat
  };
}

export function getQuizTopics() {
  const database = getDb();
  const rows = database.prepare('SELECT topic, count(*) as count FROM questions GROUP BY topic ORDER BY topic ASC').all();
  return rows;
}

export function getQuestions({
  count = 10,
  topic = 'all',
  difficulty = 'all',
  format = 'all',
  excludeIds = []
}) {
  const database = getDb();
  const limit = Math.min(100, Math.max(1, parseInt(count) || 10));

  let whereClauses = [];
  let params = [];

  if (topic && topic !== 'all') {
    whereClauses.push('topic = ?');
    params.push(topic);
  }

  if (difficulty && difficulty !== 'all') {
    whereClauses.push('difficulty = ?');
    params.push(difficulty);
  }

  if (format && format !== 'all') {
    whereClauses.push('format = ?');
    params.push(format);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // Get matching IDs
  const idQuery = `SELECT id FROM questions ${whereSql}`;
  const allMatching = database.prepare(idQuery).all(...params);

  if (allMatching.length === 0) {
    return { questions: [], totalAvailable: 0 };
  }

  // Filter out excludeIds if provided
  const excludeSet = new Set(excludeIds);
  let available = allMatching.map(r => r.id).filter(id => !excludeSet.has(id));
  if (available.length < limit) {
    available = allMatching.map(r => r.id);
  }

  // Random sample
  const sampledIds = [];
  const selectedIndices = new Set();
  const sampleCount = Math.min(limit, available.length);

  while (sampledIds.length < sampleCount) {
    const randIdx = Math.floor(Math.random() * available.length);
    if (!selectedIndices.has(randIdx)) {
      selectedIndices.add(randIdx);
      sampledIds.push(available[randIdx]);
    }
  }

  // Fetch full records
  const placeholders = sampledIds.map(() => '?').join(', ');
  const fetchQuery = `
    SELECT id, topic, difficulty, format, question, options, correct_answer, explanation, formula
    FROM questions
    WHERE id IN (${placeholders})
  `;

  const rows = database.prepare(fetchQuery).all(...sampledIds);

  const questions = rows.map(r => {
    let opts = [];
    try {
      opts = JSON.parse(r.options);
    } catch {
      opts = [r.options];
    }

    let correct = '';
    try {
      correct = JSON.parse(r.correct_answer);
    } catch {
      correct = r.correct_answer;
    }

    return {
      id: r.id,
      topic: r.topic,
      difficulty: r.difficulty,
      format: r.format,
      question: r.question,
      options: opts,
      correctAnswer: correct,
      explanation: r.explanation,
      formula: r.formula
    };
  });

  return {
    questions,
    totalAvailable: allMatching.length
  };
}
