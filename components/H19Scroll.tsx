"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./H19Scroll.module.css";

const MODULUS = 19;
const HEX_ROTATION = 8;
const TRI_REORDER = 7;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const FIBONACCI_PULSES = [0, 1, 2, 4, 7, 12] as const;

type Axial = {
  q: number;
  r: number;
  ring: 0 | 1 | 2;
};

type OrbitName = "0" | "H" | "2H" | "9H";

type PhraseState = {
  letters: string[];
  breaks: number[];
  spoken: string;
};

const phrase = (raw: string, breaks: number[], spoken: string): PhraseState => {
  const letters = Array.from(raw);

  if (letters.length !== MODULUS) {
    throw new Error(`Every phrase must contain exactly ${MODULUS} letters.`);
  }

  return { letters, breaks, spoken };
};

const PHRASES = [
  phrase("PARÇALARINAAYIRIRIM", [10], "PARÇALARINA AYIRIRIM"),
  phrase("BAŞKATÜRLÜKURULURMU", [4, 9, 16], "BAŞKA TÜRLÜ KURULUR MU"),
  phrase("AYNIMADDEBAŞKADÜZEN", [3, 8, 13], "AYNI MADDE BAŞKA DÜZEN"),
  phrase("BİRŞEYİBAŞKAKURARIM", [2, 6, 11], "BİR ŞEYİ BAŞKA KURARIM"),
] as const;

const FINALE = phrase(
  "KAOSYENİSİSTEMKURAR",
  [3, 7, 13],
  "KAOS YENİ SİSTEM KURAR",
);

const SYSTEM_PHRASES = {
  kepenk: phrase(
    "KEPENKZAMANAYERAÇAR",
    [5, 11, 14],
    "KEPENK ZAMANA YER AÇAR",
  ),
  randevu: phrase(
    "RANDEVUYÜKÜHAFİFLER",
    [6, 10],
    "RANDEVU YÜKÜ HAFİFLER",
  ),
  time: phrase(
    "ZAMANIİNSANAGERİVER",
    [5, 11, 15],
    "ZAMANI İNSANA GERİ VER",
  ),
  math: phrase(
    "MATEMATİKDÜZENİAÇAR",
    [8, 14],
    "MATEMATİK DÜZENİ AÇAR",
  ),
  earth: phrase(
    "DÜNYAYADAHAHAFİFBAS",
    [6, 10, 15],
    "DÜNYAYA DAHA HAFİF BAS",
  ),
  human: phrase(
    "SİSTEMİNSANAYERAÇAR",
    [5, 11, 14],
    "SİSTEM İNSANA YER AÇAR",
  ),
  benefit: phrase(
    "FAYDAKENDİNDENBÜYÜK",
    [4, 13],
    "FAYDA KENDİNDEN BÜYÜK",
  ),
  virtue: phrase(
    "SESSİZCEİYİOLANIYAP",
    [7, 10, 15],
    "SESSİZCE İYİ OLANI YAP",
  ),
} as const;

const BOOKING_TOKENS = [
  "09", "00", "09", "30", "10", "00", "10", "30", "11", "00",
  "11", "30", "12", "00", "12", "30", "13", "00", "✓",
] as const;

const MATH_TOKENS = [
  "0", "1", "6", "6", "6", "7", "8", "19", "×", "+",
  "=", "↻", "7", "19", "8", "6", "1", "0", "∞",
] as const;

const EARTH_TOKENS = [
  "O₂", "CO₂", "H₂O", "°C", "↺", "☼", "N", "S", "E", "W",
  "19", "1", "0", "+", "−", "≈", "·", "○", "O₂",
] as const;

const WORDS = ["PARÇA", "AYIRIM", "ANLAM", "YAPI"] as const;
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
      const id = mod(q + HEX_ROTATION * r);
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
    if (mod(representative * powerMod(HEX_ROTATION, step)) === id) {
      return step;
    }
  }

  throw new Error(`H19 orbit step missing for ${id}`);
}

function phraseX(index: number, width: number, breaks: number[]) {
  const gap = 0.9;
  const gapsBefore = breaks.filter((boundary) => boundary < index).length;
  const totalUnits = MODULUS + breaks.length * gap;
  const available = Math.min(width * 0.88, 1120);
  const unit = available / totalUnits;
  const logical = index + gapsBefore * gap;

  return (logical - (totalUnits - 1) / 2) * unit;
}

function preludePosition(
  index: number,
  width: number,
  height: number,
) {
  const baseX = phraseX(index, width, PHRASES[0].breaks);
  const isSeed = index < 5;
  const progress = index / (MODULUS - 1);
  const radius = Math.min(width * 0.045, 56) * (0.45 + progress);
  const angle = index * GOLDEN_ANGLE;
  const verticalLimit = Math.min(height * 0.075, 54);

  return {
    x: baseX + Math.cos(angle) * radius * (isSeed ? 0.22 : 1),
    y: Math.sin(angle) * Math.min(radius, verticalLimit),
    scale: isSeed ? 1.16 + index * 0.025 : 0.88 + (index % 4) * 0.045,
    opacity: isSeed ? 1 : 0.58 + (index % 5) * 0.075,
    rotation: isSeed ? 0 : Math.sin(angle) * 14,
  };
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

function polygonPosition(slot: number, width: number, height: number) {
  const minSide = Math.min(width, height);
  const radius = Math.min(minSide * 0.385, 350);
  const angle = -Math.PI / 2 + slot * ((Math.PI * 2) / MODULUS);

  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    scale: 0.84,
  };
}

function singularityPosition(index: number) {
  const angle = -Math.PI / 2 + index * ((Math.PI * 2) / MODULUS);
  const radius = 2 + mod(index * 5, 7) * 1.15;

  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    scale: 0.11 + mod(index * 3, 5) * 0.028,
    opacity: 0.22 + mod(index * 7, 6) * 0.1,
    rotation: mod(index * 137, 360) - 180,
  };
}

function primeSpiralPosition(
  index: number,
  width: number,
  height: number,
) {
  const minSide = Math.min(width, height);
  const progress = index / (MODULUS - 1);
  const angle = -Math.PI / 2 + index * ((Math.PI * 2 * TRI_REORDER) / MODULUS);
  const radius = minSide * (0.035 + progress * 0.39);

  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius * 0.78,
    scale: 0.48 + progress * 0.72,
    opacity: 0.38 + progress * 0.62,
    rotation: (angle * 180) / Math.PI + 90,
  };
}

function bookingPosition(index: number, width: number, height: number) {
  const columns = 5;
  const row = Math.floor(index / columns);
  const column = index % columns;
  const xStep = Math.min(width * 0.14, 138);
  const yStep = Math.min(height * 0.105, 86);
  const lastRowOffset = row === 3 ? xStep * 0.5 : 0;

  return {
    x: (column - 2) * xStep + lastRowOffset,
    y: (row - 1.5) * yStep,
    scale: index === 18 ? 1.08 : 0.72,
    opacity: index === 18 ? 1 : 0.54 + (index % 3) * 0.12,
    rotation: 0,
  };
}

function timeFlowPosition(index: number, width: number, height: number) {
  const t = index / (MODULUS - 1);
  const span = Math.min(width * 0.82, 980);
  const amplitude = Math.min(height * 0.12, 92);
  const phase = t * Math.PI * 3.4;

  return {
    x: (t - 0.5) * span,
    y: Math.sin(phase) * amplitude,
    scale: 0.64 + (1 - Math.abs(t - 0.5) * 2) * 0.48,
    opacity: 0.34 + (1 - Math.abs(t - 0.5) * 2) * 0.66,
    rotation: Math.cos(phase) * 16,
  };
}

function worldPosition(index: number, width: number, height: number) {
  const minSide = Math.min(width, height);
  const radius = Math.min(minSide * 0.41, 360);
  const angle = -Math.PI / 2 + index * ((Math.PI * 2) / MODULUS);
  const breathing = 0.92 + 0.08 * Math.sin(index * 1.9);

  return {
    x: Math.cos(angle) * radius * breathing,
    y: Math.sin(angle) * radius * 0.54 * breathing,
    scale: 0.48 + (index % 5) * 0.06,
    opacity: 0.38 + (index % 4) * 0.12,
    rotation: (angle * 180) / Math.PI + 90,
  };
}

function openSpacePosition(index: number, width: number, height: number) {
  const angle = -Math.PI / 2 + index * ((Math.PI * 2) / MODULUS);
  const rx = Math.min(width * 0.43, 520);
  const ry = Math.min(height * 0.36, 320);

  return {
    x: Math.cos(angle) * rx,
    y: Math.sin(angle) * ry,
    scale: 0.56,
    opacity: 0.52,
    rotation: 0,
  };
}

function chaosPosition(index: number, seed: number, width: number, height: number) {
  const minSide = Math.min(width, height);
  const slot = mod(index * 7 + seed * 5);
  const angle =
    -Math.PI / 2 +
    slot * ((Math.PI * 2) / MODULUS) +
    Math.sin((index + 1) * (seed + 2)) * 0.36;
  const depth = mod(index * 11 + seed * 7, MODULUS) / (MODULUS - 1);
  const radius = minSide * (0.16 + depth * 0.38);
  const squeeze = 0.72 + (seed % 3) * 0.06;

  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius * squeeze,
    scale: 0.52 + mod(index * 3 + seed, 8) * 0.065,
    opacity: 0.14 + mod(index * 5 + seed, 7) * 0.045,
  };
}

function findWordIndices(source: string[], word: string) {
  const used = new Set<number>();

  return Array.from(word).map((letter) => {
    const index = source.findIndex(
      (candidate, candidateIndex) =>
        candidate === letter && !used.has(candidateIndex),
    );

    if (index === -1) {
      throw new Error(`Cannot form ${word} from the current 19-letter field.`);
    }

    used.add(index);
    return index;
  });
}

const WORD_INDEXES = WORDS.map((word) => ({
  word,
  indices: findWordIndices(PHRASES[0].letters, word),
}));

function wordPosition(
  index: number,
  selected: number[],
  seed: number,
  width: number,
  height: number,
) {
  const order = selected.indexOf(index);

  if (order >= 0) {
    const spacing = Math.min(width * 0.115, 122);
    return {
      x: (order - (selected.length - 1) / 2) * spacing,
      y: 0,
      scale: width < 640 ? 2.25 : 3.05,
      opacity: 1,
    };
  }

  return chaosPosition(index, seed, width, height);
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
          scrub: 0.72,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            section.dataset.phase =
              self.progress < 0.012
                ? "line"
                : self.progress < 0.027
                  ? "breath"
                  : self.progress < 0.045
                    ? "fibonacci"
                    : self.progress < 0.067
                      ? "golden-drift"
                      : self.progress < 0.105
                        ? "hex"
                        : self.progress < 0.205
                          ? "h19-orbit"
                    : self.progress < 0.28
                      ? "cosets"
                      : self.progress < 0.39
                        ? "semantic-chaos"
                        : self.progress < 0.48
                          ? "new-system"
                          : self.progress < 0.58
                            ? "product"
                            : self.progress < 0.66
                              ? "time"
                              : self.progress < 0.75
                                ? "math"
                                : self.progress < 0.84
                                  ? "earth"
                                  : self.progress < 0.91
                                    ? "human"
                                    : self.progress < 0.96
                                      ? "benefit"
                                      : "virtue";
          },
        },
      });

      timeline.set(glyphs, {
        x: (index) => phraseX(index, viewport().width, PHRASES[0].breaks),
        y: 0,
        scale: 1,
        opacity: 1,
        rotation: 0,
      });

      // First breath: the sentence is alive before it begins to separate.
      timeline.to(glyphs, {
        scale: 1.055,
        y: (index) => Math.sin((index / (MODULUS - 1)) * Math.PI) * -5,
        duration: 0.52,
        ease: "sine.inOut",
      });

      timeline.to(glyphs, {
        scale: 0.985,
        y: 0,
        duration: 0.32,
        ease: "sine.inOut",
      });

      // Second beat is slightly stronger: a heartbeat, not a loop.
      timeline.to(glyphs, {
        scale: 1.085,
        duration: 0.24,
        ease: "power2.out",
      });

      timeline.to(glyphs, {
        scale: 1,
        duration: 0.38,
        ease: "power2.inOut",
      });

      // Fibonacci accents travel through the sentence as a hidden counting rhythm.
      FIBONACCI_PULSES.forEach((glyphIndex) => {
        timeline.to(
          glyphs[glyphIndex],
          {
            scale: glyphIndex < 5 ? 1.52 : 1.34,
            y: glyphIndex % 2 === 0 ? -13 : 11,
            opacity: 1,
            duration: 0.22,
            ease: "power3.out",
          },
          "<0.075",
        );

        timeline.to(
          glyphs[glyphIndex],
          {
            scale: 1,
            y: 0,
            duration: 0.31,
            ease: "sine.inOut",
          },
          "<0.07",
        );
      });

      timeline.to({}, { duration: 0.24 });

      // The first five letters gain mass while the rest begin a golden-angle drift.
      timeline.to(glyphs, {
        x: (index) => {
          const { width, height } = viewport();
          return preludePosition(index, width, height).x;
        },
        y: (index) => {
          const { width, height } = viewport();
          return preludePosition(index, width, height).y;
        },
        scale: (index) => {
          const { width, height } = viewport();
          return preludePosition(index, width, height).scale;
        },
        opacity: (index) => {
          const { width, height } = viewport();
          return preludePosition(index, width, height).opacity;
        },
        rotation: (index) => {
          const { width, height } = viewport();
          return preludePosition(index, width, height).rotation;
        },
        duration: 1.05,
        stagger: {
          each: 0.015,
          from: "edges",
        },
        ease: "expo.inOut",
      });

      // A brief pressure wave folds the drift back toward a single mathematical center.
      timeline.to(glyphs, {
        scale: (index) => (index < 5 ? 1.22 : 0.74),
        opacity: (index) => (index < 5 ? 1 : 0.44),
        y: (index) => {
          const { width, height } = viewport();
          const point = preludePosition(index, width, height);
          return point.y * 0.52;
        },
        duration: 0.44,
        ease: "power2.inOut",
      });

      timeline.to(glyphs, {
        x: (index) => {
          const { width, height } = viewport();
          return cellPosition(index, width, height).x;
        },
        y: (index) => {
          const { width, height } = viewport();
          return cellPosition(index, width, height).y;
        },
        scale: (index) => ringScale(CELLS[index].ring),
        opacity: 1,
        rotation: 0,
        duration: 1.42,
        stagger: {
          each: 0.018,
          from: "center",
        },
        ease: "expo.inOut",
      });

      // The H19 cell itself breathes once before rotation begins.
      timeline.to(glyphs, {
        scale: (index) => ringScale(CELLS[index].ring) * 1.075,
        duration: 0.26,
        ease: "sine.out",
      });

      timeline.to(glyphs, {
        scale: (index) => ringScale(CELLS[index].ring),
        duration: 0.34,
        ease: "sine.inOut",
      });

      timeline.to({}, { duration: 0.34 });

      for (let step = 1; step <= 6; step += 1) {
        const multiplier = powerMod(HEX_ROTATION, step);

        timeline.to(glyphs, {
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
          duration: 0.58,
          ease: "sine.inOut",
        });
      }

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
        duration: 1.25,
        stagger: {
          each: 0.012,
          from: "center",
        },
        ease: "expo.inOut",
      });

      for (let turn = 1; turn <= 6; turn += 1) {
        timeline.to(glyphs, {
          x: (index) => {
            const { width, height } = viewport();
            return orbitPosition(index, width, height, turn).x;
          },
          y: (index) => {
            const { width, height } = viewport();
            return orbitPosition(index, width, height, turn).y;
          },
          duration: 0.54,
          ease: "sine.inOut",
        });
      }

      timeline.to(glyphs, {
        x: (index) => {
          const { width, height } = viewport();
          return polygonPosition(index, width, height).x;
        },
        y: (index) => {
          const { width, height } = viewport();
          return polygonPosition(index, width, height).y;
        },
        scale: 0.84,
        opacity: 1,
        duration: 1.25,
        ease: "expo.inOut",
      });

      for (let step = 1; step <= 3; step += 1) {
        const multiplier = powerMod(TRI_REORDER, step);

        timeline.to(glyphs, {
          x: (index) => {
            const target = mod(index * multiplier);
            const { width, height } = viewport();
            return polygonPosition(target, width, height).x;
          },
          y: (index) => {
            const target = mod(index * multiplier);
            const { width, height } = viewport();
            return polygonPosition(target, width, height).y;
          },
          duration: 0.72,
          ease: "power3.inOut",
        });
      }

      timeline.to({}, { duration: 0.35 });

      WORD_INDEXES.forEach(({ indices }, wordIndex) => {
        timeline.to(glyphs, {
          x: (index) => {
            const { width, height } = viewport();
            return wordPosition(index, indices, wordIndex + 1, width, height).x;
          },
          y: (index) => {
            const { width, height } = viewport();
            return wordPosition(index, indices, wordIndex + 1, width, height).y;
          },
          scale: (index) => {
            const { width, height } = viewport();
            return wordPosition(index, indices, wordIndex + 1, width, height).scale;
          },
          opacity: (index) => {
            const { width, height } = viewport();
            return wordPosition(index, indices, wordIndex + 1, width, height).opacity;
          },
          duration: 1.05,
          ease: "expo.inOut",
        });

        timeline.to({}, { duration: 0.42 });
      });

      PHRASES.slice(1).forEach((nextPhrase, phraseIndex) => {
        const seed = phraseIndex + 7;

        timeline.to(glyphs, {
          x: (index) => {
            const { width, height } = viewport();
            return chaosPosition(index, seed, width, height).x;
          },
          y: (index) => {
            const { width, height } = viewport();
            return chaosPosition(index, seed, width, height).y;
          },
          scale: (index) => {
            const { width, height } = viewport();
            return chaosPosition(index, seed, width, height).scale;
          },
          opacity: (index) => {
            const { width, height } = viewport();
            return chaosPosition(index, seed, width, height).opacity;
          },
          duration: 0.92,
          ease: "power4.inOut",
        });

        timeline.set(glyphs, {
          textContent: (index: number) => nextPhrase.letters[index],
        });

        timeline.to(glyphs, {
          x: (index) => phraseX(index, viewport().width, nextPhrase.breaks),
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 1.15,
          stagger: {
            each: 0.01,
            from: phraseIndex % 2 === 0 ? "edges" : "center",
          },
          ease: "expo.inOut",
        });

        timeline.to({}, { duration: 0.68 });
      });

      timeline.to({}, { duration: 0.55 });

      timeline.to(glyphs, {
        x: (index) => singularityPosition(index).x,
        y: (index) => singularityPosition(index).y,
        scale: (index) => singularityPosition(index).scale,
        opacity: (index) => singularityPosition(index).opacity,
        rotation: (index) => singularityPosition(index).rotation,
        duration: 1.55,
        stagger: {
          each: 0.012,
          from: "edges",
        },
        ease: "expo.in",
      });

      timeline.to({}, { duration: 0.48 });

      timeline.set(glyphs, {
        textContent: (index: number) => FINALE.letters[index],
      });

      timeline.to(glyphs, {
        x: (index) => {
          const { width, height } = viewport();
          return primeSpiralPosition(index, width, height).x;
        },
        y: (index) => {
          const { width, height } = viewport();
          return primeSpiralPosition(index, width, height).y;
        },
        scale: (index) => {
          const { width, height } = viewport();
          return primeSpiralPosition(index, width, height).scale;
        },
        opacity: (index) => {
          const { width, height } = viewport();
          return primeSpiralPosition(index, width, height).opacity;
        },
        rotation: (index) => {
          const { width, height } = viewport();
          return primeSpiralPosition(index, width, height).rotation;
        },
        duration: 1.7,
        stagger: {
          each: 0.018,
          from: "center",
        },
        ease: "expo.out",
      });

      timeline.to({}, { duration: 0.55 });

      timeline.to(glyphs, {
        x: (index) => phraseX(index, viewport().width, FINALE.breaks),
        y: 0,
        scale: 1,
        opacity: 1,
        rotation: 0,
        duration: 1.45,
        stagger: {
          each: 0.014,
          from: "edges",
        },
        ease: "expo.inOut",
      });

      timeline.to({}, { duration: 0.82 });

      timeline.to(glyphs, {
        x: (index) => {
          const { width, height } = viewport();
          return chaosPosition(index, 23, width, height).x;
        },
        y: (index) => {
          const { width, height } = viewport();
          return chaosPosition(index, 23, width, height).y;
        },
        scale: (index) => {
          const { width, height } = viewport();
          return chaosPosition(index, 23, width, height).scale;
        },
        opacity: (index) => {
          const { width, height } = viewport();
          return chaosPosition(index, 23, width, height).opacity;
        },
        rotation: (index) => mod(index * 47, 120) - 60,
        duration: 1.05,
        ease: "power4.inOut",
      });

      timeline.set(glyphs, {
        textContent: (index: number) => SYSTEM_PHRASES.kepenk.letters[index],
      });

      timeline.to(glyphs, {
        x: (index) => phraseX(index, viewport().width, SYSTEM_PHRASES.kepenk.breaks),
        y: 0,
        scale: 1,
        opacity: 1,
        rotation: 0,
        duration: 1.25,
        stagger: { each: 0.012, from: "edges" },
        ease: "expo.inOut",
      });

      timeline.to({}, { duration: 0.68 });

      timeline.set(glyphs, {
        textContent: (index: number) => BOOKING_TOKENS[index],
      });

      timeline.to(glyphs, {
        x: (index) => {
          const { width, height } = viewport();
          return bookingPosition(index, width, height).x;
        },
        y: (index) => {
          const { width, height } = viewport();
          return bookingPosition(index, width, height).y;
        },
        scale: (index) => {
          const { width, height } = viewport();
          return bookingPosition(index, width, height).scale;
        },
        opacity: (index) => {
          const { width, height } = viewport();
          return bookingPosition(index, width, height).opacity;
        },
        rotation: 0,
        duration: 1.35,
        stagger: { each: 0.018, from: "start" },
        ease: "power3.inOut",
      });

      timeline.to({}, { duration: 0.62 });

      timeline.set(glyphs, {
        textContent: (index: number) => SYSTEM_PHRASES.randevu.letters[index],
      });

      timeline.to(glyphs, {
        x: (index) => phraseX(index, viewport().width, SYSTEM_PHRASES.randevu.breaks),
        y: 0,
        scale: 1,
        opacity: 1,
        rotation: 0,
        duration: 1.2,
        stagger: { each: 0.012, from: "center" },
        ease: "expo.inOut",
      });

      timeline.to({}, { duration: 0.64 });

      timeline.set(glyphs, {
        textContent: (index: number) => SYSTEM_PHRASES.time.letters[index],
      });

      timeline.to(glyphs, {
        x: (index) => {
          const { width, height } = viewport();
          return timeFlowPosition(index, width, height).x;
        },
        y: (index) => {
          const { width, height } = viewport();
          return timeFlowPosition(index, width, height).y;
        },
        scale: (index) => {
          const { width, height } = viewport();
          return timeFlowPosition(index, width, height).scale;
        },
        opacity: (index) => {
          const { width, height } = viewport();
          return timeFlowPosition(index, width, height).opacity;
        },
        rotation: (index) => {
          const { width, height } = viewport();
          return timeFlowPosition(index, width, height).rotation;
        },
        duration: 1.45,
        stagger: { each: 0.012, from: "start" },
        ease: "sine.inOut",
      });

      timeline.to(glyphs, {
        x: (index) => phraseX(index, viewport().width, SYSTEM_PHRASES.time.breaks),
        y: 0,
        scale: 1,
        opacity: 1,
        rotation: 0,
        duration: 1.1,
        ease: "expo.inOut",
      });

      timeline.to({}, { duration: 0.68 });

      timeline.set(glyphs, {
        textContent: (index: number) => MATH_TOKENS[index],
      });

      timeline.to(glyphs, {
        x: (index) => {
          const { width, height } = viewport();
          return cellPosition(index, width, height).x;
        },
        y: (index) => {
          const { width, height } = viewport();
          return cellPosition(index, width, height).y;
        },
        scale: (index) => ringScale(CELLS[index].ring) * 0.9,
        opacity: 0.82,
        rotation: 0,
        duration: 1.25,
        ease: "expo.inOut",
      });

      for (let step = 1; step <= 3; step += 1) {
        const multiplier = powerMod(HEX_ROTATION, step);

        timeline.to(glyphs, {
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
          duration: 0.58,
          ease: "sine.inOut",
        });
      }

      timeline.set(glyphs, {
        textContent: (index: number) => SYSTEM_PHRASES.math.letters[index],
      });

      timeline.to(glyphs, {
        x: (index) => phraseX(index, viewport().width, SYSTEM_PHRASES.math.breaks),
        y: 0,
        scale: 1,
        opacity: 1,
        rotation: 0,
        duration: 1.25,
        stagger: { each: 0.01, from: "center" },
        ease: "expo.inOut",
      });

      timeline.to({}, { duration: 0.7 });

      timeline.set(glyphs, {
        textContent: (index: number) => EARTH_TOKENS[index],
      });

      timeline.to(glyphs, {
        x: (index) => {
          const { width, height } = viewport();
          return worldPosition(index, width, height).x;
        },
        y: (index) => {
          const { width, height } = viewport();
          return worldPosition(index, width, height).y;
        },
        scale: (index) => {
          const { width, height } = viewport();
          return worldPosition(index, width, height).scale;
        },
        opacity: (index) => {
          const { width, height } = viewport();
          return worldPosition(index, width, height).opacity;
        },
        rotation: (index) => {
          const { width, height } = viewport();
          return worldPosition(index, width, height).rotation;
        },
        duration: 1.55,
        stagger: { each: 0.014, from: "center" },
        ease: "sine.inOut",
      });

      timeline.set(glyphs, {
        textContent: (index: number) => SYSTEM_PHRASES.earth.letters[index],
      });

      timeline.to(glyphs, {
        x: (index) => phraseX(index, viewport().width, SYSTEM_PHRASES.earth.breaks),
        y: 0,
        scale: 0.92,
        opacity: 0.88,
        rotation: 0,
        duration: 1.3,
        stagger: { each: 0.012, from: "edges" },
        ease: "expo.inOut",
      });

      timeline.to({}, { duration: 0.78 });

      timeline.set(glyphs, {
        textContent: (index: number) => SYSTEM_PHRASES.human.letters[index],
      });

      timeline.to(glyphs, {
        x: (index) => phraseX(index, viewport().width, SYSTEM_PHRASES.human.breaks),
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 1.15,
        ease: "expo.inOut",
      });

      timeline.to(glyphs, {
        x: (index) => {
          const { width, height } = viewport();
          return openSpacePosition(index, width, height).x;
        },
        y: (index) => {
          const { width, height } = viewport();
          return openSpacePosition(index, width, height).y;
        },
        scale: (index) => {
          const { width, height } = viewport();
          return openSpacePosition(index, width, height).scale;
        },
        opacity: (index) => {
          const { width, height } = viewport();
          return openSpacePosition(index, width, height).opacity;
        },
        duration: 1.5,
        stagger: { each: 0.01, from: "center" },
        ease: "expo.inOut",
      });

      timeline.to({}, { duration: 0.88 });

      timeline.set(glyphs, {
        textContent: (index: number) => SYSTEM_PHRASES.benefit.letters[index],
      });

      timeline.to(glyphs, {
        x: (index) => phraseX(index, viewport().width, SYSTEM_PHRASES.benefit.breaks),
        y: 0,
        scale: 1,
        opacity: 1,
        rotation: 0,
        duration: 1.25,
        ease: "expo.inOut",
      });

      timeline.to(glyphs, {
        scale: (index) => (index >= 5 && index <= 13 ? 0.34 : 1.18),
        opacity: (index) => (index >= 5 && index <= 13 ? 0.2 : 1),
        y: (index) => (index >= 5 && index <= 13 ? 10 : 0),
        duration: 1.15,
        ease: "power3.inOut",
      });

      timeline.to({}, { duration: 0.7 });

      timeline.to(glyphs, {
        x: (index) => singularityPosition(index).x,
        y: (index) => singularityPosition(index).y,
        scale: (index) => singularityPosition(index).scale,
        opacity: (index) => singularityPosition(index).opacity,
        rotation: (index) => singularityPosition(index).rotation,
        duration: 1.2,
        ease: "expo.in",
      });

      timeline.set(glyphs, {
        textContent: (index: number) => SYSTEM_PHRASES.virtue.letters[index],
      });

      timeline.to(glyphs, {
        x: (index) => phraseX(index, viewport().width, SYSTEM_PHRASES.virtue.breaks),
        y: 0,
        scale: 0.72,
        opacity: 0.72,
        rotation: 0,
        duration: 1.55,
        stagger: { each: 0.018, from: "center" },
        ease: "expo.out",
      });

      timeline.to(glyphs, {
        scale: (index) => (index >= 8 && index <= 10 ? 0.92 : 0.66),
        opacity: (index) => (index >= 8 && index <= 10 ? 1 : 0.3),
        duration: 0.72,
        ease: "sine.inOut",
      });

      timeline.to({}, { duration: 0.52 });

      timeline.to(glyphs, {
        scale: 0.66,
        opacity: 0.62,
        duration: 0.9,
        ease: "sine.inOut",
      });

      timeline.to({}, { duration: 1.8 });
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
          <p className={styles.srOnly}>
            {[
              ...PHRASES.map((item) => item.spoken),
              FINALE.spoken,
              ...Object.values(SYSTEM_PHRASES).map((item) => item.spoken),
            ].join(". ")}.
          </p>

          <div className={styles.field} aria-hidden="true">
            {PHRASES[0].letters.map((letter, index) => (
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
