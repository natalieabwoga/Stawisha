require('dotenv').config();
const nodemailer = require('nodemailer');

async function test() {
  console.log("Using user:", process.env.EMAIL_USER);
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    const success = await transporter.verify();
    if (success) {
      console.log("Server is ready to take our messages");
    }
    
    // Optional: actually send an email to verify
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // send to self
      subject: "Stawisha Email Verification Test",
      text: "If you receive this, the email configuration is working correctly."
    });
    console.log("Message sent: %s", info.messageId);
    
  } catch (err) {
    console.error("Error verifying or sending email:", err);
  }
}
test();
