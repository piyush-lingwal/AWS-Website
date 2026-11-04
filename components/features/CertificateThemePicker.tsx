"use client";

import { Check } from "lucide-react";
import {
  CERTIFICATE_THEMES,
  CERTIFICATE_THEME_INFO,
  type CertificateTheme,
} from "@/lib/certificates/theme";

interface CertificateThemePickerProps {
  value: CertificateTheme;
  onChange: (theme: CertificateTheme) => void;
  disabled?: boolean;
}

/** Tiny stand-in for the certificate layout, drawn in the theme's accent colour. */
function ThemePreview({ accent }: { accent: string }) {
  return (
    <span
      aria-hidden="true"
      className="relative block h-14 w-[4.5rem] shrink-0 overflow-hidden rounded-md border border-white/10 bg-white"
    >
      <span className="absolute left-1 top-1 h-6 w-9" style={{ backgroundColor: accent }} />
      <span className="absolute right-1 top-1 h-3 w-3 bg-[#161d26]" />
      <span className="absolute right-4 top-4 h-3 w-3 bg-[#161d26]" />
      <span className="absolute bottom-1.5 left-2 h-2 w-3" style={{ backgroundColor: accent }} />
      <span className="absolute bottom-1.5 right-1.5 h-px w-7 bg-[#161d26]/60" />
    </span>
  );
}

export function CertificateThemePicker({ value, onChange, disabled = false }: CertificateThemePickerProps) {
  return (
    <fieldset className="space-y-2.5" disabled={disabled}>
      <legend className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#A1A1AA] font-medium">
        <span>Certificate Color</span>
      </legend>

      <div className="grid grid-cols-2 gap-2.5">
        {CERTIFICATE_THEMES.map((theme) => {
          const info = CERTIFICATE_THEME_INFO[theme];
          const selected = value === theme;
          return (
            <label
              key={theme}
              className={`relative flex cursor-pointer items-center gap-3 rounded-xl border p-2.5 transition-all focus-within:ring-2 focus-within:ring-[#8B5CF6]/60 ${
                selected
                  ? "border-white/40 bg-white/[0.06]"
                  : "border-white/[0.08] bg-white/[0.02] hover:border-white/20"
              } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <input
                type="radio"
                name="certificate-theme"
                value={theme}
                checked={selected}
                onChange={() => onChange(theme)}
                className="sr-only"
              />
              <ThemePreview accent={info.accent} />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-white">{info.label}</span>
                <span className="block font-mono text-[10px] uppercase tracking-wider text-[#71717A]">
                  {info.accent}
                </span>
              </span>
              {selected && (
                <span
                  className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: info.accent }}
                >
                  <Check className="h-3 w-3" aria-hidden="true" />
                </span>
              )}
            </label>
          );
        })}
      </div>

      <p className="text-[11px] leading-relaxed text-[#71717A]">
        Used for this event&apos;s participation and Certificate of Excellence PDFs. Certificates are drawn
        in the event&apos;s current color whenever they are downloaded or emailed, including ones already issued.
      </p>
    </fieldset>
  );
}
