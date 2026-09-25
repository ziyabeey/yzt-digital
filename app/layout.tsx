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
