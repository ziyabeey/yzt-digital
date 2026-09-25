import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://yzt.digital"),
  title: {
    default: "Yusuf Ziya Terzioğlu — yzt.digital",
    template: "%s — yzt.digital",
  },
  description:
    "Ürünler, sistemler, mekânlar, kültür ve deneyler. Yusuf Ziya Terzioğlu'nun yaşayan dijital indeksi.",
  openGraph: {
    title: "Yusuf Ziya Terzioğlu — yzt.digital",
    description:
      "Bir sistemi görürüm. Parçalarına ayırırım. Başka türlü kurulabilir mi diye bakarım. Sonra gerçekten kurarım.",
    url: "https://yzt.digital",
    siteName: "yzt.digital",
    locale: "tr_TR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
