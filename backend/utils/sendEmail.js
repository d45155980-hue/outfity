const nodemailer = require('nodemailer');

const stripHtml = (html) => html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

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
