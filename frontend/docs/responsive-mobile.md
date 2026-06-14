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
| 2 | Tables → horizontal scroll | ⬜ todo |
| 3 | Overlays, popovers & dialogs → responsive widths | ⬜ todo |
| 4 | FAB toolbar (icon-only on mobile) | ⬜ todo |
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
