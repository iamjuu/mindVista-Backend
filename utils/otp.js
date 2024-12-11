const nodemailer = require('nodemailer');

const sendEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',

    auth: {
      user: 'juu5250@gmail.com', 
      pass: 'icnv qchj oxvd dpcd', 
    },
  });

  const mailOptions = {
    from: 'juu5250@gmail.com',
    to: email,
    subject: 'OTP from mindVista - Don\'t share this',
    text: `Your OTP is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Mail has been sent successfully");
  } catch (error) {
    console.error("Error occurred while sending email:", error);
    throw error; 
  }
};

module.exports = { sendEmail }; 
