"use client";

import { useEffect, useState } from "react";

const links = [
  ["ŞİMDİ", "#now"],
  ["İŞLER", "#work"],
  ["LAB", "#lab"],
  ["NOTLAR", "#notes"],
  ["HAKKIMDA", "#about"],
] as const;

export function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.documentElement.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        className="mobile-nav-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "KAPAT" : "MENÜ"}
      </button>

      <div
        className="mobile-nav-panel"
        id="mobile-navigation"
        data-open={open ? "true" : "false"}
        aria-hidden={!open}
      >
        <nav aria-label="Mobil navigasyon">
          {links.map(([label, href], index) => (
            <a
              href={href}
              key={href}
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {label}
            </a>
          ))}
        </nav>

        <div className="mobile-nav-foot">
          <span>YZT.DIGITAL</span>
          <span>10 = 10 / 19</span>
        </div>
      </div>
    </>
  );
}
