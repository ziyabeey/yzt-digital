# yzt.digital

Yusuf Ziya Terzioğlu'nun yaşayan dijital indeksi.

> Bir sistemi görürüm.  
> Parçalarına ayırırım.  
> Başka türlü kurulabilir mi diye bakarım.  
> Sonra gerçekten kurarım.

## Ana fizik

**Aynı materyal, başka düzen. 10 = 10.**

Site boyunca tek bir ortak görsel madde yaşar: **19 kalıcı SVG segmenti**.

Bu 19 parça:

- SEE / BREAK / WONDER / BUILD
- BEDEN / SES / GÖRÜNTÜ / MEKÂN / SİSTEM / ZEKÂ
- Kepenk / YOTE / KLDRM / H19
- DENEY
- KURARIM

durumlarına dönüşür.

Yeni dekoratif dünya yaratılmaz. Aynı DOM düğümleri konum, açı, ölçek ve zaman ilişkisini değiştirir.

## Creative direction

**Editöryel karanlık + kinetic typography + kontrollü sürrealizm.**

- Siyah arka plan.
- Kırık beyaz tipografi.
- Çok geniş negatif alan.
- Ana görsel malzeme: yazı + boşluk + hareket.
- Dalí etkisi ikonografi değil, zamanın kontrollü bükülmesidir.
- Scroll doğal kalır.
- İlk sürümde WebGL yoktur.
- Generic SaaS grid'i, renkli gradient ve cyberpunk dekorasyon yoktur.

İkinci omurga:

> **Malzeme değişiyor. Merak aynı kalıyor.**

## 19-stroke grammar

`DENEY` ve `KURARIM` dahil material glyph'ler aynı 19 segmentten oluşur.

Detay: [GLYPH_GRAMMAR.md](./GLYPH_GRAMMAR.md)

Fizik: [SITE_PHYSICS.md](./SITE_PHYSICS.md)

Tasarım: [DESIGN.md](./DESIGN.md)

## Stack

- Next.js 16
- React 19
- TypeScript
- GSAP + ScrollTrigger
- SVG material field
- Playwright mobile smoke
- vinext + Vite
- Cloudflare Workers

## Next.js geliştirme

```bash
npm install
npm run dev
npm run typecheck
npm run build
npm run test:mobile
```

## Vinext / Workers

```bash
npm run cloudflare:check
npm run dev:vinext
npm run build:vinext
npm run cloudflare:preview
```

Production gate ve secret listesi:

[DEPLOYMENT.md](./DEPLOYMENT.md)

## Mobil

Mobil ayrı bir ürün değildir. Aynı fizik motorunun daha sıkı geometrisidir.

Temel otomatik viewportlar:

- 360×800
- 390×844

Kurallar:

- yatay overflow yok,
- safe-area desteği,
- minimum 44px touch hedefi,
- reduced-motion fallback,
- 19 segment her sahnede korunur.

## İçerik

- `/` yaşayan ana indeks
- `/notes` yazılar
- `/archive` doğrulanmış kamusal üretim izleri

## Durum

Kod ve Cloudflare Workers konfigürasyonu repo içinde hazırdır.

Production deploy şu kanıtlar alınmadan yeşil sayılmaz:

1. dependency install
2. typecheck
3. Next production build
4. Playwright mobile smoke
5. vinext compatibility + build
6. Workers preview doğrulaması
