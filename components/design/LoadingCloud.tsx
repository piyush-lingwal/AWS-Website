import Image from "next/image";
import type { CSSProperties } from "react";
import { buildCloud, CLOUD_MASK, SPARK } from "@/lib/design/pixel-cloud";

// Server component on purpose: loading.tsx is streamed before hydration, so the motion is pure CSS
// (.ld-* in app/(light)/daylight.css) and the colours come from the same CSS variables the theme uses.
const CELLS = buildCloud();
const COLS = CLOUD_MASK[0].length;

export function LoadingCloud() {
  return (
    <div className="ld" role="status" aria-live="polite">
      <div className="ld-body">
        <div className="ld-stage">
          <div className="ld-cloud" aria-hidden="true" style={{ "--cols": COLS } as CSSProperties}>
            {CELLS.map((c) => (
              <span
                key={`${c.x}-${c.y}`}
                className="ld-cell"
                data-spark={c.color === SPARK}
                style={
                  {
                    gridColumn: c.x + 1,
                    gridRow: c.y + 1,
                    "--c": c.color,
                    "--d": c.delay,
                    "--dx": c.dx,
                    "--i": c.x + c.y,
                  } as CSSProperties
                }
              />
            ))}
          </div>
          <div className="ld-kio" aria-hidden="true">
            <Image src="/chatbotmascot.webp" alt="" width={480} height={576} priority />
          </div>
        </div>
        <div className="ld-bar" aria-hidden="true">
          <span />
        </div>
        <p className="ld-label">Building your page</p>
      </div>
    </div>
  );
}
