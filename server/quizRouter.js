import { getQuizStats, getQuizTopics, getQuestions } from './quizService.js';

export async function handleQuizApi(req, res) {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;

  if (!pathname.startsWith('/api/quiz')) {
    return false;
  }

  // Set CORS and JSON headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }

  try {
    if (req.method === 'GET' && pathname === '/api/quiz/stats') {
      const stats = getQuizStats();
      res.statusCode = 200;
      res.end(JSON.stringify(stats));
      return true;
    }

    if (req.method === 'GET' && pathname === '/api/quiz/topics') {
      const topics = getQuizTopics();
      res.statusCode = 200;
      res.end(JSON.stringify(topics));
      return true;
    }

    if (req.method === 'GET' && pathname === '/api/quiz/questions') {
      const count = parseInt(urlObj.searchParams.get('count') || '10');
      const topic = urlObj.searchParams.get('topic') || 'all';
      const difficulty = urlObj.searchParams.get('difficulty') || 'all';
      const format = urlObj.searchParams.get('format') || 'all';
      const excludeParam = urlObj.searchParams.get('excludeIds') || '';
      const excludeIds = excludeParam ? excludeParam.split(',').filter(Boolean) : [];

      const result = getQuestions({
        count,
        topic,
        difficulty,
        format,
        excludeIds
      });

      res.statusCode = 200;
      res.end(JSON.stringify(result));
      return true;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Quiz API endpoint not found' }));
    return true;
  } catch (err) {
    console.error('Quiz API error:', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message || 'Internal quiz server error' }));
    return true;
  }
}
