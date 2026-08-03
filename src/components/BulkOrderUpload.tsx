"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { useCart } from "@/components/CartProvider";
import type { CartItem, CartPersonalization } from "@/lib/orders/cart";
import {
  Alert,
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";

export interface SelectedProductVariant {
  variantId: string;
  productSlug: string;
  productName: string;
  variantName: string;
  priceKurus: number;
}

interface ParsedRow {
  fullName: string;
  title: string;
  phone: string;
  note: string;
  isValid: boolean;
  error?: string;
}

/**
 * Ham satırları (CSV veya Excel'den gelen, anahtarları serbest başlık adları olan nesneler)
 * standart ParsedRow biçimine çevirir. Başlık eşleştirmesi büyük/küçük harf ve boşluktan
 * bağımsızdır; Excel'den gelen sayısal/tarih tipi hücreler de String()'e zorlanır — SheetJS
 * telefon gibi tamamen sayısal görünen hücreleri number olarak döndürebilir.
 */
export function parseBulkOrderRows(rawRows: Record<string, unknown>[]): ParsedRow[] {
  return rawRows.map((row) => {
    const keys = Object.keys(row);
    const getVal = (possibleKeys: string[]) => {
      const key = keys.find((k) => possibleKeys.includes(k.trim().toLowerCase()));
      const value = key ? row[key] : undefined;
      return value === null || value === undefined ? "" : String(value).trim();
    };

    const fullName = getVal(["ad soyad", "ad", "isim soyisim", "isim", "name", "fullname"]);
    const title = getVal(["unvan", "ünvan", "pozisyon", "title"]);
    const phone = getVal(["telefon", "cep telefonu", "phone"]);
    const note = getVal(["not", "notlar", "note"]);

    const isValid = Boolean(fullName);
    return {
      fullName,
      title,
      phone,
      note,
      isValid,
      error: isValid ? undefined : "Ad Soyad alanı zorunludur.",
    };
  });
}

export function BulkOrderUpload({
  selectedVariant,
}: {
  selectedVariant: SelectedProductVariant | null;
}) {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addItems } = useCart();
  const [successMsg, setSuccessMsg] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setSuccessMsg("");
    setRows([]);

    const isExcel = /\.xlsx?$/i.test(file.name);

    if (isExcel) {
      // Gerçek, tipli sütunlu hücreler — CSV'nin aksine ayraç (virgül/noktalı virgül)
      // belirsizliği yoktur, bu yüzden Türkçe Excel'den kaynaklanan "her şey tek hücrede"
      // sorunu burada oluşmaz.
      file
        .arrayBuffer()
        .then((buffer) => {
          const workbook = XLSX.read(buffer, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: "" });
          setRows(parseBulkOrderRows(rawRows));
          setIsParsing(false);
        })
        .catch((error) => {
          console.error("Excel okuma hatası:", error);
          alert("Dosya okunurken bir hata oluştu. Lütfen şablonu bozmadan doldurduğunuz .xlsx dosyasını yükleyin.");
          setIsParsing(false);
        });
      return;
    }

    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setRows(parseBulkOrderRows(results.data));
        setIsParsing(false);
      },
      error: (error) => {
        console.error("CSV okuma hatası:", error);
        alert("Dosya okunurken bir hata oluştu. Lütfen geçerli bir CSV dosyası yükleyin.");
        setIsParsing(false);
      }
    });
  };

  const validRows = rows.filter(r => r.isValid);
  const invalidRows = rows.filter(r => !r.isValid);

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    
    if (validRows.length === 0) {
      alert("Sepete eklenecek geçerli kişi bulunamadı.");
      return;
    }

    const itemsToAdd: CartItem[] = validRows.map(row => {
      const personalization: CartPersonalization = {
        fullName: row.fullName,
      };
      if (row.title) personalization.title = row.title;
      if (row.phone) personalization.phone = row.phone;
      if (row.note) personalization.note = row.note;

      return {
        variantId: selectedVariant.variantId,
        productSlug: selectedVariant.productSlug,
        productName: selectedVariant.productName,
        variantName: selectedVariant.variantName,
        unitPriceKurus: selectedVariant.priceKurus,
        quantity: 1,
        personalization
      };
    });

    addItems(itemsToAdd);
    setSuccessMsg(`${validRows.length} kişi başarıyla sepete eklendi!`);
    setRows([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold tracking-tight mb-2">1. Personel Listenizi Yükleyin</h2>
      <p className="text-sm text-zinc-500 mb-6">
        İndirdiğiniz Excel şablonunu doldurup yükleyerek tüm personelinizi tek seferde
        ekleyebilirsiniz.{" "}
        <a href="/api/sablon-indir" download className="text-brand hover:underline">
          Örnek Şablonu İndir
        </a>
      </p>

      <div className="mb-6">
        <label className="block w-full cursor-pointer rounded-lg border-2 border-dashed border-zinc-300 p-8 text-center transition-colors hover:border-brand dark:border-zinc-700 dark:hover:border-brand">
          <span className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {isParsing ? "Okunuyor..." : "Excel (.xlsx) Dosyasını Seçmek İçin Tıklayın"}
          </span>
          <span className="mt-1 block text-xs text-zinc-500">
            .xlsx şablonu (önerilen) veya .csv dosyası — Maks 1000 satır
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/csv,text/csv"
            className="hidden"
            onChange={handleFileUpload}
            disabled={!selectedVariant || isParsing}
          />
        </label>
        {!selectedVariant && (
          <p className="mt-2 text-sm text-amber-600">
            * Lütfen önce yukarıdan kart modelini ve rengini seçin.
          </p>
        )}
      </div>

      {successMsg && (
        <Alert variant="success" className="mb-6">
          {successMsg}
        </Alert>
      )}

      {rows.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">
              Önizleme ({rows.length} Kişi Bulundu)
            </h3>
            <div className="text-sm text-zinc-500">
              <span className="text-green-600 font-medium">{validRows.length} Geçerli</span>
              {" • "}
              <span className="text-red-600 font-medium">{invalidRows.length} Hatalı</span>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ad Soyad</TableHead>
                <TableHead>Unvan</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Not</TableHead>
                <TableHead>Durum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.slice(0, 10).map((row, idx) => (
                <TableRow key={idx} className={row.isValid ? undefined : "bg-red-50/50 dark:bg-red-900/10"}>
                  <TableCell className="font-medium">{row.fullName || "-"}</TableCell>
                  <TableCell className="text-zinc-600 dark:text-zinc-400">{row.title || "-"}</TableCell>
                  <TableCell className="text-zinc-600 dark:text-zinc-400">{row.phone || "-"}</TableCell>
                  <TableCell className="max-w-[150px] truncate text-zinc-600 dark:text-zinc-400">
                    {row.note || "-"}
                  </TableCell>
                  <TableCell>
                    {row.isValid ? (
                      <Badge variant="success" size="sm">
                        Geçerli
                      </Badge>
                    ) : (
                      <Badge variant="danger" size="sm">
                        {row.error}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {rows.length > 10 && (
            <p className="text-center text-xs text-zinc-500">
              * Sadece ilk 10 kayıt gösteriliyor. Toplam {rows.length} kayıt eklenecek.
            </p>
          )}

          <div className="flex justify-end pt-4">
            <Button onClick={handleAddToCart} disabled={validRows.length === 0 || !selectedVariant}>
              {validRows.length} Kişiyi Sepete Ekle
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
