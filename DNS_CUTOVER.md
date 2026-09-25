# yzt.digital — DNS Cutover

## Mevcut durum

2026-09-25 doğrulaması:

- Nameserver'lar Cloudflare authoritative.
- `yzt.digital` public DNS Cloudflare proxy IP'lerine çözülüyor.
- `www.yzt.digital` public DNS Cloudflare proxy IP'lerine çözülüyor.
- Her iki hostname HTTPS'te `525 SSL Handshake Failed` dönüyor.
- Cloudflare Worker preview sağlıklı:
  `https://yzt-digital-preview.ziyabeey1.workers.dev`
- Worker custom-domain oluşturma girişimi, mevcut A/CNAME kaydı nedeniyle `100117` ile reddedildi.

## Silinecek kayıt

Cloudflare Dashboard → **DNS → Records**

`yzt.digital` / `@` için web originine işaret eden mevcut:

- **A**, veya
- **CNAME**

kaydı kaldırılmalıdır.

Eğer birden fazla root A/CNAME varsa, eski web originine ait olanların tamamı kaldırılmalıdır.

## Dokunulmayacak kayıtlar

Şunları yalnız web cutover'u için silme:

- MX
- TXT
- SPF
- DKIM
- DMARC
- verification kayıtları
- mail/autodiscover kayıtları

## www

`www` şu anda ayrıca eski web originine bağlı görünüyor.

İlk production cutover yalnız apex `yzt.digital` için yapılacaktır.
Apex doğrulandıktan sonra `www` ayrıca temizlenip apex'e yönlendirilecektir.

## Sonraki otomatik adım

Root A/CNAME kaldırıldıktan sonra `cloudflare-production` workflow'u:

1. install
2. typecheck
3. Next production build
4. mobile smoke
5. vinext compatibility
6. vinext build
7. ephemeral production custom-domain config
8. Worker deploy
9. `https://yzt.digital` canlı sağlık kontrolü

adımlarını çalıştırır.

Production workflow, apex gerçekten `YZT.DIGITAL` içeriğini döndürmeden başarılı sayılmaz.
