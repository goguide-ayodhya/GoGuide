export interface StatusEmailParams {
  title: string;
  titleColor?: string;
  messageParagraphs: string[];
  actionText?: string;
  actionUrl?: string;
  actionColor?: string;
}

export const generateStatusEmail = ({
  title,
  titleColor = "#16a34a",
  messageParagraphs,
  actionText,
  actionUrl,
  actionColor = "#000000ff",
}: StatusEmailParams) => {
  const paragraphsHtml = messageParagraphs
    .map((p) => `<p>${p}</p>`)
    .join("\n      ");

  const actionHtml =
    actionText && actionUrl
      ? `
      <div style="margin-top:20px">
        <a
          href="${actionUrl}"
          style="
            background:${actionColor};
            color:white;
            padding:12px 20px;
            text-decoration:none;
            border-radius:8px;
            display:inline-block;
          "
        >
         ${actionText}
        </a>
      </div>
    `
      : "";

  return `
    <div style="font-family:sans-serif;padding:20px">
      <h2 style="color:${titleColor}">
        ${title}
      </h2>
  
      ${paragraphsHtml}
  
      ${actionHtml}

      <div style="margin-top:25px;padding-top:15px;border-top:1px solid #e5e7eb">
        <p style="font-size:14px;color:#444;margin-bottom:10px">
          For any queries or support, feel free to contact us:
        </p>

        <p style="margin:5px 0">
          Email:
          <a
            href="mailto:goguide.in@gmail.com"
            style="color:#f97316;text-decoration:none"
          >
            goguide.in@gmail.com
          </a>
        </p>

        <p style="margin:5px 0">
          WhatsApp:
          <a
            href="https://wa.me/918881993735"
            style="color:#16a34a;text-decoration:none"
          >
            +91 88819 93735
          </a>
        </p>
      </div>
  
      <p style="margin-top:30px;color:#666">
        — GoGuide Team
      </p>
    </div>
  `;
};
