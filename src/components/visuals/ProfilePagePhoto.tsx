import Image from "next/image";

/**
 * Ziyaretçinin kartı okuttuğunda gördüğü dijital kartvizit sayfasının gerçek
 * bir ekran görüntüsü (kişisel bilgiler genel yer tutucularla değiştirildi).
 */
export function ProfilePagePhoto({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative mx-auto w-[15rem] overflow-hidden rounded-[2.25rem] border-[7px] border-zinc-900 bg-zinc-900 shadow-2xl sm:w-[16.5rem] ${className}`}
    >
      {/* Çentik */}
      <div className="absolute left-1/2 top-0 z-10 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-zinc-900" />

      <div className="relative aspect-[861/1817] w-full overflow-hidden rounded-[1.7rem]">
        <Image
          src="/images/dijital-kartvizit-ornek.jpg"
          alt="Örnek dijital kartvizit profil sayfası"
          fill
          sizes="16.5rem"
          className="object-cover object-top"
        />
      </div>
    </div>
  );
}
