import nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';

export const EmailTypes = {
  confirm: 'confirm',
  forgotPassword: 'forgotPassword',
  changeApplicationPermission: 'changeApplicationPermission'
}

export const sendEmail = async ( emailType, user, token ) => {
  
  var email={
    sender: process.env.EMAIL_USER,
    to: user.email,
    subject: null,
    content: null,
    buttonHref: null
  }
  var source, template, replacements
  switch (emailType) {
    case 'confirm':
      email.subject='Welcome to MaviDurak-IO'
      email.buttonHref = `${process.env.API_PATH}/authentications/email-confirmation?token=${token}`;  
      source = fs.readFileSync('src/templates/ConfirmationEmail.html', 'utf-8').toString();
      template = handlebars.compile(source);
      replacements = {
        username: user.name,
        href: email.buttonHref
      };
      break;

    case 'forgotPassword':
      email.subject='Reset your MaviDurak-IO account password'
      email.buttonHref = `${process.env.API_PATH}/authentications/forgot-password?token=${token}`;
      source = fs.readFileSync('src/templates/ForgotPasswordEmail.html', 'utf-8').toString();
      template = handlebars.compile(source);
      replacements = {
        username: user.name,
        href: email.buttonHref
      };  
    break;

    case 'changeApplicationPermission':
      email.subject='Change yours application permissions'
      email.buttonHref;
    break;

    default:
      break;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // generated ethereal user or someone smtp server like elasticemail or gmail
      pass: process.env.EMAIL_PASSWORD, // user password
    },
  });

  email.content = template(replacements);  
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: email.from,
    to: email.to,
    subject: email.subject,
    html: email.content
  });
  
  console.log(`\n++++++++++++++++| ${emailType} Message sent to ${email.to} - ${info.messageId} |++++++++++++++++\n`);
};

export default {
  sendEmail,
  EmailTypes
};
