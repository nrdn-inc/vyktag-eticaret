import Script from "next/script";

/**
 * NEXT_PUBLIC_GA_MEASUREMENT_ID tanımlı değilse hiçbir şey basmaz — kimlik `.env`'e
 * eklenene kadar site davranışında hiçbir değişiklik olmaz. Tanımlandığında gtag.js
 * `afterInteractive` ile yüklenir (sayfa render'ını bloklamaz, bkz. Next.js'in resmi
 * Google Analytics entegrasyon deseni).
 */
export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!measurementId) {
    return null;
  }

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
