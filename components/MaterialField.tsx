"use client";

export type MaterialPresetName =
  | "see"
  | "break"
  | "wonder"
  | "build"
  | "system"
  | "deney"
  | "kurarim";

export type MaterialViewport = "desktop" | "mobile";

export type MaterialTransform = {
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
};

const COUNT = 19;
const WIDTH = 72;
const CX = 500;
const CY = 350;

function segment(
  x: number,
  y: number,
  rotation: number,
  length = 64,
  opacity = 0.34,
): MaterialTransform {
  return {
    x,
    y,
    rotation,
    scaleX: length / WIDTH,
    scaleY: 1,
    opacity,
  };
}

function pointOnEllipse(
  index: number,
  rx: number,
  ry: number,
  viewport: MaterialViewport,
) {
  const theta = (Math.PI * 2 * index) / COUNT - Math.PI / 2;
  const mobileScale = viewport === "mobile" ? 0.82 : 1;

  return {
    x: CX + Math.cos(theta) * rx * mobileScale,
    y: CY + Math.sin(theta) * ry,
    theta,
  };
}

function chord(
  index: number,
  step: number,
  viewport: MaterialViewport,
): MaterialTransform {
  const a = pointOnEllipse(index, 255, 190, viewport);
  const b = pointOnEllipse((index + step) % COUNT, 255, 190, viewport);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy);

  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    rotation: (Math.atan2(dy, dx) * 180) / Math.PI,
    scaleX: length / WIDTH,
    scaleY: 1,
    opacity: viewport === "mobile" ? 0.32 : 0.42,
  };
}

function see(
  index: number,
  viewport: MaterialViewport,
): MaterialTransform {
  const p = pointOnEllipse(index, 245, 176, viewport);

  return {
    x: p.x,
    y: p.y,
    rotation: (p.theta * 180) / Math.PI + 90,
    scaleX: viewport === "mobile" ? 0.56 : 0.68,
    scaleY: 1,
    opacity: viewport === "mobile" ? 0.22 : 0.3,
  };
}

function breakApart(
  index: number,
  viewport: MaterialViewport,
): MaterialTransform {
  const j = (index * 7) % COUNT;
  const columns = viewport === "mobile" ? 4 : 5;
  const column = j % columns;
  const row = Math.floor(j / columns);
  const xStep = viewport === "mobile" ? 105 : 126;
  const yStep = viewport === "mobile" ? 92 : 112;
  const xCenter = (columns - 1) / 2;
  const yCenter = viewport === "mobile" ? 2 : 1.5;

  return {
    x: CX + (column - xCenter) * xStep + Math.sin(index * 1.7) * 22,
    y: CY + (row - yCenter) * yStep + Math.cos(index * 1.31) * 18,
    rotation: ((j * 19) % 170) - 85,
    scaleX:
      (viewport === "mobile" ? 0.32 : 0.4) + (j % 4) * 0.16,
    scaleY: 1,
    opacity: viewport === "mobile" ? 0.36 : 0.46,
  };
}

function build(
  index: number,
  viewport: MaterialViewport,
): MaterialTransform {
  const xStart = viewport === "mobile" ? 365 : 320;
  const xStep = viewport === "mobile" ? 30 : 40;
  const horizontalLength = viewport === "mobile" ? 285 : 364;
  const verticalLength = viewport === "mobile" ? 260 : 306;

  if (index < 10) {
    return {
      x: xStart + index * xStep,
      y: CY,
      rotation: 90,
      scaleX: verticalLength / WIDTH,
      scaleY: 1,
      opacity:
        index === 0 || index === 9
          ? viewport === "mobile"
            ? 0.38
            : 0.5
          : viewport === "mobile"
            ? 0.18
            : 0.23,
    };
  }

  const j = index - 10;
  return {
    x: CX,
    y: CY - horizontalLength / 2 + j * (horizontalLength / 8),
    rotation: 0,
    scaleX: horizontalLength / WIDTH,
    scaleY: 1,
    opacity:
      j === 0 || j === 8
        ? viewport === "mobile"
          ? 0.38
          : 0.5
        : viewport === "mobile"
          ? 0.18
          : 0.23,
  };
}


type Stroke = [x: number, y: number, rotation: number, length: number];

function fitWord(
  strokes: Stroke[],
  viewport: MaterialViewport,
  opacityDesktop = 0.34,
): MaterialTransform[] {
  if (strokes.length !== COUNT) {
    throw new Error(`Material word must contain exactly ${COUNT} strokes`);
  }

  const scale = viewport === "mobile" ? 0.76 : 1;
  const opacity = viewport === "mobile" ? opacityDesktop * 0.72 : opacityDesktop;

  return strokes.map(([x, y, rotation, length]) =>
    segment(
      CX + (x - CX) * scale,
      y,
      rotation,
      length * scale,
      opacity,
    ),
  );
}

function deney(viewport: MaterialViewport): MaterialTransform[] {
  const top = 292;
  const mid = 350;
  const bottom = 408;
  const h = 62;
  const halfV = 58;
  const fullV = 116;
  const xs = [286, 392, 500, 608, 716];

  const strokes: Stroke[] = [
    // D = 5
    [xs[0] - 28, 350, 90, fullV],
    [xs[0], top, 0, h],
    [xs[0] + 33, 321, 62, halfV],
    [xs[0] + 33, 379, -62, halfV],
    [xs[0], bottom, 0, h],

    // E = 4
    [xs[1] - 28, 350, 90, fullV],
    [xs[1], top, 0, h],
    [xs[1] - 2, mid, 0, h * 0.86],
    [xs[1], bottom, 0, h],

    // N = 3
    [xs[2] - 25, 350, 90, fullV],
    [xs[2], 350, 62, 132],
    [xs[2] + 25, 350, 90, fullV],

    // E = 4
    [xs[3] - 28, 350, 90, fullV],
    [xs[3], top, 0, h],
    [xs[3] - 2, mid, 0, h * 0.86],
    [xs[3], bottom, 0, h],

    // Y = 3
    [xs[4] - 15, 320, 55, 72],
    [xs[4] + 15, 320, 125, 72],
    [xs[4], 382, 90, 64],
  ];

  return fitWord(strokes, viewport, 0.32);
}

function kurarim(viewport: MaterialViewport): MaterialTransform[] {
  const top = 298;
  const mid = 350;
  const bottom = 402;
  const fullV = 104;
  const h = 50;
  const xs = [236, 325, 414, 503, 592, 681, 770];

  const strokes: Stroke[] = [
    // K = 3
    [xs[0] - 18, mid, 90, fullV],
    [xs[0] + 10, 325, -42, 72],
    [xs[0] + 10, 375, 42, 72],

    // U = 3
    [xs[1] - 20, 344, 90, 92],
    [xs[1], bottom, 0, 40],
    [xs[1] + 20, 344, 90, 92],

    // R = 3
    [xs[2] - 20, mid, 90, fullV],
    [xs[2] + 2, top, 0, h],
    [xs[2] + 18, 370, 52, 78],

    // A = 2
    [xs[3] - 16, mid, -72, 112],
    [xs[3] + 16, mid, 72, 112],

    // R = 3
    [xs[4] - 20, mid, 90, fullV],
    [xs[4] + 2, top, 0, h],
    [xs[4] + 18, 370, 52, 78],

    // I = 1
    [xs[5], mid, 90, fullV],

    // M = 4
    [xs[6] - 25, mid, 90, fullV],
    [xs[6] - 11, 326, 58, 64],
    [xs[6] + 11, 326, 122, 64],
    [xs[6] + 25, mid, 90, fullV],
  ];

  return fitWord(strokes, viewport, 0.34);
}

function system(viewport: MaterialViewport): MaterialTransform[] {
  const opacity = viewport === "mobile" ? 0.16 : 0.2;
  const top = viewport === "mobile" ? 285 : 300;
  const middle = viewport === "mobile" ? 350 : 350;
  const bottom = viewport === "mobile" ? 415 : 400;
  const vLength = viewport === "mobile" ? 92 : 112;
  const hLength = viewport === "mobile" ? 58 : 68;
  const xs =
    viewport === "mobile"
      ? [330, 400, 470, 545, 620, 690]
      : [250, 350, 450, 555, 660, 765];

  const sGlyph = (x: number) => [
    segment(x, top, 0, hLength, opacity),
    segment(x - hLength / 2, (top + middle) / 2, 90, vLength / 2, opacity),
    segment(x, middle, 0, hLength, opacity),
    segment(x + hLength / 2, (middle + bottom) / 2, 90, vLength / 2, opacity),
    segment(x, bottom, 0, hLength, opacity),
  ];

  return [
    ...sGlyph(xs[0]),
    segment(xs[1], (top + bottom) / 2, 90, vLength, opacity),
    ...sGlyph(xs[2]),
    segment(xs[3], top, 0, hLength, opacity),
    segment(xs[3], (top + bottom) / 2, 90, vLength, opacity),
    segment(xs[4], top, 0, hLength, opacity),
    segment(xs[4], middle, 0, hLength, opacity),
    segment(xs[4], bottom, 0, hLength, opacity),
    segment(xs[5] - 18, (top + bottom) / 2, 90, vLength, opacity),
    segment(xs[5] + 18, (top + bottom) / 2, 90, vLength, opacity),
    segment(xs[5], middle, 48, hLength * 0.82, opacity),
  ];
}

export function getMaterialPreset(
  name: MaterialPresetName,
  viewport: MaterialViewport = "desktop",
): MaterialTransform[] {
  if (name === "system") return system(viewport);
  if (name === "deney") return deney(viewport);
  if (name === "kurarim") return kurarim(viewport);

  return Array.from({ length: COUNT }, (_, index) => {
    if (name === "see") return see(index, viewport);
    if (name === "break") return breakApart(index, viewport);
    if (name === "wonder") return chord(index, 7, viewport);
    return build(index, viewport);
  });
}

export const MATERIAL_COUNT = COUNT;

export function MaterialField() {
  const initial = getMaterialPreset("see", "desktop");

  return (
    <svg
      className="material-field"
      viewBox="0 0 1000 700"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <g className="material-field-inner">
        {initial.map((item, index) => (
          <g
            className="material-module"
            data-material-index={index}
            key={index}
            transform={`translate(${item.x} ${item.y}) rotate(${item.rotation}) scale(${item.scaleX} ${item.scaleY})`}
            opacity={item.opacity}
          >
            <rect x="-36" y="-2" width="72" height="4" rx="2" />
          </g>
        ))}
      </g>
    </svg>
  );
}
