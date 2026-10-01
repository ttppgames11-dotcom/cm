import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

const MAIL_FROM = process.env.MAIL_FROM || '"Connect Maratha" <noreply@connectmaratha.com>';

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass && pass !== 'REPLACE_WITH_YOUR_HOSTINGER_PASSWORD') {
    const port = parseInt(process.env.SMTP_PORT || '465', 10);
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }
  return null;
}

/**
 * Sends a password reset OTP to the user's registered email address.
 * Uses noreply@connectmaratha.com sender address.
 * Falls back to console output if SMTP credentials are not yet configured.
 */
export async function sendPasswordResetOtpEmail({ to, name = 'सदस्य', otp }) {
  const subject = '🔐 [Connect Maratha] पासवर्ड रीसेट सुरक्षा OTP';
  
  const textContent = `
जय शिवराय ${name},

आपल्या कनेक्ट मराठा (Connect Maratha) खात्याचा पासवर्ड रीसेट करण्यासाठी खालील सुरक्षा OTP वापरा:

OTP: ${otp}

हा OTP पुढील १० मिनिटांसाठी वैध आहे.
सुरक्षा सूचना: कृपया हा OTP कोणाशीही शेअर करू नका. आपण ही विनंती केली नसल्यास, या ईमेलकडे दुर्लक्ष करा.

- टीम कनेक्ट मराठा
noreply@connectmaratha.com
`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="mr">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FDF8F2; margin: 0; padding: 24px; color: #2C1810; }
    .container { max-width: 520px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #F0DFD0; overflow: hidden; box-shadow: 0 4px 20px rgba(184, 80, 24, 0.08); }
    .header { background: linear-gradient(135deg, #B85018 0%, #D86B27 100%); padding: 28px 24px; text-align: center; color: #FFFFFF; }
    .header h1 { margin: 0; font-size: 24px; letter-spacing: 0.5px; }
    .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
    .content { padding: 32px 28px; }
    .greeting { font-size: 17px; font-weight: 600; color: #2C1810; margin-bottom: 12px; }
    .desc { font-size: 14px; line-height: 1.6; color: #5C4538; margin-bottom: 24px; }
    .otp-box { background: #FFF7EE; border: 2px dashed #B85018; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
    .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #B85018; font-family: monospace; }
    .otp-meta { margin-top: 8px; font-size: 12px; color: #8C6A54; }
    .warning { background: #FFF1F0; border-left: 4px solid #D32F2F; padding: 12px 16px; border-radius: 6px; font-size: 12px; color: #851D1D; line-height: 1.5; margin-top: 24px; }
    .footer { border-top: 1px solid #F5ECE3; padding: 20px; text-align: center; font-size: 11px; color: #A88F7E; background: #FAF5F0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>|| कनेक्ट मराठा ||</h1>
      <p>Connect Maratha — समाज आणि संस्कृती</p>
    </div>
    <div class="content">
      <div class="greeting">सस्नेह जय शिवराय, ${name}</div>
      <div class="desc">
        आपल्या कनेक्ट मराठा खात्याचा पासवर्ड रीसेट करण्यासाठी सुरक्षा OTP ची विनंती प्राप्त झाली आहे.
      </div>
      
      <div class="otp-box">
        <div class="otp-code">${otp}</div>
        <div class="otp-meta">⏳ हा OTP पुढील १० मिनिटांसाठी वैध आहे</div>
      </div>

      <div class="warning">
        <strong>सुरक्षा सूचना:</strong> हा OTP कोणाशीही शेअर करू नका. कनेक्ट मराठा टीम कधीही आपला OTP विचारत नाही. जर आपण ही विनंती केली नसेल तर या ईमेलकडे दुर्लक्ष करा.
      </div>
    </div>
    <div class="footer">
      हा ईमेल स्वयंचलित प्रणालीद्वारे पाठवला आहे. कृपया या ईमेलला उत्तर देऊ नका.<br/>
      Sent by <strong>noreply@connectmaratha.com</strong>
    </div>
  </div>
</body>
</html>
`;

  const transporter = getTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: MAIL_FROM,
        to,
        replyTo: 'noreply@connectmaratha.com',
        subject,
        text: textContent,
        html: htmlContent,
      });
      console.log(`[MAILER] Password reset OTP sent to ${to}: Message ID ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`[MAILER] Failed to send email via SMTP to ${to}:`, err.message);
      // Fall through to console logging in development
    }
  }

  // Fallback logging for local testing / non-production SMTP environments
  console.log(`\n======================================================`);
  console.log(`📩 [NOREPLY EMAIL DISPATCH] (noreply@connectmaratha.com)`);
  console.log(`   To: ${to} (${name})`);
  console.log(`   Subject: ${subject}`);
  console.log(`   🔑 OTP CODE: [ ${otp} ]`);
  console.log(`   Expires: 10 minutes from ${new Date().toISOString()}`);
  console.log(`======================================================\n`);

  return { success: true, delivered: Boolean(transporter), previewOtp: otp };
}

export default { sendPasswordResetOtpEmail };
