const { google } = require('googleapis');

const stripHtml = (html) => html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

const sendViaGmail = async (options) => {
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  if (!refreshToken) throw new Error('GMAIL_REFRESH_TOKEN not set');

  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'urn:ietf:wg:oauth:2.0:oob'
  );
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  const utf8Bytes = Buffer.from(
    `From: "OUTFITY" <d45155980@gmail.com>\r\n` +
    `To: ${options.email}\r\n` +
    `Subject: ${options.subject}\r\n` +
    `MIME-Version: 1.0\r\n` +
    `Content-Type: text/html; charset="UTF-8"\r\n\r\n` +
    (options.html || options.text || '')
  );

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: utf8Bytes.toString('base64url') },
  });
};

const sendEmail = async (options) => {
  try {
    await sendViaGmail(options);
    return;
  } catch (err) {
    console.log('Gmail API failed:', err.message);
  }

  console.log('Email sending failed — no fallback available');
};

module.exports = sendEmail;
