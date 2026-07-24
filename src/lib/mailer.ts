import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

let cachedTransporter: Transporter | null = null;

/** SMTP taşıyıcısını tembel olarak kurar; bilgiler tanımlı değilse açıklayıcı hata fırlatır. */
function getTransporter(): Transporter {
  if (cachedTransporter) {
    return cachedTransporter;
  }
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  if (!host || !port || !user || !password) {
    throw new Error(
      "SMTP bilgileri tanımlı değil. .env dosyasında SMTP_HOST, SMTP_PORT, SMTP_USER ve SMTP_PASSWORD doldurulmalı.",
    );
  }

  const portNumber = Number(port);
  cachedTransporter = nodemailer.createTransport({
    host,
    port: portNumber,
    secure: portNumber === 465,
    auth: { user, pass: password },
  });
  return cachedTransporter;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

/** SMTP üzerinden e-posta gönderir. Gönderen adresi SMTP_FROM (yoksa SMTP_USER) kullanılır. */
export async function sendEmail(input: SendEmailInput): Promise<void> {
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;
  await getTransporter().sendMail({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
  });
}
