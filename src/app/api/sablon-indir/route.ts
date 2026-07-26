import ExcelJS from "exceljs";
import { NextResponse } from "next/server";

const HEADER_FILL = "FF0891B2"; // --brand-dark
const HEADER_TEXT = "FFFFFFFF";
const SAMPLE_ROWS = [
  { fullName: "Ahmet Yılmaz", title: "Genel Müdür", phone: "05001234567", note: "Test kart" },
  { fullName: "Ayşe Kaya", title: "Satış Uzmanı", phone: "05009876543", note: "" },
  { fullName: "Mehmet Demir", title: "Yazılım Mühendisi", phone: "05001112233", note: "" },
  { fullName: "Zeynep Çelik", title: "Pazarlama Direktörü", phone: "05004445566", note: "" },
];

// Toplu sipariş şablonunu gerçek bir .xlsx dosyası olarak üretir. Önceki sürüm ham CSV
// döndürüyordu; Türkçe Excel kurulumlarında liste ayıracı virgül değil noktalı virgül
// olduğundan, çift tıklayıp açılan CSV'nin tüm sütunları tek hücrede/tek satırda birleşmiş
// gibi görünmesine yol açıyordu. .xlsx'te ayraç belirsizliği yoktur — hücreler gerçek,
// tipli sütunlardır.
export async function GET() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "VYKTag";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Personel Listesi", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = [
    { header: "Ad Soyad", key: "fullName", width: 28 },
    { header: "Unvan", key: "title", width: 26 },
    { header: "Telefon", key: "phone", width: 18 },
    { header: "Not", key: "note", width: 32 },
  ];
  sheet.addRows(SAMPLE_ROWS);

  // Başlık satırı: koyu marka rengi + beyaz kalın yazı ile veri satırlarından belirgin
  // şekilde ayrılır ve kilitlenir — sayfa korumasıyla birlikte üzerine yazılamaz.
  const headerRow = sheet.getRow(1);
  headerRow.height = 22;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: HEADER_TEXT } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_FILL } };
    cell.alignment = { vertical: "middle", horizontal: "left" };
    cell.protection = { locked: true };
  });

  // Veri satırları (örnekler + doldurulacak 200 satırlık boş alan) kilitsiz bırakılır ki
  // müşteri bilgilerini girebilsin; yalnızca başlık salt-okunur olur.
  const DATA_ROW_COUNT = 200;
  for (let r = 2; r <= DATA_ROW_COUNT + 1; r++) {
    const row = sheet.getRow(r);
    for (let c = 1; c <= sheet.columns.length; c++) {
      row.getCell(c).protection = { locked: false };
    }
  }

  // Şifre yok — amaç kötü niyetli erişimi engellemek değil, dosyayı dolduran kişinin
  // yanlışlıkla başlık satırını silmesini/değiştirmesini önlemek.
  await sheet.protect("", {
    selectLockedCells: true,
    selectUnlockedCells: true,
    formatCells: false,
    formatColumns: false,
    formatRows: false,
    insertRows: true,
    deleteRows: false,
    sort: false,
    autoFilter: false,
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="vyktag-toplu-siparis-sablonu.xlsx"',
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}
