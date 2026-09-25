import { notes } from "@/content/publicArchive";

export const metadata = {
  alternates: { canonical: "/notes" },
  title: "Notlar",
  description: "Yusuf Ziya Terzioğlu'nun yazıları ve düşünce notları.",
};

export default function NotesPage() {
  return (
    <main className="notes-page">
      <header className="subpage-header">
        <a href="/" className="wordmark">YZT.DIGITAL</a>
        <a href="/" className="subpage-back">GERİ</a>
      </header>

      <section className="archive-hero notes-hero">
        <p className="section-kicker">NOTLAR</p>
        <h1>Bir şeyi anlamaya<br />çalışırken.</h1>
        <p>
          Bazen araştırma. Bazen gezi. Bazen sanat. Ortak tarafı, bir şeyin
          başka bir şeyle nasıl bağlandığını merak etmem.
        </p>
      </section>

      <section className="note-list" aria-label="Yazılar">
        {notes.map((note, index) => (
          <a
            className="note-row"
            href={note.url}
            target="_blank"
            rel="noreferrer"
            key={note.url}
          >
            <span className="archive-index">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <span className="note-date">{note.date}</span>
              <h2>{note.title}</h2>
              <p>{note.note}</p>
            </div>
            <span className="note-source">{note.source} ↗</span>
          </a>
        ))}
      </section>

      <footer className="subpage-footer">
        <span>YZT.DIGITAL / NOTLAR</span>
        <a href="/archive">ARŞİV →</a>
      </footer>
    </main>
  );
}
