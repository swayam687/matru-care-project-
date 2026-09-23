/* ============================================================
   components.js — UI primitives, icons, toast
   ============================================================ */
(function (MC) {
  'use strict';

  const U = MC.util;
  const S = MC.schedule;

  const ICON = {
    check:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    alert:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    lock:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    out:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
    back:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
    pin:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    syringe:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3a2.4 2.4 0 0 1-3.4 0l-.6-.6a2.4 2.4 0 0 1 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/></svg>',
    flask:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2v6L4 18a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3L15 8V2"/><line x1="8" y1="2" x2="16" y2="2"/></svg>',
    heart:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>',
    baby:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>',
    home:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    user:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    id:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M15 8h4M15 12h4M5 18h14"/></svg>',
    phone:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.4 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
    cal:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    clock:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    notes:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>',
    grid:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    plus:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.7" y2="16.7"/></svg>',
    globe:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    book:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    info:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    door:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 4h3a2 2 0 0 1 2 2v14"/><path d="M2 20h3"/><path d="M13 20h9"/><path d="M10 12v.01"/><path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.562z"/></svg>',
    pill:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7z"/><path d="m8.5 8.5 7 7"/></svg>',
    chat:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    arrowR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    fam:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="2"/><circle cx="15" cy="9" r="2"/><path d="M4 20a5 5 0 0 1 5-5"/><path d="M20 20a5 5 0 0 0-5-5"/><path d="M9 20h6"/></svg>',
    file:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    wifiOff:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>'
  };

  function pill(status, text){
    return '<span class="pill pill--' + status + '">' +
           U.esc(text || S.statusText(status)) + '</span>';
  }

  function tick(w, item, editable){
    const on = !!w.done[item.id];
    if (!editable) {
      return '<span class="tick tick--static' + (on ? ' is-on' : '') + '">' +
             (on ? ICON.check : '') + '</span>';
    }
    return '<button class="tick' + (on ? ' is-on' : '') + '"' +
           ' data-act="toggle"' +
           ' data-wid="' + U.esc(w.id) + '"' +
           ' data-item="' + U.esc(item.id) + '"' +
           ' aria-pressed="' + on + '"' +
           ' aria-label="' + (on ? 'Mark not done' : 'Mark done') + ': ' + U.esc(item.label) + '"' +
           ' title="' + (on ? 'Undo' : 'Mark as done') + '">' +
           (on ? ICON.check : '') + '</button>';
  }

  function itemRow(w, item, editable){
    const rec = w.done[item.id];
    const st  = S.itemStatus(w, item);

    return '<div class="item ' + (st === 'done' ? 'is-done' : '') + '">' +
      '<div class="item__main">' +
        tick(w, item, editable) +
        '<div class="item__text">' +
          '<div class="item__label">' + U.esc(item.label) +
            (item.booster ? ' <span class="pill pill--rose">Booster</span>' : '') +
            (item.optional ? ' <span class="pill pill--plain">Optional</span>' : '') +
          '</div>' +
          '<div class="item__sub">' +
            U.esc(item.note || item.ageLabel || '') +
            (rec && rec.by ? ' · by ' + U.esc(rec.by) : '') +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="item__right">' +
        pill(st) +
        '<span class="item__date">' +
          (rec ? 'Done ' + U.fmtShort(rec.date) : 'Due ' + U.fmtShort(item.due)) +
        '</span>' +
        (rec && rec.value ? '<span class="item__value">' + U.esc(rec.value) + '</span>' : '') +
      '</div>' +
    '</div>';
  }

  function testRow(w, item, editable, expandedId){
    const rec = w.done[item.id];
    const st  = S.itemStatus(w, item);
    const open = expandedId === item.id;

    return '<div>' +
      '<div class="item ' + (st === 'done' ? 'is-done' : '') + '"' +
           (open ? ' style="border-bottom:none"' : '') + '>' +
        '<div class="item__main">' +
          tick(w, item, editable) +
          '<div class="item__text">' +
            '<div class="item__label">' + U.esc(item.label) + '</div>' +
            '<div class="item__sub">' +
              U.esc(item.note || '') +
              (rec && rec.by ? ' · by ' + U.esc(rec.by) : '') +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="item__right">' +
          pill(st) +
          '<span class="item__date">' +
            (rec ? 'Done ' + U.fmtShort(rec.date) : 'Due ' + U.fmtShort(item.due)) +
          '</span>' +
          (rec && rec.value ? '<span class="item__value">' + U.esc(rec.value) + '</span>' : '') +
          (editable && !open
            ? '<button class="btn btn--ghost btn--sm" data-act="expand"' +
              ' data-item="' + U.esc(item.id) + '">' +
              (rec ? 'Edit' : 'Record') + '</button>'
            : '') +
        '</div>' +
      '</div>' +

      (open && editable
        ? '<form data-act="saveresult"' +
            ' data-wid="' + U.esc(w.id) + '"' +
            ' data-item="' + U.esc(item.id) + '"' +
            ' style="background:var(--surface-2);border:1px solid var(--line);' +
            'border-radius:var(--r-sm);padding:12px;margin:0 0 12px">' +
            '<div class="form__row" style="margin-bottom:9px">' +
              '<input name="value" placeholder="Result (e.g. 10.8 g/dL)"' +
                ' value="' + U.esc(rec && rec.value || '') + '">' +
              '<input type="date" name="date" value="' +
                U.esc(rec && rec.date || U.today()) + '">' +
            '</div>' +
            '<div class="form__row">' +
              '<input name="note" placeholder="Notes (optional)"' +
                ' value="' + U.esc(rec && rec.note || '') + '">' +
              '<button class="btn btn--sm" type="submit">Save</button>' +
              '<button class="btn btn--ghost btn--sm" type="button"' +
                ' data-act="expand" data-item="' + U.esc(item.id) + '">Cancel</button>' +
            '</div>' +
          '</form>'
        : '') +
    '</div>';
  }

  function stat(label, value, tone){
    return '<div class="stat' + (tone ? ' stat--' + tone : '') + '">' +
      '<div class="stat__n">' + U.esc(value) + '</div>' +
      '<div class="stat__l">' + U.esc(label) + '</div>' +
    '</div>';
  }

  function bar(pct, tone, size){
    return '<div class="bar' +
      (tone ? ' bar--' + tone : '') +
      (size ? ' bar--' + size : '') + '">' +
      '<i style="width:' + Math.max(0, Math.min(100, pct)) + '%"></i></div>';
  }

  function empty(title, sub){
    return '<div class="empty">' + ICON.grid +
      '<b>' + U.esc(title) + '</b>' +
      (sub ? U.esc(sub) : '') + '</div>';
  }

  function toast(msg, tone){
    const host = document.getElementById('toasts');
    if (!host) return;
    const t = document.createElement('div');
    t.className = 'toast toast--' + (tone || 'info');
    t.innerHTML = (tone === 'ok' ? ICON.check
                 : tone === 'bad' ? ICON.alert
                 : ICON.shield) + '<span>' + U.esc(msg) + '</span>';
    host.appendChild(t);
    setTimeout(function () {
      t.style.transition = 'opacity .25s, transform .25s';
      t.style.opacity = '0';
      t.style.transform = 'translateY(8px)';
      setTimeout(function () { t.remove(); }, 260);
    }, 3200);
  }

  function hrpChecklist(w, editable){
    const active = MC.schedule.hrpActive(w);
    return '<div class="card">' +
      '<div class="card__head">' +
        '<div class="card__title">' + ICON.shield +
          'High-Risk Pregnancy (PMSMA) checklist</div>' +
        '<span class="pill ' + (active.length ? 'pill--overdue' : 'pill--done') +
          '">' + (active.length ? active.length + ' flagged' : 'No risk') +
          '</span>' +
      '</div>' +
      '<div class="u-small u-muted" style="margin-bottom:12px">' +
        'Tick every condition that applies. Once flagged, the record stays ' +
        'high-risk for the entire pregnancy.' +
      '</div>' +
      '<div style="display:grid;' +
        'grid-template-columns:repeat(auto-fit,minmax(240px,1fr));' +
        'gap:4px 18px">' +
        MC.HRP_CONDITIONS.map(function (c) {
          const on = MC.schedule.hasHrp(w, c.id);
          return '<label style="display:flex;align-items:center;gap:9px;' +
            'padding:6px 4px;cursor:' + (editable ? 'pointer' : 'default') + '">' +
            (editable
              ? '<input type="checkbox" data-act="hrp" data-wid="' +
                U.esc(w.id) + '" data-hrp="' + U.esc(c.id) + '"' +
                (on ? ' checked' : '') +
                ' style="width:16px;height:16px;' +
                'accent-color:var(--bad-600);flex:none;cursor:pointer">'
              : '<span style="width:16px;height:16px;flex:none;' +
                'border-radius:4px;' +
                'background:' + (on ? 'var(--bad-600)' : 'var(--ink-100)') +
                ';display:grid;place-items:center">' +
                (on ? '<span style="color:#fff;font-size:11px;' +
                  'font-weight:800">&#10003;</span>' : '') +
                '</span>') +
            '<span class="u-small" style="color:' +
              (on ? 'var(--bad-700)' : 'var(--ink-600)') + ';font-weight:' +
              (on ? '700' : '500') + '">' + U.esc(c.label) + '</span>' +
          '</label>';
        }).join('') +
      '</div>' +
    '</div>';
  }

  function schemeCard(scheme, w, editable){
    const checked = (w.schemes || []).indexOf(scheme.id) !== -1;
    return '<div class="card">' +
      '<div class="card__head">' +
        '<div class="card__title">' + ICON.notes +
          U.esc(scheme.name) + '</div>' +
        (editable
          ? '<label style="display:flex;align-items:center;gap:7px;' +
            'cursor:pointer">' +
            '<input type="checkbox" data-act="scheme" data-wid="' +
              U.esc(w.id) + '" data-scheme="' + U.esc(scheme.id) + '"' +
              (checked ? ' checked' : '') +
              ' style="width:16px;height:16px;' +
              'accent-color:var(--brand-600);cursor:pointer">' +
            '<span class="u-small" style="font-weight:700">' +
              (checked ? 'Enrolled' : 'Mark enrolled') + '</span>' +
            '</label>'
          : '<span class="pill ' +
              (checked ? 'pill--done' : 'pill--upcoming') + '">' +
            (checked ? 'Enrolled' : 'Not enrolled') + '</span>') +
      '</div>' +
      '<div class="u-small u-muted" style="margin-bottom:10px">' +
        U.esc(scheme.benefit) + '</div>' +
      '<dl class="kv">' +
        scheme.amounts.map(function (a) {
          return '<dt>' + U.esc(a.label) + '</dt><dd>' +
                 U.esc(a.value) + '</dd>';
        }).join('') +
      '</dl>' +
    '</div>';
  }

  function fpChecklist(w, editable){
    const chosen = w.fp || [];
    return '<div class="card">' +
      '<div class="card__head">' +
        '<div class="card__title">' + ICON.heart +
          'Postpartum family planning</div>' +
        '<span class="pill ' +
          (chosen.length ? 'pill--done' : 'pill--upcoming') + '">' +
          (chosen.length ? chosen.length + ' chosen' : 'Not counselled') +
        '</span>' +
      '</div>' +
      '<div class="u-small u-muted" style="margin-bottom:12px">' +
        'Tick the method(s) counselled / adopted. Available free of cost ' +
        'under the National Family Planning Programme.' +
      '</div>' +
      '<div style="display:grid;' +
        'grid-template-columns:repeat(auto-fit,minmax(240px,1fr));' +
        'gap:4px 18px">' +
        MC.FP_METHODS.map(function (m) {
          const on = chosen.indexOf(m.id) !== -1;
          return '<label style="display:flex;align-items:center;gap:9px;' +
            'padding:6px 4px;cursor:' + (editable ? 'pointer' : 'default') +
            '">' +
            (editable
              ? '<input type="checkbox" data-act="fp" data-wid="' +
                U.esc(w.id) + '" data-fp="' + U.esc(m.id) + '"' +
                (on ? ' checked' : '') +
                ' style="width:16px;height:16px;' +
                'accent-color:var(--brand-600);flex:none;cursor:pointer">'
              : '<span style="width:16px;height:16px;flex:none;' +
                'border-radius:4px;' +
                'background:' + (on ? 'var(--brand-600)' : 'var(--ink-100)') +
                ';display:grid;place-items:center">' +
                (on ? '<span style="color:#fff;font-size:11px;' +
                  'font-weight:800">&#10003;</span>' : '') +
                '</span>') +
            '<span class="u-small" style="font-weight:' +
              (on ? '700' : '500') + ';color:' +
              (on ? 'var(--brand-800)' : 'var(--ink-600)') + '">' +
              U.esc(m.label) + '</span>' +
          '</label>';
        }).join('') +
      '</div>' +
    '</div>';
  }

  MC.ui = {
    ICON, pill, tick, itemRow, testRow, stat, bar, empty, toast,
    hrpChecklist, schemeCard, fpChecklist
  };

})(window.MC = window.MC || {});