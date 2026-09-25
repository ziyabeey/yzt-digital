"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  getMaterialPreset,
  MaterialField,
  type MaterialTransform,
} from "./MaterialField";

const SYSTEM = "sistemi".split("");

function materialTween(preset: MaterialTransform[]) {
  return {
    x: (index: number) => preset[index].x,
    y: (index: number) => preset[index].y,
    rotation: (index: number) => preset[index].rotation,
    scaleX: (index: number) => preset[index].scaleX,
    scaleY: (index: number) => preset[index].scaleY,
    opacity: (index: number) => preset[index].opacity,
    transformOrigin: "0px 0px",
  };
}

export function Manifesto() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (!root.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const scenes = gsap.utils.toArray<HTMLElement>(".manifesto-scene");
      const letters = gsap.utils.toArray<HTMLElement>(".system-letter");
      const modules = gsap.utils.toArray<SVGGElement>(".material-module");

      const see = getMaterialPreset("see");
      const broken = getMaterialPreset("break");
      const wonder = getMaterialPreset("wonder");
      const built = getMaterialPreset("build");

      gsap.set(scenes, { autoAlpha: 0 });
      gsap.set(scenes[0], { autoAlpha: 1 });
      gsap.set(modules, materialTween(see));

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.65,
          invalidateOnRefresh: true,
        },
      });

      tl.addLabel("see")
        .fromTo(
          ".scene-one .manifesto-word",
          { yPercent: 34, autoAlpha: 0 },
          {
            yPercent: 0,
            autoAlpha: 1,
            stagger: 0.09,
            duration: 0.7,
            ease: "power3.out",
          },
        )
        .addLabel("break")
        .to(
          modules,
          {
            ...materialTween(broken),
            duration: 1.35,
            ease: "power3.inOut",
          },
          "break",
        )
        .to(
          letters,
          {
            x: (index) => (index - (letters.length - 1) / 2) * 24,
            y: (index) => (index % 2 === 0 ? -1 : 1) * (10 + index * 2),
            rotation: (index) => (index - 3) * 1.6,
            duration: 1.2,
            ease: "power2.inOut",
          },
          "break",
        )
        .to(
          ".scene-one .word-first",
          { xPercent: -38, yPercent: -18, duration: 1.1 },
          "break",
        )
        .to(
          ".scene-one .word-last",
          { xPercent: 34, yPercent: 22, duration: 1.1 },
          "break",
        )
        .to(".scene-one", { autoAlpha: 0, duration: 0.45 }, "+=0.1")
        .to(".scene-two", { autoAlpha: 1, duration: 0.25 })
        .fromTo(
          ".scene-two .line-a",
          { xPercent: -14, letterSpacing: "0.02em" },
          {
            xPercent: 0,
            letterSpacing: "0.14em",
            duration: 1,
            ease: "power3.out",
          },
          "<",
        )
        .fromTo(
          ".scene-two .line-b",
          { xPercent: 18, autoAlpha: 0 },
          {
            xPercent: 0,
            autoAlpha: 1,
            duration: 0.85,
            ease: "power3.out",
          },
          "<0.2",
        )
        .to(".scene-two", { autoAlpha: 0, duration: 0.45 }, "+=0.55")
        .addLabel("wonder")
        .to(
          modules,
          {
            ...materialTween(wonder),
            duration: 1.55,
            ease: "power2.inOut",
          },
          "wonder",
        )
        .to(".scene-three", { autoAlpha: 1, duration: 0.25 }, "wonder+=0.16")
        .fromTo(
          ".scene-three .question-a",
          { yPercent: 55, autoAlpha: 0 },
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: 0.9,
            ease: "power3.out",
          },
          "wonder+=0.16",
        )
        .fromTo(
          ".scene-three .question-b",
          { xPercent: 13, autoAlpha: 0 },
          {
            xPercent: 0,
            autoAlpha: 1,
            duration: 0.9,
            ease: "power3.out",
          },
          "wonder+=0.32",
        )
        .to(
          ".scene-three .question-b",
          {
            xPercent: -2.5,
            duration: 0.7,
            ease: "sine.inOut",
          },
          "+=0.2",
        )
        .to(".scene-three", { autoAlpha: 0, duration: 0.45 }, "+=0.4")
        .addLabel("build")
        .to(
          modules,
          {
            ...materialTween(built),
            duration: 1.65,
            ease: "expo.inOut",
          },
          "build",
        )
        .to(".scene-four", { autoAlpha: 1, duration: 0.25 }, "build+=0.2")
        .fromTo(
          ".scene-four .build-line",
          { yPercent: 42, autoAlpha: 0 },
          {
            yPercent: 0,
            autoAlpha: 1,
            stagger: 0.12,
            duration: 0.8,
            ease: "power3.out",
          },
          "build+=0.2",
        )
        .fromTo(
          ".scene-four .lock-word",
          { letterSpacing: "0.5em", autoAlpha: 0.2 },
          {
            letterSpacing: "0.02em",
            autoAlpha: 1,
            duration: 1.3,
            ease: "expo.out",
          },
          "build+=0.82",
        )
        .to(".manifesto-counter", { autoAlpha: 1, duration: 0.25 }, "<");
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="manifesto" id="index">
      <div className="manifesto-sticky">
        <MaterialField />

        <div className="manifesto-edge manifesto-edge-left">
          <span>YZT.DIGITAL</span>
          <span className="manifesto-counter">19 / 19</span>
        </div>

        <div className="manifesto-edge manifesto-edge-right">
          <span>10 = 10</span>
          <span>2026</span>
        </div>

        <div className="manifesto-stage" aria-hidden="true">
          <div className="manifesto-scene scene-one">
            <p className="manifesto-line">
              <span className="manifesto-word word-first">Bir</span>
              <span className="manifesto-word system-word">
                {SYSTEM.map((letter, index) => (
                  <span className="system-letter" key={index}>
                    {letter}
                  </span>
                ))}
              </span>
              <span className="manifesto-word word-last">görürüm.</span>
            </p>
          </div>

          <div className="manifesto-scene scene-two">
            <p className="manifesto-line manifesto-line-stacked">
              <span className="line-a">Parçalarına</span>
              <span className="line-b">ayırırım.</span>
            </p>
          </div>

          <div className="manifesto-scene scene-three">
            <p className="manifesto-line manifesto-question">
              <span className="question-a">Başka türlü</span>
              <span className="question-b">kurulabilir mi?</span>
            </p>
          </div>

          <div className="manifesto-scene scene-four">
            <p className="manifesto-line manifesto-build">
              <span className="build-line">Sonra</span>
              <span className="build-line">gerçekten</span>
              <span className="build-line lock-word">kurarım.</span>
            </p>
          </div>
        </div>

        <p className="sr-only">
          Bir sistemi görürüm. Parçalarına ayırırım. Başka türlü kurulabilir mi
          diye bakarım. Sonra gerçekten kurarım.
        </p>

        <div className="scroll-cue" aria-hidden="true">
          <span>kaydır</span>
          <span className="scroll-cue-line" />
        </div>
      </div>
    </section>
  );
}
