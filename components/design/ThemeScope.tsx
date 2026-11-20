"use client";

import { usePathname } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { THEME_STORAGE_KEY, isDarkCapablePath } from "@/lib/design/theme";

/**
 * Wrapper of every light-theme page. Provides the theme (next-themes writes data-theme on <html> and
 * injects the pre-hydration script that avoids a flash) and marks whether this page may go dark.
 * The CSS only turns dark when html[data-theme="dark"] AND this element has data-themable="true",
 * so /community, /register and /verify stay light whatever is stored.
 */
export function ThemeScope({ className, children }: { className: string; children: React.ReactNode }) {
  const themable = isDarkCapablePath(usePathname());
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem={false}
      enableColorScheme={false}
      storageKey={THEME_STORAGE_KEY}
      disableTransitionOnChange={false}
    >
      <div className={className} data-themable={themable}>
        {children}
      </div>
    </ThemeProvider>
  );
}
