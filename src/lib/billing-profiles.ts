/** Şahıs ve kurumsal fatura bilgisi profillerinin doğrulama kuralları. */

/**
 * TC Kimlik No'nun resmi checksum algoritmasına göre biçimsel geçerliliğini kontrol eder:
 * 11 hane, ilk hane 0 olamaz, 10. ve 11. haneler diğer hanelerden hesaplanan kontrol
 * basamaklarıyla eşleşmelidir.
 */
export function isValidNationalId(value: string): boolean {
  if (!/^[1-9][0-9]{10}$/.test(value)) {
    return false;
  }
  const digits = value.split("").map(Number);
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
  const digit10 = (((oddSum * 7 - evenSum) % 10) + 10) % 10;
  if (digit10 !== digits[9]) {
    return false;
  }
  const digit11 = (oddSum + evenSum + digits[9]) % 10;
  return digit11 === digits[10];
}

/**
 * Vergi numarasının 10 haneli sayısal biçimde olduğunu kontrol eder. Resmi checksum
 * algoritması TC Kimlik No'nunki gibi kamuya açık/güvenilir şekilde belgelenmediğinden
 * yalnızca biçim doğrulanır.
 */
export function isValidTaxNumber(value: string): boolean {
  return /^[0-9]{10}$/.test(value);
}
