import { publicTraces } from "@/content/publicArchive";

export const metadata = {
  title: "Arşiv",
  description: "Yusuf Ziya Terzioğlu'nun kamusal üretim izleri.",
};

export default function ArchivePage() {
  return (
    <main className="archive-page">
      <header className="subpage-header">
        <a href="/" className="wordmark">YZT.DIGITAL</a>
        <a href="/" className="subpage-back">GERİ</a>
      </header>

      <section className="archive-hero">
        <p className="section-kicker">ARŞİV / İZLER</p>
        <h1>Malzeme değişti.<br />İzleri kaldı.</h1>
        <p>
          Her şey portfolyoya girmez. Bazı işler yalnızca nereden geçtiğimi
          gösterir. Bu sayfa doğrulayabildiğim kamusal izlerin yaşayan indeksi.
        </p>
      </section>

      <section className="archive-list" aria-label="Kamusal üretim arşivi">
        {publicTraces.map((trace, index) => (
          <a
            className="archive-row"
            href={trace.url}
            target="_blank"
            rel="noreferrer"
            key={`${trace.date}-${trace.title}`}
          >
            <div className="archive-index">
              {String(index + 1).padStart(2, "0")}
            </div>
            <div className="archive-date">{trace.date}</div>
            <div className="archive-main">
              <h2>{trace.title}</h2>
              <p>{trace.note}</p>
            </div>
            <div className="archive-source">
              <span>{trace.kind}</span>
              <span>{trace.source} ↗</span>
            </div>
          </a>
        ))}
      </section>

      <footer className="subpage-footer">
        <span>YZT.DIGITAL / ARŞİV</span>
        <a href="/">INDEX</a>
      </footer>
    </main>
  );
}
