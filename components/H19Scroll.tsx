"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./H19Scroll.module.css";

const LETTERS = Array.from("PARÇALARINAAYIRIRIM");
const MODULUS = 19;
const ROTATION = 8;

type Axial = {
  q: number;
  r: number;
  ring: 0 | 1 | 2;
};

type OrbitName = "0" | "H" | "2H" | "9H";

const H = new Set([1, 7, 8, 11, 12, 18]);

function mod(value: number, base = MODULUS) {
  return ((value % base) + base) % base;
}

function axialRing(q: number, r: number): 0 | 1 | 2 {
  return Math.max(Math.abs(q), Math.abs(r), Math.abs(-q - r)) as 0 | 1 | 2;
}

function buildAxialMap(): Axial[] {
  const cells: Array<Axial | undefined> = Array.from({ length: MODULUS });

  for (let q = -2; q <= 2; q += 1) {
    const rMin = Math.max(-2, -q - 2);
    const rMax = Math.min(2, -q + 2);

    for (let r = rMin; r <= rMax; r += 1) {
      const id = mod(q + ROTATION * r);
      cells[id] = { q, r, ring: axialRing(q, r) };
    }
  }

  if (cells.some((cell) => !cell)) {
    throw new Error("H19 axial map is incomplete.");
  }

  return cells as Axial[];
}

const CELLS = buildAxialMap();

function orbitOf(id: number): OrbitName {
  if (id === 0) return "0";
  if (H.has(id)) return "H";
  if (H.has(mod(id * 10))) return "2H";
  return "9H";
}

function orbitRepresentative(orbit: OrbitName) {
  if (orbit === "H") return 1;
  if (orbit === "2H") return 2;
  if (orbit === "9H") return 9;
  return 0;
}

function powerMod(base: number, exponent: number) {
  let result = 1;

  for (let index = 0; index < exponent; index += 1) {
    result = mod(result * base);
  }

  return result;
}

function orbitStep(id: number) {
  if (id === 0) return 0;

  const orbit = orbitOf(id);
  const representative = orbitRepresentative(orbit);

  for (let step = 0; step < 6; step += 1) {
    if (mod(representative * powerMod(ROTATION, step)) === id) {
      return step;
    }
  }

  throw new Error(`H19 orbit step missing for ${id}`);
}

function phraseX(index: number, width: number) {
  const phraseUnits = 20;
  const available = Math.min(width * 0.84, 960);
  const unit = available / phraseUnits;
  const logicalIndex = index <= 10 ? index : index + 1;

  return (logicalIndex - phraseUnits / 2 + 0.5) * unit;
}

function cellPosition(id: number, width: number, height: number) {
  const cell = CELLS[id];
  const size = Math.min(width * 0.082, height * 0.095, 76);
  const x = Math.sqrt(3) * size * (cell.q + cell.r / 2);
  const y = 1.5 * size * cell.r;

  return { x, y, ring: cell.ring };
}

function ringScale(ring: Axial["ring"]) {
  if (ring === 0) return 1.34;
  if (ring === 1) return 1.06;
  return 0.88;
}

function orbitPosition(
  id: number,
  width: number,
  height: number,
  turn = 0,
) {
  if (id === 0) {
    return { x: 0, y: 0, scale: 1.42 };
  }

  const orbit = orbitOf(id);
  const minSide = Math.min(width, height);
  const outerRadius = Math.min(minSide * 0.36, 330);
  const radius =
    orbit === "H"
      ? outerRadius * 0.4
      : orbit === "2H"
        ? outerRadius * 0.7
        : outerRadius;

  const step = mod(orbitStep(id) + turn, 6);
  const angle = -Math.PI / 2 + step * (Math.PI / 3);

  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    scale: orbit === "H" ? 1.05 : orbit === "2H" ? 0.94 : 0.84,
  };
}

export function H19Scroll() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!root.current || !stage.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      const glyphs = gsap.utils.toArray<HTMLElement>("[data-h19-glyph]");
      const section = root.current;
      const canvas = stage.current;

      if (!section || !canvas || glyphs.length !== MODULUS) return;

      const viewport = () => {
        const bounds = canvas.getBoundingClientRect();
        return { width: bounds.width, height: bounds.height };
      };

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (prefersReducedMotion) {
        const { width, height } = viewport();

        glyphs.forEach((glyph, index) => {
          const point = cellPosition(index, width, height);

          gsap.set(glyph, {
            x: point.x,
            y: point.y,
            scale: ringScale(point.ring),
            opacity: 1,
          });
        });

        section.dataset.phase = "hex";
        return;
      }

      const timeline = gsap.timeline({
        defaults: {
          ease: "power2.inOut",
        },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            section.dataset.phase =
              self.progress < 0.09
                ? "line"
                : self.progress < 0.22
                  ? "hex"
                  : self.progress < 0.56
                    ? "h19-orbit"
                    : self.progress < 0.7
                      ? "split"
                      : "cosets";
          },
        },
      });

      timeline.fromTo(
        glyphs,
        {
          x: (index) => phraseX(index, viewport().width),
          y: 0,
          scale: 1,
          opacity: 1,
        },
        {
          x: (index) => {
            const { width, height } = viewport();
            return cellPosition(index, width, height).x;
          },
          y: (index) => {
            const { width, height } = viewport();
            return cellPosition(index, width, height).y;
          },
          scale: (index) => ringScale(CELLS[index].ring),
          duration: 1.45,
          stagger: {
            each: 0.018,
            from: "center",
          },
        },
        0.72,
      );

      timeline.to({}, { duration: 0.42 });

      for (let step = 1; step <= 6; step += 1) {
        const multiplier = powerMod(ROTATION, step);

        timeline.to(
          glyphs,
          {
            x: (index) => {
              const target = mod(index * multiplier);
              const { width, height } = viewport();
              return cellPosition(target, width, height).x;
            },
            y: (index) => {
              const target = mod(index * multiplier);
              const { width, height } = viewport();
              return cellPosition(target, width, height).y;
            },
            duration: 0.72,
            ease: "sine.inOut",
          },
          ">",
        );
      }

      timeline.to({}, { duration: 0.5 });

      timeline.to(glyphs, {
        x: (index) => {
          const { width, height } = viewport();
          return orbitPosition(index, width, height).x;
        },
        y: (index) => {
          const { width, height } = viewport();
          return orbitPosition(index, width, height).y;
        },
        scale: (index) => {
          const { width, height } = viewport();
          return orbitPosition(index, width, height).scale;
        },
        duration: 1.6,
        stagger: {
          each: 0.014,
          from: "center",
        },
        ease: "expo.inOut",
      });

      timeline.to({}, { duration: 0.42 });

      for (let turn = 1; turn <= 6; turn += 1) {
        timeline.to(
          glyphs,
          {
            x: (index) => {
              const { width, height } = viewport();
              return orbitPosition(index, width, height, turn).x;
            },
            y: (index) => {
              const { width, height } = viewport();
              return orbitPosition(index, width, height, turn).y;
            },
            duration: 0.68,
            ease: "sine.inOut",
          },
          ">",
        );
      }

      timeline.to({}, { duration: 0.8 });
    }, root);

    return () => context.revert();
  }, []);

  return (
    <main className={styles.page}>
      <section
        ref={root}
        className={styles.sequence}
        data-phase="line"
        aria-label="H19 tipografik hareket deneyi"
      >
        <div ref={stage} className={styles.stage}>
          <p className={styles.srOnly}>PARÇALARINA AYIRIRIM</p>

          <div className={styles.field} aria-hidden="true">
            {LETTERS.map((letter, index) => (
              <span
                className={styles.glyph}
                data-h19-glyph
                data-h19-id={index}
                data-h19-ring={CELLS[index].ring}
                data-h19-orbit={orbitOf(index)}
                data-h19-orbit-step={orbitStep(index)}
                key={`${index}-${letter}`}
              >
                {letter}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
