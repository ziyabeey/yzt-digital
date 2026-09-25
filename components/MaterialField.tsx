"use client";

export type MaterialPresetName =
  | "see"
  | "break"
  | "wonder"
  | "build"
  | "system"
  | "deney"
  | "kurarim"
  | "body"
  | "sound"
  | "image"
  | "space"
  | "intelligence"
  | "kepenk"
  | "yote"
  | "kldrm"
  | "h19";

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


function body(viewport: MaterialViewport): MaterialTransform[] {
  const opacity = viewport === "mobile" ? 0.2 : 0.28;
  const scale = viewport === "mobile" ? 0.82 : 1;
  const x = CX;
  const y = CY - 18;

  const strokes: Stroke[] = [
    // head / 6
    [x - 16, y - 128, 30, 34],
    [x + 16, y - 128, -30, 34],
    [x + 31, y - 103, 90, 34],
    [x + 16, y - 78, 30, 34],
    [x - 16, y - 78, -30, 34],
    [x - 31, y - 103, 90, 34],

    // spine / shoulders / core
    [x, y - 22, 90, 82],
    [x, y + 48, 90, 58],
    [x, y - 50, 0, 116],
    [x, y + 8, 90, 26],

    // arms / 4
    [x - 76, y - 22, -28, 82],
    [x - 116, y + 17, -55, 70],
    [x + 76, y - 22, 28, 82],
    [x + 116, y + 17, 55, 70],

    // pelvis / legs / 5
    [x, y + 82, 0, 86],
    [x - 42, y + 126, -63, 96],
    [x - 78, y + 190, -78, 92],
    [x + 42, y + 126, 63, 96],
    [x + 78, y + 190, 78, 92],
  ];

  return fitWord(
    strokes.map(([sx, sy, r, l]) => [
      CX + (sx - CX) * scale,
      sy,
      r,
      l * scale,
    ]),
    "desktop",
    opacity,
  );
}

function sound(viewport: MaterialViewport): MaterialTransform[] {
  const width = viewport === "mobile" ? 430 : 620;
  const amplitude = viewport === "mobile" ? 80 : 104;
  const opacity = viewport === "mobile" ? 0.2 : 0.28;

  return Array.from({ length: COUNT }, (_, index) => {
    const t = index / (COUNT - 1);
    const phase = t * Math.PI * 4.25;
    const x = CX - width / 2 + t * width;
    const y = CY + Math.sin(phase) * amplitude;
    const derivative = Math.cos(phase) * amplitude * (Math.PI * 4.25) / width;
    const rotation = (Math.atan2(derivative, 1) * 180) / Math.PI;

    return segment(
      x,
      y,
      rotation,
      viewport === "mobile" ? 34 : 46,
      opacity,
    );
  });
}

function image(viewport: MaterialViewport): MaterialTransform[] {
  const opacity = viewport === "mobile" ? 0.19 : 0.27;
  const w = viewport === "mobile" ? 330 : 470;
  const h = viewport === "mobile" ? 250 : 320;
  const left = CX - w / 2;
  const right = CX + w / 2;
  const top = CY - h / 2;
  const bottom = CY + h / 2;
  const thirdW = w / 3;
  const thirdH = h / 3;

  const strokes: Stroke[] = [
    // frame / 12
    [left + thirdW / 2, top, 0, thirdW],
    [left + thirdW * 1.5, top, 0, thirdW],
    [left + thirdW * 2.5, top, 0, thirdW],
    [left + thirdW / 2, bottom, 0, thirdW],
    [left + thirdW * 1.5, bottom, 0, thirdW],
    [left + thirdW * 2.5, bottom, 0, thirdW],
    [left, top + thirdH / 2, 90, thirdH],
    [left, top + thirdH * 1.5, 90, thirdH],
    [left, top + thirdH * 2.5, 90, thirdH],
    [right, top + thirdH / 2, 90, thirdH],
    [right, top + thirdH * 1.5, 90, thirdH],
    [right, top + thirdH * 2.5, 90, thirdH],

    // aperture / 7
    [CX, CY - 72, 90, 86],
    [CX + 61, CY - 35, 30, 86],
    [CX + 61, CY + 35, -30, 86],
    [CX, CY + 72, 90, 86],
    [CX - 61, CY + 35, 30, 86],
    [CX - 61, CY - 35, -30, 86],
    [CX, CY, 0, 92],
  ];

  return fitWord(strokes, "desktop", opacity);
}

function space(viewport: MaterialViewport): MaterialTransform[] {
  const opacity = viewport === "mobile" ? 0.18 : 0.26;
  const outerW = viewport === "mobile" ? 370 : 520;
  const outerH = viewport === "mobile" ? 290 : 350;
  const innerW = outerW * 0.44;
  const innerH = outerH * 0.42;

  const l = CX - outerW / 2;
  const r = CX + outerW / 2;
  const t = CY - outerH / 2;
  const b = CY + outerH / 2;
  const il = CX - innerW / 2;
  const ir = CX + innerW / 2;
  const it = CY - innerH / 2;
  const ib = CY + innerH / 2;

  const lineBetween = (
    ax: number,
    ay: number,
    bx: number,
    by: number,
  ): Stroke => {
    const dx = bx - ax;
    const dy = by - ay;
    return [
      (ax + bx) / 2,
      (ay + by) / 2,
      (Math.atan2(dy, dx) * 180) / Math.PI,
      Math.hypot(dx, dy),
    ];
  };

  const strokes: Stroke[] = [
    // outer / 4
    [CX, t, 0, outerW],
    [CX, b, 0, outerW],
    [l, CY, 90, outerH],
    [r, CY, 90, outerH],

    // inner / 4
    [CX, it, 0, innerW],
    [CX, ib, 0, innerW],
    [il, CY, 90, innerH],
    [ir, CY, 90, innerH],

    // connectors / 4
    lineBetween(l, t, il, it),
    lineBetween(r, t, ir, it),
    lineBetween(l, b, il, ib),
    lineBetween(r, b, ir, ib),

    // perspective floor / 7
    lineBetween(l + outerW * 0.14, b, il + innerW * 0.12, ib),
    lineBetween(l + outerW * 0.28, b, il + innerW * 0.24, ib),
    lineBetween(l + outerW * 0.42, b, il + innerW * 0.39, ib),
    lineBetween(CX, b, CX, ib),
    lineBetween(r - outerW * 0.42, b, ir - innerW * 0.39, ib),
    lineBetween(r - outerW * 0.28, b, ir - innerW * 0.24, ib),
    lineBetween(r - outerW * 0.14, b, ir - innerW * 0.12, ib),
  ];

  return fitWord(strokes, "desktop", opacity);
}

function intelligence(viewport: MaterialViewport): MaterialTransform[] {
  const opacity = viewport === "mobile" ? 0.22 : 0.3;

  return Array.from({ length: COUNT }, (_, index) => {
    const step = index % 3 === 0 ? 5 : index % 3 === 1 ? 7 : 8;
    const base = chord(index, step, viewport);

    return {
      ...base,
      scaleX: base.scaleX * (index % 2 === 0 ? 0.72 : 0.92),
      opacity,
    };
  });
}


function kepenk(viewport: MaterialViewport): MaterialTransform[] {
  const opacity = viewport === "mobile" ? 0.2 : 0.28;
  const width = viewport === "mobile" ? 350 : 540;
  const height = viewport === "mobile" ? 270 : 330;
  const left = CX - width / 2;
  const right = CX + width / 2;
  const top = CY - height / 2;
  const bottom = CY + height / 2;
  const col = width / 4;
  const row = height / 4;
  const slot = viewport === "mobile" ? 44 : 66;

  const strokes: Stroke[] = [
    // frame / 4
    [CX, top, 0, width],
    [CX, bottom, 0, width],
    [left, CY, 90, height],
    [right, CY, 90, height],

    // grid / 6
    [left + col, CY, 90, height],
    [left + col * 2, CY, 90, height],
    [left + col * 3, CY, 90, height],
    [CX, top + row, 0, width],
    [CX, top + row * 2, 0, width],
    [CX, top + row * 3, 0, width],

    // active slots / 9
    [left + col * 0.5, top + row * 0.5, 0, slot],
    [left + col * 1.5, top + row * 0.5, 0, slot * 0.74],
    [left + col * 2.5, top + row * 0.5, 0, slot * 0.9],
    [left + col * 0.5, top + row * 1.5, 0, slot * 0.62],
    [left + col * 1.5, top + row * 1.5, 0, slot],
    [left + col * 3.5, top + row * 1.5, 0, slot * 0.8],
    [left + col * 0.5, top + row * 2.5, 0, slot * 0.82],
    [left + col * 2.5, top + row * 2.5, 0, slot],
    [left + col * 3.5, top + row * 2.5, 0, slot * 0.66],
  ];

  return strokes.map(([x, y, rotation, length]) =>
    segment(x, y, rotation, length, opacity),
  );
}

function yote(viewport: MaterialViewport): MaterialTransform[] {
  const opacity = viewport === "mobile" ? 0.19 : 0.27;
  const scale = viewport === "mobile" ? 0.72 : 1;
  const sx = (x: number) => CX + (x - CX) * scale;
  const sy = (y: number) => CY + (y - CY) * (viewport === "mobile" ? 0.84 : 1);
  const sl = (length: number) => length * scale;

  const strokes: Stroke[] = [
    // parcel / 4
    [sx(500), sy(470), 0, sl(590)],
    [sx(500), sy(210), 0, sl(590)],
    [sx(205), sy(340), 90, sl(260)],
    [sx(795), sy(340), 90, sl(260)],

    // cabin / 5
    [sx(350), sy(402), 0, sl(150)],
    [sx(275), sy(345), 90, sl(114)],
    [sx(425), sy(345), 90, sl(114)],
    [sx(310), sy(267), -32, sl(92)],
    [sx(390), sy(267), 32, sl(92)],

    // greenhouse / 5
    [sx(600), sy(402), 0, sl(210)],
    [sx(495), sy(345), 90, sl(114)],
    [sx(705), sy(345), 90, sl(114)],
    [sx(548), sy(278), -24, sl(118)],
    [sx(652), sy(278), 24, sl(118)],

    // underground core / 4
    [sx(500), sy(448), 0, sl(220)],
    [sx(500), sy(515), 0, sl(220)],
    [sx(390), sy(482), 90, sl(67)],
    [sx(610), sy(482), 90, sl(67)],

    // one shared path / 1
    [sx(470), sy(420), -8, sl(300)],
  ];

  return strokes.map(([x, y, rotation, length]) =>
    segment(x, y, rotation, length, opacity),
  );
}

function kldrm(viewport: MaterialViewport): MaterialTransform[] {
  const width = viewport === "mobile" ? 430 : 650;
  const minLength = viewport === "mobile" ? 26 : 34;
  const maxLength = viewport === "mobile" ? 154 : 220;
  const opacity = viewport === "mobile" ? 0.22 : 0.3;

  return Array.from({ length: COUNT }, (_, index) => {
    const t = index / (COUNT - 1);
    const envelope = Math.sin(Math.PI * t);
    const pulse =
      0.48 +
      0.52 *
        Math.abs(
          Math.sin(index * 1.71) * 0.68 + Math.sin(index * 0.57) * 0.32,
        );
    const length = minLength + (maxLength - minLength) * envelope * pulse;

    return segment(
      CX - width / 2 + t * width,
      CY,
      90,
      length,
      opacity,
    );
  });
}

function h19(viewport: MaterialViewport): MaterialTransform[] {
  const opacity = viewport === "mobile" ? 0.22 : 0.3;
  const hubs =
    viewport === "mobile"
      ? [
          { x: CX, y: CY - 72 },
          { x: CX - 70, y: CY + 56 },
          { x: CX + 70, y: CY + 56 },
        ]
      : [
          { x: CX, y: CY - 92 },
          { x: CX - 94, y: CY + 72 },
          { x: CX + 94, y: CY + 72 },
        ];

  return Array.from({ length: COUNT }, (_, index) => {
    const a = pointOnEllipse(index, 286, 208, viewport);
    const hub = hubs[(index * 7) % hubs.length];
    const dx = hub.x - a.x;
    const dy = hub.y - a.y;

    return segment(
      (a.x + hub.x) / 2,
      (a.y + hub.y) / 2,
      (Math.atan2(dy, dx) * 180) / Math.PI,
      Math.hypot(dx, dy),
      opacity,
    );
  });
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
  if (name === "body") return body(viewport);
  if (name === "sound") return sound(viewport);
  if (name === "image") return image(viewport);
  if (name === "space") return space(viewport);
  if (name === "intelligence") return intelligence(viewport);
  if (name === "kepenk") return kepenk(viewport);
  if (name === "yote") return yote(viewport);
  if (name === "kldrm") return kldrm(viewport);
  if (name === "h19") return h19(viewport);

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
