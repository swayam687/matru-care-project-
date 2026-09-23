/* ============================================================
   views.detail.js — patient record
   ASHA: 9 tabs (incl. High risk)
   Woman: 5 grouped tabs (High risk hidden)
   + sticky sub-header + FAB
   ============================================================ */
(function (MC) {
  'use strict';

  const U = MC.util;
  const S = MC.schedule;
  const UI = MC.ui;
  const I = UI.ICON;
  const CH = MC.charts;
  const t = function (k) { return MC.i18n.t(k); };

  /* ASHA — unchanged, 9 tabs */
  const TABS_ASHA = [
    ['overview', 'tab.overview'],
    ['mom', 'tab.mom'],
    ['children', 'tab.children'],
    ['tests', 'tab.tests'],
    ['bp', 'tab.bp'],
    ['hrp', 'tab.hrp'],
    ['schemes', 'tab.schemes'],
    ['fp', 'tab.fp'],
    ['visits', 'tab.visits']
  ];

  /* Woman — grouped down from 8 → 5.
     [key, i18nKey, fallbackLabel]                            */
  const TABS_WOMAN = [
    ['overview', 'tab.overview', 'Overview'],
    ['baby', 'tab.myBaby', 'My Baby'],
    ['records', 'tab.myRecords', 'My Records'],
    ['care', 'tab.myCare', 'My Care'],
    ['visits', 'tab.visits', 'Visits']
  ];

  /* Legacy (pre-grouping) keys → new group keys.
     Lets deep-links from More → "Health Records hub" still work. */
  const WOMAN_TAB_MAP = {
    overview: 'overview',
    mom: 'baby',
    children: 'baby',
    tests: 'records',
    bp: 'records',
    hrp: 'overview',
    schemes: 'care',
    fp: 'care',
    visits: 'visits'
  };

  /* i18n key that may not exist yet → sensible fallback */
  function labelOf(key, fallback) {
    if (!key) return fallback || '';
    var v = t(key);
    return (!v || v === key) ? (fallback || key) : v;
  }

  /* ── subheader management ────────────────────────────────
     The subheader lives outside #app. We set it after render
     and clear it whenever #app no longer contains a detail
     marker. Self-contained; no app.js changes required.      */
  function ensureObserver() {
    if (!MC.subheader || MC.subheader._obs) return;
    var appEl = document.getElementById('app');
    if (!appEl) return;
    MC.subheader._obs = new MutationObserver(function () {
      var app = document.getElementById('app');
      if (!app) return;
      if (!app.querySelector('[data-detail-page]')) {
        MC.subheader.clear();
      }
    });
    MC.subheader._obs.observe(appEl, { childList: true, subtree: false });
  }

  function attachSubheader(w, hrp) {
    ensureObserver();
    if (!MC.subheader) return;
    requestAnimationFrame(function () {
      MC.subheader.show(w, { hrp: !!hrp, showBack: true });
    });
  }

  /* ── FAB — opens a quick BP entry sheet ────────────────
     Only rendered for ASHA (editable).                    */
  function renderFab(w) {
    return '<button class="fab" type="button" ' +
      'data-act="fab-bp" data-wid="' + U.esc(w.id) + '" ' +
      'aria-label="Record BP">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M12 5v14M5 12h14"/>' +
      '</svg>' +
      '</button>';
  }

  /* Delegated click handler for the FAB.
     Uses MC.sheet (defined in app.js). If MC.sheet is missing,
     silently no-ops so nothing breaks.                    */
  document.addEventListener('click', function (e) {
    var t0 = e.target.closest && e.target.closest('[data-act="fab-bp"]');
    if (!t0) return;
    if (!MC.sheet || !MC.sheet.open) return;

    var wid = t0.getAttribute('data-wid') || '';
    MC.sheet.open(
      '<h3 class="sheet__title">Record BP</h3>' +
      '<form data-act="addbp" data-wid="' + wid + '">' +
      '<div class="u-stack">' +
      '<label class="field">' +
      '<span class="field__label">Systolic (mmHg)</span>' +
      '<input class="input" type="number" inputmode="numeric" ' +
      'min="50" max="260" name="sys" required>' +
      '</label>' +
      '<label class="field">' +
      '<span class="field__label">Diastolic (mmHg)</span>' +
      '<input class="input" type="number" inputmode="numeric" ' +
      'min="30" max="180" name="dia" required>' +
      '</label>' +
      '<input type="hidden" name="date" value="' + U.today() + '">' +
      '<button class="btn btn--block" type="submit">Save reading</button>' +
      '</div>' +
      '</form>'
    );
  });

  /* =================== main view =================== */
  function view(w, editable, state) {
    const g = S.ga(w.lmp);
    const p = S.progressOf(w);
    const hr = S.isHighRisk(w);
    const lastBP = (w.bp || []).slice(-1)[0];
    const bpBad = lastBP && (lastBP.sys >= 140 || lastBP.dia >= 90);
    const tabs = editable ? TABS_ASHA : TABS_WOMAN;

    /* Normalise tab key: for woman, map any legacy key to
       its new group, then ensure it is one of the 5 valid ones. */
    let tab = state.tab || 'overview';
    if (!editable) {
      tab = WOMAN_TAB_MAP[tab] || 'overview';
      var valid = TABS_WOMAN.some(function (x) { return x[0] === tab; });
      if (!valid) tab = 'overview';
    }

    /* Attach the sticky sub-header (after DOM mounts) */
    attachSubheader(w, editable && hr);

    return '' +
      '<button class="auth-back" data-act="back" data-detail-page>' +
      I.back + ' ' +
      U.esc(editable ? t('detail.allben') : t('more.back')) +
      '</button>' +

      '<div class="card">' +
      '<div class="u-between" style="align-items:flex-start">' +
      '<div class="u-row" style="align-items:flex-start">' +
      '<span class="session__avatar" style="width:54px;height:54px;' +
      'font-size:20px;background:' +
      ((hr && editable) ? 'var(--bad-50)' : 'var(--brand-50)') + ';color:' +
      ((hr && editable) ? 'var(--bad-700)' : 'var(--brand-800)') + '">' +
      U.esc(U.initials(w.name)) + '</span>' +
      '<div>' +
      '<h2 style="font-size:21px">' + U.esc(w.name) + '</h2>' +
      '<div class="u-small u-muted" style="margin-top:3px">' +
      w.age + ' yrs / ' + U.esc(w.bloodGroup || '-') +
      ' / Wife of ' + U.esc(w.husband || '-') + '</div>' +
      '<div class="chip-id" style="margin-top:7px">' +
      U.esc(w.patientId) + '</div>' +
      '</div>' +
      '</div>' +
      '<div class="u-right">' +
      ((hr && editable)
        ? '<span class="pill pill--overdue">' + I.alert + ' ' +
        U.esc(t('tab.hrp')) + '</span> ' : '') +
      '<div style="font-weight:800;font-size:22px;letter-spacing:-.03em;' +
      'margin-top:6px;color:var(--ink-900)">' + p.pct + '%</div>' +
      '<div class="u-tiny u-muted">' + p.done + '/' + p.total + ' ' +
      U.esc(t('d.complete')) + '</div>' +
      '</div>' +
      '</div>' +

      UI.bar(p.pct, (hr && editable) ? 'rose' : null, 'lg') +

      '<div class="u-grid ' +
      (editable ? 'u-grid-4' : 'u-grid-3') +
      '" style="margin-top:16px">' +
      '<div><div class="stat__l">' + U.esc(t('d.gest')) + '</div>' +
      '<div style="font-weight:800;font-size:17px;color:var(--ink-900)">' +
      U.esc(g.months) + '</div>' +
      '<div class="u-tiny u-muted">' + U.esc(g.text) + '</div></div>' +
      '<div><div class="stat__l">' + U.esc(t('d.edd')) + '</div>' +
      '<div style="font-weight:800;font-size:17px;color:var(--ink-900)">' +
      U.fmtShort(S.eddOf(w.lmp)) + '</div>' +
      '<div class="u-tiny u-muted">' + U.fmtDate(S.eddOf(w.lmp)) +
      '</div></div>' +
      '<div><div class="stat__l">' + U.esc(t('d.bp')) + '</div>' +
      '<div style="font-weight:800;font-size:17px;color:' +
      (bpBad ? 'var(--bad-700)' : 'var(--ink-900)') + '">' +
      (lastBP ? lastBP.sys + '/' + lastBP.dia : '-') + '</div>' +
      '<div class="u-tiny u-muted">' +
      (lastBP ? U.fmtShort(lastBP.date) : U.esc(t('d.notrec'))) +
      '</div></div>' +
      (editable
        ? '<div><div class="stat__l">' + U.esc(t('d.hrp')) + '</div>' +
        '<div style="font-weight:800;font-size:17px;color:' +
        (hr ? 'var(--bad-700)' : 'var(--ink-900)') + '">' +
        S.hrpActive(w).length + '</div>' +
        '<div class="u-tiny u-muted">' +
        (S.hrpActive(w).length
          ? U.esc(t('d.conditions'))
          : U.esc(t('d.none'))) +
        '</div></div>'
        : '') +
      '</div>' +
      '</div>' +

      (hr && editable
        ? '<div class="alert alert--danger">' + I.alert +
        '<div><b>' + U.esc(t('tab.hrp')) + '.</b> ' +
        (S.hrpActive(w).length
          ? 'Flagged conditions: ' + S.hrpActive(w).map(function (c) {
            return U.esc(c.label);
          }).join(', ') + '. '
          : '') +
        (bpBad
          ? 'Latest BP ' + lastBP.sys + '/' + lastBP.dia + ' mmHg. '
          : '') +
        'Ensure referral to FRU / CEmONC facility.</div></div>'
        : '') +

      '<div class="tabs-wrap">' +
      '<div class="tabs" role="tablist">' +
      tabs.map(function (tabDef) {
        const key = tabDef[0];
        const label = labelOf(tabDef[1], tabDef[2]);
        return '<button class="tab' + (tab === key ? ' is-on' : '') + '"' +
          ' role="tab" aria-selected="' + (tab === key) + '"' +
          ' data-act="tab" data-tab="' + key + '">' +
          U.esc(label) + '</button>';
      }).join('') +
      '</div>' +
      '</div>' +

      panel(w, editable, tab, state) +

      (editable ? renderFab(w) : '');
  }

  /* ---------- panel router ---------- */
  function panel(w, editable, tab, state) {
    if (editable) {
      /* ASHA — 1 tab : 1 panel */
      if (tab === 'mom') return tabMom(w, editable);
      if (tab === 'children') return tabChildren(w, editable, state);
      if (tab === 'tests') return tabTests(w, editable, state);
      if (tab === 'bp') return tabBP(w, editable);
      if (tab === 'hrp') return tabHrp(w, editable);
      if (tab === 'schemes') return tabSchemes(w, editable);
      if (tab === 'fp') return tabFp(w, editable);
      if (tab === 'visits') return tabVisits(w, editable);
      return tabOverview(w, editable);
    }

    /* Woman — grouped panels */
    if (tab === 'baby') return tabMom(w, editable) + tabChildren(w, editable, state);
    if (tab === 'records') return tabTests(w, editable, state) + tabBP(w, editable);
    if (tab === 'care') return tabSchemes(w, editable) + tabFp(w, editable);
    if (tab === 'visits') return tabVisits(w, editable);
    return tabOverview(w, editable);
  }

  /* ---------- panels (unchanged below) ---------- */
  function tabOverview(w, editable) {
    const pend = S.pendingSorted(w);
    const shown = pend.slice(0, 6);
    const addr = w.address + ', ' + w.village +
      (w.pincode ? ' - ' + w.pincode : '');

    return '<div class="u-grid u-grid-2">' +
      '<div class="card">' +
      '<div class="card__head"><div class="card__title">' + I.home +
      'Address &amp; contact</div></div>' +
      '<dl class="kv">' +
      '<dt>House address</dt><dd>' + U.esc(addr) + '</dd>' +
      '<dt>Village / ward</dt><dd>' + U.esc(w.village) + '</dd>' +
      '<dt>Phone</dt><dd>' + U.esc(w.phone) + '</dd>' +
      '<dt>Husband</dt><dd>' + U.esc(w.husband || '-') + '</dd>' +
      '<dt>Assigned ASHA</dt><dd>' +
      U.esc((MC.store.asha(w.ashaId) || {}).name || '-') + '</dd>' +
      '</dl>' +
      '</div>' +
      '<div class="card">' +
      '<div class="card__head"><div class="card__title">' + I.heart +
      'Pregnancy summary</div></div>' +
      '<dl class="kv">' +
      '<dt>Patient ID</dt><dd class="u-mono">' + U.esc(w.patientId) +
      '</dd>' +
      '<dt>LMP</dt><dd>' + U.fmtDate(w.lmp) + '</dd>' +
      '<dt>Gestational age</dt><dd>' + U.esc(S.ga(w.lmp).text) +
      '</dd>' +
      '<dt>Expected delivery</dt><dd>' + U.fmtDate(S.eddOf(w.lmp)) +
      '</dd>' +
      '<dt>Previous delivery</dt><dd>' +
      (w.previousDelivery ? U.fmtDate(w.previousDelivery) : '-') +
      '</dd>' +
      '<dt>Blood group</dt><dd>' + U.esc(w.bloodGroup || '-') +
      '</dd>' +
      '</dl>' +
      '</div>' +
      '</div>' +

      '<div class="card">' +
      '<div class="card__head">' +
      '<div class="card__title">' + I.clock +
      'Pending &amp; upcoming</div>' +
      '<span class="pill ' + (pend.length ? 'pill--due' : 'pill--done') +
      '">' + pend.length + ' item' +
      (pend.length === 1 ? '' : 's') + '</span>' +
      '</div>' +
      (shown.length
        ? shown.map(function (i) { return UI.itemRow(w, i, editable); })
          .join('') +
        (pend.length > shown.length
          ? '<div class="u-small u-muted" style="padding-top:11px">and ' +
          (pend.length - shown.length) + ' more...</div>'
          : '')
        : UI.empty('All caught up',
          'Every vaccination and test is complete.')) +
      '</div>';
  }

  function tabMom(w, editable) {
    const items = S.momItems(w);
    const p = S.progressOfList(w, items);
    const hasBooster = items.some(function (i) { return i.booster; });

    return '<div class="card">' +
      '<div class="card__head">' +
      '<div class="card__title">' + I.syringe +
      'Tetanus-diphtheria (Td) schedule</div>' +
      '<span class="pill ' + (p.pct === 100 ? 'pill--done' : 'pill--brand') +
      '">' + p.pct + '% complete</span>' +
      '</div>' +

      (hasBooster
        ? '<div class="alert alert--warn">' + I.alert +
        '<div><b>Td booster applicable.</b> The previous pregnancy was on ' +
        U.fmtDate(w.previousDelivery) + ' - within 3 years.</div></div>'
        : '<div class="u-small u-muted" style="margin-bottom:12px">' +
        'No booster required - no pregnancy with 2 Td doses within the ' +
        'last 3 years.</div>') +

      items.map(function (i) { return UI.itemRow(w, i, editable); })
        .join('') +
      '</div>';
  }

  function tabChildren(w, editable, state) {
    if (!w.children || !w.children.length) {
      return '<div class="card">' +
        UI.empty('No child record yet',
          'A child record with the full immunisation schedule is created ' +
          'after delivery.') +
        '</div>';
    }

    return w.children.map(function (c) {
      const items = S.childItems(c);
      const done = items.filter(function (i) { return w.done[i.id]; });
      const pend = items.filter(function (i) { return !w.done[i.id]; });
      const p = S.progressOfList(w, items);
      const od = pend.filter(function (i) {
        return S.statusOf(i.due) === 'overdue';
      }).length;

      const openKey = 'child_' + c.id;
      const open = !!state.expand[openKey];

      return '<div class="card">' +
        '<div class="card__head">' +
        '<div class="u-row">' +
        '<span class="session__avatar" style="width:42px;height:42px;' +
        'background:var(--brand-50);color:var(--brand-800)">' +
        I.baby + '</span>' +
        '<div>' +
        '<div class="card__title" style="font-size:15px">' +
        U.esc(c.name) + '</div>' +
        '<div class="u-small u-muted">' +
        (c.gender === 'M' ? 'Boy' : 'Girl') + ' / ' +
        U.esc(S.childAge(c.dob)) + ' old / born ' +
        U.fmtDate(c.dob) + '</div>' +
        '</div>' +
        '</div>' +
        '<div class="u-right">' +
        '<div style="font-weight:800;font-size:18px;color:var(--ink-900)">' +
        p.pct + '%</div>' +
        '<div class="u-tiny u-muted">' + p.done + '/' + p.total +
        ' doses</div>' +
        '</div>' +
        '</div>' +

        UI.bar(p.pct, 'warn', 'lg') +

        (od
          ? '<div class="alert alert--danger" style="margin-top:14px">' +
          I.alert + '<div><b>' + od + ' dose' + (od > 1 ? 's' : '') +
          ' overdue.</b></div></div>'
          : '') +

        '<div style="margin-top:14px">' +
        (pend.length
          ? pend.map(function (i) { return UI.itemRow(w, i, editable); })
            .join('')
          : UI.empty('All doses complete', 'This child is up to date.')) +
        '</div>' +

        (done.length
          ? '<details class="disclosure"' + (open ? ' open' : '') + '>' +
          '<summary>' + (open ? 'Hide' : 'Show') + ' ' + done.length +
          ' completed dose' + (done.length > 1 ? 's' : '') +
          '</summary>' +
          done.map(function (i) { return UI.itemRow(w, i, false); })
            .join('') +
          '</details>'
          : '') +
        '</div>';
    }).join('');
  }

  function tabTests(w, editable, state) {
    const ancs = S.ancItems(w);
    const tests = S.testItems(w);
    const pa = S.progressOfList(w, ancs);
    const pt = S.progressOfList(w, tests);
    const expanded = state.expandId;

    return '<div class="card">' +
      '<div class="card__head">' +
      '<div class="card__title">' + I.heart + 'ANC checkups</div>' +
      '<span class="pill ' + (pa.pct === 100 ? 'pill--done' : 'pill--brand') +
      '">' + pa.done + '/4 done</span>' +
      '</div>' +
      ancs.map(function (i) { return UI.itemRow(w, i, editable); }).join('') +
      '</div>' +

      '<div class="card">' +
      '<div class="card__head">' +
      '<div class="card__title">' + I.flask +
      'Tests &amp; investigations</div>' +
      '<span class="pill ' + (pt.pct === 100 ? 'pill--done' : 'pill--brand') +
      '">' + pt.pct + '% complete</span>' +
      '</div>' +
      tests.map(function (i) {
        return UI.testRow(w, i, editable, expanded);
      }).join('') +
      '</div>';
  }

  function tabBP(w, editable) {
    const log = (w.bp || []).slice().sort(function (a, b) {
      return a.date.localeCompare(b.date);
    });
    const latest = log.slice(-1)[0];
    const bad = latest && (latest.sys >= 140 || latest.dia >= 90);

    return '<div class="card">' +
      '<div class="card__head">' +
      '<div class="card__title">' + I.heart +
      'Blood pressure trend</div>' +
      (latest
        ? '<span class="pill ' + (bad ? 'pill--overdue' : 'pill--done') +
        '">Latest ' + latest.sys + '/' + latest.dia + '</span>'
        : '') +
      '</div>' +
      CH.bpChart(log) +
      '<div class="legend">' +
      '<span><i style="background:var(--chart-sys,#be123c)"></i>Systolic</span>' +
      '<span><i style="background:var(--chart-dia,#0f766e)"></i>Diastolic</span>' +
      '<span><i style="background:#fee2e2"></i>High-BP zone ' +
      '(&ge;140/90)</span>' +
      '</div>' +
      '</div>' +

      (editable
        ? '<div class="card">' +
        '<div class="card__head"><div class="card__title">' + I.plus +
        'Add a BP / vitals reading</div></div>' +
        '<form data-act="addbp" data-wid="' + U.esc(w.id) + '">' +
        '<div class="form__row" style="margin-bottom:10px">' +
        '<input type="date" name="date" value="' + U.today() + '">' +
        '<input type="number" inputmode="numeric" name="sys" ' +
        'placeholder="Systolic (mmHg)" min="50" max="260" required>' +
        '<input type="number" inputmode="numeric" name="dia" ' +
        'placeholder="Diastolic (mmHg)" min="30" max="180" required>' +
        '</div>' +
        '<div class="form__row">' +
        '<input type="number" inputmode="numeric" name="pulse" ' +
        'placeholder="Pulse (bpm)" min="30" max="220">' +
        '<input type="number" inputmode="decimal" step="0.1" name="weight" ' +
        'placeholder="Weight (kg)" min="20" max="200">' +
        '<input name="note" placeholder="Notes (optional)">' +
        '</div>' +
        '<div class="form__row" style="margin-top:12px">' +
        '<button class="btn" type="submit">' + I.plus +
        ' Add reading</button>' +
        '</div>' +
        '</form>' +
        '</div>'
        : '') +

      '<div class="card">' +
      '<div class="card__head">' +
      '<div class="card__title">' + I.notes + 'All readings</div>' +
      '<span class="count">' + log.length + '</span>' +
      '</div>' +
      (log.length
        ? '<div class="bp-mobile-list">' +
        log.slice().reverse().map(function (r) {
          const isBad = r.sys >= 140 || r.dia >= 90;
          const st = S.bpStatus(r.sys, r.dia);
          return '<div class="bp-mobile-item bp-mobile-item--' + st + '">' +
            '<div class="bp-mobile-item__top">' +
            '<span class="bp-mobile-item__date">' +
            U.fmtDate(r.date) + '</span>' +
            '<span class="bp-mobile-item__bp">' +
            r.sys + ' / ' + r.dia + '</span>' +
            '</div>' +
            '<div class="bp-mobile-item__meta">' +
            (r.pulse ? 'Pulse ' + r.pulse + ' · ' : '') +
            (r.weight ? 'Weight ' + r.weight + ' kg' : '') +
            '</div>' +
            (r.note ? '<div class="bp-mobile-item__note">' +
              U.esc(r.note) + '</div>' : '') +
            '</div>';
        }).join('') + '</div>' +

        '<div class="table-wrap bp-desktop-table"><table class="data">' +
        '<thead><tr><th>Date</th><th>BP</th><th>Pulse</th>' +
        '<th>Weight</th><th>Notes</th></tr></thead><tbody>' +
        log.slice().reverse().map(function (r) {
          const isBad = r.sys >= 140 || r.dia >= 90;
          return '<tr>' +
            '<td>' + U.fmtDate(r.date) + '</td>' +
            '<td class="num' + (isBad ? ' is-bad' : '') + '">' +
            r.sys + '/' + r.dia + (isBad ? ' !' : '') + '</td>' +
            '<td class="num">' + (r.pulse || '-') + '</td>' +
            '<td class="num">' +
            (r.weight ? r.weight + ' kg' : '-') + '</td>' +
            '<td>' + U.esc(r.note || '') + '</td>' +
            '</tr>';
        }).join('') +
        '</tbody></table></div>'
        : UI.empty('No readings yet',
          'BP readings recorded during visits appear here.')) +
      '</div>';
  }

  function tabHrp(w, editable) {
    const active = S.hrpActive(w);
    return UI.hrpChecklist(w, editable) +
      (active.length
        ? '<div class="card">' +
        '<div class="card__head"><div class="card__title">' + I.alert +
        'Action required</div></div>' +
        '<div class="alert alert--danger" style="margin:0">' + I.alert +
        '<div>Refer to the nearest First Referral Unit (FRU) / CEmONC ' +
        'facility. Ensure birth-preparedness planning, referral ' +
        'transport, blood donor and designated caregiver are identified.' +
        '</div></div>' +
        '</div>'
        : '');
  }

  function tabSchemes(w, editable) {
    return MC.SCHEMES.map(function (s) {
      return UI.schemeCard(s, w, editable);
    }).join('');
  }

  function tabFp(w, editable) {
    return UI.fpChecklist(w, editable);
  }

  function tabVisits(w, editable) {
    const v = (w.visits || []).slice().sort(function (a, b) {
      return b.date.localeCompare(a.date);
    });

    return (editable
      ? '<div class="card">' +
      '<div class="card__head"><div class="card__title">' + I.plus +
      'Log a home visit</div></div>' +
      '<form data-act="addvisit" data-wid="' + U.esc(w.id) + '">' +
      '<div class="form__row">' +
      '<input type="date" name="date" value="' + U.today() + '">' +
      '<input name="note" ' +
      'placeholder="What was done / advised?" required>' +
      '<button class="btn" type="submit">Save visit</button>' +
      '</div>' +
      '</form>' +
      '</div>'
      : '') +

      '<div class="card">' +
      '<div class="card__head">' +
      '<div class="card__title">' + I.home + 'Visit history</div>' +
      '<span class="count">' + v.length + '</span>' +
      '</div>' +
      (v.length
        ? v.map(function (x) {
          return '<div style="padding:12px 0;' +
            'border-bottom:1px solid var(--line)">' +
            '<div class="u-between">' +
            '<b class="u-small" style="color:var(--ink-900)">' +
            U.fmtDate(x.date) + '</b>' +
            '<span class="pill pill--brand">' +
            U.esc(x.by || 'ASHA visit') + '</span>' +
            '</div>' +
            '<div class="u-small" style="margin-top:5px;color:var(--ink-600)">' +
            U.esc(x.note) + '</div>' +
            '</div>';
        }).join('')
        : UI.empty('No visits logged',
          'Home visit notes will appear here.')) +
      '</div>';
  }

  MC.views = MC.views || {};
  MC.views.detail = { view: view };

})(window.MC = window.MC || {});