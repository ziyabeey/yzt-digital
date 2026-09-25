import type { Metadata } from "next";
import { StructuredData } from "@/components/StructuredData";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://yzt.digital"),
  applicationName: "yzt.digital",
  authors: [{ name: "Yusuf Ziya Terzioğlu", url: "https://yzt.digital" }],
  creator: "Yusuf Ziya Terzioğlu",
  title: {
    default: "Yusuf Ziya Terzioğlu — yzt.digital",
    template: "%s — yzt.digital",
  },
  description:
    "Ürünler, sistemler, mekânlar, kültür ve deneyler. Yusuf Ziya Terzioğlu'nun yaşayan dijital indeksi.",
  keywords: [
    "Yusuf Ziya Terzioğlu",
    "yzt.digital",
    "iletişim tasarımı",
    "sistem tasarımı",
    "yapay zekâ",
    "dijital ürün",
    "yaratıcı teknoloji",
  ],
  category: "design",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Yusuf Ziya Terzioğlu — yzt.digital",
    description:
      "Bir sistemi görürüm. Parçalarına ayırırım. Başka türlü kurulabilir mi diye bakarım. Sonra gerçekten kurarım.",
    url: "https://yzt.digital",
    siteName: "yzt.digital",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yusuf Ziya Terzioğlu — yzt.digital",
    description:
      "Aynı materyal, başka düzen. Ürünler, sistemler, mekânlar, kültür ve deneyler.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
        <StructuredData />
        {children}
      </body>
    </html>
  );
}
