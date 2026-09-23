/* ============================================================
   views.asha.js — ASHA views: Today, Patients, Tasks, More
   ============================================================ */
(function (MC) {
  'use strict';

  const U  = MC.util;
  const S  = MC.schedule;
  const UI = MC.ui;
  const I  = UI.ICON;
  const t  = function (k) { return MC.i18n.t(k); };

  function currentAsha(){
    const s = MC.store.session.get();
    return MC.store.asha(s.id);
  }
  function myWomen(){
    const asha = currentAsha();
    return MC.store.db.women.filter(function (w) { return w.ashaId === asha.id; });
  }

  /* ============================================================
     TODAY
     ============================================================ */
  function today(){
    const asha  = currentAsha();
    const women = myWomen();
    const td    = U.today();

    const visits = women.filter(function (w) {
      return w.nextVisit && w.nextVisit.date === td;
    }).sort(function (a, b) {
      return (a.nextVisit.time || '').localeCompare(b.nextVisit.time || '');
    });

    const overdue = [];
    women.forEach(function (w) {
      S.requiredItems(w).forEach(function (i) {
        if (!w.done[i.id] && S.statusOf(i.due) === 'overdue') {
          overdue.push({ w: w, item: i });
        }
      });
    });

    const referrals = [];
    women.forEach(function (w) {
      (w.referrals || []).forEach(function (r) {
        if (r.status === 'pending') referrals.push({ w: w, r: r });
      });
    });

    const priority = women.filter(function (w) { return S.isHighRisk(w); });

    const hour = new Date().getHours();
    const greetKey = hour < 12 ? 'greet.morning'
                   : hour < 17 ? 'greet.afternoon'
                   : 'greet.evening';

    return '' +
      '<div class="today">' +
        '<div class="today__head">' +
          '<h1 class="today__greeting">' + U.esc(t(greetKey)) + ', ' +
            U.esc(asha.name.split(' ')[0]) + '</h1>' +
          '<p class="today__sub">' + U.fmtDate(td) + ' · ' +
            U.esc(asha.block) + '</p>' +
        '</div>' +

        '<div class="today__stats">' +
          statBox(t('today.visits'),    visits.length,    'brand') +
          statBox(t('today.overdue'),   overdue.length,   'bad') +
          statBox(t('today.referrals'), referrals.length, 'warn') +
          statBox(t('today.priority'),  priority.length,  'rose') +
        '</div>' +

        '<button class="btn today__scan" data-act="scan">' +
          I.plus + ' ' + U.esc(t('today.scan')) + '</button>' +

        (visits.length
          ? sectionHead(t('today.sec.visits'), visits.length) +
            visits.map(visitCard).join('')
          : '<div class="card">' +
              UI.empty(t('today.empty'), t('today.empty.sub')) +
            '</div>') +

        (overdue.length
          ? sectionHead(t('today.sec.overdue'), overdue.length) +
            overdue.slice(0, 6).map(function (o) {
              return overdueRow(o.w, o.item);
            }).join('') +
            (overdue.length > 6
              ? '<div class="u-small u-muted" style="padding:12px 4px">+ ' +
                (overdue.length - 6) + ' ' + U.esc(t('today.more')) + '</div>'
              : '')
          : '') +

        (referrals.length
          ? sectionHead(t('today.sec.ref'), referrals.length) +
            referrals.map(function (r) {
              return referralRow(r.w, r.r);
            }).join('')
          : '') +

        (priority.length
          ? sectionHead(t('today.sec.prio'), priority.length) +
            priority.map(priorityRow).join('')
          : '') +
      '</div>';
  }

  function statBox(label, value, tone){
    return '<div class="stat' + (tone ? ' stat--' + tone : '') + '">' +
      '<div class="stat__n">' + value + '</div>' +
      '<div class="stat__l">' + U.esc(label) + '</div>' +
    '</div>';
  }

  function sectionHead(title, count){
    return '<div class="section-head">' +
      '<h2>' + U.esc(title) + '</h2>' +
      '<span class="count">' + count + '</span>' +
    '</div>';
  }

  function visitCard(w){
    const time = w.nextVisit.time || '';
    const visited = hasVisitToday(w);
    return '<div class="visit-card">' +
      (time ? '<div class="visit-card__time">' + U.esc(time) + '</div>' : '') +
      '<button class="visit-card__body" data-act="open" data-id="' +
        U.esc(w.id) + '">' +
        '<span class="visit-card__accent"' +
          (visited ? ' style="background:var(--ok-700)"' : '') + '></span>' +
        '<span class="visit-card__content">' +
          '<span class="visit-card__name">' + U.esc(w.name) +
            (visited
              ? ' <span class="pill pill--done" style="font-size:10px">' +
                '&#10003; ' + U.esc(t('today.visited')) + '</span>'
              : '') +
          '</span>' +
          '<span class="visit-card__meta">' + U.esc(w.nextVisit.type) +
            (w.nextVisit.note ? ' · ' + U.esc(w.nextVisit.note) : '') +
          '</span>' +
          '<span class="visit-card__id">' + U.esc(w.patientId) + '</span>' +
        '</span>' +
        '<span class="visit-card__cta">' + U.esc(t('common.open')) + '</span>' +
      '</button>' +
    '</div>';
  }

  /** True if a visit was logged today for this woman. */
  function hasVisitToday(w){
    return (w.visits || []).some(function (v) {
      return v.date === U.today();
    });
  }

  function overdueRow(w, item){
    return '<button class="alert-row alert-row--bad" data-act="open" data-id="' +
      U.esc(w.id) + '">' +
      '<span class="alert-row__icon">▲</span>' +
      '<span class="alert-row__body">' +
        '<span class="alert-row__name">' + U.esc(w.name) + '</span>' +
        '<span class="alert-row__meta">' + U.esc(item.label) +
          ' · ' + U.esc(t('tasks.wasdue')) + ' ' + U.fmtShort(item.due) + '</span>' +
      '</span>' +
      '<span class="alert-row__cta">›</span>' +
    '</button>';
  }

  function referralRow(w, r){
    return '<button class="alert-row alert-row--warn" data-act="open" data-id="' +
      U.esc(w.id) + '">' +
      '<span class="alert-row__icon">→</span>' +
      '<span class="alert-row__body">' +
        '<span class="alert-row__name">' + U.esc(w.name) + '</span>' +
        '<span class="alert-row__meta">' + U.esc(r.to) +
          ' · ' + U.fmtShort(r.date) + '</span>' +
      '</span>' +
      '<span class="alert-row__cta">›</span>' +
    '</button>';
  }

  function priorityRow(w){
    const flags = S.hrpActive(w);
    return '<button class="alert-row alert-row--rose" data-act="open" data-id="' +
      U.esc(w.id) + '">' +
      '<span class="alert-row__icon">●</span>' +
      '<span class="alert-row__body">' +
        '<span class="alert-row__name">' + U.esc(w.name) + '</span>' +
        '<span class="alert-row__meta">' + flags.length + ' ' +
          U.esc(t('d.conditions')) + ' · ' + U.esc(w.patientId) +
        '</span>' +
      '</span>' +
      '<span class="alert-row__cta">›</span>' +
    '</button>';
  }

  /* ============================================================
     PATIENTS list — searchable & filterable
     ============================================================ */
  function patients(filter){
    const women = myWomen();
    filter = filter || MC.app.state.patientFilter || { q: '', chip: 'all' };

    let list = women.slice();

    /* search */
    if (filter.q) {
      const q = filter.q.toLowerCase();
      list = list.filter(function (w) {
        return (w.name && w.name.toLowerCase().indexOf(q) !== -1) ||
               (w.patientId && w.patientId.toLowerCase().indexOf(q) !== -1) ||
               (w.village && w.village.toLowerCase().indexOf(q) !== -1);
      });
    }

    /* chip filter */
    if (filter.chip === 'overdue') {
      list = list.filter(function (w) { return S.overdueCount(w) > 0; });
    } else if (filter.chip === 'due') {
      list = list.filter(function (w) {
        return S.requiredItems(w).some(function (i) {
          return !w.done[i.id] && S.statusOf(i.due) === 'due';
        });
      });
    } else if (filter.chip === 'high') {
      list = list.filter(function (w) { return S.isHighRisk(w); });
    } else if (filter.chip === 'pp') {
      list = list.filter(function (w) { return (w.children || []).length > 0; });
    }

    /* sort */
    list.sort(function (a, b) {
      const ah = S.isHighRisk(a) ? 0 : 1;
      const bh = S.isHighRisk(b) ? 0 : 1;
      if (ah !== bh) return ah - bh;
      const ao = S.overdueCount(a);
      const bo = S.overdueCount(b);
      if (ao !== bo) return bo - ao;
      return a.name.localeCompare(b.name);
    });

    const chips = [
      ['all',     t('patients.f.all')],
      ['overdue', t('patients.f.overdue')],
      ['due',     t('patients.f.due')],
      ['high',    t('patients.f.high')],
      ['pp',      t('patients.f.pp')]
    ];

    return '' +
      '<div class="page-head">' +
        '<h1>' + U.esc(t('patients.title')) + '</h1>' +
        '<p>' + women.length + ' ' + U.esc(t('patients.sub')) + '</p>' +
      '</div>' +

      '<div class="patient-search">' +
        '<span class="patient-search__icon">' + I.search + '</span>' +
        '<input type="search" data-act="patient-search" ' +
          'placeholder="' + U.esc(t('patients.search')) + '" ' +
          'value="' + U.esc(filter.q) + '" ' +
          'aria-label="' + U.esc(t('patients.search')) + '">' +
      '</div>' +

      '<div class="filter-chips">' +
        chips.map(function (c) {
          return '<button class="filter-chip' +
            (filter.chip === c[0] ? ' is-on' : '') + '"' +
            ' data-act="patient-filter" data-chip="' + c[0] + '">' +
            U.esc(c[1]) + '</button>';
        }).join('') +
      '</div>' +

      (list.length
        ? '<div class="u-grid u-grid-2" style="margin-top:16px">' +
            list.map(patientCard).join('') +
          '</div>'
        : '<div class="card">' +
            UI.empty(t('patients.empty'), t('patients.empty.sub')) +
          '</div>');
  }

  function patientCard(w){
    const g      = S.ga(w.lmp);
    const p      = S.progressOf(w);
    const hr     = S.isHighRisk(w);
    const nxt    = S.pendingSorted(w)[0];
    const od     = S.overdueCount(w);
    const lastBP = (w.bp || []).slice(-1)[0];
    const bpBad  = lastBP && (lastBP.sys >= 140 || lastBP.dia >= 90);

    return '<button class="wcard" data-act="open" data-id="' + U.esc(w.id) +
      '" style="display:flex;gap:14px;align-items:flex-start;width:100%;' +
      'background:var(--surface);border:1px solid var(--line);' +
      'border-radius:var(--r-lg);box-shadow:var(--sh-sm);padding:16px;' +
      'text-align:left;">' +

      '<span class="session__avatar" style="width:46px;height:46px;font-size:17px;' +
        'background:' + (hr ? 'var(--bad-50)' : 'var(--brand-50)') + ';' +
        'color:' + (hr ? 'var(--bad-700)' : 'var(--brand-800)') + '">' +
        U.esc(U.initials(w.name)) + '</span>' +

      '<span style="flex:1;min-width:0">' +
        '<span class="u-between" style="align-items:flex-start">' +
          '<span style="min-width:0">' +
            '<span style="display:block;font-weight:700;font-size:15.5px;' +
              'color:var(--ink-900);letter-spacing:-.01em">' +
              U.esc(w.name) + '</span>' +
            '<span class="u-small u-muted" style="display:block;margin-top:2px;' +
              'overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' +
              U.esc(w.address) + ', ' + U.esc(w.village) + '</span>' +
            '<span class="chip-id" style="margin-top:6px">' +
              U.esc(w.patientId) + '</span>' +
          '</span>' +
          (hr ? '<span class="pill pill--overdue">' +
                  U.esc(t('patients.f.high')) + '</span>'
              : (od ? '<span class="pill pill--overdue">' + od + ' ' +
                      U.esc(t('today.overdue')) + '</span>' : '')) +
        '</span>' +

        '<span style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">' +
          '<span class="pill pill--rose">' + U.esc(g.months) + ' ' +
            U.esc(t('d.pregnant')) + '</span>' +
          (lastBP
            ? '<span class="pill ' + (bpBad ? 'pill--overdue' : 'pill--brand') +
              '">BP ' + lastBP.sys + '/' + lastBP.dia + '</span>'
            : '') +
        '</span>' +

        '<span class="u-between" style="margin-top:12px">' +
          '<span class="u-small u-muted">' + p.done + ' / ' + p.total + ' ' +
            U.esc(t('d.complete')) + '</span>' +
          '<span class="u-small u-bold" style="color:var(--ink-900)">' +
            p.pct + '%</span>' +
        '</span>' +
        UI.bar(p.pct, hr ? 'rose' : null, 'sm') +

        (nxt
          ? '<span class="u-small" style="display:block;margin-top:10px;' +
            'color:var(--ink-600)">' +
            U.esc(t('woman.nextvisit')) + ': <b style="color:var(--ink-900)">' +
            U.esc(nxt.label) + '</b> · ' + U.fmtShort(nxt.due) + '</span>'
          : '<span class="u-small" style="display:block;margin-top:10px;' +
            'color:var(--ok-700);font-weight:700">' +
            U.esc(t('common.done')) + '</span>') +
      '</span>' +
    '</button>';
  }

  /* ============================================================
     TASKS
     ============================================================ */
  function tasks(){
    const women = myWomen();
    const all = [];
    women.forEach(function (w) {
      S.requiredItems(w).forEach(function (i) {
        if (!w.done[i.id]) {
          all.push({ w: w, item: i, st: S.statusOf(i.due) });
        }
      });
    });
    all.sort(function (a, b) { return a.item.due.localeCompare(b.item.due); });

    const overdue = all.filter(function (x) { return x.st === 'overdue'; });
    const due     = all.filter(function (x) { return x.st === 'due'; });

    return '' +
      '<div class="page-head">' +
        '<h1>' + U.esc(t('tasks.title')) + '</h1>' +
        '<p>' + overdue.length + ' ' + U.esc(t('tasks.sub')) + ' · ' +
          due.length + ' ' + U.esc(t('tasks.sub2')) + '</p>' +
      '</div>' +

      (overdue.length
        ? sectionHead(U.esc(t('status.overdue')), overdue.length) +
          overdue.map(function (x) {
            return taskRow(x.w, x.item, 'overdue');
          }).join('')
        : '') +

      (due.length
        ? sectionHead(U.esc(t('status.due')), due.length) +
          due.map(function (x) {
            return taskRow(x.w, x.item, 'due');
          }).join('')
        : '') +

      (!all.length
        ? '<div class="card">' +
            UI.empty(t('tasks.empty'), t('tasks.empty.sub')) +
          '</div>'
        : '');
  }

  function taskRow(w, item, st){
    const isBad = st === 'overdue';
    return '<button class="alert-row alert-row--' +
      (isBad ? 'bad' : 'warn') + '" data-act="open" data-id="' +
      U.esc(w.id) + '">' +
      '<span class="alert-row__icon">' + (isBad ? '▲' : '●') + '</span>' +
      '<span class="alert-row__body">' +
        '<span class="alert-row__name">' + U.esc(item.label) + '</span>' +
        '<span class="alert-row__meta">' + U.esc(w.name) + ' · ' +
          (isBad ? U.esc(t('tasks.wasdue')) : U.esc(t('tasks.due'))) +
          ' ' + U.fmtShort(item.due) +
        '</span>' +
      '</span>' +
      '<span class="alert-row__cta">›</span>' +
    '</button>';
  }

  /* ============================================================
     MORE
     ============================================================ */
  function more(){
    const asha = currentAsha();
    const langLabel = (MC.i18n.options().find(function(o){
      return o.code === MC.i18n.lang;
    }) || {}).label || 'English';

    return '' +
      '<div class="page-head"><h1>' + U.esc(t('more.title')) + '</h1></div>' +

      '<div class="card">' +
        '<div class="u-row">' +
          '<span class="session__avatar" style="width:56px;height:56px;' +
            'font-size:20px;background:var(--navy-50);color:var(--navy-900)">' +
            U.esc(U.initials(asha.name)) + '</span>' +
          '<div>' +
            '<div style="font-weight:700;font-size:17px">' +
              U.esc(asha.name) + '</div>' +
            '<div class="u-small u-muted">' + U.esc(asha.workerId) + ' · ' +
              U.esc(asha.block) + '</div>' +
            '<div class="u-small u-muted">' + U.esc(asha.phone) + '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="card" style="padding:0;margin-top:14px">' +
        '<button class="menu-row" data-act="open-lang">' +
          '<span class="menu-row__ico">' + I.globe + '</span>' +
          '<span class="menu-row__label">' + U.esc(t('more.language')) + '</span>' +
          '<span class="menu-row__value">' + U.esc(langLabel) + '</span>' +
          '<span class="menu-row__cta">›</span>' +
        '</button>' +
        '<button class="menu-row" data-act="noop">' +
          '<span class="menu-row__ico">' + I.book + '</span>' +
          '<span class="menu-row__label">' + U.esc(t('more.help')) + '</span>' +
          '<span class="menu-row__cta">›</span>' +
        '</button>' +
        '<button class="menu-row" data-act="noop">' +
          '<span class="menu-row__ico">' + I.info + '</span>' +
          '<span class="menu-row__label">' + U.esc(t('more.about')) + '</span>' +
          '<span class="menu-row__cta">›</span>' +
        '</button>' +
        '<button class="menu-row" data-act="logout" style="color:var(--bad-700)">' +
          '<span class="menu-row__ico">' + I.door + '</span>' +
          '<span class="menu-row__label" style="font-weight:700">' +
            U.esc(t('more.signout')) + '</span>' +
          '<span class="menu-row__cta">›</span>' +
        '</button>' +
      '</div>';
  }

  MC.views = MC.views || {};
  MC.views.asha = { today: today, patients: patients, tasks: tasks, more: more };

})(window.MC = window.MC || {});