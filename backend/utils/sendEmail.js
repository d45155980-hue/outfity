const nodemailer = require('nodemailer');
const dns = require('dns');

const stripHtml = (html) => html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

const createTransport = async () => {
  const host = await new Promise((resolve) => {
    dns.resolve4(process.env.SMTP_HOST, (err, addresses) => {
      if (err || !addresses || !addresses.length) resolve(process.env.SMTP_HOST);
      else resolve(addresses[0]);
    });
  });

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    requireTLS: true,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

const sendEmail = async (options) => {
  const transporter = await createTransport();

  const mailOptions = {
    from: `"OUTFITY" <${process.env.SMTP_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.text || (options.html ? stripHtml(options.html) : ''),
    html: options.html || '',
    headers: {
      'List-Unsubscribe': `<mailto:${process.env.SMTP_EMAIL}?subject=unsubscribe>`,
      'X-Mailer': 'OUTFITY',
      'X-Priority': '1',
    },
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
