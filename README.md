# Maatru Care

ASHA worker visit & maternal health tracking portal.

Two roles share one live record:

- **ASHA worker** — full editing: ticks vaccines, records test results,
  logs BP and home visits.
- **Pregnant woman / family** — read-only view of her own record, reached
  with a **Patient ID + last 4 digits of her registered mobile number**.

No build step, no dependencies, no backend. Everything runs in the browser
and persists to `localStorage`.

---

## Run it

**Option 1 — open directly**

```
open index.html
```

Works from `file://` because the scripts are classic (non-module) scripts.

**Option 2 — local server (recommended)**

```bash
python3 -m http.server 8080
# or
npx serve .
```

Then visit `http://localhost:8080`.

---

## Demo credentials

**ASHA worker**

| Worker ID | PIN |
|---|---|
| `ASHA-001` | `1234` |

**Patients**

| Name | Patient ID | Mobile (last 4) |
|---|---|---|
| Sunita Devi | `MC-RMP-0001` | `1111` |
| Rekha Kumari | `MC-RMP-0002` | `2222` |
| Priya Yadav | `MC-RMP-0003` | `3333` |
| Anita Sharma | `MC-RMP-0004` | `4444` |

> Remove the `demoBox()` call in `assets/js/views.auth.js` before any
> real deployment.

---

## Project layout

```
maatru-care/
├── index.html              app shell — loads CSS then JS in order
├── README.md
├── docs/
│   ├── CHECKUP_GUIDE.md    clinical reference (Td, ANC, tests, child schedule)
│   └── TESTING.md          manual test plan
└── assets/
    ├── css/
    │   ├── base.css        design tokens, reset, typography, utilities
    │   ├── layout.css      shell, topbar, grid, cards, auth split
    │   ├── components.css  buttons, fields, pills, items, tables, toasts
    │   └── auth.css        login screens
    └── js/
        ├── config.js       constants + all schedules (edit here)
        ├── utils.js        date & format helpers
        ├── schedule.js     item builders, status, progress maths
        ├── store.js        persistence, session, auth, lockout
        ├── seed.js         demo dataset
        ├── components.js   UI primitives + toast
        ├── charts.js       BP trend SVG
        ├── views.auth.js   login screens
        ├── views.asha.js   ASHA dashboard
        ├── views.detail.js patient record (shared, role-gated)
        └── app.js          router, events, session watchdog, boot
```

---

## Security model (client-side, honest limits)

This is a **front-end prototype**. Everything below is defence-in-depth
for a demo — **not** a substitute for server-side auth.

| Control | Implementation |
|---|---|
| Patient enumeration blocked | Login requires **Patient ID + last 4 digits of mobile**; no list is rendered |
| ID normalisation | Uppercase, whitespace/dashes stripped (`MC.util.normId`) |
| Brute-force lockout | 5 failed attempts per ID → 5-minute lockout (`store.attempts`) |
| Session storage | `sessionStorage` — clears when the tab closes |
| Session TTL | 30 min ASHA, 15 min woman; warning toast at 1 min remaining |
| Idle refresh | Every user interaction touches the session |
| Role enforcement | Every mutating action re-checks `session.role === 'asha'` — the read-only UI is a convenience, not the control |
| Password fields | PIN input is `type="password"` |
| XSS | All interpolated values pass through `MC.util.esc()` |

### Before a real deployment

1. Move authentication to a server. Patient IDs and PINs must never ship
   in client JavaScript.
2. Replace `localStorage` with an API. Add TLS, audit logging, and
   per-record authorisation.
3. Hash the mobile last-4 (or replace it with a real OTP).
4. Add a Content-Security-Policy header.
5. Strip `demoBox()` and the seed dataset.

---

## Extending

**Add a vaccine or test** — edit the arrays in `assets/js/config.js`.
Every count, progress bar, and tab picks it up automatically.

**Add a beneficiary** — append to the array returned by `MC.seed()` in
`assets/js/seed.js`, or push to `MC.store.db.women` and call
`MC.store.save()`.

**Add a new tab** — add an entry to `TABS` in `views.detail.js`, write a
`tabX()` function, and add a branch in the `panel()` router.

**Change the theme** — all colours are CSS custom properties at the top
of `assets/css/base.css`.

---

## Browser support

Chrome / Edge 90+, Firefox 88+, Safari 14+. Uses CSS custom properties,
`grid`, `backdrop-filter` (decorative only), and `sessionStorage`.