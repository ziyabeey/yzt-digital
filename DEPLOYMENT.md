# yzt.digital — Cloudflare Workers Deployment

## Durum

Kod tabanı Next.js 16 + vinext + Cloudflare Workers için hazırlanmıştır.

Cloudflare'ın güncel önerilen yolu:
1. vinext compatibility check
2. vinext build
3. Workers preview
4. custom domain

## Gereken gizli değerler

Bunlar repoya yazılmaz:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

API token için Cloudflare Workers edit yetkili şablon kullanılmalıdır.

## Yerel doğrulama

```bash
npm install
npm run typecheck
npm run build
npm run test:mobile
npm run cloudflare:check
npm run build:vinext
```

## Preview

```bash
export CLOUDFLARE_ACCOUNT_ID=...
export CLOUDFLARE_API_TOKEN=...

npm run cloudflare:preview
```

Önce `*.workers.dev` / preview URL doğrulanır.

Kontrol listesi:

- 360×800 mobil
- 390×844 mobil
- desktop
- reduced motion
- /notes
- /archive
- 19 modül baştan sona korunuyor
- yatay overflow yok
- mobil menü
- deep-link reload
- metadata / robots / sitemap

## Production

Preview doğrulandıktan sonra:

```bash
npm run cloudflare:deploy
```

Ardından Cloudflare Workers projesine:

- `yzt.digital`
- `www.yzt.digital`

custom domainleri bağlanır.

Tercih:
- apex: `yzt.digital`
- `www.yzt.digital` → apex yönlendirmesi

## Not

`wrangler.jsonc` içine hesap ID'si hard-code edilmez.
CI ve deploy ortamında environment variable kullanılır.

## CI durumu

GitHub Actions workflow'u repoda hazırdır fakat mevcut hesapta job'lar step başlamadan düşebilmektedir. Runner gerçekten başlamadan gelen failure, uygulama build sonucu kabul edilmemelidir.

Production gate:
- dependency install gerçekten başlamalı,
- typecheck gerçekten koşmalı,
- Next build gerçekten koşmalı,
- Playwright mobil smoke gerçekten koşmalı,
- vinext compatibility gerçekten koşmalı.

Bu beş kanıt olmadan production deploy "yeşil" sayılmaz.
