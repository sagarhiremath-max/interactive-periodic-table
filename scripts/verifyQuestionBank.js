import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = path.resolve(process.cwd(), 'data/questions.db');

if (!fs.existsSync(DB_PATH)) {
  console.error('FATAL: Database not found at ' + DB_PATH);
  process.exit(1);
}

const db = new DatabaseSync(DB_PATH);

console.log('========================================================');
console.log('AUDITING QUIZ DATABASE: data/questions.db');
console.log('========================================================');

// 1. Basic counts
const totalRow = db.prepare('SELECT count(*) as total FROM questions').get();
const total = totalRow.total;
console.log(`Total questions stored: ${total}`);

// 2. ID uniqueness
const uniqueIdsRow = db.prepare('SELECT count(DISTINCT id) as unique_ids FROM questions').get();
console.log(`Unique Question IDs: ${uniqueIdsRow.unique_ids}`);

// 3. Question text uniqueness
const uniqueTextRow = db.prepare('SELECT count(DISTINCT lower(trim(question))) as unique_text FROM questions').get();
console.log(`Unique Question Texts (normalized): ${uniqueTextRow.unique_text}`);

// 4. Hash uniqueness
const uniqueHashRow = db.prepare('SELECT count(DISTINCT hash) as unique_hash FROM questions').get();
console.log(`Unique Hashes: ${uniqueHashRow.unique_hash}`);

// 5. Duplicate search
const dupes = db.prepare(`
  SELECT lower(trim(question)) as q_text, count(*) as c
  FROM questions
  GROUP BY lower(trim(question))
  HAVING count(*) > 1
  LIMIT 10
`).all();

if (dupes.length > 0) {
  console.error(`FAILED: Found duplicates! Sample:`, dupes);
} else {
  console.log(`✓ Zero duplicates found across all ${total} questions.`);
}

// 6. Incomplete / null fields
const nullChecks = db.prepare(`
  SELECT count(*) as bad_count
  FROM questions
  WHERE id IS NULL OR trim(id) = ''
     OR topic IS NULL OR trim(topic) = ''
     OR difficulty IS NULL OR trim(difficulty) = ''
     OR format IS NULL OR trim(format) = ''
     OR question IS NULL OR trim(question) = ''
     OR options IS NULL OR trim(options) = ''
     OR correct_answer IS NULL OR trim(correct_answer) = ''
     OR explanation IS NULL OR trim(explanation) = ''
     OR hash IS NULL OR trim(hash) = ''
`).get();

console.log(`Incomplete / Null records count: ${nullChecks.bad_count}`);

// 7. Validate all rows (options, correct answer presence, option uniqueness)
console.log('Performing deep row-by-row validation of all 100,000 questions...');
const stmt = db.prepare('SELECT id, question, options, correct_answer, explanation, topic, difficulty, format FROM questions');
const rows = stmt.all();

let invalidOptionsCount = 0;
let answerNotInOptionsCount = 0;
let duplicateOptionsInQuestionCount = 0;
let shortExplanationCount = 0;

for (const r of rows) {
  let opts = [];
  try {
    opts = JSON.parse(r.options);
  } catch {
    invalidOptionsCount++;
    continue;
  }

  if (!Array.isArray(opts) || opts.length < 2) {
    invalidOptionsCount++;
  }

  const optSet = new Set(opts);
  if (optSet.size !== opts.length) {
    duplicateOptionsInQuestionCount++;
  }

  let ans = '';
  try {
    ans = JSON.parse(r.correct_answer);
  } catch {
    ans = r.correct_answer;
  }

  if (Array.isArray(ans)) {
    if (!ans.every(a => optSet.has(a))) {
      answerNotInOptionsCount++;
    }
  } else {
    if (!optSet.has(ans)) {
      answerNotInOptionsCount++;
    }
  }

  if (!r.explanation || r.explanation.trim().length < 5) {
    shortExplanationCount++;
  }
}

console.log(`- Invalid options format: ${invalidOptionsCount}`);
console.log(`- Questions with duplicate choices inside options: ${duplicateOptionsInQuestionCount}`);
console.log(`- Correct answer NOT in options list: ${answerNotInOptionsCount}`);
console.log(`- Incomplete explanations (<5 chars): ${shortExplanationCount}`);

// 8. Breakdown by Topic
console.log('\n--- Breakdown by Topic ---');
const topicRows = db.prepare('SELECT topic, count(*) as count FROM questions GROUP BY topic ORDER BY count DESC').all();
for (const tr of topicRows) {
  console.log(`  ${tr.topic.padEnd(42)}: ${tr.count}`);
}

// 9. Breakdown by Difficulty
console.log('\n--- Breakdown by Difficulty ---');
const diffRows = db.prepare('SELECT difficulty, count(*) as count FROM questions GROUP BY difficulty ORDER BY count DESC').all();
for (const dr of diffRows) {
  console.log(`  ${dr.difficulty.padEnd(20)}: ${dr.count}`);
}

// 10. Breakdown by Format
console.log('\n--- Breakdown by Format ---');
const formatRows = db.prepare('SELECT format, count(*) as count FROM questions GROUP BY format ORDER BY count DESC').all();
for (const fr of formatRows) {
  console.log(`  ${fr.format.padEnd(25)}: ${fr.count}`);
}

console.log('========================================================');
if (total === 100000 && uniqueTextRow.unique_text === 100000 && invalidOptionsCount === 0 && answerNotInOptionsCount === 0 && duplicateOptionsInQuestionCount === 0) {
  console.log('AUDIT PASSED: EXACTLY 100,000 UNIQUE, VALIDATED, USABLE QUESTIONS CONFIRMED.');
} else {
  console.error('AUDIT FAILED!');
  process.exit(1);
}
console.log('========================================================');
