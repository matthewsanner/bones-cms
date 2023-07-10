const nodemailer = require("nodemailer");

const sendVerificationEmail = async (userEmail, token) => {
  console.log("userE-mail:", userEmail, "token:", token, 'envPass:', process.env.PASS, 'envUser:', process.env.EMAIL )
    try {
        const transporter = nodemailer.createTransport({
           service: 'Gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASS,
            },
        });

        await transporter.sendMail({
          from: process.env.EMAIL,
          to: userEmail,
          subject: 'Email Verification',
          text: 'Please click the following link to verify your email:',
          html: `<a href="http://localhost:3000/users/verify/${token}">Verify Email</a>`,
        });

        console.log("email sent sucessfully");
    } catch (error) {
        console.log(error, "email not sent");
    }
};

module.exports = sendVerificationEmail;