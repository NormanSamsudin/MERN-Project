const nodemailer = require('nodemailer');

const sendEmail = async options => {
  //1) create a transporter
  //   const transporter = nodemailer.createTransport({
  //     service: 'Gmail',
  //     auth: {
  //       user: process.env.EMAIL_USERNAME,
  //       pass: process.env.EMAIL_PASSWORD
  //     },
  //     secure: false,
  //     logger: true,
  //     tls: {
  //       rejectUnauthorized: true
  //     },
  //     host: process.env.EMAIL_HOST,
  //     port: process.env.EMAIL_PORT
  //   });
  const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: 'af8274a29740fa',
      pass: 'dac04cdb65b207'
    }
  });

  //2) define the email options
  const mailOptions = {
    from: 'Norman Samsudin <normaniman79@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
    //html
  };

  //3) actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
