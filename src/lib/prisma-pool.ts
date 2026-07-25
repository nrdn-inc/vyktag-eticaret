import type { PrismaMariaDb } from "@prisma/adapter-mariadb";

/** Adaptörün kabul ettiği nesne biçimli havuz yapılandırması (string varyantı hariç). */
export type MariaDbPoolConfig = Extract<ConstructorParameters<typeof PrismaMariaDb>[0], object>;

/**
 * Hostinger MySQL sunucusunun ölçülen varsayılan wait_timeout'u: boştaki bir bağlantı
 * bu süre sonunda sunucu tarafından kapatılır. Asıl kesintinin kaynağı bu değerdi.
 */
export const SERVER_DEFAULT_WAIT_TIMEOUT_SECONDS = 20;

/**
 * Bağlantı kurulduğunda oturum bazında ayarladığımız wait_timeout (saniye).
 * Hostinger oturum düzeyinde yükseltmeye izin veriyor (ölçüldü: 20 -> 600 kabul edildi
 * ve bağlantı 35 saniye sonra hâlâ canlıydı), böylece boştaki bağlantı 20 saniyede bir
 * değil, 10 dakikada bir yenilenir.
 */
export const SESSION_WAIT_TIMEOUT_SECONDS = 600;

/**
 * KÖK NEDEN VE DÜZELTME
 *
 * Hostinger hesabının ölçülen limitleri:
 *   wait_timeout             = 20 sn -> boştaki bağlantıyı sunucu 20 saniyede kapatır
 *   MAX_CONNECTIONS_PER_HOUR = 500   -> hesap başına saatte en fazla 500 YENİ bağlantı
 *   MAX_USER_CONNECTIONS     = 75    -> aynı anda en fazla 75 açık bağlantı
 *
 * mariadb sürücüsünün varsayılanları bu limitlerle çakışıyordu: `minimumIdle` varsayılan
 * olarak `connectionLimit`e (10) eşittir, yani havuz hiç trafik olmasa bile 10 boşta
 * bağlantıyı ayakta TUTMAYA çalışır. Sunucu bunları 20 saniyede kapattığı için havuz
 * anında yeniden bağlanıyor ve bu döngü sonsuza kadar sürüyordu.
 *
 * Ölçüm (sıfır trafik, connectionLimit=2): havuzun tamamı tam 20 saniyede bir yenilendi
 * -> connectionLimit=10 ile ~1440 yeni bağlantı/saat, yani 500'lük kotanın ~3 katı.
 * Kota dolunca sunucu yeni bağlantıları reddeder, her sorgu `acquireTimeout` boyunca
 * bloke olur, istekler birikir ve hosting'in eşzamanlı işlem (Max Processes) limiti
 * dolarak 503'e yol açar. Yük CPU/RAM'de görünmez, çünkü işlemler çalışmaz — bekler.
 *
 * Düzeltme iki ayaklı: boşta tutulan bağlantı sayısını 10'dan 1'e indirmek ve o tek
 * bağlantının ömrünü 20 saniyeden 600 saniyeye çıkarmak. Sonuç: ~1440 bağlantı/saat
 * yerine ~6 bağlantı/saat (yaklaşık 240 kat azalma).
 */
export const POOL_TUNING = {
  /**
   * DİKKAT — sürücü kısıtı: bu değer 0 OLAMAZ. Havuzun bağlantı kurduğu tek kod yolu
   * `_shouldCreateMoreConnections()` ve oradaki koşul `idleConnections.length <
   * minimumIdle`. 0 verilirse `0 < 0` asla doğru olmaz, havuz hiç bağlantı kuramaz ve
   * her sorgu "pool timeout ... active=0 idle=0" ile başarısız olur. 1, sürücünün izin
   * verdiği en düşük ve bizim istediğimiz değer: tek bir bağlantı sıcak tutulur,
   * gerisi talebe göre connectionLimit'e kadar açılır.
   */
  minimumIdle: 1,
  /**
   * Her yeni bağlantıda oturumun wait_timeout'unu yükseltir. Sıcak tutulan bağlantının
   * 20 saniyede bir kopup yeniden kurulmasını engelleyen asıl düzeltme budur.
   */
  initSql: `SET SESSION wait_timeout=${SESSION_WAIT_TIMEOUT_SECONDS}`,
  /**
   * Talep anında açılan FAZLA bağlantıları (minimumIdle üzerindekileri) bu süre sonunda
   * bırakırız. Oturum wait_timeout'undan küçük olmalı ki kapatma kararı bizde kalsın.
   * Saniye cinsindendir.
   */
  idleTimeout: 60,
  /**
   * 75'lik eşzamanlı bağlantı sınırını birden çok Node.js işlemiyle paylaşıyoruz
   * (Hostinger uygulamayı tek işlemle çalıştırmayı garanti etmez), bu yüzden işlem
   * başına payı küçük tutuyoruz. DATABASE_CONNECTION_LIMIT ile ayarlanabilir.
   */
  connectionLimit: 5,
  /**
   * Havuz dolduğunda isteği 10 saniye (sürücü varsayılanı) bekletmek, işlemi o süre
   * boyunca meşgul tutar ve tam da tükenmek istemediğimiz eşzamanlı işlem limitini
   * doldurur. Hızlı başarısız olmak yığılmayı engeller. Milisaniye cinsindendir.
   */
  acquireTimeout: 5000,
  connectTimeout: 5000,
} as const satisfies Partial<MariaDbPoolConfig>;

/** connectionLimit için ortam değişkeni geçersiz kılması; tanımsız/geçersizse varsayılan kullanılır. */
function resolveConnectionLimit(raw: string | undefined): number {
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return POOL_TUNING.connectionLimit;
  }
  return parsed;
}

/**
 * DATABASE_URL'i sürücünün nesne yapılandırmasına çevirir ve yukarıdaki güvenli havuz
 * ayarlarını uygular. Bağlantı dizesini string olarak geçmek bu ayarları uygulamamıza
 * izin vermiyor (adaptör string'i doğrudan createPool'a devrediyor), bu yüzden URL'i
 * burada ayrıştırıyoruz.
 */
export function buildPoolConfig(
  databaseUrl: string | undefined,
  connectionLimitOverride?: string,
): MariaDbPoolConfig {
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL tanımlı değil. .env dosyasında veritabanı bağlantı adresi doldurulmalı.",
    );
  }

  let url: URL;
  try {
    url = new URL(databaseUrl);
  } catch {
    throw new Error(
      "DATABASE_URL geçerli bir bağlantı adresi değil (örn. mysql://kullanici:sifre@sunucu:3306/veritabani).",
    );
  }

  const database = url.pathname.replace(/^\//, "");
  if (!database) {
    throw new Error(
      "DATABASE_URL bir veritabanı adı içermiyor (adresin sonunda /veritabani_adi olmalı).",
    );
  }

  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database,
    ...POOL_TUNING,
    connectionLimit: resolveConnectionLimit(connectionLimitOverride),
  };
}
