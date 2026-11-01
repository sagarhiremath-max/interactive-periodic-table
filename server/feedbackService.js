import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { sendFeedbackNotification, DEFAULT_NOTIFICATION_EMAIL } from './emailService.js';

// Configuration
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'feedback.db');
const ADMIN_SECRET = process.env.ADMIN_SECRET || process.env.ADMIN_KEY || 'admin123';

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize SQLite database
const db = new DatabaseSync(DB_PATH);

// Create table and indexes
db.exec(`
  CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    email TEXT,
    page_url TEXT NOT NULL,
    page_title TEXT,
    browser_info TEXT,
    screenshot_data TEXT,
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TEXT NOT NULL,
    ip_address TEXT,
    admin_notes TEXT DEFAULT '',
    email_status TEXT DEFAULT 'pending',
    email_sent_at TEXT,
    email_error TEXT,
    email_recipient TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
  CREATE INDEX IF NOT EXISTS idx_feedback_category ON feedback(category);
`);

// Run migrations on existing databases to ensure columns exist
try {
  db.exec("ALTER TABLE feedback ADD COLUMN email_status TEXT DEFAULT 'pending'");
} catch {}
try {
  db.exec("ALTER TABLE feedback ADD COLUMN email_sent_at TEXT");
} catch {}
try {
  db.exec("ALTER TABLE feedback ADD COLUMN email_error TEXT");
} catch {}
try {
  db.exec("ALTER TABLE feedback ADD COLUMN email_recipient TEXT");
} catch {}

// Valid feedback categories
export const VALID_CATEGORIES = [
  'Incorrect Information',
  'Typo / Spelling Mistake',
  'Technical Bug',
  'Missing Information',
  'Broken Link',
  'Suggestion',
  'Other'
];

export const VALID_STATUSES = ['Pending', 'Reviewed', 'Resolved'];

// In-memory rate limiter: max 5 submissions per 10 minutes per IP
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_SUBMISSIONS_PER_WINDOW = 5;
const ipSubmissionsMap = new Map();

function cleanOldRateLimits() {
  const now = Date.now();
  for (const [ip, timestamps] of ipSubmissionsMap.entries()) {
    const valid = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
    if (valid.length === 0) {
      ipSubmissionsMap.delete(ip);
    } else {
      ipSubmissionsMap.set(ip, valid);
    }
  }
}

// In-memory admin session tokens (valid for 24 hours)
const adminSessions = new Map(); // token -> { createdAt: number }
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function cleanOldSessions() {
  const now = Date.now();
  for (const [token, data] of adminSessions.entries()) {
    if (now - data.createdAt > SESSION_TTL_MS) {
      adminSessions.delete(token);
    }
  }
}

// Sanitize string to prevent XSS / malicious injection
function sanitizeText(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>]/g, '') // strip < and >
    .trim();
}

/**
 * Check if IP is rate-limited
 */
export function checkRateLimit(ip) {
  cleanOldRateLimits();
  const now = Date.now();
  const timestamps = ipSubmissionsMap.get(ip) || [];
  const recent = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= MAX_SUBMISSIONS_PER_WINDOW) {
    return false;
  }

  recent.push(now);
  ipSubmissionsMap.set(ip, recent);
  return true;
}

/**
 * Admin authentication verification
 */
export function verifyAdminToken(token) {
  if (!token) return false;
  // Direct secret match
  if (token === ADMIN_SECRET) return true;
  // Session token match
  cleanOldSessions();
  const session = adminSessions.get(token);
  return Boolean(session && Date.now() - session.createdAt < SESSION_TTL_MS);
}

/**
 * Admin login
 */
export function adminLogin(password) {
  if (!password || password !== ADMIN_SECRET) {
    return { success: false, error: 'Invalid admin credentials' };
  }
  const token = crypto.randomBytes(32).toString('hex');
  adminSessions.set(token, { createdAt: Date.now() });
  return { success: true, token };
}

/**
 * Save new feedback submission
 */
export function createFeedback(data, ip = '127.0.0.1') {
  // Honeypot spam check
  if (data.website || data.honeypot || data.company) {
    throw new Error('Bot submission detected');
  }

  // Rate limiting
  if (!checkRateLimit(ip)) {
    const err = new Error('Rate limit exceeded. Please wait before submitting another report.');
    err.status = 429;
    throw err;
  }

  // Category validation
  const category = (data.category || '').trim();
  if (!VALID_CATEGORIES.includes(category)) {
    const err = new Error(`Invalid category. Allowed: ${VALID_CATEGORIES.join(', ')}`);
    err.status = 400;
    throw err;
  }

  // Description validation
  const description = sanitizeText(data.description);
  if (!description || description.length < 5) {
    const err = new Error('Description must be at least 5 characters long.');
    err.status = 400;
    throw err;
  }
  if (description.length > 5000) {
    const err = new Error('Description cannot exceed 5000 characters.');
    err.status = 400;
    throw err;
  }

  // Email validation (optional)
  let email = null;
  if (data.email && typeof data.email === 'string' && data.email.trim()) {
    const trimmedEmail = data.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      const err = new Error('Please provide a valid email address.');
      err.status = 400;
      throw err;
    }
    if (trimmedEmail.length > 254) {
      const err = new Error('Email address is too long.');
      err.status = 400;
      throw err;
    }
    email = sanitizeText(trimmedEmail);
  }

  // Page URL and Title
  const pageUrl = sanitizeText(data.page_url || data.pageUrl || windowUrlFallback(data));
  const pageTitle = sanitizeText(data.page_title || data.pageTitle || 'Periodic Table');

  // Browser info
  let browserInfo = '';
  if (typeof data.browser_info === 'object' || typeof data.browserInfo === 'object') {
    browserInfo = JSON.stringify(data.browser_info || data.browserInfo);
  } else if (typeof data.browser_info === 'string') {
    browserInfo = sanitizeText(data.browser_info);
  }

  // Screenshot validation (optional)
  let screenshotData = null;
  if (data.screenshot_data || data.screenshotData) {
    const rawScreenshot = data.screenshot_data || data.screenshotData;
    if (typeof rawScreenshot === 'string') {
      if (rawScreenshot.startsWith('data:image/')) {
        // Base64 limit check ~7MB string ~= 5MB binary
        if (rawScreenshot.length > 7 * 1024 * 1024) {
          const err = new Error('Screenshot file size must be less than 5MB.');
          err.status = 400;
          throw err;
        }
        screenshotData = rawScreenshot;
      }
    }
  }

  const id = `fb_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const createdAt = new Date().toISOString();
  const status = 'Pending';
  const initialEmailStatus = 'pending';

  const stmt = db.prepare(`
    INSERT INTO feedback (
      id, category, description, email, page_url, page_title,
      browser_info, screenshot_data, status, created_at, ip_address, admin_notes,
      email_status, email_recipient
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Step 1: ALWAYS SAVE FEEDBACK TO DATABASE FIRST
  stmt.run(
    id,
    category,
    description,
    email,
    pageUrl,
    pageTitle,
    browserInfo,
    screenshotData,
    status,
    createdAt,
    ip,
    '',
    initialEmailStatus,
    DEFAULT_NOTIFICATION_EMAIL
  );

  const savedRecord = {
    id,
    category,
    description,
    email,
    page_url: pageUrl,
    page_title: pageTitle,
    browser_info: browserInfo,
    has_screenshot: Boolean(screenshotData),
    status,
    created_at: createdAt,
    email_status: initialEmailStatus,
    email_recipient: DEFAULT_NOTIFICATION_EMAIL
  };

  // Step 2: SEND EMAIL NOTIFICATION ASYNCHRONOUSLY
  // Guaranteed non-blocking: feedback is already safe in database
  sendFeedbackNotification(savedRecord, screenshotData)
    .then((emailResult) => {
      const emailStatus = emailResult.success
        ? (emailResult.deliveryStatus || 'sent')
        : 'failed';
      const emailSentAt = emailResult.success ? new Date().toISOString() : null;
      const emailError = emailResult.error || null;
      const emailRecipient = emailResult.recipient || DEFAULT_NOTIFICATION_EMAIL;

      try {
        db.prepare(`
          UPDATE feedback
          SET email_status = ?, email_sent_at = ?, email_error = ?, email_recipient = ?
          WHERE id = ?
        `).run(emailStatus, emailSentAt, emailError, emailRecipient, id);
      } catch (dbErr) {
        console.error('[feedbackService] Failed to update email delivery status in DB:', dbErr.message);
      }
    })
    .catch((err) => {
      console.error('[feedbackService] Unexpected error sending email notification:', err.message);
      try {
        db.prepare('UPDATE feedback SET email_status = ?, email_error = ? WHERE id = ?')
          .run('failed', err.message, id);
      } catch {}
    });

  return savedRecord;
}

function windowUrlFallback(data) {
  return typeof data?.url === 'string' ? data.url : 'http://localhost:5174/';
}

/**
 * Get feedback list with optional filters
 */
export function getFeedbackList({ category, status, search, limit = 100, offset = 0 } = {}) {
  let query = "SELECT id, category, description, email, page_url, page_title, browser_info, status, created_at, admin_notes, email_status, email_sent_at, email_error, email_recipient, CASE WHEN screenshot_data IS NOT NULL AND screenshot_data != '' THEN 1 ELSE 0 END AS has_screenshot FROM feedback WHERE 1=1";
  const params = [];

  if (category && category !== 'all') {
    query += ' AND category = ?';
    params.push(category);
  }

  if (status && status !== 'all') {
    query += ' AND status = ?';
    params.push(status);
  }

  if (search && search.trim()) {
    const s = `%${search.trim()}%`;
    query += ' AND (description LIKE ? OR email LIKE ? OR page_url LIKE ? OR page_title LIKE ?)';
    params.push(s, s, s, s);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit) || 100, Number(offset) || 0);

  const stmt = db.prepare(query);
  const rows = stmt.all(...params);

  // Parse browser_info JSON for cleaner client consumption
  return rows.map(row => {
    let parsedBrowser = null;
    try {
      if (row.browser_info) parsedBrowser = JSON.parse(row.browser_info);
    } catch {
      parsedBrowser = row.browser_info;
    }
    return {
      ...row,
      browser_info: parsedBrowser,
      has_screenshot: Boolean(row.has_screenshot)
    };
  });
}

/**
 * Get a single feedback by ID (including full screenshot)
 */
export function getFeedbackById(id) {
  const stmt = db.prepare('SELECT * FROM feedback WHERE id = ?');
  const row = stmt.get(id);
  if (!row) return null;

  let parsedBrowser = null;
  try {
    if (row.browser_info) parsedBrowser = JSON.parse(row.browser_info);
  } catch {
    parsedBrowser = row.browser_info;
  }

  return {
    ...row,
    browser_info: parsedBrowser
  };
}

/**
 * Update feedback status or admin notes
 */
export function updateFeedback(id, { status, admin_notes }) {
  const existing = getFeedbackById(id);
  if (!existing) {
    const err = new Error('Feedback not found');
    err.status = 404;
    throw err;
  }

  const updates = [];
  const params = [];

  if (status !== undefined) {
    if (!VALID_STATUSES.includes(status)) {
      const err = new Error(`Invalid status. Allowed: ${VALID_STATUSES.join(', ')}`);
      err.status = 400;
      throw err;
    }
    updates.push('status = ?');
    params.push(status);
  }

  if (admin_notes !== undefined) {
    updates.push('admin_notes = ?');
    params.push(sanitizeText(admin_notes));
  }

  if (updates.length === 0) {
    return existing;
  }

  params.push(id);
  const query = `UPDATE feedback SET ${updates.join(', ')} WHERE id = ?`;
  db.prepare(query).run(...params);

  return getFeedbackById(id);
}

/**
 * Delete feedback entry
 */
export function deleteFeedback(id) {
  const existing = getFeedbackById(id);
  if (!existing) {
    const err = new Error('Feedback not found');
    err.status = 404;
    throw err;
  }
  db.prepare('DELETE FROM feedback WHERE id = ?').run(id);
  return { success: true, id };
}

/**
 * Get aggregated statistics for admin dashboard
 */
export function getFeedbackStats() {
  const total = db.prepare('SELECT COUNT(*) as count FROM feedback').get().count;
  const pending = db.prepare("SELECT COUNT(*) as count FROM feedback WHERE status = 'Pending'").get().count;
  const reviewed = db.prepare("SELECT COUNT(*) as count FROM feedback WHERE status = 'Reviewed'").get().count;
  const resolved = db.prepare("SELECT COUNT(*) as count FROM feedback WHERE status = 'Resolved'").get().count;

  const categoryCounts = db.prepare(`
    SELECT category, COUNT(*) as count
    FROM feedback
    GROUP BY category
    ORDER BY count DESC
  `).all();

  return {
    total,
    pending,
    reviewed,
    resolved,
    byCategory: categoryCounts
  };
}

/**
 * Manually retry sending email notification for a feedback entry
 */
export async function retryEmailNotification(id) {
  const feedback = getFeedbackById(id);
  if (!feedback) {
    const err = new Error('Feedback not found');
    err.status = 404;
    throw err;
  }

  const emailResult = await sendFeedbackNotification(feedback, feedback.screenshot_data);
  const emailStatus = emailResult.success
    ? (emailResult.deliveryStatus || 'sent')
    : 'failed';
  const emailSentAt = emailResult.success ? new Date().toISOString() : null;
  const emailError = emailResult.error || null;
  const emailRecipient = emailResult.recipient || DEFAULT_NOTIFICATION_EMAIL;

  db.prepare(`
    UPDATE feedback
    SET email_status = ?, email_sent_at = ?, email_error = ?, email_recipient = ?
    WHERE id = ?
  `).run(emailStatus, emailSentAt, emailError, emailRecipient, id);

  return {
    ...getFeedbackById(id),
    emailResult
  };
}

/**
 * Send a test email directly to verify email integration
 */
export async function testSendEmail(targetRecipient = DEFAULT_NOTIFICATION_EMAIL) {
  const dummyFeedback = {
    id: `test_${Date.now()}`,
    category: 'Technical Bug',
    description: 'This is a test feedback notification to verify that email delivery to ' + targetRecipient + ' is functioning properly.',
    email: 'tester@elementslab.internal',
    page_url: 'http://localhost:5174/test',
    page_title: 'Email Integration Test Verification',
    browser_info: { browser: 'Chrome / Elements Lab Test Agent', os: 'Windows 11', screen: '1920x1080' },
    created_at: new Date().toISOString(),
    has_screenshot: false
  };

  return await sendFeedbackNotification(dummyFeedback);
}
