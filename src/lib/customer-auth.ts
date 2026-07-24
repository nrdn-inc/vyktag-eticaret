import "server-only";
import { createEmailVerificationToken } from "@/lib/auth";
import { sendEmail } from "@/lib/mailer";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 8;

/** Kayıt/yeniden gönderim sonrası e-posta doğrulama bağlantısını müşteriye gönderir. */
export async function sendVerificationEmail(userId: string, email: string, fullName: string): Promise<void> {
  const token = createEmailVerificationToken(userId);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const verifyUrl = `${siteUrl}/hesap/dogrula?token=${encodeURIComponent(token)}`;

  await sendEmail({
    to: email,
    subject: "Vyktag hesabınızı doğrulayın",
    html: `
      <p>Merhaba ${fullName},</p>
      <p>Vyktag hesabınızı doğrulamak ve şifrenizi belirlemek için aşağıdaki bağlantıya tıklayın:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>Bu bağlantı 24 saat geçerlidir. Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz.</p>
    `,
  });
}
