import nodemailer from "nodemailer";

const sendMail = async (options: any) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMPT_HOST || "",
    port: Number(process.env.SMPT_PORT) || 0,
    service: process.env.SMPT_SERVICE || "",
    auth: {
      user: process.env.SMPT_MAIL || "",
      pass: process.env.SMPT_PASSWORD || "",
    },
  });

  const mailOptions = {
    from: process.env.SMPT_MAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

export default sendMail