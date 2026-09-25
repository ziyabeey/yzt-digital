# yzt.digital — Agent Rules

Bu dosya tasarım anayasasıdır. Yeni kod yazmadan önce okunmalıdır.

## Kimlik

yzt.digital bir ajans sitesi veya generic creative-tech landing page değildir. Yusuf Ziya Terzioğlu'nun yaşayan dijital indeksi, düşünme biçimi ve arşividir.

Ana fikir:

> Bir sistemi görürüm.  
> Parçalarına ayırırım.  
> Başka türlü kurulabilir mi diye bakarım.  
> Sonra gerçekten kurarım.

İkinci omurga:

> Malzeme değişiyor. Merak aynı kalıyor.

## Zorunlu görsel kurallar

- Arka plan siyah.
- Ana tipografi kırık beyaz / beyaz.
- Çok geniş negatif alan kullan.
- Yazı + boşluk + motion ana görsel malzemedir.
- İlk sürümde Three.js / WebGL / dekoratif 3D kullanma.
- Büyük kart grid'leri oluşturma.
- Renkli gradient cümbüşü oluşturma.
- Cyberpunk estetik kullanma.
- Gereksiz ikon kullanma.
- Scroll-jacking yapma.
- Motion anlam taşımalı, süs olmamalı.
- Arayüz dili varsayılan olarak Türkçedir.

## Dalí etkisi

Dalí doğrudan kopyalanmaz. Eriyen saat, tablo kolajı ve bariz sürreal ikonografi yasaktır.

Esinti şuralardan gelir:
- zamanın hafifçe esnemesi,
- kelimelerin beklenmedik gecikmesi,
- mekânsal hizalamanın kontrollü kayması,
- oransız ölçek,
- sessizlik ve boşluk,
- parçalanma ve yeniden birleşme.

## Motion fiilleri

1. SPLIT
2. REORDER
3. REVEAL
4. COMPRESS
5. DISAPPEAR
6. LOCK

Yeni bir animasyon bu fiillerden en az birine bağlanamıyorsa eklenmemelidir.

## Her değişiklikten önce sor

1. Bu öğe anlam taşıyor mu, yoksa sadece süs mü?
2. Boşluğu azaltıyor mu?
3. Motion düşünceyi açıklıyor mu?
4. Aynı etki daha az öğeyle yapılabilir mi?
5. Bu hâlâ yzt.digital mı?
6. Sürrealizm kontrollü mü?
7. Metin hâlâ rahat okunuyor mu?


## Site Physics v0.1

`SITE_PHYSICS.md` bu dosyayla birlikte zorunlu referanstır.

- Ana görsel materyal 19 kalıcı modüldür.
- Ana modülleri sahneler arasında silme / yeniden yaratma.
- Yeni dekoratif obje eklemeden önce mevcut 19 modül ile çözülebilir mi diye kontrol et.
- Ana korunum yasası: **10 = 10**.
- Geometri için 19-gon ve deterministik modüler dönüşümler tercih edilir.
- 19 bir iddia veya numeroloji açıklaması olarak değil, iç tasarım grameri olarak kullanılır.
- Yazı / şekil / grid / diyagram mümkün olduğunca aynı materyal ailesinden türemelidir.


## 19-Stroke Grammar

`GLYPH_GRAMMAR.md` zorunlu referanstır.

- Material word veya ana sembol üretirken segment sayısı 19 olarak korunur.
- DENEY, KURARIM ve biyografik haller ayrı SVG asset değildir.
- BEDEN → SES → GÖRÜNTÜ → MEKÂN → SİSTEM → ZEKÂ aynı `.material-module` düğümlerinin transformlarıdır.
- Crossfade ile iki ayrı çizim taklit etme; aynı node'ları morph et.
- Mobilde geometri sadeleşebilir fakat node sayısı, anlam ve korunum yasası değişmez.
