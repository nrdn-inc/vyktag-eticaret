# Temel UI Kiti

VYKTag'in tüm sayfalarında (mağaza + admin + hesap) tekrar eden ad-hoc Tailwind kalıplarının
(`rounded-full bg-brand px-6 py-2.5 ...` gibi elle kopyalanan class blokları) yerini alacak,
tek kaynaktan yönetilen, erişilebilir bileşen kümesi. Mevcut sayfalar zorla taşınmadı — yeni
kod buradan başlar, eskisi kademeli olarak buraya geçebilir.

```ts
import { Button, Input, Modal, EmptyState } from "@/components/ui";
```

## 1. Mimari

```
src/components/ui/
├── Button.tsx        # + buttonVariants (Link'i buton gibi göstermek için)
├── Spinner.tsx
├── field-shell.tsx    # Input/Textarea/Select'in ortak label+hata+açıklama çerçevesi (dahili)
├── Input.tsx          # + fieldVariants (Textarea/Select bunu paylaşır)
├── Textarea.tsx
├── Select.tsx
├── Checkbox.tsx
├── RadioGroup.tsx
├── Switch.tsx
├── Modal.tsx           # "use client"
├── Tabs.tsx            # "use client" — Tabs/TabList/Tab/TabPanel
├── Skeleton.tsx        # + SkeletonText
├── Badge.tsx
├── Alert.tsx
├── EmptyState.tsx
├── Pagination.tsx      # + getPaginationRange (saf fonksiyon)
├── Table.tsx            # Table/TableHeader/TableBody/TableRow/TableHead/TableCell/TableCaption
└── index.ts             # tek barrel export
```

Kararlar:

- **Varyantlar `class-variance-authority` (cva) ile tanımlanır**, sınıf birleştirme
  `clsx` + `tailwind-merge` (`@/lib/cn`) ile yapılır. Çağıran taraf `className` verirse,
  çakışan Tailwind utility'lerinde her zaman **sizin verdiğiniz kazanır** (`twMerge` sayesinde
  `className="mt-4"` ile varyantın kendi margin'i varsa bile öngörülebilir şekilde ezilir).
- **`FieldShell` + `useFieldIds`** (`field-shell.tsx`), Input/Textarea/Select arasında
  paylaşılan tek parça: label↔input eşlemesi, `aria-describedby`, hata varken açıklamanın
  gizlenmesi kuralı tek yerde yaşar. Yeni bir form alanı eklerken (ör. bir `DatePicker`)
  bunu yeniden yazmayın, `useFieldIds` + `FieldShell`'i kullanın.
- **`"use client"` yalnızca gerçekten kaçınılmaz olduğunda.** Button/Input/Textarea/Select/
  Checkbox/RadioGroup/Switch/Badge/Alert/Skeleton/EmptyState/Pagination/Table hiç hook
  kullanmaz ya da yalnızca `useId` kullanır (React Server Component ağacında da çalışır) — bir
  Server Component sayfası bunları hiç client JS göndermeden render edebilir. `Pagination` ve
  `TableHead`'in `onPageChange`/`onSort` callback'leri bile bunu bozmaz: fonksiyon zaten bir
  Client Component'ten prop olarak geliyorsa, aradaki Server Component onu yalnızca ilgili DOM
  elemanına iletir. Yalnızca **Modal** (`useEffect`, `createPortal`, klavye dinleyicileri) ve
  **Tabs** (seçili sekme durumu + ok tuşu gezinmesi) gerçek istemci etkileşimi gerektirir ve
  `"use client"` taşır.
- **Native elemanlar tercih edilir.** `Select` özel bir listbox değil, stillenmiş bir
  `<select>`'tir; `Checkbox`/`RadioGroup`/`Switch` özel bir görsel katman içermez, native
  `<input type="checkbox"|"radio">` + `accent-color` (Tailwind `accent-brand`) ile temaya
  bağlanır; `RadioGroup`'ta ok tuşu gezinmesi hiç JS yazılmadan, aynı `name`'e sahip native
  radio'ların tarayıcı davranışından gelir; `Table`, özel bir "DataTable" bileşeni değil, native
  `<table>` üzerine ince bir stil katmanıdır; `Modal` özel bir portal/focus-trap kütüphanesi
  (Radix vb.) değil, elle yazılmış ~130 satırlık bir uygulamadır. Bağımlılık yüzeyini küçük
  tutar, platformun yıllarca test edilmiş klavye/ekran okuyucu davranışından yararlanır.
- **Renkler tema token'larına dayanır** (`brand`, `brand-dark`, `accent`, `surface`,
  `border-soft`, `background`) — bunlar `globals.css`'te `prefers-color-scheme` ile otomatik
  değişir, çoğu yerde elle `dark:` yazmanıza gerek kalmaz. Form alanları ve metin renkleri gibi
  token'ı olmayan yerlerde mevcut kod tabanıyla tutarlı kalmak için `zinc-*` ölçeği + `dark:`
  kullanılmaya devam eder.

## 2. Bileşenler

### Button

| Prop          | Tip                                                                          | Varsayılan  | Açıklama                                          |
| ------------- | ----------------------------------------------------------------------------- | ----------- | -------------------------------------------------- |
| `variant`     | `primary \| secondary \| outline \| ghost \| destructive \| link`             | `primary`   |                                                      |
| `size`        | `sm \| md \| lg \| icon`                                                      | `md`        | `icon`: kare, yalnızca ikon içeren butonlar için    |
| `loading`     | `boolean`                                                                      | `false`     | Butonu kilitler, spinner gösterir, `aria-busy` ekler |
| `loadingText` | `ReactNode`                                                                    | —           | `loading` iken children yerine gösterilir (opsiyonel) |
| `leftIcon` / `rightIcon` | `ReactNode`                                                        | —           |                                                      |
| `fullWidth`   | `boolean`                                                                      | `false`     |                                                      |
| ...           | native `<button>` özellikleri (`onClick`, `disabled`, `type`, `aria-*`, ...) |             |                                                      |

```tsx
<Button onClick={handleSave} loading={isPending} loadingText="Kaydediliyor…">
  Kaydet
</Button>

<Button variant="outline" size="sm" leftIcon={<TrashIcon />}>
  Sil
</Button>

// Bir <Link>'i buton gibi göstermek — semantik olarak gezinmedir, <button> DEĞİLDİR:
import Link from "next/link";
import { buttonVariants } from "@/components/ui";

<Link href="/urunler" className={buttonVariants({ variant: "outline" })}>
  Ürünleri gör
</Link>
```

**Dikkat:** Varsayılan `type="button"`. HTML'in form içi butonlarda varsayılanı olan
`type="submit"`, bir formun içine konan "iptal"/"sil" gibi butonların istemeden formu
göndermesine yol açan çok yaygın bir hatadır. Gönderim yapması gereken butonda
`type="submit"` **açıkça** verin.

### Input / Textarea / Select

Üçü de aynı API şeklini paylaşır: `label`, `description`, `error`, `fieldSize`
(`sm | md | lg`), `containerClassName` (dış sarmalayıcı) + native elemanın tüm özellikleri.
`error` verildiğinde `aria-invalid` + `role="alert"` otomatik bağlanır; `description` yalnızca
hata yokken görünür (ikisi aynı anda gösterilmez, dikey yer kaplamaz).

```tsx
<Input
  label="E-posta"
  type="email"
  required
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
/>

<Textarea label="Not" description="İsteğe bağlı, siparişe eklenir." autoResize />

<Select
  label="Kart rengi"
  placeholder="Seçiniz"
  options={[{ value: "siyah", label: "Siyah" }, { value: "beyaz", label: "Beyaz" }]}
  value={color}
  onChange={(e) => setColor(e.target.value)}
/>
```

**Dikkat:** `id` vermezseniz `useId` ile üretilir — bu, aynı formda birden çok kez render
edilen bileşenlerde (ör. bir liste içindeki her satırda tekrar eden bir input) bile
çakışmaz. `id`'yi yalnızca dışarıdan bir `<label htmlFor>` ile elle eşlemeniz gerektiğinde
verin.

### Checkbox / RadioGroup / Switch

Üçü de anlamsal olarak farklı bir eylemi temsil eder — birbirinin yerine kullanılmamalı:
`Checkbox` bir formun parçası olarak gönderilecek bağımsız bir açık/kapalı değer (ör. "şartları
kabul ediyorum"), `RadioGroup` bir küme içinden **tek** seçim (`Select` ile aynı `options`/
`value`/`onChange` şekli), `Switch` bir formun gönderimini beklemeden **anında** uygulanan bir
ayar (ör. "iki adımlı doğrulamayı aç").

```tsx
<Checkbox
  label="Kampanya e-postalarını almak istiyorum"
  checked={optIn}
  onChange={(e) => setOptIn(e.target.checked)}
/>

<RadioGroup
  name="kart-rengi"
  label="Kart rengi"
  options={[{ value: "siyah", label: "Siyah" }, { value: "beyaz", label: "Beyaz" }]}
  value={color}
  onChange={setColor}
/>

<Switch
  label="İki adımlı doğrulama"
  description="Girişte SMS veya kimlik doğrulama uygulaması ister."
  checked={twoFactorEnabled}
  onChange={(e) => setTwoFactorEnabled(e.target.checked)}
/>
```

**Dikkat (indeterminate):** `Checkbox` üç durumlu (ör. bir tablodaki "tümünü seç" satırı) bir
prop **almaz** — bu, bileşeni bir Effect eklemeye (dolayısıyla `"use client"`e) zorlardı. Bunun
yerine `ref` üzerinden doğrudan atayın: `checkboxRef.current.indeterminate = true`.

### Tabs

```tsx
// Tabs.tsx zaten "use client" taşır — bunu kullanan sayfa bir Server Component olarak kalabilir,
// Tabs'ı çocuk olarak render etmek onu client yapmaya zorlamaz.
<Tabs defaultValue="genel">
  <TabList aria-label="Ürün bilgisi">
    <Tab value="genel">Genel</Tab>
    <Tab value="teknik">Teknik özellikler</Tab>
    <Tab value="stok" disabled>Stok (yakında)</Tab>
  </TabList>
  <TabPanel value="genel">...</TabPanel>
  <TabPanel value="teknik">...</TabPanel>
  <TabPanel value="stok">...</TabPanel>
</Tabs>
```

WAI-ARIA "Tabs" desenini (otomatik aktivasyon) uygular: ok tuşlarıyla gezinme (yatayda ←/→,
`orientation="vertical"` ile ↑/↓), Home/End ile ilk/son sekmeye atlama, devre dışı sekmelerin
gezinmede atlanması, roving tabindex. Kontrolsüz (`defaultValue`) veya kontrollü (`value` +
`onValueChange`) kullanılabilir. `TabPanel`, varsayılan olarak seçili değilken `hidden` ile
gizlenir ama DOM'da kalır (sekmeler arası state, ör. doldurulmuş bir form, korunur); pahalı/veri
çeken bir panel için `unmountOnHide` verin.

### Modal

| Prop                  | Tip                        | Varsayılan | Açıklama                                                     |
| ---------------------- | --------------------------- | ---------- | -------------------------------------------------------------- |
| `open`                | `boolean`                   | —          | zorunlu                                                          |
| `onClose`             | `() => void`                | —          | zorunlu — ESC, arka plan tıklaması, X butonu hepsi bunu çağırır |
| `title` / `ariaLabel` | `ReactNode` / `string`      | —          | İkisinden **biri** zorunlu (erişilebilir ad için)               |
| `description`         | `ReactNode`                 | —          |                                                                  |
| `footer`              | `ReactNode`                 | —          | Sağa yaslı eylem butonları için                                 |
| `size`                | `sm \| md \| lg \| xl \| full` | `md`    |                                                                  |
| `closeOnOverlayClick` / `closeOnEsc` | `boolean`      | `true`     |                                                                  |
| `initialFocusRef`     | `RefObject<HTMLElement>`     | —          | Verilmezse içerikteki (footer dahil) ilk odaklanabilir eleman   |

```tsx
const [open, setOpen] = useState(false);

<Modal
  open={open}
  onClose={() => setOpen(false)}
  title="Adresi sil"
  description="Bu işlem geri alınamaz."
  footer={
    <>
      <Button variant="ghost" onClick={() => setOpen(false)}>Vazgeç</Button>
      <Button variant="destructive" onClick={handleDelete}>Sil</Button>
    </>
  }
>
  <p>Bu adres tüm siparişlerinizden kaldırılacak.</p>
</Modal>
```

İçerir: focus trap (Tab döngüsü modal içinde kalır), açılışta odağın içeriğe (kendi "Kapat"
butonuna değil) gitmesi, kapanışta odağın tetikleyici elemana dönmesi, body scroll kilidi,
`document.body`'ye portal (SSR-güvenli — `useSyncExternalStore` ile mount kontrolü).

**Bilinen sınır:** İç içe (nested) modal senaryosunda scroll-kilit geri yüklemesi basit
save/restore'dur, sayaç tutmaz. Şu an tek seferde bir modal açık varsayımıyla yeterlidir;
sihirbaz/çok adımlı akışlar için ayrı bir kilit sayacı eklenmeli.

### Skeleton / SkeletonText

```tsx
{isLoading ? <SkeletonText lines={3} /> : <p>{product.description}</p>}
{isLoading ? <Skeleton variant="circular" width={40} height={40} /> : <Avatar />}
```

Salt görsel bir ipucudur (`aria-hidden`). Gerçek "yükleniyor" durumunun ekran okuyucuya
duyurulması ayrıdır — bkz. aşağıdaki "Yükleme durumları" pratiği.

### Badge

```tsx
<Badge variant={stock > 0 ? "success" : "danger"}>{stock > 0 ? "Stokta" : "Tükendi"}</Badge>
```

### Alert

```tsx
<Alert variant="danger" title="Ödeme başarısız">
  Kartınızdan tahsilat yapılamadı. Lütfen tekrar deneyin.
</Alert>

<Alert variant="success" onDismiss={() => setShow(false)}>
  Adresiniz kaydedildi.
</Alert>
```

`danger`/`warning` → `role="alert"` (assertive, kullanıcının o an yaptığını böler);
`info`/`success` → `role="status"` (polite, sıraya girer). Bu ayrımı siz seçmezsiniz,
`variant`'a göre otomatik belirlenir.

### EmptyState

```tsx
<EmptyState
  icon={<CartIcon className="h-6 w-6" />}
  title="Sepetiniz boş"
  description="Ürün eklemek için mağazaya göz atın."
  action={<Button onClick={() => router.push("/urunler")}>Ürünleri keşfet</Button>}
/>
```

### Pagination

```tsx
// Bağlantı modu — SEO-dostu, JS gerekmeden çalışır (ör. /urunler?sayfa=2)
<Pagination page={page} totalPages={totalPages} hrefFor={(p) => `/urunler?sayfa=${p}`} />

// next/link ile istemci taraflı gezinme/prefetch isteniyorsa:
<Pagination
  page={page}
  totalPages={totalPages}
  hrefFor={(p) => `/urunler?sayfa=${p}`}
  renderLink={({ href, className, children, "aria-current": ariaCurrent, "aria-label": ariaLabel }) => (
    <Link href={href} className={className} aria-current={ariaCurrent} aria-label={ariaLabel}>
      {children}
    </Link>
  )}
/>

// Buton modu — bir tablo/liste durumunu client'ta kontrol ediyorsanız
<Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
```

`totalPages <= 1` iken hiçbir şey render etmez. Sayfa numaraları arasındaki `…` (ellipsis)
mantığı `getPaginationRange(page, totalPages, { siblingCount })` adlı saf bir fonksiyonla
hesaplanır — bağımsız test edilebilir, farklı bir görünüm gerekirse doğrudan içe aktarılabilir.

### Table

```tsx
<Table>
  <TableCaption>Son 30 günün siparişleri</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Sipariş no</TableHead>
      <TableHead align="right" sortDirection={sort === "tutar" ? sortDir : false} onSort={() => toggleSort("tutar")}>
        Tutar
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {orders.map((order) => (
      <TableRow key={order.id} selected={selectedIds.has(order.id)}>
        <TableCell>{order.code}</TableCell>
        <TableCell align="right">{formatPriceTRY(order.totalKurus)}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

Bilinçli olarak bir "DataTable" mega-bileşeni **değil** — `Select`in native `<select>`'i tercih
etmesi gibi, `Table` da native `<table>` üzerine ince bir stil katmanıdır; sıralama/sayfalama/
seçim durumu çağıran tarafta tutulur, `TableHead`'in `onSort`'u ve ayrı `Pagination` bileşeniyle
birleştirilir. Yatayda taşan geniş tablolar otomatik olarak yalnızca kendi içinde kayar (sayfa
değil). Yükleniyor durumu için satır hücrelerinin içine `Skeleton` koyun; boş durum için
`colSpan` veren tek bir satır içine `EmptyState` yerleştirin:

```tsx
<TableBody>
  {isLoading ? (
    Array.from({ length: 3 }).map((_, i) => (
      <TableRow key={i}>
        <TableCell colSpan={2}><SkeletonText lines={1} /></TableCell>
      </TableRow>
    ))
  ) : orders.length === 0 ? (
    <TableRow>
      <TableCell colSpan={2}>
        <EmptyState title="Henüz sipariş yok" description="İlk sipariş geldiğinde burada görünecek." />
      </TableCell>
    </TableRow>
  ) : (
    orders.map((order) => /* ... */)
  )}
</TableBody>
```

## 3. En iyi pratikler

**Yükleme durumları.** Buton içi bir eylem için `Button`'ın `loading` prop'unu kullanın
(spinner + `aria-busy` + kilit otomatik). Bir kart/liste/tablo yüklenirken `Skeleton`/
`SkeletonText` kullanın; içeren elemana `aria-busy="true"` eklemeyi unutmayın — `Skeleton`'ın
kendisi `aria-hidden` olduğu için ekran okuyucuya "yükleniyor" bilgisini *siz* taşımalısınız:

```tsx
<section aria-busy={isLoading}>
  {isLoading ? <SkeletonText lines={3} /> : <ProductDescription product={product} />}
</section>
```

**Boş durumlar.** Bir liste/tablo/arama sonucu boşsa sessizce boş bir `<div>` bırakmayın,
`EmptyState` kullanın — kullanıcıya ne olduğunu ve varsa sıradaki adımı söyleyin.

**Hata durumları.** Form alanı hatası için her zaman `error` prop'unu kullanın (elle kırmızı
`<p>` yazmayın) — `aria-invalid`/`aria-describedby` bağlantısını siz kurmak zorunda
kalmazsınız. Sayfa/form geneli bir hata için `Alert variant="danger"`.

**Buton içine buton koymayın.** `leftIcon`/`rightIcon` yalnızca dekoratif ikon veya `Spinner`
içindir; tıklanabilir ikinci bir eleman (ör. bir "x kaldır" butonu) `Button`'ın içine
konmamalı — iç içe etkileşimli elemanlar ekran okuyucularda ve klavye gezinmesinde
kırılır. Ayrı bir buton olarak yan yana koyun.

**Modal'ı `title` veya `ariaLabel` olmadan açmayın.** İkisinden biri olmazsa modal'ın
erişilebilir bir adı olmaz, ekran okuyucu kullanıcısı "bir dialog açıldı, içeriği belirsiz"
duyar.

**`className` ile geçersiz kılarken `cn`/`buttonVariants`'i hatırlayın.** Bir bileşenin
görünümünü değil de konumunu (`mt-4`, `w-full` gibi) değiştirmek için `className` yeterlidir;
tamamen farklı bir görünüm gerekiyorsa (ör. `Button`'ı link gibi ama farklı renkte
göstermek) önce mevcut `variant`'ların yetip yetmediğine bakın, yetmiyorsa yeni bir
`variant` **eklemeyi** düşünün — her çağıran yerde `className` ile aynı özel stili
kopyalamak, bu kitin var olma amacını (tek kaynak, tutarlılık) baştan çürütür.

**Server Component'lerde bedava kullanın.** Bir admin sayfası salt server-render bir tabloda
`Badge`/`Skeleton`/`EmptyState` kullanıyorsa, bunlar için hiç client JS gönderilmez — `"use
client"` eklemeyin, gerek yok.

## 4. Test kuralı

Her bileşenin yanında `ComponentAdı.test.tsx` bulunur (`@vitest-environment jsdom`,
`@testing-library/react`, proje genelinde olduğu gibi `fireEvent` — `userEvent` bu projede
kullanılmıyor). Yeni bir bileşen eklerken en azından şunları test edin: varsayılan render,
`error`/`disabled` gibi durum prop'larının doğru ARIA'ya bağlandığını, kullanıcı
etkileşiminin (`onClick`/`onChange`) tetiklendiğini. `npm test` ile çalıştırılır.

## 5. Kapsam dışı (bilinçli olarak yok)

- **Toast/bildirim kuyruğu** — portal + otomatik kapanma + yığın yönetimi gerektiren ayrı bir
  altyapı; şu an tek bir sayfa içi `Alert` yeterli olan senaryolar var, gerçek ihtiyaç
  çıkınca eklenmeli.
- **Özel Combobox/Autocomplete** — `Select` native `<select>` ile yeterli olduğu sürece bu
  eklenmemeli; native listbox'ın erişilebilirliğini yeniden icat etmek yüksek risklidir.
- **Tema değiştirici (light/dark toggle)** — site şu an yalnızca `prefers-color-scheme`
  kullanıyor, elle geçiş yok; eklenirse token'lar zaten hazır, sadece `data-theme` sınıf
  stratejisine geçiş gerekir.
