const nodemailer = require('nodemailer');

const sendMail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMPT_HOST,
    port: process.env.SMPT_PORT,
    // service: process.env.SMPT_SERVICE,
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_PASSWORD,
    },
  });

  if (options.pdfBuffer) {
    const mailOptions = {
      from: `Signet Institute <${process.env.SMPT_MAIL}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
      attachments: [
        {
          filename: 'report.pdf',
          content: options.pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    await transporter.sendMail(mailOptions);
  }

  const mailOptions = {
    from: `Signet Institute <${process.env.SMPT_MAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendMail;
