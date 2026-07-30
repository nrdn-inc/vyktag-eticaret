/**
 * Tek seferlik kurulum script'i: iyzico Abonelik ürününde "VYKTag Abonelik" ürününü (yoksa)
 * ve altında 6 aylık + yıllık Fiyatlandırma Planlarını oluşturur, ardından dönen referans
 * kodlarını veritabanındaki SubscriptionPlan.iyzicoPricingPlanRef alanına yazar.
 *
 * Idempotentlik iyzico tarafındaki isimle eşleştirmeye değil, kendi veritabanımızdaki
 * iyzicoPricingPlanRef alanının dolu olup olmadığına dayanır: bir plan için bu alan zaten
 * doluysa o plan atlanır, tekrar çalıştırmak güvenlidir.
 *
 * Önce `npm run db:seed` ile catalog-seed.ts'teki (henüz iyzicoPricingPlanRef'siz)
 * SubscriptionPlan satırları oluşturulmuş olmalı.
 *
 * Çalıştırma: npx tsx scripts/iyzico-setup-subscription-plans.ts
 */
import "dotenv/config";
import Iyzipay from "iyzipay";
import { prisma } from "../src/lib/prisma";

const PRODUCT_NAME = "VYKTag Abonelik";
const PRODUCT_DESCRIPTION = "VYKTag dijital profil kullanım hakkı aboneliği";

interface PlanToProvision {
  slug: string;
  name: string;
  priceKurus: number;
  paymentInterval: "MONTHLY" | "YEARLY";
  paymentIntervalCount: number;
}

const PLANS_TO_PROVISION: PlanToProvision[] = [
  { slug: "vyktag-abonelik-6ay", name: "VYKTag Abonelik (6 Ay)", priceKurus: 14999, paymentInterval: "MONTHLY", paymentIntervalCount: 6 },
  { slug: "vyktag-abonelik-yillik", name: "VYKTag Abonelik (Yıllık)", priceKurus: 19999, paymentInterval: "YEARLY", paymentIntervalCount: 1 },
];

function getClient(): Iyzipay {
  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;
  const uri = process.env.IYZICO_BASE_URL;
  if (!apiKey || !secretKey || !uri) {
    throw new Error("iyzico API bilgileri tanımlı değil (.env: IYZICO_API_KEY, IYZICO_SECRET_KEY, IYZICO_BASE_URL).");
  }
  return new Iyzipay({ apiKey, secretKey, uri });
}

interface IyzicoErrorFields {
  errorMessage?: string;
}

function assertSuccess(result: { status?: string } & IyzicoErrorFields, action: string): void {
  if (result.status !== "success") {
    throw new Error(`${action} başarısız: ${result.errorMessage ?? "bilinmeyen hata"}`);
  }
}

/** iyzico'nun ürün listesi yanıtını (v2 sarmalama biçimi ne olursa olsun) bir diziye normalize eder. */
function extractProductList(result: unknown): Array<{ name?: string; productReferenceCode?: string }> {
  const withData = result as { data?: unknown };
  const data = withData?.data ?? result;
  if (Array.isArray(data)) return data as Array<{ name?: string; productReferenceCode?: string }>;
  const withContent = data as { content?: unknown; items?: unknown };
  if (Array.isArray(withContent?.content)) return withContent.content as Array<{ name?: string; productReferenceCode?: string }>;
  if (Array.isArray(withContent?.items)) return withContent.items as Array<{ name?: string; productReferenceCode?: string }>;
  return [];
}

async function findExistingProductReferenceCode(client: Iyzipay): Promise<string | null> {
  const result = await new Promise<unknown>((resolve, reject) => {
    client.subscriptionProduct.retrieveList({ page: 1, count: 50 } as never, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
  const products = extractProductList(result);
  const match = products.find((p) => p.name === PRODUCT_NAME);
  return match?.productReferenceCode ?? null;
}

async function createProduct(client: Iyzipay): Promise<string> {
  const result = await new Promise<{ status?: string; data?: { productReferenceCode?: string } } & IyzicoErrorFields>(
    (resolve, reject) => {
      client.subscriptionProduct.create({ locale: "tr", name: PRODUCT_NAME, description: PRODUCT_DESCRIPTION } as never, (err, res) => {
        if (err) reject(err);
        else resolve(res as never);
      });
    },
  );
  assertSuccess(result, "Abonelik ürünü oluşturma");
  const ref = result.data?.productReferenceCode;
  if (!ref) throw new Error("Abonelik ürünü oluşturuldu ama productReferenceCode dönmedi.");
  return ref;
}

async function createPricingPlan(client: Iyzipay, productReferenceCode: string, plan: PlanToProvision): Promise<string> {
  const result = await new Promise<{ status?: string; data?: { pricingPlanReferenceCode?: string } } & IyzicoErrorFields>(
    (resolve, reject) => {
      client.subscriptionPricingPlan.create(
        {
          productReferenceCode,
          locale: "tr",
          name: plan.name,
          price: (plan.priceKurus / 100).toFixed(2),
          currencyCode: "TRY",
          paymentInterval: Iyzipay.SUBSCRIPTION_PRICING_PLAN_INTERVAL[plan.paymentInterval],
          paymentIntervalCount: plan.paymentIntervalCount,
          planPaymentType: Iyzipay.PLAN_PAYMENT_TYPE.RECURRING,
        } as never,
        (err, res) => {
          if (err) reject(err);
          else resolve(res as never);
        },
      );
    },
  );
  assertSuccess(result, `"${plan.name}" fiyatlandırma planı oluşturma`);
  const ref = result.data?.pricingPlanReferenceCode;
  if (!ref) throw new Error(`"${plan.name}" oluşturuldu ama pricingPlanReferenceCode dönmedi.`);
  return ref;
}

async function main() {
  const dbPlans = await prisma.subscriptionPlan.findMany({
    where: { slug: { in: PLANS_TO_PROVISION.map((p) => p.slug) } },
  });

  const missing = PLANS_TO_PROVISION.filter((p) => {
    const row = dbPlans.find((r) => r.slug === p.slug);
    return !row || !row.iyzicoPricingPlanRef;
  });

  if (missing.length === 0) {
    console.log("Tüm planlar zaten iyzico referans koduna sahip, yapılacak bir şey yok.");
    return;
  }

  const client = getClient();

  let productReferenceCode = await findExistingProductReferenceCode(client);
  if (productReferenceCode) {
    console.log(`Mevcut "${PRODUCT_NAME}" ürünü bulundu: ${productReferenceCode}`);
  } else {
    productReferenceCode = await createProduct(client);
    console.log(`"${PRODUCT_NAME}" ürünü oluşturuldu: ${productReferenceCode}`);
  }

  for (const plan of missing) {
    const pricingPlanRef = await createPricingPlan(client, productReferenceCode, plan);
    await prisma.subscriptionPlan.update({ where: { slug: plan.slug }, data: { iyzicoPricingPlanRef: pricingPlanRef } });
    console.log(`"${plan.name}" planı oluşturuldu ve kaydedildi: ${pricingPlanRef}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
