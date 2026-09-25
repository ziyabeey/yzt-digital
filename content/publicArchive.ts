export type PublicTrace = {
  date: string;
  year: string;
  title: string;
  source: "Medium" | "Behance" | "Saatchi Art" | "LinkedIn";
  kind: string;
  note: string;
  url: string;
};

export const publicTraces: PublicTrace[] = [
  {
    date: "2025-04-15",
    year: "2025",
    title: "Antik Çinde Sihir: Benim İçimde Yankılanan Kadim Fısıltılar",
    source: "Medium",
    kind: "YAZI",
    note: "Shan Hai Jing, Huainanzi, doğa, ritüel ve insanın düzen içindeki yeri.",
    url: "https://medium.com/@ziyabeey1/antik-%C3%A7inde-sihir-benim-i%CC%87%C3%A7imde-yank%C4%B1lanan-kadim-f%C4%B1s%C4%B1lt%C4%B1lar-7c267c6565f7",
  },
  {
    date: "2024-12-04",
    year: "2024",
    title: "Cap de Creus’ta Sardana Ezgileri",
    source: "Medium",
    kind: "YAZI",
    note: "Dalí, Cap de Creus, Sardana ve bir formun başka bir forma dönüşmesi üzerine.",
    url: "https://medium.com/@ziyabeey1/cap-de-creusta-sardana-ezgileri-abf1736205bf",
  },
  {
    date: "2023-07-30",
    year: "2023",
    title: "Dieter Rams / Az Ama İyi",
    source: "LinkedIn",
    kind: "TASARIM NOTU",
    note: "Sadelik, kullanılabilirlik ve zamansız tasarım üzerine kamusal bir tasarım notu. Bugünkü yzt.digital yönündeki 'daha az ama anlamlı' yaklaşımın erken izlerinden biri.",
    url: "https://tr.linkedin.com/posts/ziyabey_tasar%C4%B1milham%C4%B1-dieterrams-end%C3%BCstriyeltasar%C4%B1m-activity-7091287187488481280-bP9W",
  },
  {
    date: "2023-07-28",
    year: "2023",
    title: "PsykoTapestry",
    source: "Behance",
    kind: "AI / SANAT",
    note: "Yapay zekâyı sanatçının yerine değil, yaratıcı üretimin bir aracı olarak kullanan deney.",
    url: "https://www.behance.net/gallery/176371013/PsykoTapestry",
  },
  {
    date: "2023-07-27",
    year: "2023",
    title: "Mirror Portraits",
    source: "Behance",
    kind: "FOTOĞRAF",
    note: "Salon deneyimi, ayna, insan ilişkisi ve dönüşüm üzerine siyah-beyaz portre serisi.",
    url: "https://www.behance.net/gallery/176346541/Mirror-Portraits",
  },
  {
    date: "2023-07-25",
    year: "2023",
    title: "Dark Food",
    source: "Behance",
    kind: "FOTOĞRAF / ART DIRECTION",
    note: "Yemek fotoğrafı, styling ve karanlık görsel dil çalışması.",
    url: "https://www.behance.net/gallery/176123311/Dark-Food",
  },
  {
    date: "2023-07-24",
    year: "2023",
    title: "Ege'nin Sualtı Perisi",
    source: "Behance",
    kind: "DİJİTAL SANAT / ANLATI",
    note: "Ege, algı, gerçeklik ve hayal arasındaki sınırı görsel hikâyeye çeviren seri.",
    url: "https://www.behance.net/gallery/176048623/Egenin-Sualt-Perisi-Gercegin-Sihirli-Yansmalar",
  },
  {
    date: "2023-07-24",
    year: "2023",
    title: "Brandos Cafe Reels",
    source: "Behance",
    kind: "VİDEO / İÇERİK",
    note: "Yoğun tempolu kısa video üretimi ve sosyal medya anlatısı.",
    url: "https://www.behance.net/gallery/176074677/Brandos-Cafe-Reels",
  },
  {
    date: "2023",
    year: "2023",
    title: "The Boscian Enigma",
    source: "Saatchi Art",
    kind: "DİJİTAL SANAT",
    note: "Bosch’tan hareketle bilinçaltı, gerçeklik ve sürreal alan üzerine dijital çalışma.",
    url: "https://www.saatchiart.com/en-jo/print/Digital-The-Boscian-Enigma/1072291/10748149/view",
  },
  {
    date: "2018",
    year: "2018",
    title: "Behance’e katılım",
    source: "Behance",
    kind: "ARŞİV BAŞLANGICI",
    note: "Bugün doğrulayabildiğimiz kamusal yaratıcı arşivin erken katmanlarından biri.",
    url: "https://www.behance.net/ziyaterzi",
  },
  {
    date: "2018",
    year: "2018",
    title: "Saatchi Art profili",
    source: "Saatchi Art",
    kind: "ARŞİV BAŞLANGICI",
    note: "Dans, müzik, yazı, tasarım ve sanatın aynı kişisel üretim alanında buluştuğu erken profil.",
    url: "https://www.saatchiart.com/ziyabey",
  },
];

export const notes = publicTraces.filter((trace) => trace.source === "Medium");
