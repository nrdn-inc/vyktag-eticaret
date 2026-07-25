import "server-only";
import { createEmailVerificationToken, createPasswordResetToken } from "@/lib/auth";
import { escapeHtml } from "@/lib/html-escape";
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
      <p>Merhaba ${escapeHtml(fullName)},</p>
      <p>Vyktag hesabınızı doğrulamak ve şifrenizi belirlemek için aşağıdaki bağlantıya tıklayın:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>Bu bağlantı 24 saat geçerlidir. Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz.</p>
    `,
  });
}

/** Şifremi unuttum isteği sonrası şifre sıfırlama bağlantısını müşteriye gönderir. */
export async function sendPasswordResetEmail(userId: string, email: string, fullName: string): Promise<void> {
  const token = createPasswordResetToken(userId);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const resetUrl = `${siteUrl}/hesap/sifre-sifirla?token=${encodeURIComponent(token)}`;

  await sendEmail({
    to: email,
    subject: "Vyktag şifre sıfırlama isteğiniz",
    html: `
      <p>Merhaba ${escapeHtml(fullName)},</p>
      <p>Vyktag hesabınızın şifresini sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Bu bağlantı 1 saat geçerlidir. Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz; şifreniz değişmeyecektir.</p>
    `,
  });
}

/** Giriş sırasında (2FA açıksa) doğrulama kodunu müşterinin e-postasına gönderir. */
export async function sendTwoFactorCode(email: string, fullName: string, code: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: "Vyktag giriş doğrulama kodunuz",
    html: `
      <p>Merhaba ${escapeHtml(fullName)},</p>
      <p>Hesabınıza giriş yapmak için doğrulama kodunuz:</p>
      <p style="font-size:24px;font-weight:bold;letter-spacing:4px;">${escapeHtml(code)}</p>
      <p>Bu kod 10 dakika geçerlidir. Bu girişi siz yapmadıysanız şifrenizi hemen değiştirmenizi öneririz.</p>
    `,
  });
}
