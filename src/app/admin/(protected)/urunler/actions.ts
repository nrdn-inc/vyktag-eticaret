"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { verifyAdminSession } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/prisma";
import { CATALOG_CACHE_TAG } from "@/lib/catalog";
import { REVALIDATE_PATHS } from "@/lib/revalidate";
import { slugify } from "@/lib/slugify";

export interface ProductFormState {
  error?: string;
}

function revalidateCatalog(slug?: string) {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path);
  }
  if (slug) {
    revalidatePath(`/urunler/${slug}`);
  }
  updateTag(CATALOG_CACHE_TAG);
}

function readProductFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const isActive = formData.get("isActive") === "on";
  return { name, slug: slugify(rawSlug || name), description, isActive };
}

/** Yeni ürün oluşturur (isteğe bağlı varyantsız — ilk varyant düzenleme sayfasında eklenir). */
export async function createProduct(_prevState: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await verifyAdminSession();

  const { name, slug, description, isActive } = readProductFields(formData);
  if (!name) {
    return { error: "Ürün adı gerekli." };
  }
  if (!slug) {
    return { error: "Geçerli bir slug oluşturulamadı — lütfen ürün adını veya slug'ı kontrol edin." };
  }
  if (!description) {
    return { error: "Açıklama gerekli." };
  }

  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) {
    return { error: `"${slug}" slug'ı zaten kullanılıyor. Lütfen farklı bir slug girin.` };
  }

  const product = await prisma.product.create({
    data: { name, slug, description, isActive, images: [] },
  });

  revalidateCatalog(slug);
  redirect(`/admin/urunler/${product.id}`);
}

/** Var olan bir ürünün ad/slug/açıklama/aktiflik alanlarını günceller. */
export async function updateProduct(
  productId: string,
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await verifyAdminSession();

  const current = await prisma.product.findUnique({ where: { id: productId } });
  if (!current) {
    return { error: "Ürün bulunamadı." };
  }

  const { name, slug, description, isActive } = readProductFields(formData);
  if (!name) {
    return { error: "Ürün adı gerekli." };
  }
  if (!slug) {
    return { error: "Geçerli bir slug oluşturulamadı — lütfen ürün adını veya slug'ı kontrol edin." };
  }
  if (!description) {
    return { error: "Açıklama gerekli." };
  }

  if (slug !== current.slug) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      return { error: `"${slug}" slug'ı zaten kullanılıyor. Lütfen farklı bir slug girin.` };
    }
  }

  await prisma.product.update({
    where: { id: productId },
    data: { name, slug, description, isActive },
  });

  revalidateCatalog(current.slug);
  if (slug !== current.slug) {
    revalidateCatalog(slug);
  }
  redirect(`/admin/urunler/${productId}`);
}

export interface ToggleActiveState {
  error?: string;
  isActive?: boolean;
}

/** Ürünü tek tıkla aktif/pasif yapar — mevcut durumu okuyup tersine çevirir. */
export async function toggleProductActive(productId: string): Promise<ToggleActiveState> {
  await verifyAdminSession();

  const current = await prisma.product.findUnique({ where: { id: productId } });
  if (!current) {
    return { error: "Ürün bulunamadı." };
  }

  const updated = await prisma.product.update({
    where: { id: productId },
    data: { isActive: !current.isActive },
  });

  revalidateCatalog(updated.slug);
  revalidatePath("/admin/urunler");
  return { isActive: updated.isActive };
}
