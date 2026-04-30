import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const info = await resend.emails.send({
      from: "GoGuide <no-reply@goguide.in>",
      to,
      subject,
      html,
    });
    return info;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown email error";
    throw new Error(`Email send failed: ${message}`);
  }
};
