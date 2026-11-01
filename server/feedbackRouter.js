import {
  createFeedback,
  getFeedbackList,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  getFeedbackStats,
  adminLogin,
  verifyAdminToken,
  retryEmailNotification,
  testSendEmail,
  VALID_CATEGORIES,
  VALID_STATUSES
} from './feedbackService.js';

/**
 * Helper to read JSON request body safely
 */
async function readJsonBody(req, maxSizeBytes = 10 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > maxSizeBytes) {
        const err = new Error('Payload too large (maximum 10MB allowed)');
        err.status = 413;
        reject(err);
      }
    });
    req.on('end', () => {
      if (!body.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        const err = new Error('Malformed JSON body');
        err.status = 400;
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

/**
 * Send JSON response helper
 */
function sendJson(res, statusCode, data) {
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = statusCode;
  res.end(JSON.stringify(data));
}

/**
 * Extract client IP
 */
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const list = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return list.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || '127.0.0.1';
}

/**
 * Extract auth token from request
 */
function getAuthToken(req) {
  const authHeader = req.headers['authorization'] || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return req.headers['x-admin-key'] || req.headers['x-admin-secret'] || '';
}

/**
 * Handle HTTP request for /api/feedback
 * Returns true if handled, false if not an API route
 */
export async function handleFeedbackApi(req, res) {
  const urlObj = new URL(req.url, 'http://localhost');
  const pathname = urlObj.pathname;

  // Only handle /api/feedback routes
  if (!pathname.startsWith('/api/feedback')) {
    return false;
  }

  // CORS headers in case needed
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }

  try {
    // 1. POST /api/feedback/login
    if (pathname === '/api/feedback/login' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const result = adminLogin(body.password);
      if (!result.success) {
        sendJson(res, 401, { error: result.error });
        return true;
      }
      sendJson(res, 200, { success: true, token: result.token });
      return true;
    }

    // 2. GET /api/feedback/stats (Admin protected)
    if (pathname === '/api/feedback/stats' && req.method === 'GET') {
      const token = getAuthToken(req);
      if (!verifyAdminToken(token)) {
        sendJson(res, 401, { error: 'Unauthorized: Admin authentication required' });
        return true;
      }
      const stats = getFeedbackStats();
      sendJson(res, 200, {
        stats,
        validCategories: VALID_CATEGORIES,
        validStatuses: VALID_STATUSES
      });
      return true;
    }

    // 2b. POST /api/feedback/test-email (Admin protected: send verification test email)
    if (pathname === '/api/feedback/test-email' && req.method === 'POST') {
      const token = getAuthToken(req);
      if (!verifyAdminToken(token)) {
        sendJson(res, 401, { error: 'Unauthorized: Admin authentication required' });
        return true;
      }
      const body = await readJsonBody(req);
      const testResult = await testSendEmail(body.recipient);
      sendJson(res, 200, {
        success: testResult.success,
        result: testResult
      });
      return true;
    }

    // 3. POST /api/feedback (Public submission with rate limiting)
    if (pathname === '/api/feedback' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const ip = getClientIp(req);
      const result = createFeedback(body, ip);
      sendJson(res, 201, {
        success: true,
        message: 'Thank you for your feedback! Your report has been submitted successfully. We appreciate your help.',
        feedback: result
      });
      return true;
    }

    // 4. GET /api/feedback (Admin protected list)
    if (pathname === '/api/feedback' && req.method === 'GET') {
      const token = getAuthToken(req);
      if (!verifyAdminToken(token)) {
        sendJson(res, 401, { error: 'Unauthorized: Admin authentication required' });
        return true;
      }
      const category = urlObj.searchParams.get('category');
      const status = urlObj.searchParams.get('status');
      const search = urlObj.searchParams.get('search');
      const limit = urlObj.searchParams.get('limit') || 100;
      const offset = urlObj.searchParams.get('offset') || 0;

      const items = getFeedbackList({ category, status, search, limit, offset });
      sendJson(res, 200, {
        feedback: items,
        total: items.length
      });
      return true;
    }

    // Specific item subroutes: /api/feedback/:id
    const idMatch = pathname.match(/^\/api\/feedback\/([a-zA-Z0-9_-]+)$/);
    if (idMatch) {
      const id = idMatch[1];
      const token = getAuthToken(req);

      // 5. GET /api/feedback/:id (Admin protected: get detail with full screenshot)
      if (req.method === 'GET') {
        if (!verifyAdminToken(token)) {
          sendJson(res, 401, { error: 'Unauthorized: Admin authentication required' });
          return true;
        }
        const item = getFeedbackById(id);
        if (!item) {
          sendJson(res, 404, { error: 'Feedback not found' });
          return true;
        }
        sendJson(res, 200, { feedback: item });
        return true;
      }

      // 6. PATCH /api/feedback/:id (Admin protected: update status or notes)
      if (req.method === 'PATCH') {
        if (!verifyAdminToken(token)) {
          sendJson(res, 401, { error: 'Unauthorized: Admin authentication required' });
          return true;
        }
        const body = await readJsonBody(req);
        const updated = updateFeedback(id, body);
        sendJson(res, 200, {
          success: true,
          feedback: updated
        });
        return true;
      }

      // 7. DELETE /api/feedback/:id (Admin protected: delete)
      if (req.method === 'DELETE') {
        if (!verifyAdminToken(token)) {
          sendJson(res, 401, { error: 'Unauthorized: Admin authentication required' });
          return true;
        }
        const delResult = deleteFeedback(id);
        sendJson(res, 200, delResult);
        return true;
      }

      // 8. POST /api/feedback/:id/retry-email (Admin protected: retry sending email)
      if (req.method === 'POST') {
        if (!verifyAdminToken(token)) {
          sendJson(res, 401, { error: 'Unauthorized: Admin authentication required' });
          return true;
        }
        const retryResult = await retryEmailNotification(id);
        sendJson(res, 200, {
          success: retryResult.emailResult.success,
          feedback: retryResult
        });
        return true;
      }
    }

    // If route matches /api/feedback but unsupported method/path
    sendJson(res, 404, { error: `Endpoint ${req.method} ${pathname} not found` });
    return true;
  } catch (err) {
    console.error('API Error:', err);
    const statusCode = err.status || 500;
    sendJson(res, statusCode, {
      error: err.message || 'An internal server error occurred'
    });
    return true;
  }
}
