# Design Sync Notes — MyEnglishBro

## Repo context
- Full Vite React app (not a published library) — synth-entry mode (no dist/)
- shadcn/ui components in `src/components/ui/` (48 components)
- Custom landing sections in `src/components/landing/meb/` (11 components)
- Design system: navy primary (`hsl(207 79% 28%)`), teal secondary (`hsl(180 68% 39%)`), amber accent
- Fonts: Inter (body) + Poppins (display) — loaded via Google Fonts at runtime, NOT shipped in bundle

## CSS / styling
- `cssEntry: "src/index.css"` ships the CSS custom properties (design tokens) but NOT compiled Tailwind utilities
- Components use Tailwind utility classes — for authored previews, need compiled Tailwind CSS
- To generate full Tailwind CSS for authored previews: `npx tailwindcss -i src/index.css -o ds-tailwind.css` and update cssEntry
- For floor cards (current mode), this is fine — floor cards are typographic placeholders

## Synth-entry mode
- No `dist/` in this app repo — converter synthesizes from `src/components/ui/`
- `.d.ts` contracts weaker than published-library mode
- `tsconfig.app.json` has `@/* → ./src/*` path alias — passed via `--tsconfig` flag

## Fonts
- `runtimeFontPrefixes: ["Inter", "Poppins"]` suppresses FONT_MISSING warnings
- Fonts loaded from Google Fonts CDN at runtime — no woff2 to ship

## Known issues to watch on re-sync
- If landing components import from `@/assets/*`, the asset paths may not resolve in bundle (images) — use `componentSrcMap: { "ComponentName": null }` to exclude if it causes build errors
- `instructor-photo.png` imported in AboutMEB — this is a static asset import; esbuild may inline it as base64 or skip it

## Re-sync risks
- Landing components (MEB* series) are tightly coupled to the app's routing, contexts, and assets — they may fail to render in isolation
- Floor cards are the safe baseline for these; rich previews for landing components require provider setup
- CSS variables in index.css depend on the `.light` class being present — previews should include `<html class="light">` in their wrapper

## Supabase projects
- **acelingua.com (Lumia):** `zjobnxbzdtqsgbfdxzqo` — base de datos original, NO tocar
- **myenglishbro (nuevo):** `dykagdlfhlfhlcqhmvqn` — base de datos separada, creada 2026-06-26
- Schema migrado completo: 26 tablas, 3 enums, 20+ funciones, triggers, RLS

## First sync details
- Date: 2026-06-25
- Mode: floor cards (no render check, no authored previews)
- Total components targeted: 59 (48 UI + 11 landing)
- Playwright: NOT installed — render verification skipped
