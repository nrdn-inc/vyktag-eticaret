"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import { useCart } from "@/components/CartProvider";
import type { CartItem, CartPersonalization } from "@/lib/cart";

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

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData: ParsedRow[] = [];
        
        results.data.forEach((row: any, index) => {
          // Desteklenen başlıklar (Büyük/küçük harf veya boşluk duyarlılığını azaltmak için trim kullanıyoruz)
          const keys = Object.keys(row);
          const getVal = (possibleKeys: string[]) => {
            const key = keys.find(k => possibleKeys.includes(k.trim().toLowerCase()));
            return key ? row[key]?.trim() : "";
          };

          const fullName = getVal(["ad soyad", "ad", "isim soyisim", "isim", "name", "fullname"]);
          const title = getVal(["unvan", "ünvan", "pozisyon", "title"]);
          const phone = getVal(["telefon", "cep telefonu", "phone"]);
          const note = getVal(["not", "notlar", "note"]);

          let isValid = true;
          let error = "";

          if (!fullName) {
            isValid = false;
            error = "Ad Soyad alanı zorunludur.";
          }

          parsedData.push({
            fullName,
            title,
            phone,
            note,
            isValid,
            error
          });
        });

        setRows(parsedData);
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
        Hazırladığınız CSV dosyasını seçerek tüm personelinizi tek seferde yükleyebilirsiniz.{" "}
        <a href="/vyktag-toplu-siparis-sablonu.csv" download className="text-brand hover:underline">
          Örnek Şablonu İndir
        </a>
      </p>

      <div className="mb-6">
        <label className="block w-full cursor-pointer rounded-lg border-2 border-dashed border-zinc-300 p-8 text-center transition-colors hover:border-brand dark:border-zinc-700 dark:hover:border-brand">
          <span className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {isParsing ? "Okunuyor..." : "CSV Dosyasını Seçmek İçin Tıklayın"}
          </span>
          <span className="mt-1 block text-xs text-zinc-500">
            .csv veya Excel'den dışa aktarılmış CSV dosyaları (Maks 1000 satır)
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv, application/csv, text/csv"
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
        <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">
          {successMsg}
        </div>
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

          <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs font-medium text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Ad Soyad</th>
                  <th className="px-4 py-3">Unvan</th>
                  <th className="px-4 py-3">Telefon</th>
                  <th className="px-4 py-3">Not</th>
                  <th className="px-4 py-3">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {rows.slice(0, 10).map((row, idx) => (
                  <tr key={idx} className={row.isValid ? "" : "bg-red-50/50 dark:bg-red-900/10"}>
                    <td className="px-4 py-3 font-medium">{row.fullName || "-"}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{row.title || "-"}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{row.phone || "-"}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 truncate max-w-[150px]">{row.note || "-"}</td>
                    <td className="px-4 py-3">
                      {row.isValid ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Geçerli
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          {row.error}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 10 && (
            <p className="text-center text-xs text-zinc-500">
              * Sadece ilk 10 kayıt gösteriliyor. Toplam {rows.length} kayıt eklenecek.
            </p>
          )}

          <div className="flex justify-end pt-4">
            <button
              onClick={handleAddToCart}
              disabled={validRows.length === 0 || !selectedVariant}
              className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
            >
              {validRows.length} Kişiyi Sepete Ekle
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
