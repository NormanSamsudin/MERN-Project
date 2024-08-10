const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Jonas Schedmann <${process.env.EMAIL_FROM}>`;
  }

  createTransport() {
    if (process.env.NODE_ENV === 'production') {
      // use sendgrid
      return 1;
    }
    return nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: 'af8274a29740fa',
        pass: 'dac04cdb65b207'
      }
    });
  }

  // send actual email
  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject
      }
    );
    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html)
    };

    // 3) Create a transport and send the email
    await this.newTransport().transporter.sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the natours family');
  }
};

// const sendEmail = async options => {
//   //1) create a transporter
//   //   const transporter = nodemailer.createTransport({
//   //     service: 'Gmail',
//   //     auth: {
//   //       user: process.env.EMAIL_USERNAME,
//   //       pass: process.env.EMAIL_PASSWORD
//   //     },
//   //     secure: false,
//   //     logger: true,
//   //     tls: {
//   //       rejectUnauthorized: true
//   //     },
//   //     host: process.env.EMAIL_HOST,
//   //     port: process.env.EMAIL_PORT
//   //   });
//   // const transporter = nodemailer.createTransport({
//   //   host: 'sandbox.smtp.mailtrap.io',
//   //   port: 2525,
//   //   auth: {
//   //     user: 'af8274a29740fa',
//   //     pass: 'dac04cdb65b207'
//   //   }
//   // });

//   //2) define the email options
//   const mailOptions = {
//     from: 'Norman Samsudin <normaniman79@gmail.com>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message
//     //html
//   };

//   //3) actually send the email
// };

// module.exports = sendEmail;
