export function StructuredData() {
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Yusuf Ziya Terzioğlu",
    alternateName: ["Yusuf Ziya Terzioglu", "Ziya"],
    url: "https://yzt.digital",
    jobTitle: "İletişim tasarımcısı ve sistem kurucusu",
    sameAs: [
      "https://medium.com/@ziyabeey1",
      "https://www.behance.net/ziyaterzi",
      "https://www.saatchiart.com/ziyabey",
      "https://www.linkedin.com/in/ziyabey",
    ],
    knowsAbout: [
      "Communication Design",
      "Creative Direction",
      "Digital Products",
      "Artificial Intelligence",
      "Systems Design",
      "Culture",
      "Spatial Design",
    ],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "yzt.digital",
    url: "https://yzt.digital",
    inLanguage: "tr",
    author: {
      "@type": "Person",
      name: "Yusuf Ziya Terzioğlu",
      url: "https://yzt.digital",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}
