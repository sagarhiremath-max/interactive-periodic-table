import fs from 'node:fs';
import path from 'node:path';
import tls from 'node:tls';

// 1. Auto-load .env file if present
export function reloadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
          process.env[key] = val;
        }
      }
    }
  } catch (err) {
    console.warn('[emailService] Warning loading .env:', err.message);
  }
}

reloadEnv();

// Target recipient address
export const DEFAULT_NOTIFICATION_EMAIL = 'sagarhiremath025@gmail.com';

/**
 * Format browser info object or string into readable HTML summary
 */
function formatBrowserInfoHtml(browserInfo) {
  if (!browserInfo) return '<span style="color: #64748b;">Not provided</span>';

  let data = browserInfo;
  if (typeof browserInfo === 'string') {
    try {
      data = JSON.parse(browserInfo);
    } catch {
      return `<code style="font-size: 12px; color: #cbd5e1; word-break: break-all;">${escapeHtml(browserInfo)}</code>`;
    }
  }

  if (typeof data !== 'object' || data === null) {
    return `<code style="font-size: 12px; color: #cbd5e1; word-break: break-all;">${escapeHtml(String(data))}</code>`;
  }

  const items = [];
  if (data.browser) items.push(`<strong>Browser:</strong> ${escapeHtml(data.browser)}`);
  if (data.os) items.push(`<strong>OS:</strong> ${escapeHtml(data.os)}`);
  if (data.device) items.push(`<strong>Device:</strong> ${escapeHtml(data.device)}`);
  if (data.screen) items.push(`<strong>Screen:</strong> ${escapeHtml(data.screen)}`);
  if (data.userAgent && !data.browser) {
    items.push(`<strong>User Agent:</strong> ${escapeHtml(data.userAgent)}`);
  }

  if (items.length === 0) {
    return `<code style="font-size: 12px; color: #cbd5e1; word-break: break-all;">${escapeHtml(JSON.stringify(data))}</code>`;
  }

  return items.map(item => `<div style="margin-bottom: 4px; color: #cbd5e1; font-size: 13px;">${item}</div>`).join('');
}

/**
 * Basic HTML escaping helper
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Get category accent color for email badge
 */
function getCategoryColor(category) {
  switch (category) {
    case 'Incorrect Information': return { bg: '#451a03', border: '#f97316', text: '#fdba74' };
    case 'Typo / Spelling Mistake': return { bg: '#2e1065', border: '#a855f7', text: '#d8b4fe' };
    case 'Technical Bug': return { bg: '#4c0519', border: '#f43f5e', text: '#fda4af' };
    case 'Missing Information': return { bg: '#172554', border: '#3b82f6', text: '#93c5fd' };
    case 'Broken Link': return { bg: '#3b0764', border: '#d946ef', text: '#f0abfc' };
    case 'Suggestion': return { bg: '#042f2e', border: '#14b8a6', text: '#5eead4' };
    default: return { bg: '#0f172a', border: '#06b6d4', text: '#67e8f9' };
  }
}

/**
 * Generate high quality, responsive HTML email template
 */
export function generateFeedbackEmailHtml(feedback, adminUrl) {
  const catColor = getCategoryColor(feedback.category);
  const formattedDate = new Date(feedback.created_at || Date.now()).toUTCString();
  const userEmail = feedback.email
    ? `<a href="mailto:${escapeHtml(feedback.email)}" style="color: #22d3ee; text-decoration: none; font-weight: 600;">${escapeHtml(feedback.email)}</a>`
    : '<span style="color: #64748b; font-style: italic;">Not provided (Anonymous)</span>';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Elements Lab] New Feedback</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050814; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050814; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Container Card -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #0c1226; border: 1px solid rgba(6, 182, 212, 0.25); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 28px 32px; background: linear-gradient(135deg, #0f172a 0%, #162447 100%); border-bottom: 1px solid rgba(6, 182, 212, 0.3);">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-family: monospace; font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #22d3ee; text-transform: uppercase; margin-bottom: 6px;">
                      ⚛ ELEMENTS LAB • SCIENTIFIC PLATFORM
                    </div>
                    <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                      ELEMENTS LAB - NEW FEEDBACK
                    </h1>
                    <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8;">
                      A user has submitted new feedback on your website.
                    </p>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display: inline-block; padding: 6px 14px; border-radius: 20px; background-color: ${catColor.bg}; border: 1px solid ${catColor.border}; color: ${catColor.text}; font-size: 12px; font-weight: 700; font-family: monospace; text-transform: uppercase;">
                      ${escapeHtml(feedback.category)}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 32px;">
              
              <!-- Description Section -->
              <div style="margin-bottom: 24px;">
                <div style="font-family: monospace; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #38bdf8; margin-bottom: 8px;">
                  USER DESCRIPTION:
                </div>
                <div style="background-color: #070c1d; border: 1px solid #1e293b; border-left: 4px solid #06b6d4; border-radius: 8px; padding: 18px 20px; font-size: 14px; line-height: 1.6; color: #f1f5f9; white-space: pre-wrap;">
${escapeHtml(feedback.description)}
                </div>
              </div>

              <!-- Information Details Grid -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; background-color: #070c1d; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; width: 35%; font-size: 12px; font-family: monospace; color: #94a3b8; text-transform: uppercase;">
                    User Email
                  </td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; font-size: 13px;">
                    ${userEmail}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; font-size: 12px; font-family: monospace; color: #94a3b8; text-transform: uppercase;">
                    Page URL
                  </td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; font-size: 13px;">
                    <a href="${escapeHtml(feedback.page_url)}" target="_blank" rel="noopener noreferrer" style="color: #38bdf8; text-decoration: underline; word-break: break-all;">
                      ${escapeHtml(feedback.page_url)}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; font-size: 12px; font-family: monospace; color: #94a3b8; text-transform: uppercase;">
                    Page Title
                  </td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; font-size: 13px; color: #e2e8f0; font-weight: 500;">
                    ${escapeHtml(feedback.page_title || 'Elements Lab Periodic Table')}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; font-size: 12px; font-family: monospace; color: #94a3b8; text-transform: uppercase;">
                    Submission Time
                  </td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; font-size: 13px; color: #e2e8f0; font-family: monospace;">
                    ${formattedDate}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; font-size: 12px; font-family: monospace; color: #94a3b8; text-transform: uppercase;">
                    Browser / Device
                  </td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b;">
                    ${formatBrowserInfoHtml(feedback.browser_info)}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; font-size: 12px; font-family: monospace; color: #94a3b8; text-transform: uppercase;">
                    Screenshot
                  </td>
                  <td style="padding: 14px 18px; font-size: 13px; color: #e2e8f0;">
                    ${feedback.has_screenshot || feedback.screenshot_data
                      ? '<span style="color: #34d399; font-weight: 600;">✓ Attached to this report</span>'
                      : '<span style="color: #64748b;">None uploaded</span>'}
                  </td>
                </tr>
              </table>

              <!-- Prominent CTA Button -->
              <div style="text-align: center; margin: 32px 0 16px 0;">
                <a href="${escapeHtml(adminUrl)}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 14px 36px; border-radius: 10px; background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: #020617; text-decoration: none; font-size: 14px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; box-shadow: 0 4px 18px rgba(6, 182, 212, 0.45);">
                  VIEW FEEDBACK IN ADMIN DASHBOARD →
                </a>
              </div>

              <div style="text-align: center; font-size: 11px; color: #64748b; font-family: monospace;">
                Feedback ID: <span style="color: #94a3b8;">${escapeHtml(feedback.id)}</span>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #070a18; border-top: 1px solid #1e293b; text-align: center; font-size: 11px; color: #64748b; font-family: monospace;">
              This notification was automatically sent by the Elements Lab Feedback &amp; Mistake Reporting System.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Generate plain text fallback for email clients
 */
export function generateFeedbackEmailText(feedback, adminUrl) {
  return `
[ELEMENTS LAB - NEW USER FEEDBACK]
Category: ${feedback.category}
Date: ${new Date(feedback.created_at || Date.now()).toUTCString()}
Page URL: ${feedback.page_url}
Page Title: ${feedback.page_title}
User Email: ${feedback.email || 'Not provided'}

--- DESCRIPTION ---
${feedback.description}

--- BROWSER / DEVICE ---
${typeof feedback.browser_info === 'object' ? JSON.stringify(feedback.browser_info) : feedback.browser_info || 'Not provided'}

Screenshot: ${feedback.has_screenshot || feedback.screenshot_data ? 'Attached' : 'None'}

View Feedback in Admin Dashboard:
${adminUrl}

Feedback ID: ${feedback.id}
  `.trim();
}

/**
 * Check delivery status of a sent email in Resend
 */
export async function checkResendDeliveryStatus(emailId, apiKey) {
  if (!emailId || !apiKey) return null;
  try {
    const res = await fetch(`https://api.resend.com/emails/${emailId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Send feedback email via REAL Resend API
 */
async function sendViaResend({ apiKey, to, subject, html, text, screenshotData }) {
  const fromEmail = process.env.EMAIL_FROM || 'Elements Lab <onboarding@resend.dev>';

  const payload = {
    from: fromEmail,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    text
  };

  // Attach screenshot if provided
  if (screenshotData && typeof screenshotData === 'string' && screenshotData.startsWith('data:image/')) {
    const parts = screenshotData.split(',');
    if (parts.length === 2) {
      const mimeMatch = parts[0].match(/data:(.*?);base64/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/png';
      const extension = mime.split('/')[1] || 'png';
      payload.attachments = [
        {
          filename: `feedback-screenshot-${Date.now()}.${extension}`,
          content: parts[1]
        }
      ];
    }
  }

  console.log(`[Resend API] Sending email from: "${fromEmail}" to: "${payload.to.join(', ')}"...`);

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const responseText = await response.text();
  let json = {};
  try {
    json = JSON.parse(responseText);
  } catch {
    json = { raw: responseText };
  }

  if (!response.ok) {
    let errorDetail = json.message || json.error || `HTTP ${response.status}: ${responseText}`;
    if (response.status === 401) {
      errorDetail = `Invalid Resend API key (HTTP 401). Please check RESEND_API_KEY in .env. Resend said: ${errorDetail}`;
    } else if (response.status === 403 && errorDetail.includes('domain')) {
      errorDetail = `Resend Domain Authorization Error (HTTP 403): ${errorDetail}. Note: onboarding@resend.dev can only send to your account email (${to}). For custom domains, verify domain DNS records in resend.com.`;
    }
    throw new Error(errorDetail);
  }

  // Check delivery event from Resend
  let deliveryStatus = 'accepted_by_resend';
  try {
    if (json.id) {
      const statusCheck = await checkResendDeliveryStatus(json.id, apiKey);
      if (statusCheck && statusCheck.last_event) {
        deliveryStatus = statusCheck.last_event;
      }
    }
  } catch (err) {
    console.warn('[Resend API] Status check warning:', err.message);
  }

  return {
    success: true,
    provider: 'Resend',
    messageId: json.id,
    deliveryStatus
  };
}

/**
 * Send email directly via Gmail / SMTP over secure TLS (port 465)
 * Built with native Node.js TLS - zero external dependencies required.
 */
function sendViaSmtpTls({ host = 'smtp.gmail.com', port = 465, user, pass, to, subject, html }) {
  return new Promise((resolve, reject) => {
    const cleanPass = pass.replace(/\s+/g, '');
    const cleanUser = user.trim();
    let step = 0;
    let buffer = '';

    console.log(`[SMTP TLS] Connecting to ${host}:${port} for ${to}...`);

    const socket = tls.connect(port, host, { timeout: 15000 }, () => {
      // Connected
    });

    socket.setEncoding('utf8');

    socket.on('data', (chunk) => {
      buffer += chunk;
      if (!buffer.endsWith('\n')) return;

      const line = buffer;
      buffer = '';
      const code = parseInt(line.slice(0, 3), 10);

      try {
        if (step === 0 && code === 220) {
          step = 1;
          socket.write(`EHLO localhost\r\n`);
        } else if (step === 1 && code === 250) {
          if (line.includes('250 ')) {
            step = 2;
            socket.write(`AUTH LOGIN\r\n`);
          }
        } else if (step === 2 && code === 334) {
          step = 3;
          socket.write(`${Buffer.from(cleanUser).toString('base64')}\r\n`);
        } else if (step === 3 && code === 334) {
          step = 4;
          socket.write(`${Buffer.from(cleanPass).toString('base64')}\r\n`);
        } else if (step === 4 && code === 235) {
          step = 5;
          socket.write(`MAIL FROM:<${cleanUser}>\r\n`);
        } else if (step === 5 && code === 250) {
          step = 6;
          socket.write(`RCPT TO:<${to}>\r\n`);
        } else if (step === 6 && code === 250) {
          step = 7;
          socket.write(`DATA\r\n`);
        } else if (step === 7 && code === 354) {
          step = 8;
          const msg = [
            `From: Elements Lab <${cleanUser}>`,
            `To: <${to}>`,
            `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
            `MIME-Version: 1.0`,
            `Content-Type: text/html; charset=UTF-8`,
            `Content-Transfer-Encoding: base64`,
            '',
            Buffer.from(html).toString('base64'),
            '.',
            ''
          ].join('\r\n');
          socket.write(msg);
        } else if (step === 8 && code === 250) {
          step = 9;
          socket.write(`QUIT\r\n`);
          console.log(`[SMTP TLS] ✓ Email successfully accepted by ${host} for delivery to ${to}`);
          resolve({
            success: true,
            provider: `${host} SMTP`,
            messageId: `smtp_${Date.now()}`,
            deliveryStatus: 'delivered'
          });
        } else if (code >= 400) {
          socket.destroy();
          reject(new Error(`SMTP error ${code}: ${line.trim()}`));
        }
      } catch (err) {
        socket.destroy();
        reject(err);
      }
    });

    socket.on('error', (err) => {
      reject(new Error(`SMTP connection error: ${err.message}`));
    });

    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('SMTP connection timed out after 15 seconds'));
    });
  });
}

/**
 * Main dispatcher to send the feedback notification email.
 *
 * REAL DELIVERY ONLY:
 * - Checks RESEND_API_KEY (Resend API)
 * - Checks GMAIL_APP_PASSWORD / SMTP_PASS (Direct TLS SMTP)
 * - If neither is configured, fails explicitly with exact instructions
 */
export async function sendFeedbackNotification(feedback, fullScreenshotData = null) {
  reloadEnv();

  const recipient = (process.env.NOTIFICATION_EMAIL || DEFAULT_NOTIFICATION_EMAIL).trim();
  const baseUrl = process.env.APP_URL || 'http://localhost:5174';
  const adminUrl = `${baseUrl}/admin?id=${encodeURIComponent(feedback.id)}`;
  const subject = `[Elements Lab] New User Feedback - ${feedback.category}`;
  const html = generateFeedbackEmailHtml(feedback, adminUrl);
  const text = generateFeedbackEmailText(feedback, adminUrl);

  const screenshot = fullScreenshotData || feedback.screenshot_data || null;

  console.log(`[Email Notification] Initiating REAL email delivery for feedback ${feedback.id} to ${recipient}...`);

  // Provider 1: Resend API Key
  const resendKey = process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.trim() : '';
  if (resendKey) {
    if (!resendKey.startsWith('re_')) {
      const errorMsg = 'RESEND_API_KEY in .env does not match expected format (must begin with "re_"). Actual key starts with: ' + resendKey.slice(0, 4) + '...';
      console.error(`[Email Notification] ✗ ${errorMsg}`);
      return {
        success: false,
        error: errorMsg,
        provider: 'Resend',
        recipient
      };
    }

    try {
      console.log('[Email Notification] Dispatching via Resend API (https://api.resend.com/emails)...');
      const res = await sendViaResend({
        apiKey: resendKey,
        to: recipient,
        subject,
        html,
        text,
        screenshotData: screenshot
      });

      console.log(`[Email Notification] ✓ Resend accepted message. Email ID: ${res.messageId}, Status: ${res.deliveryStatus}`);
      return {
        success: true,
        provider: 'Resend',
        messageId: res.messageId,
        deliveryStatus: res.deliveryStatus,
        recipient
      };
    } catch (error) {
      console.error(`[Email Notification] ✗ Real Resend delivery failed for ${recipient}:`, error.message);
      return {
        success: false,
        error: error.message,
        provider: 'Resend',
        recipient
      };
    }
  }

  // Provider 2: Gmail SMTP / Custom SMTP Password
  const gmailPass = (process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || '').trim();
  const gmailUser = (process.env.GMAIL_USER || process.env.SMTP_USER || recipient).trim();
  if (gmailPass) {
    const smtpHost = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
    const smtpPort = Number(process.env.SMTP_PORT) || 465;

    try {
      console.log(`[Email Notification] Dispatching via ${smtpHost} TLS...`);
      const res = await sendViaSmtpTls({
        host: smtpHost,
        port: smtpPort,
        user: gmailUser,
        pass: gmailPass,
        to: recipient,
        subject,
        html
      });
      return {
        success: true,
        provider: res.provider,
        messageId: res.messageId,
        deliveryStatus: res.deliveryStatus,
        recipient
      };
    } catch (error) {
      console.error(`[Email Notification] ✗ SMTP delivery failed for ${recipient}:`, error.message);
      return {
        success: false,
        error: error.message,
        provider: 'SMTP',
        recipient
      };
    }
  }

  // Neither configured:
  const errorMsg = 'No email credentials configured in .env. To receive feedback at ' + recipient + ', provide either RESEND_API_KEY=re_... OR GMAIL_APP_PASSWORD=... in your .env file.';
  console.error(`[Email Notification] ✗ ${errorMsg}`);
  return {
    success: false,
    error: errorMsg,
    provider: 'None',
    recipient
  };
}
