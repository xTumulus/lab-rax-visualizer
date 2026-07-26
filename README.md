# Lab Rax Planner

A browser-based visualizer and parts-list planner for [Lab Rax](https://the-diy-life.com/introducing-lab-rax-a-3d-printable-modular-10-rack-system/),
a 3D-printable modular 10" rack system. Users pick a rack height (4U–12U),
color each part, lay out shelves, and see a real-time 3D model — built from
the actual Lab Rax STL/3MF part files — update in the viewport. The build
can be exported as a checkable parts list (CSV or XLSX) and shared via URL.

There is no backend, no database, no login, and no build-time secrets. It is
a fully static single-page app — all state lives in the browser
(`localStorage`) or is encoded into the page URL.

## Tech stack

| Concern            | Choice                                              |
|---------------------|------------------------------------------------------|
| Framework           | React 18 + TypeScript                                |
| Build tool          | Vite 5                                                |
| 3D rendering        | Three.js via `@react-three/fiber` + `@react-three/drei` |
| App state           | Zustand (with `persist` middleware → `localStorage`) |
| Styling             | Tailwind CSS                                          |
| Color picker widget | `react-colorful`                                      |
| Spreadsheet export  | `xlsx` (SheetJS)                                      |

No router, no server framework, no test runner is configured. `npm run build`
produces a static `dist/` folder deployable to any static host.

## How the app is organized

```
src/
  domain/            Pure logic — no React, no Three.js. Start here to understand the model.
    types.ts           Core types: PartType, PartStyle, Shelf, Toggles, BuildState
    constants.ts       Size range (4U–12U), part labels/quantities, pattern registry
    models.ts          Real-part config: STL/3MF filenames, measured mm offsets used to lay parts out
    defaults.ts        Factory for a fresh default BuildState
    shelves.ts         Shelf placement/gap-finding and resize-clamping logic
    parts-list.ts      buildPartsList() — turns BuildState into export-ready rows

  store/
    use-build-store.ts Zustand store: the single source of truth for the current build.
                       All mutations (resize, restyle, toggle, shelf edits) go through here.

  components/
    viewer/            The 3D scene
      scene.tsx          <Canvas>, lighting, camera framing (Bounds), OrbitControls, ground grid
      rack-real.tsx       Reads the store and positions every real STL/3MF part in millimetre-space
      parts/real-mesh.tsx             Renders one prepared part geometry with a flat colored material
      materials/use-model-geometry.ts Loads + bakes an .stl/.3mf file into scene-space geometry
    layout/            App chrome
      header.tsx         Branding, live size/part-count, Share/CSV/XLSX buttons
      sidebar.tsx        Scrollable left menu: size → per-part controls → shelves
      ad-panel.tsx       Unobtrusive support-link panel (bottom of sidebar)
    controls/          Sidebar form controls, one per concern
      size-control.tsx   4U–12U slider
      part-control.tsx   Reusable row: color swatch + visibility toggle (+ on/off toggle for optional parts)
      shelf-editor.tsx   Ordered shelf list with per-shelf type/color + add/remove
      colors-section.tsx Shared 6-swatch palette editor

  ui/                  Generic, store-agnostic input widgets (color-picker, palette-picker, visibility-toggle)

  export/              Parts-list export
    export-csv.ts      Plain CSV with a "☐" checkbox glyph column
    export-xlsx.ts     SheetJS workbook, same columns
    download.ts        Shared Blob-download helper

  share/url-state.ts   Encode/decode a BuildState to/from a base64url `?b=` query param

  app.tsx              Top-level grid layout: header / sidebar / viewport
  main.tsx             Entry point — hydrates from a share URL (if present) before mounting React
```

### Data flow, in one paragraph

`useBuildStore` (Zustand) holds a single `BuildState` object: rack height,
a `PartStyle` (color, plus a pattern/solid field reserved for a future
per-part pattern feature) per part type, on/off `toggles` for the optional
parts, and an array of `Shelf` objects. Every control in `Sidebar` reads
from and writes to this store. `rack-real.tsx` subscribes to the same store
and re-renders the Three.js scene from the loaded part geometry on every
change. `header.tsx` reads the same store to export or share the current
build.

### The geometry is real, not procedural

Parts are the actual Lab Rax STL/3MF files (`public/models-3d/`), loaded and
prepared once per file (`use-model-geometry.ts` bakes each part's native Z-up
axes into the scene's Y-up convention and re-centers its pivot to
bottom-center). `rack-real.tsx` positions instances of these prepared
geometries using constants measured directly from the models
(`src/domain/models.ts`) rather than nominal/idealized dimensions — rails,
panels, and shelves are mirrored/rotated/offset to snap together the same
way the physical parts do. Height changes are handled by greedily stacking
the fixed segment lengths that actually exist as files (`decomposeIntoSegments`),
e.g. 8U → a 5U + a 3U rail.

### Shelf placement

Each shelf is a fixed-size real part (its size follows `shelfType`, e.g.
always 2U for `plate-2u`) placed at a `startU` row from the bottom of the
rack. Shelves are independently positioned — gaps, and "no shelves at all,"
are both valid; nothing is forced to fill or stack contiguously.
`src/domain/shelves.ts` provides the supporting logic:

- `findFirstGap()` — scans from the top down for the first run of free rows
  a new shelf can occupy.
- `maxDownGrowth()` — how far a shelf (top row held fixed) can grow downward
  before it hits another shelf or the bottom of the rack; caps the shelf-type
  options offered in `ShelfEditor`.
- `clampShelvesToRack()` — called after every resize or load; drops shelves
  that no longer fit and backfills/repairs older persisted/shared shelf data.

### Persistence and sharing

- `useBuildStore` is wrapped in Zustand's `persist` middleware
  (`localStorage` key `lab-rax-build`), so a reload restores the last build
  automatically.
- The **Share** button (`src/share/url-state.ts`) serializes the current
  `BuildState` to compact JSON, base64url-encodes it, and puts it in a `?b=`
  query param, then copies the full URL to the clipboard.
- On load, `main.tsx` calls `hydrateFromShareParam()` *before* React mounts.
  If a `?b=` param is present and decodes successfully, it overrides
  whatever was in `localStorage` for that session, then strips the param
  from the URL (so a later plain reload falls back to the persisted build,
  not the shared one).
- `decodeBuild()` is defensive: it validates shape field-by-field and falls
  back to defaults for anything missing or malformed, so a hand-edited or
  truncated share link can't crash the app.

### Known simplifications / stretch work not yet built

- **Pattern/perforation styling** is modeled in `PartStyle`/`Shelf`
  (`pattern`, `solid`) and round-trips through persistence, share links, and
  the parts-list export, but there is currently no UI control to set it and
  no visual rendering of it — `RackReal` renders every part as a flat
  colored STL mesh. `part-control.tsx` has a short note on where the control
  used to live.
- **Per-instance part editing** ("click a single rail to recolor just that
  one") is *not* implemented. The store has a `selectedPartId` field and a
  `selectPart` action wired up, and `scene.tsx` clears the selection on an
  empty-space click, but no UI yet reacts to a selection.
- **XLSX checkboxes are not interactive.** The free/community build of
  SheetJS (`xlsx`) can't embed real form-control checkboxes, so both the CSV
  and XLSX exports use a `☐` text glyph in the "Done" column. If real
  tickable checkboxes are required, swap `export-xlsx.ts` to use `exceljs`
  instead.
- **Horizontal edge quantity is an estimate** (`src/domain/parts-list.ts`,
  `horizontalEdges` case) — it's a simple formula based on rack height, not
  a precise bill-of-materials count. Tighten this if exact print counts
  matter.
- Ad/support panel links (`ad-panel.tsx`) are placeholders pointing at the
  generic Buy Me a Coffee / Patreon homepages — replace with real account
  links before shipping.
- No automated tests exist yet (no test runner is configured).

## Local development

Prerequisites: Node.js 18+ (project was built/verified with Node 25 and npm
11, but anything ≥18 that supports Vite 5 will work).

```bash
# from the project root
npm install       # install dependencies
npm run dev       # start the Vite dev server (default: http://localhost:5173)
```

Other scripts:

```bash
npm run typecheck # tsc --noEmit — type-check without emitting files
npm run build     # tsc -b && vite build — production build into dist/
npm run preview   # serve the dist/ build locally, for a pre-deploy sanity check
```

There is no `.env` / environment configuration required — the app has no
backend calls of any kind.

## Deploying to a web server

The app builds to a fully static `dist/` folder (HTML/CSS/JS + the 3D model
files under `dist/models-3d/`). Any static file host works.

```bash
npm install
npm run build
```

This produces `dist/index.html`, `dist/assets/*.js`/`*.css`, and
`dist/models-3d/*.stl`/`*.3mf`. Copy the entire `dist/` directory to your
host.

A few things to know before deploying:

- **`base` is relative.** `vite.config.ts` sets `base: './'`, so the build's
  asset URLs are relative — it works whether the app is served from a
  domain root (`https://example.com/`) or a subpath
  (`https://example.com/rax-planner/`), with no config changes needed.
- **It's a single-page app with no client-side router**, so there's nothing
  special to configure for deep links — every route *is* `/`. You do not
  need SPA-fallback rewrite rules.
- **Cache the `assets/` folder aggressively.** Vite fingerprints filenames
  in `dist/assets/` (e.g. `index-C0mu_Dzn.js`), so those are safe to cache
  with a long `Cache-Control: max-age=31536000, immutable`. Do *not*
  aggressively cache `index.html` itself — set it to `no-cache` (or a short
  max-age) so users pick up new deploys.
- **Serve `models-3d/*.stl`/`*.3mf` as static assets** (they're plain files
  copied from `public/`, not bundled) — any static host does this by default.

### Example: Nginx

```nginx
server {
    listen 80;
    server_name your-domain.example;
    root /var/www/lab-rax-planner/dist;
    index index.html;

    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }
}
```

### Example: any static host (Netlify, Vercel, GitHub Pages, S3+CloudFront, Cloudflare Pages)

- **Build command:** `npm run build`
- **Publish/output directory:** `dist`
- **Environment variables:** none needed
- No redirect/rewrite rules are required since there's no client-side
  routing; the defaults on all of these platforms serve a static `dist/`
  folder correctly out of the box.

For GitHub Pages specifically, if serving from
`https://<user>.github.io/<repo>/` (a subpath), no change is needed beyond
the existing `base: './'` — this differs from many Vite templates that
require setting `base: '/<repo>/'`, because relative paths already resolve
correctly from any subpath.

## Where to make common changes

| I want to...                                   | Look at...                                             |
|-------------------------------------------------|---------------------------------------------------------|
| Change the size range                            | `src/domain/constants.ts` (`MIN_U`, `MAX_U`, `DEFAULT_U`) |
| Add/remove a part type                           | `src/domain/types.ts` (`PartType`), `constants.ts` (`PART_TYPES`, `PART_LABELS`, `BASE_QUANTITIES`), `rack-real.tsx` (geometry/placement), `defaults.ts` (default style) |
| Add a shelf type                                 | Add the STL/3MF to `public/models-3d/`, register it in `SHELF_TYPES` (`constants.ts`) and `SHELF_TYPE_FILES` (`models.ts`) |
| Change what's in the parts-list export           | `src/domain/parts-list.ts`                                |
| Change export file format/columns                | `src/export/export-csv.ts`, `src/export/export-xlsx.ts`    |
| Adjust camera framing / lighting / ground grid    | `src/components/viewer/scene.tsx`                        |
| Change how real parts are positioned/oriented    | `src/components/viewer/rack-real.tsx`, measured constants in `src/domain/models.ts` |
| Add per-part click-to-edit (the stretch feature) | Start from `selectedPartId` in `use-build-store.ts` and the `onPointerMissed` plumbing already in `scene.tsx` |
| Swap ad/support links                             | `src/components/layout/ad-panel.tsx`                      |
