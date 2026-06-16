const https = require('https');
const http = require('http');

const stripHtml = (html) => html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

const sendViaResend = (options) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY not set');

  const data = JSON.stringify({
    from: 'OUTFITY <onboarding@resend.dev>',
    to: [options.email],
    subject: options.subject,
    text: options.text || stripHtml(options.html || ''),
    html: options.html || '',
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.resend.com',
      path: '/emails',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
      timeout: 15000,
    });
    req.on('response', (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(true);
        else reject(new Error(`Resend ${res.statusCode}: ${body.slice(0, 200)}`));
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Resend timeout')); });
    req.write(data);
    req.end();
  });
};

const sendEmail = async (options) => {
  console.log('sendEmail called, RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);

  try {
    await sendViaResend(options);
    return;
  } catch (err) {
    console.log('Resend email failed:', err.message);
  }

  console.log('Falling back to SMTP...');
  const nodemailer = require('nodemailer');
  const dns = require('dns');

  const host = await new Promise((resolve) => {
    dns.resolve4(process.env.SMTP_HOST || 'smtp.gmail.com', (err, addresses) => {
      if (err || !addresses || !addresses.length) resolve(process.env.SMTP_HOST || 'smtp.gmail.com');
      else resolve(addresses[0]);
    });
  });

  const port = Number(process.env.SMTP_PORT) || 587;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user: process.env.SMTP_EMAIL || '',
      pass: process.env.SMTP_PASSWORD || '',
    },
    tls: { rejectUnauthorized: false },
  });

  await transporter.sendMail({
    from: `"OUTFITY" <${process.env.SMTP_EMAIL || 'noreply@outfity.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.text || stripHtml(options.html || ''),
    html: options.html || '',
  });
};

module.exports = sendEmail;
