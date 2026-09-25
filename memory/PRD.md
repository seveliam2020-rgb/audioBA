# PRD — Booklab Audio

## Original Problem Statement
"Create me an audiobook distribution website. I need to be modern looking site like the Auramax headphone website design. The name of the company is Booklab Authority but the site name will be Booklab Audio. Feature books that are audible. Pricing is $1.99 for first 3 months and $8.99 after. They can choose 1 book per month and the next one if they order another is $8.99."

User choices (confirmed via questions): dark premium & cinematic direction, no checkout (waitlist email capture only), curated catalog of 8–12 titles with generated cover art + ratings + narrator info, simple signup/login with a "my shelf" member area.

## Brand
- Company: Booklab Authority — site/brand: Booklab Audio
- Aesthetic: Auramax-style dark cinematic hardware aesthetic; titanium charcoal #0A0A0C, ember #FF5A1F, gold #FFB800; Syne display / Instrument Serif accents / Plus Jakarta Sans body / JetBrains Mono technical labels
- Original logo mark (amber waveform bars in a titanium tile) used in nav, footer, auth and as favicon.svg

## Architecture (as built 2026-09-25)
- Backend: FastAPI (0.0.0.0:8001, all routes under /api), MongoDB via MONGO_URL/DB_NAME
  - Auth: JWT access (15m) + refresh (7d) in httpOnly SameSite=None cookies; bcrypt hashing; brute-force lockout (5 fails / 15 min); admin seeding from env; forgot/reset-password endpoints
  - Collections: users (email unique idx), books (seeded 8 titles), shelf, waitlist, login_attempts, password_reset_tokens
  - Membership logic: 1 free credit per 30 days; first shelf add uses credit ($0), further adds priced $8.99; duplicate adds rejected 409
- Frontend: CRA React 19 + Tailwind + framer-motion + lenis smooth scroll + sonner toasts
  - Pages: HomePage (/), AuthPage (/auth), ShelfPage (/shelf, protected)
  - Signature moments: masked line-by-line hero reveal, canvas waveform visualizer (reacts to teaser playback), parallax hero image, slow editorial marquee, bento pricing grid, glow-border waitlist card

## Core Requirements → Status
- Modern Auramax-style dark site — DONE
- Company Booklab Authority / site Booklab Audio — DONE (nav, footer, auth, copy)
- Featured audible books — DONE (8 titles, covers, ratings, narrators, durations, genres, playable previews)
- Pricing $1.99 first 3 months then $8.99 — DONE (hero specs, pricing bento, waitlist, auth note)
- 1 book/month; extra books $8.99 — DONE (credit system enforced server-side + shown in shelf)
- Email waitlist capture — DONE (dedupe by email, live count, success state)
- Signup/login + My Shelf — DONE (player with speed control 0.8–2.0×, listening/saved tabs, remove, claim next book, credit badge, empty states)

## Verification (2026-09-25)
- curl: register → me → shelf add (credit $0) → shelf add ($8.99) → dup 409 → bad login 401 → waitlist → admin login → logout — all pass
- Screenshots (external preview host): desktop home 1440, mobile home 390 (overflow fixed), mobile catalog/pricing, auth page, UI register → shelf flow — all pass

## Backlog
P0 — none open
P1 — genre filter/sort in catalog (DONE 2026-09-25); server-side listening position sync (DONE 2026-09-25); book spotlight — horizontal 3D coverflow carousel (arrows, click-to-front, hover pop, auto-advance paused on hover, drag-to-flip with 1:1 tracking + flick momentum, arrow-key browsing) with front-cover info bar (DONE 2026-09-25, per user: horizontal alignment, not circular); wishlist (heart on covers, no credit spent, shelf tab, move-to-shelf) (DONE 2026-09-25); admin spotlight picks — /admin page, role-gated PATCH, /api/spotlight feeds carousel (DONE 2026-09-25)
P2 — copy refresh (DONE 2026-09-25, per user: positioning is audiobook distribution from authors globally, not a studio); hero rebuilt as Product-Behind-Text layering (DONE 2026-09-25, per user's Auramax reference: giant BOOKLAB wordmark behind a transparent-cutout headset, details pinned to bottom edges, wave strip intact); wordmark light-sweep shimmer on load + recurring glint (DONE 2026-09-25); "Audiobook distribution" pill relocated to bottom-center block above the tagline (DONE 2026-09-25); hero Preview button removed (DONE 2026-09-25); app presence — App Store / Google Play badges in hero + dedicated "The app" section (04) with phone mockup, features, badges; store links are placeholders that scroll to waitlist until real listings exist (DONE 2026-09-25); membership section redesigned as ONE clarity card — billing timeline (months 1–3 $1.99 → month 4+ $8.99 → 1 book included → +$8.99 extras), always-included checklist, "the whole story" summary box, 3 FAQs (DONE 2026-09-25, per user: fees/offering were confusing)
P2 — real Stripe checkout (user opted waitlist-only for now); password reset UI; richer shelf analytics
