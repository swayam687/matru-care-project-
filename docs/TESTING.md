# Maatru Care — Manual Test Guide

## Setup

1. Put the folder on any static server (see `README.md`), or just open
   `index.html` directly in a modern browser.
2. Open DevTools → Application → Local Storage.
3. To reset all data, delete keys `mc_db_v2`, `mc_session_v2`, `mc_attempts_v2`
   and refresh. Or run `MC.store.reset()` in the console.

---

## A. Authentication

| # | Steps | Expected |
|---|---|---|
| A1 | Landing → "Pregnant woman / family" | Patient sign-in form appears, with Patient ID + 4-digit fields |
| A2 | Enter `MC-RMP-0001` and `1111` → submit | Signed in as Sunita Devi. **No list of other women is visible anywhere.** |
| A3 | Enter `MC-RMP-0001` and `9999` | Inline error: "Patient ID or mobile digits are incorrect." No hint about which field is wrong. |
| A4 | Enter `mc rmp 0001` (lowercase, spaces) and `1111` | Succeeds — the ID is normalised |
| A5 | Submit a wrong code 5 times for the same ID | 6th attempt shows "Too many failed attempts. Try again in 5 minute(s)." |
| A6 | Landing → "ASHA worker" → `ASHA-001` / `1234` | ASHA dashboard loads |
| A7 | ASHA login with wrong PIN | Inline error, PIN field cleared and refocused |
| A8 | Sign in, then close the tab and reopen `index.html` | Signed out (sessionStorage cleared) |
| A9 | Sign in, leave idle for the TTL (15 min woman / 30 min ASHA) | Toast at 1 min remaining, then auto sign-out with "Session expired" |
| A10 | Click "Sign out" in the topbar | Returns to landing, toast confirms |

---

## B. ASHA dashboard

| # | Steps | Expected |
|---|---|---|
| B1 | Sign in as ASHA | 4 stat cards: beneficiaries, due in 14 d, overdue, high risk |
| B2 | Read the stat numbers | Match the sum of per-woman card badges |
| B3 | Inspect Sunita Devi's card | Shows high-risk (last BP 124/80 → not high; check Anita instead) |
| B4 | Inspect Anita Sharma | No high-risk badge; 1 child shown |
| B5 | Inspect Priya Yadav | "1 child" pill, booster flag on the mom tab |
| B6 | Confirm the red banner | Appears only when ≥ 1 overdue item exists |

---

## C. Ticking items (ASHA only)

| # | Steps | Expected |
|---|---|---|
| C1 | Open Rekha Kumari → Mom vaccines → tick Td-2 | Tick turns green, status → Done, dashboard % increases |
| C2 | Untick the same item | Reverts to Overdue / Due soon, % decreases |
| C3 | Reload the page | The tick state persists |
| C4 | Sign in as that woman | She sees the same tick, read-only (no click response) |
| C5 | Open Tests → click "Record" on Haemoglobin | Inline form expands with value + date + notes |
| C6 | Save `11.5 g/dL` | Row shows green pill, value chip `11.5 g/dL`, form closes |
| C7 | Reopen and click "Edit" | Form pre-filled with the saved values |
| C8 | Click "Cancel" | Form closes, no change saved |

---

## D. Td booster logic

| # | Steps | Expected |
|---|---|---|
| D1 | Open Priya Yadav → Mom vaccines | Amber banner: "Td booster applicable" with the previous delivery date |
| D2 | Check Td Booster row | Present, `BOOSTER` pill, due = LMP + 196 d |
| D3 | Open Sunita Devi → Mom vaccines | No booster row; grey note "No booster required" |
| D4 | In the console: `MC.store.db.women[2].previousDelivery = MC.util.daysAgo(2500); MC.store.save(); MC.app.render()` | Booster row disappears for Priya |
| D5 | Undo with `previousDelivery = MC.util.daysAgo(1825)` | Booster row returns |

---

## E. Child immunisation

| # | Steps | Expected |
|---|---|---|
| E1 | Open Anita Sharma → Children | Baby Sharma, 5 days old, 3/26 doses (birth doses) |
| E2 | Check pending list | Pentavalent-1 group at 6 weeks, marked "Upcoming" |
| E3 | Tick `Pentavalent-1` | Moves to the "completed doses" disclosure |
| E4 | Expand "Show completed doses" | Birth doses + the newly ticked one, with dates and "by Kavita Singh" |
| E5 | Open Priya Yadav → Children | Aarav, ~5 years old, all doses up to 480 d done, DPT Booster-2 upcoming |

---

## F. BP tracking

| # | Steps | Expected |
|---|---|---|
| F1 | Open any woman → BP & vitals | Chart with two lines, shaded band above 140/90 |
| F2 | Add `150 / 95`, pulse `88`, weight `60` | Reading saved, toast warns about the high range |
| F3 | Check the header | Latest BP chip turns red, red alert banner appears |
| F4 | Check the dashboard card | "High risk" pill appears on that woman's card |
| F5 | Add `118 / 76` | Banner clears (latest reading is normal), high-risk flag clears |
| F6 | Add a reading with a back-dated `date` | Table sorts correctly, chart plots in order |
| F7 | Add a reading with empty systolic | Toast: "Systolic and diastolic values are required." |

---

## G. Visits

| # | Steps | Expected |
|---|---|---|
| G1 | Open a woman → Visits | Existing notes listed newest-first |
| G2 | Log a visit | Appears at the top with today's date and the ASHA's name |
| G3 | Sign in as the woman → Visits | The note is visible; **no** logging form |

---

## H. Read-only enforcement (family view)

| # | Steps | Expected |
|---|---|---|
| H1 | Sign in as `MC-RMP-0001` / `1111` | Header shows the ASHA's name is *not* editable, ticks are static |
| H2 | Click any tick | Nothing happens |
| H3 | BP tab | No "Add a BP reading" card |
| H4 | Visits tab | No "Log a visit" form |
| H5 | Manually fire a toggle in the console: `document.querySelector('.tick').click()` | Toast: "Only an ASHA worker can update records." Nothing changes |

---

## I. Layout & accessibility

| # | Steps | Expected |
|---|---|---|
| I1 | Resize to 360 px wide | Login stacks, tabs scroll horizontally, tables scroll inside their wrapper |
| I2 | Tab through the login form | Visible focus rings, logical order |
| I3 | Tab to a tick | `aria-pressed` toggles, `aria-label` describes the item |
| I4 | Enable "Reduce motion" in OS settings | Transitions effectively disabled |
| I5 | Zoom to 200% | No content clipped or overlapping |

---

## J. Data integrity

| # | Steps | Expected |
|---|---|---|
| J1 | Make several edits, then `MC.store.db` in the console | All edits reflected in the stored object |
| J2 | Reload | Edits persist |
| J3 | Delete `mc_db_v2` and reload | Seed data restored (4 women, 1 ASHA) |
| J4 | Set `localStorage` to a corrupt string, reload | App reseeds instead of crashing |
| J5 | Run in a private/incognito window | Works; `save()` failures are swallowed silently |