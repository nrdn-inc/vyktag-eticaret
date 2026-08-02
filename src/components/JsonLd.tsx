/**
 * Bir schema.org nesnesini `<script type="application/ld+json">` olarak basar.
 *
 * Her `<` karakteri, JSON'ın kendi Unicode kaçış dizisiyle (u003c) değiştirilir: veri (ör.
 * ürün açıklaması) içinde geçen bir `</script>` dizisi aksi halde script etiketini erkenden
 * kapatıp kalan JSON'ı sayfaya HTML olarak enjekte ederdi. Bir JSON dizesi içinde bu kaçış
 * dizisi `<` ile birebir aynı değeri taşır; arama motorlarının okuduğu veri değişmez.
 */
export function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      // İçerik JSON.stringify çıktısıdır ve `<` yukarıda kaçışlanmıştır.
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
