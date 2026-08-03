"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { verifyAdminSession } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { CATALOG_CACHE_TAG } from "@/lib/catalog";
import { REVALIDATE_PATHS } from "@/lib/revalidate";
import { sanitizeProductImages } from "@/lib/product-image-upload";
import type { CardColor, PrintColor } from "@/lib/catalog/product-variant-attributes";

export interface VariantFormState {
  error?: string;
}

function revalidateCatalog(productSlug: string) {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path);
  }
  revalidatePath(`/urunler/${productSlug}`);
  updateTag(CATALOG_CACHE_TAG);
}

const CARD_COLORS: CardColor[] = ["Siyah", "Beyaz"];
const PRINT_COLORS: PrintColor[] = ["Gümüş", "Altın", "Siyah"];

interface ParsedVariantFields {
  name: string;
  sku: string;
  priceKurus: number;
  stock: number;
  isActive: boolean;
  attributes: { cardColor: CardColor; printColor: PrintColor; customDesign: boolean } | null;
  images: string[];
}

/** Form alanlarını doğrular; sorun varsa hata mesajı, yoksa DB'ye yazılacak alanları döner. */
function readVariantFields(formData: FormData): ParsedVariantFields | { error: string } {
  const name = String(formData.get("name") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim();
  const priceKurus = Number(formData.get("priceKurus"));
  const stock = Number(formData.get("stock"));
  const isActive = formData.get("isActive") === "on";
  const structured = formData.get("structured") === "on";

  if (!name) return { error: "Varyant adı gerekli." };
  if (!sku) return { error: "SKU gerekli." };
  if (!Number.isInteger(priceKurus) || priceKurus < 0) return { error: "Fiyat 0 veya daha büyük bir tam sayı (kuruş) olmalı." };
  if (!Number.isInteger(stock) || stock < 0) return { error: "Stok 0 veya daha büyük bir tam sayı olmalı." };

  let attributes: ParsedVariantFields["attributes"] = null;
  if (structured) {
    const cardColor = String(formData.get("cardColor") ?? "");
    const printColor = String(formData.get("printColor") ?? "");
    const customDesign = formData.get("customDesign") === "on";
    if (!CARD_COLORS.includes(cardColor as CardColor) || !PRINT_COLORS.includes(printColor as PrintColor)) {
      return { error: "Geçerli bir kart rengi ve baskı rengi seçin." };
    }
    attributes = { cardColor: cardColor as CardColor, printColor: printColor as PrintColor, customDesign };
  }

  const rawImages = formData.getAll("images").map((v) => String(v));
  const images = sanitizeProductImages(rawImages);

  return { name, sku, priceKurus, stock, isActive, attributes, images };
}

/** Yeni varyant oluşturur. */
export async function createVariant(
  productId: string,
  _prevState: VariantFormState,
  formData: FormData,
): Promise<VariantFormState> {
  await verifyAdminSession();

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return { error: "Ürün bulunamadı." };
  }

  const fields = readVariantFields(formData);
  if ("error" in fields) {
    return fields;
  }

  const existingSku = await prisma.productVariant.findUnique({ where: { sku: fields.sku } });
  if (existingSku) {
    return { error: `"${fields.sku}" SKU'su zaten kullanılıyor. Lütfen farklı bir SKU girin.` };
  }

  const variant = await prisma.productVariant.create({
    data: {
      productId,
      name: fields.name,
      sku: fields.sku,
      priceKurus: fields.priceKurus,
      stock: fields.stock,
      isActive: fields.isActive,
      attributes: fields.attributes ?? Prisma.JsonNull,
      images: fields.images,
    },
  });

  revalidateCatalog(product.slug);
  redirect(`/admin/urunler/${productId}/varyant/${variant.id}`);
}

/** Var olan bir varyantı günceller. */
export async function updateVariant(
  variantId: string,
  _prevState: VariantFormState,
  formData: FormData,
): Promise<VariantFormState> {
  await verifyAdminSession();

  const current = await prisma.productVariant.findUnique({ where: { id: variantId }, include: { product: true } });
  if (!current) {
    return { error: "Varyant bulunamadı." };
  }

  const fields = readVariantFields(formData);
  if ("error" in fields) {
    return fields;
  }

  if (fields.sku !== current.sku) {
    const existingSku = await prisma.productVariant.findUnique({ where: { sku: fields.sku } });
    if (existingSku) {
      return { error: `"${fields.sku}" SKU'su zaten kullanılıyor. Lütfen farklı bir SKU girin.` };
    }
  }

  await prisma.productVariant.update({
    where: { id: variantId },
    data: {
      name: fields.name,
      sku: fields.sku,
      priceKurus: fields.priceKurus,
      stock: fields.stock,
      isActive: fields.isActive,
      attributes: fields.attributes ?? Prisma.JsonNull,
      images: fields.images,
    },
  });

  revalidateCatalog(current.product.slug);
  redirect(`/admin/urunler/${current.productId}/varyant/${variantId}`);
}

export interface ToggleActiveState {
  error?: string;
  isActive?: boolean;
}

/** Varyantı tek tıkla aktif/pasif yapar. */
export async function toggleVariantActive(variantId: string): Promise<ToggleActiveState> {
  await verifyAdminSession();

  const current = await prisma.productVariant.findUnique({ where: { id: variantId }, include: { product: true } });
  if (!current) {
    return { error: "Varyant bulunamadı." };
  }

  const updated = await prisma.productVariant.update({
    where: { id: variantId },
    data: { isActive: !current.isActive },
  });

  revalidateCatalog(current.product.slug);
  revalidatePath(`/admin/urunler/${current.productId}`);
  return { isActive: updated.isActive };
}
