// ============================================================
// Team roster — arranging team_members rows for the public Team page (PURE)
// ============================================================
// The table has no ordering column, so the page derives order:
//
//   Leadership  exactly six titles, in this order: Leader, Vice-Leader,
//               Technical Lead, Event Lead, Secretary, PR Lead. Any other
//               role (co-leads) is not Leadership.
//   Wings       everyone whose `wing` column is set, grouped by it (Tech, PR,
//               Event, Media first, then any other wing A→Z). Titled people
//               come first in a group, then A→Z; the title shows on the card.
//               A leader whose wing is set appears in both sections.
//
// The wing is never guessed from the role text. A non-leadership row with
// wing = NULL is not shown until its wing is set in the admin Team tab.
// ============================================================

import type { TeamMemberRow } from "./types";

/** Columns the public page reads. email stays private. */
export const PUBLIC_TEAM_COLUMNS = "id, name, course, branch, role, wing, picture_url" as const;

export type PublicTeamMember = Pick<
  TeamMemberRow,
  "id" | "name" | "course" | "branch" | "role" | "wing" | "picture_url"
>;

export interface WingGroup {
  wing: string;
  members: PublicTeamMember[];
}

export interface ArrangedRoster {
  /** The Leadership tier, in title order. */
  core: PublicTeamMember[];
  wings: WingGroup[];
}

/** Leadership titles in display order; each entry lists the spellings it accepts. */
const LEADERSHIP_ROLES: readonly (readonly string[])[] = [
  ["leader", "sbgleader", "groupleader", "builderleader"],
  ["viceleader", "vicesbgleader"],
  ["technicallead", "techlead"],
  ["eventlead", "eventslead"],
  ["secretary"],
  ["prlead", "publicrelationslead"],
];

const WING_ORDER = ["tech", "pr", "event", "media"];

const squash = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");

/** Position of a leadership title (0 = Leader), or -1 for any other role. */
export function coreRank(role: string | null): number {
  if (!role) return -1;
  const r = squash(role);
  return LEADERSHIP_ROLES.findIndex((names) => names.includes(r));
}

const hasRole = (m: PublicTeamMember) => Boolean(m.role?.trim());
const byName = (a: PublicTeamMember, b: PublicTeamMember) => a.name.localeCompare(b.name);

function wingRank(wing: string): number {
  const i = WING_ORDER.indexOf(squash(wing));
  return i === -1 ? WING_ORDER.length : i;
}

export function arrangeRoster(rows: readonly PublicTeamMember[]): ArrangedRoster {
  const rank = (m: PublicTeamMember) => {
    const r = coreRank(m.role);
    return r === -1 ? LEADERSHIP_ROLES.length : r;
  };

  const core = rows.filter((m) => coreRank(m.role) !== -1).sort((a, b) => rank(a) - rank(b) || byName(a, b));

  const groups = new Map<string, PublicTeamMember[]>();
  for (const m of rows) {
    const wing = m.wing?.trim();
    if (!wing) continue;
    const list = groups.get(wing) ?? [];
    list.push(m);
    groups.set(wing, list);
  }

  const wings = [...groups.entries()]
    .map(([wing, members]) => ({
      wing,
      members: members.sort((a, b) => Number(hasRole(b)) - Number(hasRole(a)) || rank(a) - rank(b) || byName(a, b)),
    }))
    .sort((a, b) => wingRank(a.wing) - wingRank(b.wing) || a.wing.localeCompare(b.wing));

  return { core, wings };
}
