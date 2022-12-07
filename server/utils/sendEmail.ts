import nodemailer from "nodemailer";

export async function sendEmail(to: string, html: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_HOST,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  // send mail with defined transport object
  await transporter.sendMail({
    from: '"Im Listening 🎧" <services@imlistening.com>', // sender address
    to: to, // list of receivers
    subject: "Change password", // Subject line
    html,
  });
}
