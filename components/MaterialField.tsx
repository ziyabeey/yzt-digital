"use client";

export type MaterialPresetName = "see" | "break" | "wonder" | "build";

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

function pointOnEllipse(index: number, rx: number, ry: number) {
  const theta = (Math.PI * 2 * index) / COUNT - Math.PI / 2;
  return {
    x: CX + Math.cos(theta) * rx,
    y: CY + Math.sin(theta) * ry,
    theta,
  };
}

function chord(index: number, step: number): MaterialTransform {
  const a = pointOnEllipse(index, 255, 190);
  const b = pointOnEllipse((index + step) % COUNT, 255, 190);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy);

  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    rotation: (Math.atan2(dy, dx) * 180) / Math.PI,
    scaleX: length / WIDTH,
    scaleY: 1,
    opacity: 0.48,
  };
}

function see(index: number): MaterialTransform {
  const p = pointOnEllipse(index, 245, 176);

  return {
    x: p.x,
    y: p.y,
    rotation: (p.theta * 180) / Math.PI + 90,
    scaleX: 0.68,
    scaleY: 1,
    opacity: 0.34,
  };
}

function breakApart(index: number): MaterialTransform {
  const j = (index * 7) % COUNT;
  const column = j % 5;
  const row = Math.floor(j / 5);

  return {
    x: CX + (column - 2) * 126 + Math.sin(index * 1.7) * 28,
    y: CY + (row - 1.5) * 112 + Math.cos(index * 1.31) * 24,
    rotation: ((j * 19) % 170) - 85,
    scaleX: 0.42 + (j % 4) * 0.2,
    scaleY: 1,
    opacity: 0.5,
  };
}

function build(index: number): MaterialTransform {
  if (index < 10) {
    return {
      x: 320 + index * 40,
      y: CY,
      rotation: 90,
      scaleX: 4.25,
      scaleY: 1,
      opacity: index === 0 || index === 9 ? 0.58 : 0.26,
    };
  }

  const j = index - 10;
  return {
    x: CX,
    y: 190 + j * 40,
    rotation: 0,
    scaleX: 5.05,
    scaleY: 1,
    opacity: j === 0 || j === 8 ? 0.58 : 0.26,
  };
}

export function getMaterialPreset(
  name: MaterialPresetName,
): MaterialTransform[] {
  return Array.from({ length: COUNT }, (_, index) => {
    if (name === "see") return see(index);
    if (name === "break") return breakApart(index);
    if (name === "wonder") return chord(index, 7);
    return build(index);
  });
}

export const MATERIAL_COUNT = COUNT;

export function MaterialField() {
  const initial = getMaterialPreset("see");

  return (
    <svg
      className="material-field"
      viewBox="0 0 1000 700"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <g className="material-field-inner">
        {initial.map((item, index) => (
          <g
            className="material-module"
            data-material-index={index}
            key={index}
            transform={
              `translate(${item.x} ${item.y}) rotate(${item.rotation}) scale(${item.scaleX} ${item.scaleY})`
            }
            opacity={item.opacity}
          >
            <rect x="-36" y="-2" width="72" height="4" rx="2" />
          </g>
        ))}
      </g>
    </svg>
  );
}
