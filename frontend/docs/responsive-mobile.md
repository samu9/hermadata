# Responsive / mobile adaptation

Tracking doc for making the HermaData frontend responsive down to ~375px **without changing the desktop (≥1024px / `lg`) layout**.

## Ground rules

- Build mobile-up: add `sm:`/`md:`/`lg:` overrides **on top of** existing classes. Never delete a desktop class — if a value was unconditional, re-assert it at `lg:`.
- The desktop sidebar shell activates at `lg` (1024px). Below `lg` = mobile/tablet treatment.
- Target min width: **375px** (iPhone SE / standard phones). 320px is best-effort, not required.
- Tables: **horizontal scroll** for now (stacked-card view is a possible future improvement).
- Scope: **whole app**.

## Breakpoints (Tailwind defaults)

`sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280

---

## Phases

| Phase | Description | Status |
|---|---|---|
| 0 | Foundations: viewport meta, `useMediaQuery` hook, overflow guard | ✅ done |
| 1 | App shell + navigation: sidebar → drawer, mobile top bar | ✅ done |
| 2 | Tables → horizontal scroll | ✅ done |
| 3 | Overlays, popovers & dialogs → responsive widths | ✅ done |
| 4 | FAB toolbar (icon-only on mobile) | ✅ done |
| 5 | Animal profile (header polaroid, tab bar) | ⬜ todo |
| 6 | Forms (single-column fallback, full-width inputs) | ⬜ todo |
| 7 | Remaining pages sweep | ⬜ todo |
| 8 | Verification (manual @ 375/768/1280, vitest) | ⬜ todo |

---

## Phase 0 — Foundations ✅

- **Viewport meta**: already present in `index.html` (`width=device-width, initial-scale=1.0`). No change needed.
- **`src/hooks/useMediaQuery.ts`**: SSR-safe hook + `useIsMobile()` helper (`< lg`, i.e. `< 1024px`). Used by JS-driven responsive behavior (drawer, dialog full-screen, FAB collapse).
- **Overflow guard**: added `min-w-0` to the main content flex column in `App.tsx` so inner scroll regions (tables) can scroll instead of stretching the whole layout.

## Phase 1 — App shell + navigation ✅

Files: `App.tsx`, `components/layout/SideMenu.tsx`, `components/Nav.tsx`.

- **`SideMenu`**: now a slide-in drawer below `lg` (`fixed inset-y-0 left-0 z-40 -translate-x-full`, slides to `translate-x-0` when open). At `lg` it reverts to the original always-visible in-flow sidebar (`lg:static lg:translate-x-0 lg:z-20`). New optional props `isOpen` / `onClose` (default closed) so existing standalone tests keep passing. Added a mobile-only close (×) button in the header.
- **`Nav`** (was dead daisyUI leftover): repurposed as the mobile top bar (`lg:hidden`) — hamburger button + logo + "Hermadata". Hamburger opens the drawer.
- **`App`**: manages `drawerOpen` state; renders a tap-to-close backdrop (`lg:hidden`) and the `Nav` top bar above the outlet. Drawer auto-closes on route change (`useLocation`). Desktop markup path is unchanged (Nav + backdrop are `lg:hidden`, SideMenu is `lg:static`).

### Desktop regression check
At ≥1024px: backdrop hidden, Nav hidden, SideMenu static/in-flow at `w-72` — identical to before.

## Phase 2 — Tables → horizontal scroll ✅

Approach: PrimeReact's official horizontal-scroll pattern — add `scrollable` +
`tableStyle={{ minWidth: "<N>rem" }}` to each `DataTable`. The table body keeps
its natural min width and scrolls inside the DataTable's own wrapper (paginator
stays fixed, header sticky). On desktop the container is wider than `minWidth`,
so the table renders at 100% — visually identical to before.

`min-w-0` on the App content column (Phase 0) ensures the table region can
actually overflow-scroll instead of stretching the page.

| Table | File | minWidth |
|---|---|---|
| Animal list | `components/animal/AnimalList.tsx` | 60rem |
| Adopter list | `components/adopter/AdopterList.tsx` | 48rem |
| Vet list | `components/vet/VetList.tsx` | 40rem |
| Dashboard recent | `pages/HomePage.tsx` | 44rem |
| Animal entries | `components/animal/AnimalEntriesList.tsx` | 64rem |
| Animal docs | `components/animal/AnimalDocs.tsx` | 22rem |
| User list | `components/user/UserList.tsx` | 64rem |
| User activities | `components/user/UserActivities.tsx` | 48rem |

Also: AnimalList "Stampa" button → full-width on mobile (`w-full sm:w-auto`)
so it doesn't sit awkwardly when the filter toolbar wraps.

Note: 2 pre-existing failures in `HomePage.test.tsx` ("Date Importanti") are
unrelated — they fail identically on the original code (verified via stash).

## Phase 3 — Overlays, popovers & dialogs ✅

**Overlay panels** (anchored popovers) had fixed inner widths that overflow a
375px screen. Changed fixed `w-[Nrem]` → `w-[90vw] max-w-[Nrem]` so they shrink
on mobile but keep the same width on desktop (90vw ≫ Nrem there):
- `OverlayFormButton` (25rem), `ControlledBreedsDropdown` /
  `ControlledDocKindsDropdown` / `ControlledFurColorDropdown` / `NewEntry`
  (20rem each).
- `NewItemButton` / `NewAdopterButton` / `NewVetButton` wrapped their form in
  an unconstrained `div` → added `max-w-[90vw]` so the panel can't exceed the
  viewport (desktop natural width unchanged).

**Dialogs** with fixed px / narrow vw widths got PrimeReact `breakpoints` (only
affects viewports ≤ the listed width; desktop uses `style.width` unchanged):
- `AnimalRecord` move-to-shelter + confirm-adoption (400px) → `640px: 95vw`
- `UserList` edit user (500px) → `640px: 95vw`
- `AnimalGallery` delete-confirm (360px) → `640px: 90vw`
- `AnimalAdoptionPage` no-results (50vw — too narrow on phones) →
  `960px: 85vw, 640px: 95vw`

**Already responsive, left as-is:** `AnimalExitForm` (`w-full max-w-4xl`),
`AnimalEvents` (`w-full max-w-md`), `UpdateAnimalEntryDialog` /
`AnimalImageUploadDialog` / `AnimalGallery` image dialog (all `90vw` + maxWidth).

## Phase 4 — FAB toolbar ✅

The floating `Toolbar` could stack 3–4 *labeled* pill buttons (delete + exit +
move + new-entry on an animal profile), overflowing a 375px row.

- `Toolbar` + `OverlayFormButton`: buttons become **icon-only 48px circles**
  below `sm` (`!w-12 !h-12 !p-0`), restoring the labeled pill from `sm` up
  (`sm:!w-auto sm:!px-6 sm:!py-3`). Label hidden via `hidden sm:inline`, with
  `aria-label` kept for a11y. Container moved to `bottom-4 right-4` on mobile
  (`sm:bottom-8 sm:right-8` = desktop unchanged) and `flex-wrap` as a safety net.
- Standalone list FABs (`NewItemButton`, `NewAdopterButton`) keep their label
  (single pill fits 375px) but reposition to `bottom-4 right-4 sm:bottom-8
  sm:right-8`.
- `PageWrapper`: extra bottom padding on mobile (`pb-24 md:pb-8`) so FABs don't
  cover the last row of content. Desktop (`md+`) padding unchanged.

### Test-env note
`layout.test.tsx` fails with "document is not defined" when run **in isolation**
(jsdom doesn't init for a lone file) — this is pre-existing and unrelated; it
passes when the suite runs batched. Always run `vitest` over a directory, not a
single component test file. Baseline: 2 failed / 75 passed (the 2 are the
pre-existing HomePage "Date Importanti" failures).
