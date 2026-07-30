import { revalidatePath, revalidateTag } from "next/cache";
import { CATALOG_CACHE_TAG } from "@/lib/catalog";
import { REVALIDATE_PATHS, isRevalidateAuthorized } from "@/lib/revalidate";

// On-demand yenileme endpoint'i: seed/katalog güncellemesi sonrası ISR sayfalarını
// beklemeden yeniler. Gizli anahtar `x-revalidate-secret` başlığı veya `?secret=` ile gönderilir.
// Her istekte taze veri gerektiği için bu handler'ın kendisi statik üretilmemeli.
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const provided =
    request.headers.get("x-revalidate-secret") ??
    new URL(request.url).searchParams.get("secret");

  if (!isRevalidateAuthorized(provided, process.env.REVALIDATE_SECRET)) {
    return Response.json({ ok: false, error: "Yetkisiz istek." }, { status: 401 });
  }

  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path);
  }
  // Route Handler içinde updateTag kullanılamaz (yalnızca Server Action'larda çalışır) —
  // bu uç noktanın amacı zaten "beklemeden yenile" olduğundan { expire: 0 } ile anında
  // geçersiz kılıyoruz (bkz. Next.js revalidateTag dokümantasyonu).
  revalidateTag(CATALOG_CACHE_TAG, { expire: 0 });

  return Response.json({
    ok: true,
    revalidated: REVALIDATE_PATHS,
    revalidatedAt: new Date().toISOString(),
  });
}
