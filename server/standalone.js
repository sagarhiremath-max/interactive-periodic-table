import http from 'node:http';
import { handleFeedbackApi } from './feedbackRouter.js';

const PORT = process.env.PORT || 3001;

const server = http.createServer(async (req, res) => {
  try {
    const handled = await handleFeedbackApi(req, res);
    if (!handled) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  } catch (err) {
    console.error('Server error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

server.listen(PORT, () => {
  console.log(`Feedback API standalone server listening on http://localhost:${PORT}`);
});
