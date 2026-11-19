# DESIGN.md — Daylight Cloud

The design system for the redesigned AWS Student Builder Group website (Tulas University).
**Status:** sample landing page built at `/preview`. Nothing else on the site uses these styles yet.
Section 11 lists exactly what changes if you adopt it.

---

## 1. Direction

**Daylight Cloud**: the same community, in daylight. The current site is dark and glowing, which is the
default look of almost every tech site. This one is white and lilac, editorial and warm, with one clear idea:

> **Builders build.** The page is assembled as you scroll. A cloud is built out of pixels, words light up as
> you read them, cards slide past, and the background itself changes colour from one section to the next.

It keeps what is already ours and drops what is generic:

| Keep (our identity) | Drop (generic) |
|---|---|
| The **pixel chip** logo, used as a motif: pixel clouds, pixel corners, pixel counters | Dark navy + purple glow on everything |
| **Kio**, the cloud mascot, with the orange AWS cap | Poppins for every piece of text |
| **Purple** as the brand colour, **AWS orange** as the spark | Stock glassmorphism cards on black |
| The existing content and messaging | Floating decorative flowers |

### Principles

1. **Scroll is the interface.** Every major section has a scroll behaviour that explains something: building, reading, browsing, counting. None is decoration.
2. **Light, never flat.** Pages are near-white, with colour carried by a living background and tinted cards, not by dark panels.
3. **One accent per moment.** Lilac leads. Orange appears in a few pixels. Nothing else competes.
4. **Editorial contrast.** A tight geometric sans against an elegant italic serif, used for one or two words per heading.
5. **Content never waits for animation.** The headline and the call to action are readable on first paint. Scroll adds, it never gates.
6. **Respect the reader.** Reduced-motion shows every finished state. Contrast meets WCAG AA everywhere.

---

## 2. Colour

All values are defined in `tailwind.config.ts` under `sbg` and as CSS variables in `app/preview/preview.css`.

### 2.1 Core

| Token | Hex | Use |
|---|---|---|
| `sbg-paper` | `#FBF9FF` | Page base |
| `sbg-mist` | `#F4EFFF` | Quiet panels, scrollbar track |
| `sbg-ink` | `#1B1140` | Headlines and body (a violet-black, not pure black) |
| `sbg-ink-2` | `#4D4470` | Secondary text |
| `sbg-ink-3` | `#6A6190` | Labels, captions, eyebrows |
| `sbg-spark` | `#FF9900` | **Decoration only**: a few pixels, one dot. Never text on light |

### 2.2 Lilac scale (brand)

| 50 | 100 | 200 | 300 | 400 | 500 | **600 (brand)** | 700 | 800 | 900 |
|---|---|---|---|---|---|---|---|---|---|
| `#F7F3FF` | `#EFE8FF` | `#E1D4FF` | `#CBB5FF` | `#AF8CFF` | `#9461FA` | `#7C3AED` | `#6428D4` | `#4A1D9E` | `#2E1170` |

`lilac-600` is the same purple the site already uses (`primary`), so the brand does not change, only its setting.

### 2.3 Card tints (soft pastels, used as a top-left wash over white)

Lilac `#EFE8FF` · Peach `#FFEBD3` · Rose `#FFE7F1` · Sky `#DCEBFF` · Mint `#DDF3E6` · Blush `#FFE1E1`.
Each card uses one tint fading to translucent white: `linear-gradient(155deg, tint 0%, rgba(255,255,255,.8) 58%)`.

### 2.4 Contrast (measured, WCAG 2.x)

| Pair | Ratio | Result |
|---|---|---|
| ink on paper (body, headings) | 16.74 : 1 | AAA |
| ink-2 on paper (secondary text) | 8.46 : 1 | AAA |
| ink-3 on paper (labels) | 5.39 : 1 | AA |
| ink-3 on the deepest page tone `#EEE6FF` | 4.67 : 1 | AA |
| lilac-600 on paper (accent words, links) | 5.45 : 1 | AA |
| lilac-700 on lilac-100 (active nav) | 6.31 : 1 | AA |
| white on lilac-600 (primary button) | 5.70 : 1 | AA |
| white on deep CTA card `#2E1170` | 14.68 : 1 | AAA |
| **spark orange on paper** | **2.05 : 1** | **fails: never use for text** |

Rule: orange is a fill or a dot. If text sits on orange, it is `ink` (8.17 : 1).

---

## 3. The dynamic background

The most important piece of the system. It lives in `components/design/ScrollAtmosphere.tsx`, with the colour
maths in `lib/design/atmosphere.ts` (unit-tested).

### 3.1 What it is

A fixed layer behind the page, made of:

1. a **base colour**,
2. three huge soft **blobs** (`a`, `b`, `c`) that drift across the screen as you scroll,
3. a field of 26 small **pixels** (the brand motif) floating at different speeds, a few in orange,
4. a faint **grain** and a soft top fade.

### 3.2 Tones

Every section declares a mood with `data-tone="..."`. While scrolling, the background blends from the tone of
the section being left to the tone of the one being entered.

| Tone | Base | Blob a | Blob b | Blob c | Used by |
|---|---|---|---|---|---|
| `dawn` | `#FBF9FF` | `#E4D8FF` lilac | `#FFE0BC` peach | `#D4E5FF` sky | Hero, Learning Hub |
| `bloom` | `#F6F0FF` | `#CDB9FF` | `#F2C9FF` orchid | `#C4DBFF` | Mission, Stats |
| `violet` | `#EEE6FF` | `#B39BFF` | `#8F73FF` | `#FFD0A3` | Build rail, Final CTA |
| `dusk` | `#FAF1FF` | `#F8C6E6` rose | `#C8B2FF` | `#FFDCB0` | Why join |
| `clear` | `#FDFCFF` | `#ECE5FF` | `#E0D5FF` | `#FFEFD9` | Events |

**Every tone is light** (a unit test fails if any base or blob gets dark). The page never leaves white and lilac.

### 3.3 Rules of the blend

- A tone is anchored at the **centre** of its section and measured against the **middle** of the screen.
- It is **held** for the first and last 30 % of the distance between two sections and only changes in the
  middle 40 %, so a long section feels settled and the change reads as a deliberate moment.
- The blend is eased (smoothstep), so there is no visible start or stop.
- Sections are measured on load, on resize, and whenever the page height changes.

### 3.4 Adding a section

Put `data-tone="<name>"` on its `<section>`. That is all. To add a mood, add one line to `TONES` and keep it light.

---

## 4. Typography

| Role | Font | Where it comes from | Use |
|---|---|---|---|
| Display | **Bricolage Grotesque** | `next/font/google` | Headlines, big numbers, card titles |
| Accent | **Instrument Serif** *italic* | `next/font/google` | One or two words in a headline |
| Body | **Figtree** | `next/font/google` | Paragraphs, UI text |
| Label | **Geist Mono** | `geist/font/mono` | Eyebrows, tags, code-like chips |
| Pixel | **Geist Pixel Square** | already on `<body>` | Section numbers, counters |

Poppins is retired in this system (it is the main reason the current site reads as generic).

### Scale

| Token (class) | Size | Weight | Tracking | Line height |
|---|---|---|---|---|
| Hero H1 `t-display` | `clamp(38px, 5.3vw, 80px)` | 600 | −0.035em | 0.98 |
| Section H2 `t-display` | `clamp(34px, 5.4vw, 76px)` | 600 | −0.035em | 0.98 |
| Statement `manifesto` | `clamp(30px, 5.2vw, 70px)` | 600 | −0.035em | 1.08 |
| Card title | 26–52 px | 600 | −0.035em | 0.98 |
| Lead `t-lead` | `clamp(16px, 1.55vw, 19px)` | 400 | 0 | 1.6 |
| Body | 15–16 px | 400 | 0 | 1.6 |
| Eyebrow `t-eyebrow` | 11 px | 500 | +0.16em, uppercase, mono | n/a |
| Pixel numbers `t-pixel` | 15 px (counters up to 128 px) | 400 | 0 | 1 |

### The italic accent rule

In any headline, **at most one phrase** is set in `t-serif` (Instrument Serif italic) and coloured `lilac-600`.
The serif is drawn 7 % larger (`font-size: 1.07em`) so its smaller x-height sits level with the sans.
Examples: *builders*, *on AWS.*, *grow.*, *Build something.*, *next step.*, *cloud journey?*

---

## 5. Layout and spacing

- Content width: **1240 px** max (`max-w-[1240px]`), gutter `clamp(20px, 5vw, 40px)`.
- Section rhythm: `py-24 sm:py-32` for normal sections. Pinned scenes are tall by design (see section 7).
- Eyebrow pattern on every section: pixel number, short rule, label (`01 — Our mission`, `02 — What you can build` ...).
- Radius: cards **28 px**, hero/CTA card **36 px**, pills and buttons **999 px**, small icon tiles **16 px**.
- Grid: events use a 12-column bento (7 + 5, then 5 + 7); everything else is a simple stack or two-column split.

### Surfaces

`.surface`: `rgba(255,255,255,.72)` fill, 1 px white border, `backdrop-filter: blur(18px) saturate(1.2)`, and a
two-layer violet shadow: `0 20px 50px -24px rgba(76,29,149,.28)` + `0 2px 6px -2px rgba(76,29,149,.08)`.
Shadows are always tinted violet, never grey.

---

## 6. Components

| Component | Notes |
|---|---|
| **Nav** (`DesignNav`) | Floating glass pill, 56/64 px tall. Logo sits on an ink tile so the purple chip glyph keeps contrast. Active link is lilac-100 with lilac-700 text (scroll-spy). Mobile: short name "AWS SBG", Join button, menu sheet. A 3 px gradient progress bar runs along the top of the screen. |
| **Primary button** | White text on a lilac-600 gradient, violet glow shadow, lifts 2 px on hover (hover devices only), presses to 97 %. Min height 48 px. |
| **Ghost button** | White 70 % glass, 1 px line, lifts on hover. |
| **Light button** | White with ink text, used on the dark CTA card. |
| **Cards** | `.surface` + a tint wash. `.lift` raises 6 px and deepens the shadow on hover. |
| **Tag chip** | Mono, uppercase, tiny coloured dot, white 80 % pill. |
| **Service chip** | Real AWS service icon from `public/assets`, name, and a mono caption. |
| **Pixel corner** | 3 × 3 grid of 10 px rounded squares in the card's own colour. The brand motif. |
| **Final CTA** | The only dark moment: `#2E1170 → #4A1D9E → #6428D4`, with Kio peeking over the top edge. |

---

## 7. Scroll choreography

Everything scroll-driven writes **one CSS variable** (`--t`, 0 to 1) on its section; CSS does the rest
(`app/preview/preview.css`). No React state changes while scrolling, so nothing re-renders. This is what keeps
the pinned scenes smooth.

| # | Scene | Height | What scrolling does |
|---|---|---|---|
| 1 | **Hero** | 230 svh, pinned | The headline arrives on load (time). Scrolling **builds the cloud**: ~190 squares fall in bottom-up (the base is already landing when the page opens), service chips float in, stats appear, then the copy gently exits. Kio arrives on load and drifts up slightly. |
| 2 | **Mission** | 260 svh, pinned | The statement **lights up word by word**, from pale lilac to ink. Accent words light to lilac. The four values fade in at the end. |
| 3 | **Build rail** | viewport + track width, pinned | Vertical scroll drives a **horizontal track** of six cards. The section is exactly as tall as the distance the track must travel, so one scrolled pixel moves the cards one pixel (it feels like dragging, not like an animation). A counter and progress bar follow. |
| 4 | **Why join** | normal flow | A sticky heading and a big pixel counter on the left; five reasons scroll past on the right. The one in the middle of the screen is lit, the rest recede to 40 %. |
| 5 | **Events** | normal flow | Cards fade up with a 90 ms stagger the first time they are seen. |
| 6 | **Learning Hub** | normal flow | Two rows of topics **slide in opposite directions**, linked to scroll position. |
| 7 | **Stats** | normal flow | Numbers count up the first time they are seen (1.4 s, ease-out). |
| 8 | **Final CTA** | normal flow | Card reveals; Kio peeks over its edge. |

### Motion tokens

| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | Entrances, hovers (snappy, settles softly) |
| `--ease-soft` | `cubic-bezier(0.32, 0.72, 0, 1)` | Drawers, cues |
| Entrance | 800–900 ms, rises 26–28 px, 6 px blur to 0 on the hero | |
| Hover | 220–400 ms | |
| Float (Kio, chips) | 6–7 s, ±9 px | Slow and quiet |

Only `transform`, `opacity` and `filter` are animated. Never layout properties.

---

## 8. Accessibility

- **Contrast:** every text pairing meets AA (section 2.4). Orange is never text.
- **Reduced motion:** `--t` is forced to 1, so every scene shows its finished state; the cloud is built, all words are lit, the
  horizontal rail becomes a normal swipeable row, and floating, drifting and counting stop.
- **Without JavaScript:** reveal and intro animations fall back to visible (`@media (scripting: none)`).
- **Keyboard:** skip link, visible 2 px lilac focus ring on every control, `aria-current` on the active nav item,
  Escape closes the mobile menu.
- **Semantics:** one `<h1>`, ordered section headings, decorative layers are `aria-hidden`, stats use a `<dl>`,
  the animated marquee exposes its list once (the duplicate row is hidden from assistive tech).
- **Touch targets:** buttons are at least 42–48 px tall.

---

## 9. Responsive behaviour

| Width | Behaviour |
|---|---|
| ≥ 1024 | Hero is two columns (copy, then stage). Nav shows all links. Why-join counter is shown and sticky. |
| 640–1023 | Hero stacks; stats row shows. |
| < 640 | Hero shows headline and buttons only (the paragraph is dropped so the stage fits the first screen); nav shows the short name and a menu button; rail cards are 80 vw. |

Checked at 1440 × 900 and 390 × 844: no horizontal overflow, no console errors.

---

## 10. Performance

- Scrolling does **no React renders**. One `requestAnimationFrame`-throttled handler writes CSS variables for the
  background; each scene uses framer-motion's `useScroll` to write one variable.
- The cloud is ~190 plain `<span>`s positioned with CSS grid and moved by `calc()` on one inherited variable.
- Large blobs are plain radial gradients (no CSS `blur()` filter), promoted with `will-change: transform`.
- Fonts are self-hosted by `next/font` with `display: swap`; Kio and the logo are small transparent WebP/PNG.
- The preview adds no JavaScript library: it uses `framer-motion` and `lucide-react`, which the site already ships.

---

## 11. Adopting this on the live site

Everything is namespaced, so adoption is deliberate and reversible.

**Already in the repo (harmless to the current dark pages):**
`tailwind.config.ts` (`sbg` colours, `lt-*` fonts), `lib/design/*`, `components/design/*`, `app/preview/*`,
`lib/layout/standalone-pages.ts` (lets `/preview` draw its own nav).

**To adopt, in order:**

1. **Fonts and tokens.** Move the `next/font` setup from `app/preview/layout.tsx` into `app/layout.tsx`; move the
   `:root` tokens and the `.sbg-light` rules from `preview.css` into `globals.css`; flip `body` to `bg-sbg-paper text-sbg-ink`.
2. **Chrome.** Replace `components/layout/Navbar.tsx` and `Footer.tsx` with `DesignNav` and `DesignFooter`
   (point the links at the real routes: `/`, `/about`, `/events`, `/team`, `/learning-hub`, `/gallery`).
3. **Home page.** Replace the home sections in `app/page.tsx` with the preview's, wiring live data into Events
   (`/api/events`) and the Stats counters.
4. **Inner pages**, one at a time, in this order (most visited first): Events, Team, Learning Hub, Gallery, About, Register, Verify.
   Each one gets a `data-tone` per section and the shared surfaces and buttons.
5. **Admin stays as it is.** It is a dense data tool used by a few people; it keeps the dark theme and `native-scroll` behaviour.
6. **Toaster and chatbot.** Switch `Toaster theme` to `light` and restyle `ChatbotMascot` (it is dark-only today).

**Certificate PDFs and e-mails are not affected**: they use their own templates.

---

## 12. Do and don't

| Do | Don't |
|---|---|
| Use the italic serif for one phrase per heading | Use it for whole sentences or body text |
| Tint shadows violet | Use grey or black drop shadows |
| Keep every tone light | Add a dark page tone (the CTA card is the only dark surface) |
| Use orange as a few pixels | Use orange for text, buttons or backgrounds on light |
| Let scroll reveal content that is already in the DOM | Hide the headline or CTA behind a scroll trigger |
| Write animations as one `--t` variable plus CSS | Add scroll listeners that set React state |
| Reuse real AWS service icons and Kio | Use stock illustrations or random gradient art |
