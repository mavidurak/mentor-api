import nodemailer from 'nodemailer';

export const EmailTypes = {
  confirm: 'confirm',
  forgotPassword: 'forgotPassword',
  changeApplicationPermission: 'changeApplicationPermission'
}

export const sendEmail = async ( emailType, {user, token} ) => {
  
  var email={
    sender: process.env.EMAIL_USER,
    to: user.email,
    subject: null,
    content: null,
    buttonHref: null
  }

  switch (emailType) {
    case 'confirm':
      email.subject='Welcome to MaviDurak-IO'
      email.buttonHref = `${process.env.API_PATH}/authentications/email-confirmation?token=${token}`;
      /*
        Template okuyan, kullanıcıya gore yeniden duzenleyen ve email.content e atayan kod parçası
      */
      break;

    case 'forgotPassword':
      email.subject='Reset your MaviDurak-IO account password'
      email.buttonHref = `${process.env.API_PATH}/authentications/forgot-password?token=${token}`;
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

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: email.from,
    to: email.to,
    subject: email.subject,
    html: email.content,
  });

  console.log(`\n++++++++++++++++| ${emailType} Message sent to ${email.to} - ${info.messageId} |++++++++++++++++\n`);
};

export default {
  sendEmail,
  EmailTypes
};
