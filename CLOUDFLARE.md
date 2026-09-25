# yzt.digital — Cloudflare Workers Runbook

## Karar

Hedef:

```
GitHub → Next.js → vinext → Cloudflare Workers → yzt.digital
```

Cloudflare'ın güncel Next.js rehberi yeni Next.js / Workers projeleri için vinext'i varsayılan yol olarak öneriyor.

## Gate sırası

Bu sırayı bozma:

### CF-01 — Next.js doğrulama

```bash
npm install
npm run typecheck
npm run build
npm run test:mobile
```

Hepsi geçmeden Cloudflare migration başlatma.

### CF-02 — vinext compatibility

```bash
npm run cloudflare:check
```

Compatibility raporundaki her hata veya unsupported API ayrı ayrı incelenir.

**Gate:** temiz / kabul edilmiş exception olmadan init yok.

### CF-03 — init

```bash
npm run cloudflare:init
```

Cloudflare Workers hedefini seç.

Bu komutun ürettiği dosyalar gözden geçirilir. Özellikle:

- `vite.config.ts`
- `wrangler.jsonc`
- vinext / Vite / Cloudflare dependencies
- package scripts

Elle tahmin edilen config'i init çıktısının üstüne zorla yazma.

### CF-04 — dry run

```bash
npm run cloudflare:dry-run
```

Deploy etmeden build + config üretimini doğrula.

### CF-05 — preview

```bash
npm run cloudflare:preview
```

Preview URL'de:

- desktop smoke
- 360×800
- 390×844
- reduced motion
- /notes
- /archive
- sitemap.xml
- robots.txt

kontrol edilir.

### CF-06 — custom domain

Preview temizse Worker'a:

- `yzt.digital`
- `www.yzt.digital` → apex redirect

bağlanır.

### CF-07 — production

```bash
npm run cloudflare:deploy
```

## CI credentials

CI üzerinden deploy yapılacaksa Cloudflare tarafında en az şu bilgiler gerekir:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID` veya wrangler config içindeki account id

Token yalnızca gereken Workers yetkileriyle sınırlandırılmalı.

## Önemli

vinext beta olduğu için Next.js ve vinext upgrade'leri bağımsız yapılır.

Her upgrade sonrası:

```bash
npm run typecheck
npm run build
npm run test:mobile
npm run cloudflare:check
```

yeniden koşar.

Production deploy hiçbir zaman compatibility gate'i atlamaz.
