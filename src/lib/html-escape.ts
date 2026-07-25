const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * Kullanıcı girdisini bir HTML e-posta şablonuna gömmeden önce kaçışlar. Şablonlar
 * template literal ile inline oluşturulduğundan (ör. ad soyad), kaçışlanmamış bir
 * değer HTML/etiket enjeksiyonuna yol açar. Her e-posta şablonunda kullanıcıdan gelen
 * her değer bu fonksiyondan geçirilmelidir.
 */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char]);
}
