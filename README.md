# Guest Portal — Nineteen Milano

Static guest guide (IT/EN). **Phase 1 live.**

## Live site

**https://nineteen-milano.github.io/**

Repo: https://github.com/nineteen-milano/nineteen-milano.github.io

## What's on the site

| Section | Source file |
|---|---|
| Check-in / checkout | `public/js/content.js` |
| WiFi (+ copy button) | `content.js` → `GUEST_WIFI` |
| Apartment guide | `public/js/guide-sections.js` |
| Parking | `content.js` |
| Milan (10 places, horizontal scroll) | `guide-sections.js` + `images/milan/` |
| Transport, useful contacts | `guide-sections.js` |
| Contact host | `content.js` |

**Hidden for now:** house photo gallery — set `showHouseGallery: true` in `content.js` → `GUEST_FEATURES`.

**Not on site:** door access code (Airbnb private messages only).

## Content source of truth

- Runtime copy: `public/js/content.js` + `public/js/guide-sections.js`
- Reference doc (English): `Nineteen_Milano_Website_Content.md`
- Obsidian: `03 - Progetti/Airbnb/Guest Portal.md`

## WiFi (current)

- SSID: `TIM-31857969`
- Password: `cfsYfYtFWdfjBdnfME57`

## Images

| Path | Use |
|---|---|
| `public/images/hero-banner.jpg` | Hero (Milan tram + Arco della Pace) |
| `public/images/house/*.avif` | House gallery (disabled) — 480×640 Airbnb thumbs |
| `public/images/milan/*.jpg` | Milan section cards |

## Preview locally

```bash
cd public
python3 -m http.server 8787
```

Open http://localhost:8787

## Deploy

Requires GitHub org **`nineteen-milano`** (already created).

```bash
./deploy.sh
```

Updates `public/` → force-push to org repo → GitHub Pages rebuild (~1–2 min).

**Deprecated URL:** https://alessandrodiaz1000.github.io/nineteen-milano-guest/

## Phase 2 (planned)

- `/s/[token]` per-booking links
- Check-in time form → Notion
- Optional: Cloudflare Pages + Functions on same project (`wrangler.toml` exists)

## Security model (Phase 1)

- Public static site, `noindex`
- WiFi visible to anyone with the link
- Door code deliberately excluded
- Org repo is public — credentials visible in source
