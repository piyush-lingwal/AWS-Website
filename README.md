<a name="readme-top"></a>
<div align="center">

<img src="./.github/assets/banner.svg" alt="AWS Student Builder Group — Tulas University, Dehradun" width="100%" />

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-11-EF008F?logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![License](https://img.shields.io/badge/License-Unlicensed-lightgrey)](#-license)

**A community of student builders learning cloud, AI, and software through hands-on projects, workshops, and mentorship.**

</div>

---

## 📌 Table of Contents

- [About](#-about)
- [Pages](#-pages)
- [Tech Stack](#-tech-stack)
- [Design System](#-design-system)
- [Project Structure](#-project-structure)
- [Accessibility and Performance](#-accessibility-and-performance)
- [Contributing](#-contributing)
- [License](#-license)

## 🌐 About

This is the marketing and community site for **AWS SBG** — built to showcase what the group does, spotlight the team, list events, and give members a hub for AWS learning resources. It's a Next.js 15 App Router project styled with a dark, purple-accented "cloud/infrastructure" aesthetic instead of a generic SaaS template look — the node-network graphic above is the same signature visual used in the site's actual Hero section.

## ✨ Pages

| Route | Page | Description |
|---|---|---|
| `/` | Home | Hero + scroll-reveal tagline |
| `/about` | About | What the group is, mission, how it works |
| `/events` | Events | Upcoming and past workshops, hackathons, build days |
| `/team` | Team | Core team, organisers, and mentors |
| `/learning-hub` | Learning Hub | AWS certifications, Skill Builder links, starter kits |
| `/gallery` | Gallery | Photos from past events |
| `/demo` | Demo | Standalone shader/animation experiment (Celestial Bloom) |

## 🛠️ Tech Stack

<table>
<tr>
<td valign="top" width="33%">

**Core**
- Next.js 15 (App Router)
- React 19
- TypeScript

</td>
<td valign="top" width="33%">

**Styling & Motion**
- Tailwind CSS + `shadcn/ui`
- Framer Motion
- `lightswind` (Scroll Reveal, Team Carousel)

</td>
<td valign="top" width="33%">

**Visuals & Icons**
- `three` / `ogl` (shader & 3D)
- Lucide React
- Tabler Icons

</td>
</tr>
</table>

## 🎨 Design System

A dark, purple-forward palette meant to read as "cloud infrastructure," not another startup landing page. All tokens live in `tailwind.config.ts` — never hardcode a hex value in a component.

| Token | Swatch | | Token | Swatch |
|---|---|---|---|---|
| `primary` | ![7C3AED](https://img.shields.io/badge/7C3AED-%20-7C3AED?style=flat-square) | | `bg` | ![09090B](https://img.shields.io/badge/09090B-%20-09090B?style=flat-square) |
| `primary-hover` | ![6D28D9](https://img.shields.io/badge/6D28D9-%20-6D28D9?style=flat-square) | | `bg-surface` | ![111827](https://img.shields.io/badge/111827-%20-111827?style=flat-square) |
| `primary-light` | ![A78BFA](https://img.shields.io/badge/A78BFA-%20-A78BFA?style=flat-square) | | `bg-elevated` | ![1F2937](https://img.shields.io/badge/1F2937-%20-1F2937?style=flat-square) |
| `primary-soft` | ![EDE9FE](https://img.shields.io/badge/EDE9FE-%20-EDE9FE?style=flat-square) | | `bg-card` | ![18181B](https://img.shields.io/badge/18181B-%20-18181B?style=flat-square) |
| `accent` | ![C084FC](https://img.shields.io/badge/C084FC-%20-C084FC?style=flat-square) | | `border` | ![27272A](https://img.shields.io/badge/27272A-%20-27272A?style=flat-square) |
| `secondary` | ![8B5CF6](https://img.shields.io/badge/8B5CF6-%20-8B5CF6?style=flat-square) | | `muted` | ![71717A](https://img.shields.io/badge/71717A-%20-71717A?style=flat-square) |

- **Display font:** Space Grotesk (`font-display`) — headings
- **Body font:** Poppins (`font-body`) — everything else
- **Max content width:** `1280px` via the `max-w-content` utility

## 📁 Project Structure

<details>
<summary><strong>Click to expand full folder tree</strong></summary>

```
app/
├── layout.tsx          # Root layout — fonts, SEO metadata, Navbar/Footer shell
├── page.tsx              # Home (Hero + ScrollRevealSection)
├── globals.css            # Design tokens, base styles, reduced-motion handling
├── about/page.tsx
├── events/page.tsx
├── team/page.tsx
├── learning-hub/page.tsx
├── gallery/page.tsx
└── demo/page.tsx           # Shader experiment

components/
├── layout/
│   ├── Navbar.tsx          # Responsive nav (desktop + mobile menu)
│   └── Footer.tsx
├── sections/
│   ├── Hero.tsx             # Signature floating node-network visual
│   ├── About.tsx
│   ├── Events.tsx
│   ├── Team.tsx
│   ├── Gallery.tsx
│   ├── LearningHub.tsx
│   ├── Statistics.tsx
│   ├── TrustedBy.tsx
│   └── ScrollRevealSection.tsx
├── lightswind/
│   └── scroll-reveal.tsx    # Lightswind ScrollReveal integration
└── ui/
    ├── Button.tsx
    ├── resizable-navbar.tsx
    ├── ProfileCard.tsx/.css
    ├── LightRays.jsx/.css
    ├── celestial-bloom-shader.tsx
    └── flip-text.tsx

lib/
└── utils.ts                # cn() class-merge helper

public/
├── logos/                   # AWS, SBG, Tula's Institute logos
└── Members/                  # Team member photos
```


## ♿ Accessibility and Performance

- Visible focus rings (`:focus-visible`) throughout
- `prefers-reduced-motion` respected globally in `globals.css`
- Semantic `<nav>` / `<section>` structure with `aria-label` / `aria-expanded` on the mobile menu toggle
- Per-page SEO metadata (title templates, Open Graph, Twitter cards) via the Next.js Metadata API

## 🤝 Contributing

This project is maintained by the AWS Student Builder Group core team at Tula's University. Issues and pull requests from members are welcome — please keep new sections self-contained (one component per section) and follow the existing token-based styling approach rather than hardcoded values.

## 📄 License

This project currently has no explicit license. Contact the maintainer before reusing code outside the AWS SBG community.

---

<div align="center">

Built with ☕ and Next.js by the **AWS Student Builder Group**, Tula's University, Dehradun.

[⬆ Back to top](#readme-top)

</div>
