import { testSendEmail } from '../server/feedbackService.js';
import { reloadEnv } from '../server/emailService.js';

reloadEnv();

const recipient = process.env.NOTIFICATION_EMAIL || 'sagarhiremath025@gmail.com';
console.log('====================================================');
console.log(`TESTING REAL EMAIL DELIVERY TO: ${recipient}`);
console.log('====================================================');

const resendConfigured = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim());
const gmailConfigured = Boolean(process.env.GMAIL_APP_PASSWORD && process.env.GMAIL_APP_PASSWORD.trim());

console.log(`- RESEND_API_KEY: ${resendConfigured ? '✓ Configured (' + process.env.RESEND_API_KEY.trim().slice(0, 6) + '...)' : '✗ Not configured (blank in .env)'}`);
console.log(`- GMAIL_APP_PASSWORD: ${gmailConfigured ? '✓ Configured' : '✗ Not configured (blank in .env)'}`);
console.log('----------------------------------------------------');

if (!resendConfigured && !gmailConfigured) {
  console.log('STATUS: Email cannot be delivered because no credentials are set.');
  console.log('\nTo receive emails at ' + recipient + ', open your .env file and set EITHER:');
  console.log('Option 1 (Resend):');
  console.log('  RESEND_API_KEY=re_your_api_key_here');
  console.log('Option 2 (Gmail App Password):');
  console.log('  GMAIL_USER=sagarhiremath025@gmail.com');
  console.log('  GMAIL_APP_PASSWORD=your_16_character_app_password');
  console.log('====================================================');
  process.exit(1);
}

console.log('Attempting delivery now...');
const result = await testSendEmail(recipient);

if (result.success) {
  console.log('\n SUCCESS! Email was successfully dispatched and delivered!');
  console.log(`Provider: ${result.provider}`);
  console.log(`Message ID: ${result.messageId}`);
  console.log(`Status: ${result.deliveryStatus}`);
  console.log(`Please check your inbox at: ${recipient}`);
} else {
  console.error('\n Delivery Failed:');
  console.error(result.error);
}
console.log('====================================================');
