"use client";

import { useEffect } from "react";
import { magnetFor, parallaxFor, tiltFor } from "@/lib/design/pointer-fx";

const FINE = "(hover: hover) and (pointer: fine)";
const REDUCED = "(prefers-reduced-motion: reduce)";

/**
 * One delegated pointermove for the whole site. Writes CSS variables only (no React state):
 *   [data-magnetic] -> --tx / --ty (px)      [data-parallax] -> --px / --py (-1..1)
 *   .lift -> --mx / --my (px inside the card)      [data-tilt] -> --rx / --ry (deg)
 * Does nothing on touch or with prefers-reduced-motion, so those variables are never written.
 */
export function PointerFx() {
  useEffect(() => {
    const fine = window.matchMedia(FINE);
    const reduced = window.matchMedia(REDUCED);
    let off: (() => void) | null = null;

    const enable = () => {
      let raf = 0;
      let px = 0;
      let py = 0;
      const touched = new Set<HTMLElement>();

      let card: HTMLElement | null = null;
      const clearCard = () => {
        if (!card) return;
        ["--mx", "--my", "--rx", "--ry"].forEach((p) => card!.style.removeProperty(p));
        card = null;
      };

      const reset = () => {
        clearCard();
        touched.forEach((el) => {
          el.style.removeProperty("--tx");
          el.style.removeProperty("--ty");
          el.style.removeProperty("--px");
          el.style.removeProperty("--py");
        });
        touched.clear();
      };

      const frame = () => {
        raf = 0;
        const hit = document.elementFromPoint(px, py)?.closest<HTMLElement>(".lift");
        if (hit !== card) clearCard();
        if (hit) {
          const r = hit.getBoundingClientRect();
          hit.style.setProperty("--mx", `${(px - r.left).toFixed(0)}px`);
          hit.style.setProperty("--my", `${(py - r.top).toFixed(0)}px`);
          if (hit.hasAttribute("data-tilt")) {
            const t = tiltFor(r, px, py, 4);
            hit.style.setProperty("--rx", `${t.x.toFixed(2)}deg`);
            hit.style.setProperty("--ry", `${t.y.toFixed(2)}deg`);
          }
          card = hit;
        }
        document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
          const r = el.getBoundingClientRect();
          const m = magnetFor(r, px, py, 40, 0.25, 6);
          if (m.x === 0 && m.y === 0) {
            if (touched.delete(el)) {
              el.style.removeProperty("--tx");
              el.style.removeProperty("--ty");
            }
            return;
          }
          el.style.setProperty("--tx", `${m.x.toFixed(2)}px`);
          el.style.setProperty("--ty", `${m.y.toFixed(2)}px`);
          touched.add(el);
        });
        document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.bottom < 0 || r.top > window.innerHeight) return;
          const p = parallaxFor(r, px, py);
          el.style.setProperty("--px", p.x.toFixed(3));
          el.style.setProperty("--py", p.y.toFixed(3));
          touched.add(el);
        });
      };

      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        px = e.clientX;
        py = e.clientY;
        if (!raf) raf = requestAnimationFrame(frame);
      };
      const onLeave = () => {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        reset();
      };

      document.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      window.addEventListener("blur", onLeave);
      return () => {
        document.removeEventListener("pointermove", onMove);
        document.documentElement.removeEventListener("pointerleave", onLeave);
        window.removeEventListener("blur", onLeave);
        onLeave();
      };
    };

    const sync = () => {
      off?.();
      off = fine.matches && !reduced.matches ? enable() : null;
    };
    sync();
    fine.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    return () => {
      fine.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
      off?.();
    };
  }, []);

  return null;
}
