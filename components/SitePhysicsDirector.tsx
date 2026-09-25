"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  getMaterialPreset,
  type MaterialPresetName,
  type MaterialTransform,
  type MaterialViewport,
} from "./MaterialField";

function mix(
  from: MaterialTransform,
  to: MaterialTransform,
  progress: number,
): MaterialTransform {
  const lerp = (a: number, b: number) => a + (b - a) * progress;

  return {
    x: lerp(from.x, to.x),
    y: lerp(from.y, to.y),
    rotation: lerp(from.rotation, to.rotation),
    scaleX: lerp(from.scaleX, to.scaleX),
    scaleY: lerp(from.scaleY, to.scaleY),
    opacity: lerp(from.opacity, to.opacity),
  };
}

function applyMix(
  modules: SVGGElement[],
  from: MaterialTransform[],
  to: MaterialTransform[],
  progress: number,
) {
  const state = from.map((item, index) => mix(item, to[index], progress));

  gsap.set(modules, {
    x: (index: number) => state[index].x,
    y: (index: number) => state[index].y,
    rotation: (index: number) => state[index].rotation,
    scaleX: (index: number) => state[index].scaleX,
    scaleY: (index: number) => state[index].scaleY,
    opacity: (index: number) => state[index].opacity,
    transformOrigin: "0px 0px",
  });
}

type Transition = {
  trigger: string;
  from: MaterialPresetName;
  to: MaterialPresetName;
  start?: string;
  end?: string;
};

const transitions: Transition[] = [
  {
    trigger: "#about",
    from: "build",
    to: "system",
    start: "top 92%",
    end: "top 38%",
  },
  {
    trigger: "#now",
    from: "system",
    to: "build",
    start: "top 92%",
    end: "top 40%",
  },
  {
    trigger: "#work",
    from: "build",
    to: "break",
    start: "top 92%",
    end: "top 42%",
  },
  {
    trigger: "#lab",
    from: "break",
    to: "wonder",
    start: "top 92%",
    end: "top 40%",
  },
  {
    trigger: "#notes",
    from: "wonder",
    to: "see",
    start: "top 92%",
    end: "top 42%",
  },
];

export function SitePhysicsDirector() {
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const modules = Array.from(
      document.querySelectorAll<SVGGElement>(".material-module"),
    );
    if (modules.length !== 19) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        mobile: "(max-width: 860px)",
        reduceMotion: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const conditions = context.conditions as {
          mobile: boolean;
          reduceMotion: boolean;
        };

        const viewport: MaterialViewport = conditions.mobile
          ? "mobile"
          : "desktop";

        if (conditions.reduceMotion) {
          const staticState = getMaterialPreset("see", viewport);
          applyMix(modules, staticState, staticState, 1);
          return;
        }

        const triggers = transitions.map((transition) => {
          const from = getMaterialPreset(transition.from, viewport);
          const to = getMaterialPreset(transition.to, viewport);

          return ScrollTrigger.create({
            trigger: transition.trigger,
            start: transition.start,
            end: transition.end,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (!self.isActive) return;
              applyMix(modules, from, to, self.progress);
            },
            onLeave: () => applyMix(modules, to, to, 1),
            onEnterBack: (self) => applyMix(modules, from, to, self.progress),
            onLeaveBack: () => applyMix(modules, from, from, 1),
          });
        });

        return () => triggers.forEach((trigger) => trigger.kill());
      },
    );

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("orientationchange", refresh);

    return () => {
      window.removeEventListener("orientationchange", refresh);
      mm.revert();
    };
  }, []);

  return null;
}
