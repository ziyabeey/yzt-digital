import { Manifesto } from "@/components/Manifesto";
import { MaterialField } from "@/components/MaterialField";
import { SitePhysicsDirector } from "@/components/SitePhysicsDirector";
import { MobileNav } from "@/components/MobileNav";

const projects = [
  {
    index: "01",
    title: "Kepenk.ai",
    type: "ÜRÜN / SİSTEM",
    description: "Küçük işletmeler için daha basit bir çalışma sistemi.",
    slug: "kepenk",
    state: "kepenk",
  },
  {
    index: "02",
    title: "YOTE",
    type: "MEKÂN / EKOLOJİ",
    description: "Bir evden çok, yaşayan bir sistem deneyi.",
    slug: "yote",
    state: "yote",
  },
  {
    index: "03",
    title: "KLDRM",
    type: "KÜLTÜR / MEKÂN",
    description: "Müzik, mekân ve insanların kesiştiği bir üretim alanı.",
    slug: "kldrm",
    state: "kldrm",
  },
  {
    index: "04",
    title: "H19 / Jev",
    type: "LAB / ARAŞTIRMA",
    description: "Küçük modellerden ne kadar büyük sistemler çıkarabiliriz?",
    slug: "h19",
    state: "h19",
  },
];

export default function Home() {
  return (
    <main>
      <div className="site-material" aria-hidden="true">
        <MaterialField />
      </div>
      <SitePhysicsDirector />

      <header className="site-header">
        <a className="wordmark" href="#index" aria-label="yzt.digital ana sayfa">
          YZT.DIGITAL
        </a>

        <nav className="site-nav" aria-label="Ana navigasyon">
          <a href="#now">ŞİMDİ</a>
          <a href="#work">İŞLER</a>
          <a href="#lab">LAB</a>
          <a href="#notes">NOTLAR</a>
          <a href="#about">HAKKIMDA</a>
        </nav>

        <div className="status" aria-label="Durum: üretiyor">
          <span className="status-dot" aria-hidden="true" />
          ÜRETİYOR
        </div>

        <MobileNav />
      </header>

      <Manifesto />

      <section className="identity-section" id="about">
        <div className="identity-sticky">
          <div className="section-kicker">YUSUF ZİYA TERZİOĞLU</div>
          <div className="identity-copy">
            <h1>
              Malzeme değişiyor.
              <br />
              Merak aynı kalıyor.
            </h1>
            <p>
              İletişim tasarımcısı ve sistem kurucusu. Ürünler, sistemler,
              mekânlar, kültür ve deneyler arasında çalışıyorum.
            </p>
          </div>

          <div className="materials" aria-label="Çalışma alanları">
            <span className="material-label" data-material-state="body">BEDEN</span>
            <span className="material-label" data-material-state="sound">SES</span>
            <span className="material-label" data-material-state="image">GÖRÜNTÜ</span>
            <span className="material-label" data-material-state="space">MEKÂN</span>
            <span className="material-label" data-material-state="system">SİSTEM</span>
            <span className="material-label" data-material-state="intelligence">ZEKÂ</span>
          </div>
        </div>
      </section>

      <section className="now-section" id="now">
        <div className="section-kicker">ŞU ANDA / 2026</div>
        <div className="now-grid">
          <h2>Kepenk.ai</h2>
          <p>
            İşletmelerin uğraşmak zorunda kaldığı küçük ama pahalı problemleri
            ortadan kaldıran bir çalışma sistemi.
          </p>
        </div>
      </section>

      <section className="work-section" id="work">
        <div className="section-kicker">SEÇİLMİŞ İŞLER</div>

        <div className="project-list">
          {projects.map((project) => (
            <article
              className="project-row"
              id={`project-${project.slug}`}
              data-project-state={project.state}
              key={project.title}
            >
              <div className="project-meta">
                <span>{project.index}</span>
                <span>{project.type}</span>
              </div>
              <h2>{project.title}</h2>
              <p>{project.description}</p>
              <span className="project-arrow" aria-hidden="true">
                ↗
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="lab-section" id="lab">
        <div className="section-kicker">LAB</div>
        <div className="lab-copy">
          <p className="lab-word">DENEY</p>
          <div className="lab-index">
            <span>H19</span>
            <span>JEV</span>
            <span>TOPOLOJİ</span>
            <span>ARAYÜZLER</span>
          </div>
        </div>
      </section>

      <section className="notes-section" id="notes">
        <div className="section-kicker">NOTLAR</div>
        <div className="notes-intro">
          <h2>Bir şey anlamaya çalışırken bıraktığım izler.</h2>
          <p>
            Tasarım, kültür, teknoloji, mekân ve henüz adını koymadığım şeyler.
          </p>
          <div className="notes-actions">
            <a href="/notes">NOTLARI AÇ ↗</a>
            <a href="/archive">ARŞİVİ AÇ ↗</a>
          </div>
        </div>
      </section>

      <section className="final-section" id="final">
        <div className="section-kicker">AYNI MADDE / BAŞKA DÜZEN</div>
        <div className="final-copy">
          <p className="final-equation">19 = 19</p>
          <p className="final-sentence">Sonra gerçekten kurarım.</p>
          <span className="sr-only">KURARIM</span>
        </div>
      </section>

      <footer className="site-footer">
        <span>YZT.DIGITAL</span>
        <span>İSTANBUL / 2026</span>
        <span>YUSUF ZİYA TERZİOĞLU</span>
      </footer>
    </main>
  );
}
