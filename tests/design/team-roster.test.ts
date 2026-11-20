import test from "node:test";
import assert from "node:assert/strict";
import { arrangeRoster, type PublicTeamMember } from "../../lib/team/roster.ts";

const m = (name: string, role: string | null, wing: string | null = null): PublicTeamMember => ({
  id: name,
  name,
  course: "B.Tech",
  branch: null,
  role,
  wing,
  picture_url: null,
});

const rows = [
  m("Zed", null, "Tech"),
  m("Abe", null, "Tech"),
  m("Rishav", "PR Lead"),
  m("Aanya", "Media Co-Lead"),
  m("Vivek", "Technical Co-Lead"),
  m("Piyush", "Technical Lead", "Tech"),
  m("Rishanshu", "Event Lead"),
  m("Anubhav", "Secretary"),
  m("Lingwal", "Leader"),
  m("Vice", "Vice - Leader"),
  m("Pat", null, "PR"),
];

test("Leadership is exactly the six leadership titles (incl. PR Lead), in title order", () => {
  assert.deepEqual(
    arrangeRoster(rows).core.map((x) => x.name),
    ["Lingwal", "Vice", "Piyush", "Rishanshu", "Anubhav", "Rishav"]
  );
});

test("co-leads are not Leadership", () => {
  const { core } = arrangeRoster(rows);
  assert.ok(!core.some((x) => x.name === "Aanya" || x.name === "Vivek"));
});

test("wings come only from the wing column; wing = NULL non-leadership rows are not shown", () => {
  const { core, wings } = arrangeRoster(rows);
  assert.deepEqual(wings.map((w) => w.wing), ["Tech", "PR"]);
  const shown = new Set([...core, ...wings.flatMap((w) => w.members)].map((x) => x.name));
  assert.ok(!shown.has("Aanya") && !shown.has("Vivek"));
});

test("a leader with a wing also appears in that wing, titled people first", () => {
  const { wings } = arrangeRoster(rows);
  assert.deepEqual(wings[0].members.map((x) => x.name), ["Piyush", "Abe", "Zed"]);
});
