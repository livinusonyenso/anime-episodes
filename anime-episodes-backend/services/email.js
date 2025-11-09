// ---------------- Nodemailer Transporter Factory ----------------
const nodemailer = require("nodemailer");

// Helper: ensure required env vars are defined
function assertEnv(key) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

async function createTransporter() {
  assertEnv("EMAIL_USER");
  assertEnv("EMAIL_PASS");

  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    EMAIL_USER,
    EMAIL_PASS,
    SMTP_TLS_REJECT_UNAUTHORIZED,
  } = process.env;

  // Use safer default host for cPanel shared email services
  const primaryHost = SMTP_HOST || "mail.kazfieldisl.com";

  const transporter = nodemailer.createTransport({
    host: primaryHost,
    port: parseInt(SMTP_PORT, 10) || 465, // default SSL port
    secure: SMTP_SECURE === "true", // true for 465, false for 587
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: SMTP_TLS_REJECT_UNAUTHORIZED !== "false",
    },
  });

  return transporter;
}

// ---------------- Send Mail Helper ----------------
async function sendMail(to, subject, html) {
  const transporter = await createTransporter();
  const from = process.env.FROM_EMAIL || process.env.EMAIL_USER;

  const mailOptions = {
    from,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email send failed:", error.message);
    throw error;
  }
}

module.exports = { sendMail, createTransporter };
