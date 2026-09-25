# yzt.digital

Yusuf Ziya Terzioğlu'nun yaşayan dijital indeksi.

> Bir sistemi görürüm.  
> Parçalarına ayırırım.  
> Başka türlü kurulabilir mi diye bakarım.  
> Sonra gerçekten kurarım.

## Creative direction

**Editöryel karanlık + kinetic typography + kontrollü sürrealizm.**

- Siyah arka plan, kırık beyaz tipografi, geniş negatif alan.
- Ana görsel malzeme yazı, boşluk ve harekettir.
- Dalí etkisi ikonografiyle değil, zamanın ve mekânın hafifçe kaymasıyla gelir.
- Scroll doğaldır; animasyon scroll ilerlemesine bağlıdır.
- İlk sürümde 3D / WebGL yoktur.
- Kart grid'i, gradient cümbüşü, cyberpunk dekorasyonu yoktur.

İkinci omurga:

> **Malzeme değişiyor. Merak aynı kalıyor.**

## Stack

- Next.js 16
- React 19
- TypeScript
- GSAP + ScrollTrigger
- Cloudflare Workers hedefi

## Çalıştırma

```bash
npm install
npm run dev
```

## Cloudflare

Kod standart Next.js App Router olarak tutulur. Cloudflare Workers geçişi için:

```bash
npm run cloudflare:check
npm run cloudflare:init
```

Deploy bağlantısı domain aktif olduktan sonra tamamlanacaktır.
