import { NextResponse } from "next/server";

export async function GET() {
  const csvContent = `Ad Soyad,Unvan,Telefon,Not
Ahmet Yılmaz,Genel Müdür,05001234567,Test kart
Ayşe Kaya,Satış Uzmanı,05009876543,
Mehmet Demir,Yazılım Mühendisi,05001112233,
Zeynep Çelik,Pazarlama Direktörü,05004445566,
`;

  // Excel'in UTF-8'i doğru tanıması için BOM (Byte Order Mark) ekliyoruz
  const bom = "\uFEFF";
  const contentWithBom = bom + csvContent;

  return new NextResponse(contentWithBom, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="vyktag-toplu-siparis-sablonu.csv"',
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}
