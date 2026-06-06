import nodemailer from "nodemailer";

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  return transporter;
};

export const sendEmail = async (to, subject, html) => {
  try {
    const client = await getTransporter();
    const info = await client.sendMail({
      from: '"Tata English Center" <no-reply@tataenglish.edu.vn>',
      to,
      subject,
      html,
    });
    console.log(`[EMAIL] Đã gửi tới ${to}: "${subject}"`);
    console.log(`[EMAIL VIEW LINK]: ${nodemailer.getTestMessageUrl(info)}`);
  } catch (error) {
    console.error("Lỗi khi gửi email:", error.message);
  }
};
