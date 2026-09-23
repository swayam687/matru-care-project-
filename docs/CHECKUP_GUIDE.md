# Maatru Care — Checkup & Vaccination Reference

Everything the portal schedules is derived from **two dates only**:
the mother's **LMP** and each child's **date of birth**. Change either
date and every due date recalculates.

---

## 1. Mother — Tetanus-diphtheria (Td)

| Dose | When | Portal due date | Notes |
|---|---|---|---|
| Td-1 | Early pregnancy | LMP + 14 days | Give at first ANC contact |
| Td-2 | 4 weeks after Td-1 | LMP + 42 days | Minimum gap 4 weeks |
| **Td Booster** | If 2nd child born within **6 years** of previous delivery | LMP + 196 days | Auto-flagged by the portal |

**Booster rule:** if `today − previousDelivery < 6 years (2190 days)`,
the booster item is injected into the schedule automatically.
No manual toggle needed.

---

## 2. Mother — ANC checkups

| Visit | Window | Portal due | What to do |
|---|---|---|---|
| ANC-1 | Before 12 weeks | LMP + 84 d | Register, history, BP, weight, IFA + calcium start, all baseline labs |
| ANC-2 | 14–20 weeks | LMP + 140 d | BP, weight, Hb, USG-2, Td-2 if not given |
| ANC-3 | 28–32 weeks | LMP + 196 d | BP, weight, Hb, GDM screen, USG-3, birth-plan discussion |
| ANC-4 | 36 weeks → delivery | LMP + 252 d | BP, weight, foetal position, danger-sign counselling |

**Every visit:** BP, weight, pulse, fundal height, foetal heart rate.

---

## 3. Mother — lab tests

| Test | Portal ID | Due (LMP +) | Notes |
|---|---|---|---|
| Haemoglobin / CBC | `hb` | 84 d | Anaemia screen |
| Blood group & Rh | `bg` | 84 d | Anti-D if Rh-negative |
| HIV | `hiv` | 84 d | With consent + counselling |
| VDRL | `vdrl` | 84 d | Syphilis screen |
| HBsAg | `hbsag` | 84 d | Hepatitis B |
| Urine routine | `urine` | 84 d | Protein / sugar |
| TSH | `tsh` | 84 d | Thyroid |
| Blood sugar / GDM | `sugar` | 168 d | 24–28 weeks |
| USG-1 | `usg1` | 84 d | Dating / NT, 11–13 w |
| USG-2 | `usg2` | 133 d | Anomaly scan, 18–20 w |
| USG-3 | `usg3` | 224 d | Growth scan, 28–32 w |

---

## 4. Child — immunisation schedule

| Age | Vaccines | Portal keys |
|---|---|---|
| Birth | BCG, OPV-0, Hep B-0 | `bcg`, `opv0`, `hepb0` |
| 6 weeks | Pentavalent-1, OPV-1, Rotavirus-1, PCV-1, IPV-1 | `penta1`, `opv1`, `rota1`, `pcv1`, `ipv1` |
| 10 weeks | Pentavalent-2, OPV-2, Rotavirus-2 | `penta2`, `opv2`, `rota2` |
| 14 weeks | Pentavalent-3, OPV-3, Rotavirus-3, PCV-2, IPV-2 | `penta3`, `opv3`, `rota3`, `pcv2`, `ipv2` |
| 9 months | MR-1, JE-1, PCV Booster, Vitamin A (1st) | `mr1`, `je1`, `pcvb`, `vita1` |
| 16–24 months | MR-2, JE-2, DPT Booster-1, OPV Booster, Vitamin A (2nd) | `mr2`, `je2`, `dptb1`, `opvb`, `vita2` |
| 5–6 years | DPT Booster-2, Vitamin A (3rd) | `dptb2`, `vita3` |

Portal item IDs are `c{childId}_{key}`, e.g. `c1_bcg`.

---

## 5. BP thresholds used by the portal

| Reading | Portal behaviour |
|---|---|
| < 140 / 90 | Normal — no alert |
| ≥ 140 / 90 | Red banner, red pill, high-risk flag on the dashboard |
| ≥ 160 / 110 | **Severe** — refer immediately (clinical judgement) |

The BP chart plots the last 10 readings with a shaded zone above 140/90.

---

## 6. Editing the schedules

All schedules live in `assets/js/config.js`:

- `MC.MOM_DEFS` — Td doses
- `MC.ANC_DEFS` — ANC visits
- `MC.TEST_DEFS` — lab tests
- `MC.CHILD_SCHEDULE` — child immunisation
- `MC.BOOSTER_WINDOW_DAYS` — booster window (default `6 * 365`)

Each entry uses `at` (mother) or `age` (child) as **days offset**. Add an
entry and it appears everywhere — dashboard counts, progress %, tabs —
with no other code change.