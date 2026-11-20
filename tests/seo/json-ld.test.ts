import test from "node:test";
import assert from "node:assert/strict";
import { aboutPageJsonLd, breadcrumbJsonLd, eventsJsonLd, organizationNode, serializeJsonLd, teamJsonLd, websiteNode } from "../../lib/seo/json-ld.ts";
import { arrangeRoster, type PublicTeamMember } from "../../lib/team/roster.ts";
import { FACULTY_COORDINATORS, HOD } from "../../lib/team/faculty.ts";

const BASE = "https://awstulas.org";

test("serializeJsonLd escapes < and line separators", () => {
  const out = serializeJsonLd({ a: "</script><b>\u2028\u2029" });
  assert.ok(!out.includes("<"));
  assert.ok(out.includes("\\u003c"));
  assert.ok(!out.includes("\u2028"));
  assert.ok(!out.includes("\u2029"));
  assert.equal(JSON.parse(out).a, "</script><b>\u2028\u2029");
});

test("organizationNode is accurate", () => {
  const o = organizationNode(BASE);
  assert.equal(o["@id"], `${BASE}/#organization`);
  assert.equal(o.logo, `${BASE}/logos/SBG_logo.png`);
  assert.equal(o.address.addressCountry, "IN");
  assert.equal(o.parentOrganization["@type"], "CollegeOrUniversity");
  assert.ok(!("url" in o.parentOrganization));
  assert.ok(o.sameAs.length === 3 && o.sameAs.every((u) => !u.includes("github.com")));
  assert.ok(!JSON.stringify(o).includes("Cloud Club"));
});

test("websiteNode has no potentialAction", () => {
  const w = websiteNode(BASE);
  assert.equal(w["@id"], `${BASE}/#website`);
  assert.ok(!("potentialAction" in w));
});

test("breadcrumbJsonLd builds absolute positions", () => {
  const b = breadcrumbJsonLd(
    [
      { name: "Home", path: "/" },
      { name: "Events", path: "/events" },
    ],
    BASE
  );
  assert.equal(b.itemListElement[0].position, 1);
  assert.equal(b.itemListElement[0].item, BASE);
  assert.equal(b.itemListElement[1].item, `${BASE}/events`);
});

const member = (over: Partial<PublicTeamMember>): PublicTeamMember => ({
  id: "1",
  name: "A",
  course: "B.Tech",
  branch: "CSE",
  role: null,
  wing: null,
  picture_url: null,
  ...over,
});

test("teamJsonLd lists leadership and faculty only, without private fields", () => {
  const rows = [
    member({ id: "1", name: "Lead One", role: "Leader", picture_url: "https://cdn.example.com/a.png" }),
    member({ id: "2", name: "Tech Person", role: "Technical Lead", picture_url: "/members/boy2.png" }),
    member({ id: "3", name: "Wing Only", role: null, wing: "Tech" }),
  ];
  const { core } = arrangeRoster(rows);
  const data = teamJsonLd(core, [HOD, ...FACULTY_COORDINATORS], BASE);
  const names = data["@graph"].map((n) => n.name);
  assert.deepEqual(names, ["Lead One", "Tech Person", HOD.name, ...FACULTY_COORDINATORS.map((f) => f.name)]);
  assert.ok(!names.includes("Wing Only"));
  const json = JSON.stringify(data);
  assert.ok(!json.includes('"email"'));
  assert.ok(!json.includes("B.Tech"));
  assert.ok(!json.includes("boy2.png"));
  assert.equal((data["@graph"][0] as { image?: string }).image, "https://cdn.example.com/a.png");
  assert.equal((data["@graph"][1] as { image?: string }).image, undefined);
});

test("aboutPageJsonLd references the organization and website nodes", () => {
  const data = aboutPageJsonLd(BASE);
  assert.equal(data["@type"], "AboutPage");
  assert.deepEqual(data.about, { "@id": `${BASE}/#organization` });
  assert.deepEqual(data.isPartOf, { "@id": `${BASE}/#website` });
});
const ev = (over: Record<string, unknown>) => ({
  id: "e1",
  name: "Cloud Day",
  description: "A session",
  event_date: "2026-10-20",
  ...over,
});

test("eventsJsonLd keeps only rows with a real date", () => {
  const data = eventsJsonLd(
    [ev({ id: "a" }), ev({ id: "b", event_date: null }), ev({ id: "c", event_date: "" }), ev({ id: "d", event_date: "2026-02-31" }), ev({ id: "e", event_date: "soon" })],
    BASE
  );
  assert.equal(data["@graph"].length, 1);
  assert.equal(data["@graph"][0].startDate, "2026-10-20");
  assert.equal(data["@graph"][0]["@type"], "Event");
});

test("eventsJsonLd emits endDate only when valid and not before start", () => {
  const [ok, before, bad, same] = eventsJsonLd(
    [
      ev({ id: "1", event_end_date: "2026-10-21" }),
      ev({ id: "2", event_end_date: "2026-10-19" }),
      ev({ id: "3", event_end_date: "tomorrow" }),
      ev({ id: "4", event_end_date: "2026-10-20" }),
    ],
    BASE
  )["@graph"] as { endDate?: string }[];
  assert.equal(ok.endDate, "2026-10-21");
  assert.equal(before.endDate, undefined);
  assert.equal(bad.endDate, undefined);
  assert.equal(same.endDate, "2026-10-20");
});

test("eventsJsonLd has no offers or performer, fixed location, optional description and https image", () => {
  const data = eventsJsonLd(
    [ev({ id: "1", cover_url: "https://cdn.example.com/c.png" }), ev({ id: "2", description: "  ", cover_url: "http://x/y.png" })],
    BASE
  );
  const [first, second] = data["@graph"] as Record<string, unknown>[];
  const json = JSON.stringify(data);
  for (const key of ["offers", "performer", "eventAttendanceMode"]) assert.ok(!json.includes(`"${key}"`));
  assert.equal(first.image, "https://cdn.example.com/c.png");
  assert.equal(second.image, undefined);
  assert.equal(second.description, undefined);
  assert.equal(first.eventStatus, "https://schema.org/EventScheduled");
  assert.deepEqual(first.organizer, { "@id": `${BASE}/#organization` });
  const loc = first.location as { name: string; address: { addressLocality: string; addressRegion: string; addressCountry: string } };
  assert.equal(loc.name, "Tulas University");
  assert.deepEqual([loc.address.addressLocality, loc.address.addressRegion, loc.address.addressCountry], ["Dehradun", "Uttarakhand", "IN"]);
});

test("eventsJsonLd ids are unique", () => {
  const data = eventsJsonLd([ev({ id: "a" }), ev({ id: "b" }), ev({ id: "c d" })], BASE);
  const ids = (data["@graph"] as { "@id": string }[]).map((n) => n["@id"]);
  assert.equal(new Set(ids).size, 3);
});