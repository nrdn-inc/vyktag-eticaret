import { describe, expect, it } from "vitest";
import { parseBulkOrderRows } from "@/components/BulkOrderUpload";

describe("parseBulkOrderRows", () => {
  it("maps the canonical Turkish headers", () => {
    const [row] = parseBulkOrderRows([
      { "Ad Soyad": "Ahmet Yılmaz", Unvan: "Genel Müdür", Telefon: "05001234567", Not: "Test kart" },
    ]);
    expect(row).toEqual({
      fullName: "Ahmet Yılmaz",
      title: "Genel Müdür",
      phone: "05001234567",
      note: "Test kart",
      isValid: true,
      error: undefined,
    });
  });

  it("matches headers case-insensitively and trims surrounding whitespace", () => {
    const [row] = parseBulkOrderRows([{ " ad soyad ": "Ayşe Kaya", " UNVAN": "Satış Uzmanı" }]);
    expect(row.fullName).toBe("Ayşe Kaya");
    expect(row.title).toBe("Satış Uzmanı");
  });

  it("accepts alternate header spellings (isim, ünvan, cep telefonu, notlar)", () => {
    const [row] = parseBulkOrderRows([
      { isim: "Mehmet Demir", ünvan: "Mühendis", "cep telefonu": "05001112233", notlar: "Not" },
    ]);
    expect(row).toMatchObject({ fullName: "Mehmet Demir", title: "Mühendis", phone: "05001112233", note: "Not" });
  });

  it("coerces non-string cell values (Excel may return numbers/dates) to trimmed strings", () => {
    const [row] = parseBulkOrderRows([{ "Ad Soyad": "Zeynep Çelik", Telefon: 5001234567 }]);
    expect(row.phone).toBe("5001234567");
  });

  it("flags rows without a full name as invalid, others as valid", () => {
    const rows = parseBulkOrderRows([{ "Ad Soyad": "Ahmet Yılmaz" }, { Unvan: "Sahipsiz satır" }]);
    expect(rows[0]).toMatchObject({ isValid: true, error: undefined });
    expect(rows[1]).toMatchObject({ isValid: false, error: "Ad Soyad alanı zorunludur." });
  });

  it("treats a missing/undefined/null field as an empty string, not 'undefined'/'null'", () => {
    const [row] = parseBulkOrderRows([{ "Ad Soyad": "Ahmet", Not: null }]);
    expect(row.note).toBe("");
    expect(row.title).toBe("");
  });

  it("returns an empty array for an empty input", () => {
    expect(parseBulkOrderRows([])).toEqual([]);
  });
});
