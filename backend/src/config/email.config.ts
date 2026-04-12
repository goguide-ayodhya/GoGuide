import nodemailer from "nodemailer";

// if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
//   throw new Error("EMAIL_USER and EMAIL_PASS environment variables are required");
// }

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"GoGuide" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });
    return info;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    throw new Error(`Email send failed: ${message}`);
  }
};