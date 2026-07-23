import Iyzipay from "iyzipay";

// @types/iyzipay bu uç nokta için ödeme kartı/taksit alanlarını yanlışlıkla zorunlu gösteriyor
// (gerçek Checkout Form API'sinde kart bilgisi hiç sunucumuza gelmez, müşteri iyzico'nun
// barındırdığı sayfada kart bilgisini girer). Gerçek istek gövdesi iyzico Node SDK'sının
// CreateCheckoutFormInitializeRequest modeliyle eşleşir; bu yüzden burada kendi tipimizi
// tanımlayıp çağrı noktasında `as never` ile paket tipini bypass ediyoruz.

export interface CheckoutBuyer {
  id: string;
  name: string;
  surname: string;
  identityNumber: string;
  email: string;
  gsmNumber: string;
  registrationAddress: string;
  city: string;
  country: string;
  zipCode: string;
  ip: string;
}

export interface CheckoutAddress {
  contactName: string;
  city: string;
  country: string;
  address: string;
  zipCode: string;
}

export interface CheckoutBasketItem {
  id: string;
  name: string;
  category1: string;
  itemType: "PHYSICAL" | "VIRTUAL";
  priceKurus: number;
}

export interface BuildCheckoutFormRequestInput {
  conversationId: string;
  basketId: string;
  callbackUrl: string;
  totalKurus: number;
  buyer: CheckoutBuyer;
  shippingAddress: CheckoutAddress;
  billingAddress: CheckoutAddress;
  basketItems: CheckoutBasketItem[];
}

/** Kuruşu iyzico'nun beklediği ondalıklı TL tutar metnine çevirir (örn. 59990 -> "599.90"). */
export function kurusToTutarMetni(kurus: number): string {
  return (kurus / 100).toFixed(2);
}

/** iyzico Checkout Form Initialize isteği için gövdeyi oluşturur. Saf fonksiyon, ağ çağrısı yapmaz. */
export function buildCheckoutFormRequest(input: BuildCheckoutFormRequestInput) {
  const price = kurusToTutarMetni(input.totalKurus);
  return {
    locale: "tr",
    conversationId: input.conversationId,
    price,
    paidPrice: price,
    currency: Iyzipay.CURRENCY.TRY,
    basketId: input.basketId,
    paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
    callbackUrl: input.callbackUrl,
    buyer: input.buyer,
    shippingAddress: input.shippingAddress,
    billingAddress: input.billingAddress,
    basketItems: input.basketItems.map((item) => ({
      id: item.id,
      name: item.name,
      category1: item.category1,
      itemType: item.itemType,
      price: kurusToTutarMetni(item.priceKurus),
    })),
  };
}

let cachedClient: Iyzipay | null = null;

/** iyzico istemcisini tembel olarak kurar; API bilgileri tanımlı değilse açıklayıcı hata fırlatır. */
function getClient(): Iyzipay {
  if (cachedClient) {
    return cachedClient;
  }
  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;
  const uri = process.env.IYZICO_BASE_URL;
  if (!apiKey || !secretKey || !uri) {
    throw new Error(
      "iyzico API bilgileri tanımlı değil. .env dosyasında IYZICO_API_KEY, IYZICO_SECRET_KEY ve IYZICO_BASE_URL doldurulmalı.",
    );
  }
  cachedClient = new Iyzipay({ apiKey, secretKey, uri });
  return cachedClient;
}

export interface CheckoutFormInitializeResponse {
  token: string;
  checkoutFormContent: string;
}

interface IyzicoErrorFields {
  errorMessage?: string;
}

/** Checkout Form'u başlatır ve ödeme sayfası içeriğini (token + gömülecek script) döner. */
export function initializeCheckoutForm(
  input: BuildCheckoutFormRequestInput,
): Promise<CheckoutFormInitializeResponse> {
  const request = buildCheckoutFormRequest(input);
  return new Promise((resolve, reject) => {
    getClient().checkoutFormInitialize.create(request as never, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      if (result.status !== "success") {
        const message =
          (result as unknown as IyzicoErrorFields).errorMessage ??
          "iyzico ödeme başlatma isteği başarısız oldu.";
        reject(new Error(message));
        return;
      }
      resolve({ token: result.token, checkoutFormContent: result.checkoutFormContent });
    });
  });
}

export interface CheckoutFormRetrieveResponse {
  status: string;
  paymentStatus: string;
  conversationId?: string;
  basketId: string;
  paymentId: string;
  price: number | string;
  paidPrice: number | string;
}

/** Ödeme sonucunu iyzico'dan sorgular. Sipariş durumu yalnızca bu sunucu-sunucu çağrısına göre belirlenmelidir. */
export function retrieveCheckoutForm(token: string): Promise<CheckoutFormRetrieveResponse> {
  return new Promise((resolve, reject) => {
    getClient().checkoutForm.retrieve({ token }, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
}

/** iyzico sorgu sonucunun ödemenin gerçekten başarılı sayılıp sayılamayacağını belirler. */
export function isPaymentSuccessful(result: Pick<CheckoutFormRetrieveResponse, "status" | "paymentStatus">): boolean {
  return result.status === "success" && result.paymentStatus === "SUCCESS";
}
