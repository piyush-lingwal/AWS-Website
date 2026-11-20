"use client";

import { useState } from "react";
import { TEAM_PLACEHOLDER_PICTURE } from "@/lib/team/types";

/**
 * A member's photo. Shows picture_url when it is set, and the shared
 * placeholder when it is not (or when the URL fails to load).
 */
export function TeamAvatar({
  src,
  name,
  className = "",
}: {
  src: string | null | undefined;
  name: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const url = !failed && src?.trim() ? src : TEAM_PLACEHOLDER_PICTURE;
  const isPlaceholder = url === TEAM_PLACEHOLDER_PICTURE;

  return (
    <span
      className={`team-avatar relative block shrink-0 overflow-hidden border-4 border-[color:var(--surface-line)] bg-[var(--tile-bg)] shadow-[0_18px_40px_-18px_var(--tile-shadow)] ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- admin-set URLs can point anywhere */}
      <img
        src={url}
        alt={isPlaceholder ? "" : name}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`h-full w-full ${isPlaceholder ? "object-contain p-[6%]" : "object-cover"}`}
      />
    </span>
  );
}
