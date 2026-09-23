/* ============================================================
   views.woman.js — patient-facing (read-only) view
   ============================================================ */
(function (MC) {
  'use strict';

  const U  = MC.util;
  const S  = MC.schedule;
  const UI = MC.ui;
  const I  = UI.ICON;
  const t  = function (k) { return MC.i18n.t(k); };

  function currentWoman(){
    const s = MC.store.session.get();
    return MC.store.woman(s.id);
  }

  function langBar(){
    const opts = MC.i18n.options();
    const cur  = MC.i18n.lang;
    return '<div class="woman-langbar">' +
      opts.map(function (o) {
        return '<button class="woman-langbar__btn' +
          (o.code === cur ? ' is-on' : '') + '"' +
          ' data-act="set-lang" data-lang="' + o.code + '">' +
          U.esc(o.label) + '</button>';
      }).join('') +
    '</div>';
  }

  /* ---------- Home ---------- */
  function home(){
    const w    = currentWoman();
    const g    = S.ga(w.lmp);
    const nv   = w.nextVisit;
    const refs = (w.referrals || []).filter(function(r){ return r.status === 'pending'; });
    const fus  = (w.followUps || []).filter(function(f){ return !f.done; });
    const meds = (w.medicines || []).length;
    const visits = (w.visits || []).length;
    const daysLeft = S.daysToEdd(w.lmp);

    return '' +
      langBar() +

      '<div class="woman-home">' +

        '<div class="woman-greet">' +
          '<span class="woman-greet__avatar">' +
            U.esc(U.initials(w.name)) + '</span>' +
          '<div>' +
            '<div class="woman-greet__hello">' +
              U.esc(t('woman.hello')) + ', ' +
              U.esc(w.name.split(' ')[0]) + '</div>' +
            '<div class="woman-greet__sub">' + U.esc(g.months) + ' ' +
              U.esc(t('d.pregnant')) + ' · ' + U.esc(g.text) + '</div>' +
          '</div>' +
        '</div>' +

        (daysLeft > 0
          ? '<div class="countdown-chip">' +
              '<span class="countdown-chip__label">' +
                U.esc(t('woman.countdown')) + '</span>' +
              '<span class="countdown-chip__value">' +
                (daysLeft >= 14
                  ? Math.floor(daysLeft / 7) + ' ' + U.esc(t('woman.countdown.weeks'))
                  : daysLeft + ' ' + U.esc(t('woman.countdown.days'))) +
              '</span>' +
            '</div>'
          : '') +

        '<div class="woman-section-title">' + U.esc(t('woman.next')) + '</div>' +
        (nv
          ? '<div class="next-step-card">' +
              '<div class="next-step-card__row">' +
                '<span class="next-step-card__icon">' + I.cal + '</span>' +
                '<div class="next-step-card__main">' +
                  '<div class="next-step-card__date">' + U.fmtDate(nv.date) + '</div>' +
                  '<div class="next-step-card__type">' + U.esc(nv.type) + '</div>' +
                  (nv.at ? '<div class="next-step-card__at">' + I.pin + ' ' +
                    U.esc(nv.at) + '</div>' : '') +
                  (nv.time ? '<div class="next-step-card__time">' + I.clock + ' ' +
                    U.esc(nv.time) + '</div>' : '') +
                '</div>' +
              '</div>' +
              '<button class="btn btn--block" style="margin-top:14px" ' +
                'data-act="woman-tab" data-tab="visits">' +
                U.esc(t('woman.viewdetails')) + '</button>' +
            '</div>'
          : '<div class="next-step-card next-step-card--quiet">' +
              '<div class="next-step-card__type" style="color:var(--ink-500)">' +
                U.esc(t('d.none')) + '</div>' +
            '</div>') +

        '<div class="woman-section-title">' + U.esc(t('woman.mycare')) + '</div>' +
        '<div class="care-checklist">' +
          careRow('check', visits + ' ' + t('woman.visits'), 'ok',
                  'woman-tab', 'visits', visits + ' done — see details') +
          careRow('pill', meds + ' ' + t('woman.meds'), 'ok',
                  'woman-tab', 'care', 'Tap to see names & timings') +
          careRow('arrow', refs.length + ' ' + t('woman.ref') +
                  (refs.length === 1 ? '' : 's'),
                  refs.length ? 'warn' : 'muted',
                  'woman-tab', 'care',
                  refs.length ? 'See where you were sent' : 'No referrals') +
          careRow('arrow', fus.length + ' ' + t('woman.fu') +
                  (fus.length === 1 ? '' : 's'),
                  fus.length ? 'warn' : 'muted',
                  'woman-tab', 'care',
                  fus.length ? 'See reasons & dates' : 'No follow-ups') +
        '</div>' +

        '<button class="btn btn--ghost btn--block woman-ask" ' +
          'data-act="woman-ask">' + I.chat + ' ' + U.esc(t('woman.ask')) + '</button>' +

      '</div>';
  }

  function careRow(iconType, label, tone, act, tab, sub){
    const iconMap = {
      check: '&#10003;',
      arrow: '→',
      pill:  '&#9679;'
    };
    return '<button class="care-row care-row--' + tone + '" ' +
      'data-act="' + act + '" data-tab="' + tab + '">' +
      '<span class="care-row__icon">' + (iconMap[iconType] || iconType) + '</span>' +
      '<span class="care-row__body">' +
        '<span class="care-row__label">' + U.esc(label) + '</span>' +
        (sub ? '<span class="care-row__sub">' + U.esc(sub) + '</span>' : '') +
      '</span>' +
      '<span class="care-row__cta">›</span>' +
    '</button>';
  }

  /* ---------- Visits ---------- */
  function visits(){
    const w = currentWoman();
    const all = (w.visits || []).slice().sort(function (a, b) {
      return b.date.localeCompare(a.date);
    });
    const nv  = w.nextVisit;
    const fus = (w.followUps || []);

    let out = '<div class="page-head"><h1>' +
      U.esc(t('woman.visits.title')) + '</h1><p>' +
      U.esc(t('woman.visits.sub')) + '</p></div>';

    if (nv) {
      out += '<div class="woman-section-title">Upcoming</div>' +
        '<div class="visit-upcoming">' +
          '<div class="visit-upcoming__when">' + U.fmtDate(nv.date) +
            (nv.time ? ' · ' + U.esc(nv.time) : '') + '</div>' +
          '<div class="visit-upcoming__type">' + U.esc(nv.type) + '</div>' +
          (nv.at ? '<div class="visit-upcoming__at">' + I.pin + ' ' +
            U.esc(nv.at) + '</div>' : '') +
          (nv.note ? '<div class="visit-upcoming__note">' +
            U.esc(nv.note) + '</div>' : '') +
        '</div>';
    }

    if (fus.length) {
      out += '<div class="woman-section-title">Follow-ups</div>' +
        '<div class="followup-list">' +
        fus.map(function (f) {
          const tone = f.done ? 'ok' : 'warn';
          const icon = f.done ? '&#10003;' : '&#9679;';
          return '<div class="followup-item followup-item--' + tone + '">' +
            '<span class="followup-item__icon">' + icon + '</span>' +
            '<div class="followup-item__body">' +
              '<div class="followup-item__reason">' +
                U.esc(f.type || 'Follow-up') + ': ' + U.esc(f.reason) + '</div>' +
              '<div class="followup-item__date">' +
                U.fmtDate(f.due) + (f.done ? ' · ' + t('status.done') : '') +
              '</div>' +
            '</div>' +
          '</div>';
        }).join('') +
        '</div>';
    }

    out += '<div class="woman-section-title">Completed</div>';
    out += (all.length
      ? '<div class="timeline">' + all.map(function (v) {
          return '<div class="timeline__item">' +
            '<div class="timeline__dot"></div>' +
            '<div class="timeline__body">' +
              '<div class="timeline__date">' + U.fmtDate(v.date) + '</div>' +
              '<div class="timeline__note">' + U.esc(v.note) + '</div>' +
              (v.by ? '<div class="timeline__by">' + U.esc(v.by) + '</div>' : '') +
            '</div>' +
          '</div>';
        }).join('') + '</div>'
      : '<div class="card">' + UI.empty(t('woman.no.visits'), '') + '</div>');

    return out;
  }

  /* ---------- Care ---------- */
  function care(){
    const w = currentWoman();
    const meds = w.medicines || [];
    const refs = w.referrals || [];
    const pend = S.pendingSorted(w);
    const asha = MC.store.asha(w.ashaId);

    const vacc = pend.filter(function (i) {
      return i.group === 'mom' || i.group === 'child';
    });
    const tests = pend.filter(function (i) { return i.group === 'test'; });

    /* BP status of latest */
    const lastBP = (w.bp || []).slice(-1)[0];
    const bpStat = lastBP ? S.bpStatus(lastBP.sys, lastBP.dia) : null;

    return '' +
      langBar() +
      '<div class="page-head"><h1>' +
        U.esc(t('woman.care.title')) + '</h1><p>' +
        U.esc(t('woman.care.sub')) + '</p></div>' +

      /* BP card first */
      (lastBP
        ? '<div class="bp-card bp-card--' + bpStat + '">' +
            '<div class="bp-card__label">Blood pressure</div>' +
            '<div class="bp-card__value">' +
              lastBP.sys + ' / ' + lastBP.dia +
              '<span class="bp-card__unit">mmHg</span>' +
            '</div>' +
            '<div class="bp-card__status">' +
              U.esc(t('bp.' + bpStat)) +
            '</div>' +
            '<div class="bp-card__date">' +
              U.fmtDate(lastBP.date) +
            '</div>' +
          '</div>'
        : '') +

      /* medicines */
      '<div class="woman-section-title">' + U.esc(t('woman.care.meds')) + '</div>' +
      (meds.length
        ? '<div class="med-list">' + meds.map(function (m) {
            return '<div class="med-item">' +
              '<div class="med-item__icon">' + I.pill + '</div>' +
              '<div class="med-item__body">' +
                '<div class="med-item__name">' + U.esc(m.name) + '</div>' +
                (m.purpose
                  ? '<div class="med-item__purpose">' +
                    U.esc(t('woman.medicine.purpose')) + ': ' +
                    U.esc(m.purpose) + '</div>'
                  : '') +
                '<div class="med-item__line">' +
                  (m.dose ? '<span class="med-item__dose">' +
                    U.esc(m.dose) + '</span> · ' : '') +
                  '<span class="med-item__time">' + U.esc(m.timing) + '</span>' +
                '</div>' +
                (m.note ? '<div class="med-item__note">' +
                  U.esc(m.note) + '</div>' : '') +
              '</div>' +
            '</div>';
          }).join('') + '</div>'
        : '<div class="card">' + UI.empty('No medicines recorded', '') + '</div>') +

      /* referrals */
      (refs.length
        ? '<div class="woman-section-title">' + U.esc(t('woman.care.ref')) + '</div>' +
          '<details class="explain">' +
            '<summary>' + U.esc(t('common.explain')) + '</summary>' +
            '<div>' + U.esc(t('woman.referral.explain')) + '</div>' +
          '</details>' +
          '<div class="ref-list">' + refs.map(function (r) {
            const tone = r.status === 'pending' ? 'warn' : 'ok';
            const mapQ = encodeURIComponent(r.address || r.to);
            const mapsUrl = 'https://maps.google.com/?q=' + mapQ;
            return '<div class="ref-item ref-item--' + tone + '">' +
              '<div class="ref-item__icon">→</div>' +
              '<div class="ref-item__body">' +
                '<div class="ref-item__to">' + U.esc(r.to) + '</div>' +
                '<div class="ref-item__reason">' +
                  U.esc(r.type || 'Referral') + ': ' + U.esc(r.reason) + '</div>' +
                '<div class="ref-item__date">' + U.fmtDate(r.date) +
                  (r.status === 'pending' ? ' · pending' : '') + '</div>' +
                '<a class="ref-item__dir" href="' + mapsUrl + '"' +
                  ' target="_blank" rel="noopener">' +
                  I.pin + ' ' + U.esc(t('woman.directions')) + '</a>' +
              '</div>' +
            '</div>';
          }).join('') + '</div>'
        : '') +

      /* vaccines */
      (vacc.length
        ? '<div class="woman-section-title">' + U.esc(t('woman.care.vac')) + '</div>' +
          '<div class="care-list-card">' + vacc.slice(0, 6).map(function (i) {
            return '<div class="care-list-item">' +
              '<span class="care-list-item__label">' + U.esc(i.label) + '</span>' +
              '<span class="care-list-item__due">' + U.fmtShort(i.due) + '</span>' +
            '</div>';
          }).join('') + '</div>'
        : '') +

      /* tests */
      (tests.length
        ? '<div class="woman-section-title">' + U.esc(t('woman.care.tests')) + '</div>' +
          '<div class="care-list-card">' + tests.slice(0, 6).map(function (i) {
            return '<div class="care-list-item">' +
              '<span class="care-list-item__label">' + U.esc(i.label) + '</span>' +
              '<span class="care-list-item__due">' + U.fmtShort(i.due) + '</span>' +
            '</div>';
          }).join('') + '</div>'
        : '') +

      /* call ASHA */
      (asha && asha.phone
        ? '<button class="btn btn--ghost btn--block woman-ask"' +
            ' style="margin-top:22px" data-act="call-asha"' +
            ' data-phone="' + U.esc(String(asha.phone).replace(/\D/g,'')) + '">' +
            I.phone + ' ' + U.esc(t('woman.call.asha')) +
          '</button>'
        : '');
  }

  /* ---------- More ---------- */
  function more(){
    const w = currentWoman();
    const langLabel = (MC.i18n.options().find(function(o){
      return o.code === MC.i18n.lang;
    }) || {}).label || 'English';

    return '' +
      langBar() +
      '<div class="page-head"><h1>' + U.esc(t('more.title')) + '</h1></div>' +

      '<div class="card">' +
        '<div class="u-row">' +
          '<span class="session__avatar" style="width:56px;height:56px;' +
            'font-size:20px;background:var(--rose-50);color:var(--rose-700)">' +
            U.esc(U.initials(w.name)) + '</span>' +
          '<div>' +
            '<div style="font-weight:700;font-size:17px">' +
              U.esc(w.name) + '</div>' +
            '<div class="u-small u-muted">' + U.esc(w.patientId) + '</div>' +
            '<div class="u-small u-muted">' + U.esc(w.phone) + '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="woman-section-title">' + U.esc(t('more.records')) + '</div>' +
      '<div class="card" style="padding:0">' +
        clinicalRow(I.syringe, t('tab.mom'),      'mom') +
        clinicalRow(I.baby,    t('tab.children'), 'children') +
        clinicalRow(I.flask,   t('tab.tests'),    'tests') +
        clinicalRow(I.heart,   t('tab.bp'),       'bp') +
        clinicalRow(I.notes,   t('tab.schemes'),  'schemes') +
        clinicalRow(I.fam,     t('tab.fp'),       'fp') +
      '</div>' +

      '<div class="woman-section-title">' + U.esc(t('more.settings')) + '</div>' +
      '<div class="card" style="padding:0">' +
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
      '</div>' +

      '<div class="card" style="padding:0;margin-top:14px">' +
        '<button class="menu-row" data-act="logout" style="color:var(--bad-700)">' +
          '<span class="menu-row__ico">' + I.door + '</span>' +
          '<span class="menu-row__label" style="font-weight:700">' +
            U.esc(t('more.signout')) + '</span>' +
          '<span class="menu-row__cta">›</span>' +
        '</button>' +
      '</div>';
  }

  function clinicalRow(iconSvg, label, tab){
    return '<button class="menu-row" data-act="woman-view" data-tab="' + tab + '">' +
      '<span class="menu-row__ico">' + iconSvg + '</span>' +
      '<span class="menu-row__label">' + U.esc(label) + '</span>' +
      '<span class="menu-row__cta">›</span>' +
    '</button>';
  }

  MC.views = MC.views || {};
  MC.views.woman = { home: home, visits: visits, care: care, more: more };

})(window.MC = window.MC || {});