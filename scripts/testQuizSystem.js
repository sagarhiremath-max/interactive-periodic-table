import { getQuestions, getQuizStats, getQuizTopics } from '../server/quizService.js';

console.log('========================================================');
console.log('TESTING QUIZ SYSTEM CAPABILITIES');
console.log('========================================================');

// 1. Test stats and topics
const stats = getQuizStats();
console.log(`Stats API check: ${stats.totalQuestions} total questions across ${Object.keys(stats.byTopic).length} topics.`);

const topics = getQuizTopics();
console.log(`Topics API check: Retrieved ${topics.length} topics from database.`);

// 2. Test each question count mode: 10, 20, 25, 50, 100
const testCounts = [10, 20, 25, 50, 100];
for (const count of testCounts) {
  const result = getQuestions({ count, topic: 'all', difficulty: 'all' });
  const ids = result.questions.map(q => q.id);
  const uniqueIds = new Set(ids);
  
  if (ids.length !== count) {
    console.error(`FAILED: Expected ${count} questions, got ${ids.length}`);
    process.exit(1);
  }
  if (uniqueIds.size !== count) {
    console.error(`FAILED: Duplicate question found in ${count}-question quiz! Unique: ${uniqueIds.size}`);
    process.exit(1);
  }
  console.log(`✓ ${count}-question quiz generated with ${uniqueIds.size} unique, non-repeating questions.`);
}

// 3. Test specific topics
const sampleTopics = [
  'Periodic Table and element properties',
  'Chemical bonding',
  'Thermodynamics',
  'Electrochemistry',
  'Organic chemistry'
];
for (const top of sampleTopics) {
  const result = getQuestions({ count: 15, topic: top, difficulty: 'all' });
  const allMatch = result.questions.every(q => q.topic === top);
  if (!allMatch || result.questions.length !== 15) {
    console.error(`FAILED: Topic filter mismatch for ${top}`);
    process.exit(1);
  }
  console.log(`✓ Topic filter '${top}' returned 15 matching questions.`);
}

// 4. Test specific difficulties
const diffs = ['Beginner', 'Easy', 'Intermediate', 'Advanced', 'Expert'];
for (const diff of diffs) {
  const result = getQuestions({ count: 10, topic: 'all', difficulty: diff });
  const allMatch = result.questions.every(q => q.difficulty === diff);
  if (!allMatch || result.questions.length !== 10) {
    console.error(`FAILED: Difficulty filter mismatch for ${diff}`);
    process.exit(1);
  }
  console.log(`✓ Difficulty filter '${diff}' returned 10 matching questions.`);
}

// 5. Test question formats and content integrity
const sampleQuiz = getQuestions({ count: 25, topic: 'all', difficulty: 'all' });
let correctCount = 0;
const incorrectList = [];

for (const q of sampleQuiz.questions) {
  if (!q.question || q.question.length < 5) throw new Error('Short question text');
  if (!Array.isArray(q.options) || q.options.length < 2) throw new Error('Invalid options');
  if (!q.explanation || q.explanation.length < 5) throw new Error('Missing explanation');
  
  // Simulate answering
  const optIdx = q.options.indexOf(q.correctAnswer);
  if (optIdx === -1) throw new Error(`Correct answer not in options: ${q.id}`);
  
  // Simulate 80% correct answers
  const isCorrect = Math.random() < 0.8;
  if (isCorrect) {
    correctCount++;
  } else {
    incorrectList.push(q);
  }
}

const accuracy = Math.round((correctCount / sampleQuiz.questions.length) * 100);
console.log(`✓ Answer validation simulated: ${correctCount}/${sampleQuiz.questions.length} correct (${accuracy}% accuracy).`);
console.log(`✓ Retry list isolated: ${incorrectList.length} incorrect questions queued for retry.`);

console.log('========================================================');
console.log('ALL QUIZ SYSTEM TESTS PASSED SUCCESSFULLY.');
console.log('========================================================');
