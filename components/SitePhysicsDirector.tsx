"use client";

import { useEffect } from "react";
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

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function smoothstep(value: number) {
  const p = clamp01(value);
  return p * p * (3 - 2 * p);
}

function temporalProgress(
  progress: number,
  index: number,
  amount: number,
) {
  if (amount <= 0) return smoothstep(progress);

  const phase = (((index * 7) % 19) / 18 - 0.5) * amount;
  const base = smoothstep(progress);
  const shifted = clamp01(
    base + phase * Math.sin(Math.PI * base),
  );

  return smoothstep(shifted);
}

function applyMix(
  modules: SVGGElement[],
  from: MaterialTransform[],
  to: MaterialTransform[],
  progress: number,
  temporalAmount = 0,
) {
  modules.forEach((module, index) => {
    const state = mix(
      from[index],
      to[index],
      temporalProgress(progress, index, temporalAmount),
    );

    module.setAttribute(
      "transform",
      `translate(${state.x} ${state.y}) rotate(${state.rotation}) scale(${state.scaleX} ${state.scaleY})`,
    );
    module.setAttribute("opacity", String(state.opacity));
  });
}

type Transition = {
  trigger: string;
  from: MaterialPresetName;
  to: MaterialPresetName;
  start?: string;
  end?: string;
  temporalAmount?: number;
};

const identityStates: MaterialPresetName[] = [
  "body",
  "sound",
  "image",
  "space",
  "system",
  "intelligence",
];

const transitions: Transition[] = [
  {
    trigger: "#now",
    from: "intelligence",
    to: "kepenk",
    start: "top bottom",
    end: "top 40%",
    temporalAmount: 0.055,
  },
  {
    trigger: "#project-yote",
    from: "kepenk",
    to: "yote",
    start: "top 82%",
    end: "top 34%",
    temporalAmount: 0.085,
  },
  {
    trigger: "#project-kldrm",
    from: "yote",
    to: "kldrm",
    start: "top 82%",
    end: "top 34%",
    temporalAmount: 0.12,
  },
  {
    trigger: "#project-h19",
    from: "kldrm",
    to: "h19",
    start: "top 82%",
    end: "top 34%",
    temporalAmount: 0.07,
  },
  {
    trigger: "#lab",
    from: "h19",
    to: "deney",
    start: "top 92%",
    end: "top 40%",
    temporalAmount: 0.09,
  },
  {
    trigger: "#notes",
    from: "deney",
    to: "see",
    start: "top 92%",
    end: "top 42%",
    temporalAmount: 0.04,
  },
  {
    trigger: "#final",
    from: "see",
    to: "kurarim",
    start: "top 92%",
    end: "top 34%",
    temporalAmount: 0.11,
  },
];

export function SitePhysicsDirector() {
  useEffect(() => {
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

        const labels = Array.from(
          document.querySelectorAll<HTMLElement>(".material-label"),
        );

        const identityPresets = [
          getMaterialPreset("build", viewport),
          ...identityStates.map((state) => getMaterialPreset(state, viewport)),
        ];

        const setActiveLabel = (activeIndex: number) => {
          labels.forEach((label, index) => {
            const active = index === activeIndex;
            label.style.opacity = "1";
            label.style.color = active ? "var(--fg)" : "var(--muted)";
            label.dataset.activeMaterial = active ? "true" : "false";
          });
        };

        setActiveLabel(0);

        const identityTrigger = ScrollTrigger.create({
          trigger: "#about",
          start: "top top",
          end: "bottom bottom",
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const transitionsCount = identityStates.length;
            const scaled = Math.min(
              self.progress * transitionsCount,
              transitionsCount - 0.0001,
            );
            const index = Math.floor(scaled);
            const localProgress = scaled - index;

            applyMix(
              modules,
              identityPresets[index],
              identityPresets[index + 1],
              localProgress,
              conditions.mobile ? 0.045 : 0.08,
            );
            setActiveLabel(index);
          },
          onLeave: () => {
            const last = identityPresets[identityPresets.length - 1];
            applyMix(modules, last, last, 1);
            setActiveLabel(identityStates.length - 1);
          },
          onLeaveBack: () => {
            const first = identityPresets[0];
            applyMix(modules, first, first, 1);
            setActiveLabel(0);
          },
        });

        const materialRoot =
          document.querySelector<HTMLElement>(".site-material");

        const lockMaterialState = (state: MaterialPresetName) => {
          const preset = getMaterialPreset(state, viewport);
          applyMix(modules, preset, preset, 1);

          if (materialRoot) {
            materialRoot.dataset.currentMaterialState = state;
          }
        };

        const projectRows = Array.from(
          document.querySelectorAll<HTMLElement>(".project-row"),
        );

        const setActiveProject = (active: HTMLElement | null) => {
          projectRows.forEach((row) => {
            row.dataset.activeProject = row === active ? "true" : "false";
          });
        };

        const projectTextTriggers = projectRows.map((row) =>
          ScrollTrigger.create({
            trigger: row,
            start: "top 62%",
            end: "bottom 38%",
            onEnter: () => setActiveProject(row),
            onEnterBack: () => setActiveProject(row),
            onLeave: () => {
              if (row.dataset.activeProject === "true") {
                row.dataset.activeProject = "false";
              }
            },
            onLeaveBack: () => {
              if (row.dataset.activeProject === "true") {
                row.dataset.activeProject = "false";
              }
            },
          }),
        );

        const projectStateLocks = projectRows
          .map((row) => {
            const state = row.dataset.projectState as
              | MaterialPresetName
              | undefined;

            if (!state) return null;

            return ScrollTrigger.create({
              trigger: row,
              start: "top 33%",
              end: "bottom 33%",
              onEnter: () => lockMaterialState(state),
              onEnterBack: () => lockMaterialState(state),
            });
          })
          .filter((trigger): trigger is ScrollTrigger => trigger !== null);

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
              applyMix(
                modules,
                from,
                to,
                self.progress,
                (transition.temporalAmount ?? 0) *
                  (conditions.mobile ? 0.62 : 1),
              );
            },
            onLeave: () => {
              applyMix(modules, to, to, 1);
              if (materialRoot) {
                materialRoot.dataset.currentMaterialState = transition.to;
              }
            },
            onEnterBack: (self) =>
              applyMix(
                modules,
                from,
                to,
                self.progress,
                (transition.temporalAmount ?? 0) *
                  (conditions.mobile ? 0.62 : 1),
              ),
            onLeaveBack: () => {
              applyMix(modules, from, from, 1);
              if (materialRoot) {
                materialRoot.dataset.currentMaterialState = transition.from;
              }
            },
          });
        });

        if (materialRoot) {
          materialRoot.dataset.physicsReady = "true";
        }

        return () => {
          if (materialRoot) {
            delete materialRoot.dataset.physicsReady;
          }
          identityTrigger.kill();
          projectTextTriggers.forEach((trigger) => trigger.kill());
          projectStateLocks.forEach((trigger) => trigger.kill());
          triggers.forEach((trigger) => trigger.kill());
        };
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
