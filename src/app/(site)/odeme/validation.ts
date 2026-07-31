import { isValidNationalId } from "@/lib/account/billing-profiles";
import type { CheckoutInput } from "./actions";
import type { CheckoutAddressInput } from "@/lib/orders";

// Ödeme, kimlik doğrulaması gerektirmeyen tek herkese açık yazma yolu (misafir alışveriş de
// mümkün) — bu yüzden istemciden gelen HER alan burada sunucu tarafında yeniden doğrulanır.
// Sınırlar, Address/User modellerindeki Prisma varsayılanı VARCHAR(191) sütun genişliğinin
// altında tutulur (bkz. lib/orders/index.ts'teki PERSONALIZATION_FIELD_MAX_LENGTH ile aynı gerekçe).
const NAME_MAX_LENGTH = 60;
const EMAIL_MAX_LENGTH = 190;
const PHONE_MAX_LENGTH = 20;
const ADDRESS_LINE_MAX_LENGTH = 190;
const CITY_DISTRICT_MAX_LENGTH = 100;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const POSTAL_CODE_REGEX = /^\d{5}$/;
const CONTROL_CHAR_REGEX = /[\x00-\x08\x0b\x0c\x0e-\x1f]/;

function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

/** Basit metin alanları için: boş/aşırı uzun/kontrol karakteri içeren değerleri reddeder. */
function validateText(value: string, label: string, maxLength: number): string | null {
  if (isBlank(value)) {
    return `${label} zorunludur.`;
  }
  if (value.length > maxLength) {
    return `${label} en fazla ${maxLength} karakter olabilir.`;
  }
  if (CONTROL_CHAR_REGEX.test(value)) {
    return `${label} geçersiz karakterler içeriyor.`;
  }
  return null;
}

function validateAddress(address: CheckoutAddressInput, label: string): string | null {
  return (
    validateText(address.addressLine1, `${label} adres`, ADDRESS_LINE_MAX_LENGTH) ??
    (address.addressLine2 && address.addressLine2.length > ADDRESS_LINE_MAX_LENGTH
      ? `${label} adres (devamı) en fazla ${ADDRESS_LINE_MAX_LENGTH} karakter olabilir.`
      : address.addressLine2 && CONTROL_CHAR_REGEX.test(address.addressLine2)
        ? `${label} adres (devamı) geçersiz karakterler içeriyor.`
        : null) ??
    validateText(address.city, `${label} il`, CITY_DISTRICT_MAX_LENGTH) ??
    validateText(address.district, `${label} ilçe`, CITY_DISTRICT_MAX_LENGTH) ??
    (POSTAL_CODE_REGEX.test(address.postalCode.trim())
      ? null
      : `${label} posta kodu 5 haneli olmalıdır.`)
  );
}

/**
 * `/odeme` formundan gelen tüm alanları sunucu tarafında doğrular. Tarayıcıdaki `required`/
 * `maxLength` öznitelikleri yalnızca kullanıcı deneyimi içindir ve herhangi bir istemci
 * (ör. doğrudan fetch ile giden bir script) tarafından atlanabilir — asıl kontrol burada.
 * Geçersizse kullanıcıya gösterilecek Türkçe hata mesajını, geçerliyse null döner.
 */
export function validateCheckoutInput(input: CheckoutInput): string | null {
  const { contact, shipping, billing } = input;

  return (
    validateText(contact.firstName, "Ad", NAME_MAX_LENGTH) ??
    validateText(contact.lastName, "Soyad", NAME_MAX_LENGTH) ??
    validateText(contact.email, "E-posta", EMAIL_MAX_LENGTH) ??
    (contact.email.length <= EMAIL_MAX_LENGTH && !EMAIL_REGEX.test(contact.email.trim())
      ? "Geçerli bir e-posta adresi girin."
      : null) ??
    validateText(contact.phone, "Telefon", PHONE_MAX_LENGTH) ??
    (contact.phone.replace(/\D/g, "").length < 10 ? "Geçerli bir telefon numarası girin." : null) ??
    (isValidNationalId(input.identityNumber) ? null : "TC Kimlik No geçerli değil.") ??
    validateAddress(shipping, "Teslimat") ??
    (billing ? validateAddress(billing, "Fatura") : null)
  );
}
