/* ============================================================
   schedule.js — item builders, status logic, progress, HRP
   ============================================================ */
(function (MC) {
  'use strict';

  const U = MC.util;

  function momItems(w){
    const out = MC.MOM_DEFS.map(d => ({
      id: d.id, label: d.label, note: d.note,
      due: U.addDays(w.lmp, d.at), group: 'mom'
    }));

    if (w.previousDelivery &&
        U.diffDays(w.previousDelivery, U.today()) < MC.BOOSTER_WINDOW_DAYS) {
      out.push({
        id: 'tdb',
        label: 'Td Booster',
        note: 'Required — 2 Td doses given in a pregnancy within 3 years',
        due: U.addDays(w.lmp, 196),
        group: 'mom',
        booster: true
      });
    }

    out.push({
      id: 'tdap',
      label: MC.TDAP_DEF.label,
      note: MC.TDAP_DEF.note,
      due: U.addDays(w.lmp, MC.TDAP_DEF.at),
      group: 'mom',
      optional: true
    });

    return out;
  }

  function ancItems(w){
    return MC.ANC_DEFS.map(d => ({
      id: d.id, label: d.label, note: d.note,
      due: U.addDays(w.lmp, d.at), group: 'anc'
    }));
  }

  function testItems(w){
    return MC.TEST_DEFS.map(d => ({
      id: d.id, label: d.label, note: d.note,
      due: U.addDays(w.lmp, d.at), group: 'test'
    }));
  }

  function childItems(child){
    return MC.CHILD_SCHEDULE.map(v => ({
      id: 'c' + child.id + '_' + v.key,
      label: v.label,
      ageLabel: v.ageLabel,
      note: '',
      due: U.addDays(child.dob, v.age),
      group: 'child',
      childId: child.id
    }));
  }

  function allItems(w){
    return [].concat(
      momItems(w),
      ancItems(w),
      testItems(w),
      (w.children || []).reduce((acc, c) => acc.concat(childItems(c)), [])
    );
  }

  function statusOf(due){
    const n = U.diffDays(U.today(), due);
    if (n < 0)   return 'overdue';
    if (n <= 14) return 'due';
    return 'upcoming';
  }

  const STATUS_TEXT = {
    done: 'Done', overdue: 'Overdue', due: 'Due soon', upcoming: 'Upcoming'
  };
  function statusText(s){ return STATUS_TEXT[s] || s; }

  function itemStatus(w, item){
    return w.done[item.id] ? 'done' : statusOf(item.due);
  }

  function ga(lmp){
    const d = U.diffDays(lmp, U.today());
    if (d < 0) return { weeks: 0, days: 0, text: '—', months: '—', totalDays: 0 };
    const wk = Math.floor(d / 7);
    const dy = d % 7;
    const mo = Math.floor(wk / 4.345);
    return {
      weeks: wk, days: dy, totalDays: d,
      text: wk + 'w ' + dy + 'd',
      months: mo + (mo === 1 ? ' month' : ' months')
    };
  }

  function eddOf(lmp){ return U.addDays(lmp, 280); }

  function daysToEdd(lmp){ return U.diffDays(U.today(), eddOf(lmp)); }

  function childAge(dob){
    const d = U.diffDays(dob, U.today());
    if (d < 0) return 'not born';
    if (d < 60) return d + (d === 1 ? ' day' : ' days');
    if (d < 730) {
      const m = Math.floor(d / 30.44);
      return m + (m === 1 ? ' month' : ' months');
    }
    return (d / 365.25).toFixed(1) + ' years';
  }

  /* ---------- aggregates (optional items excluded from progress) ---------- */
  function requiredItems(w){
    return allItems(w).filter(function (i) { return !i.optional; });
  }

  function progressOf(w){
    const items = requiredItems(w);
    if (!items.length) return { pct: 0, done: 0, total: 0 };
    const done = items.filter(i => w.done[i.id]).length;
    return {
      pct: Math.round(done / items.length * 100),
      done, total: items.length
    };
  }

  function progressOfList(w, items){
    const req = items.filter(function (i) { return !i.optional; });
    if (!req.length) return { pct: 0, done: 0, total: 0 };
    const done = req.filter(i => w.done[i.id]).length;
    return {
      pct: Math.round(done / req.length * 100),
      done, total: req.length
    };
  }

  function pendingSorted(w){
    return requiredItems(w)
      .filter(i => !w.done[i.id])
      .sort((a, b) => a.due.localeCompare(b.due));
  }

  function overdueCount(w){
    return requiredItems(w).filter(i => !w.done[i.id] && statusOf(i.due) === 'overdue').length;
  }

  function isHighRisk(w){
    const everHighBP = (w.bp || []).some(r => r.sys >= 140 || r.dia >= 90);
    if (everHighBP) return true;
    if (w.hrp && w.hrp.length) return true;
    if (w.risk && w.risk.length) return true;

    const hbTests = ['hb1','hb2','hb3'];
    for (const id of hbTests) {
      const rec = w.done[id];
      if (rec && rec.value) {
        const val = U.parseNumeric(rec.value);
        if (!isNaN(val) && val < 7) return true;
      }
    }
    return false;
  }

  function hrpActive(w){
    const ids = w.hrp || [];
    return MC.HRP_CONDITIONS.filter(c => ids.indexOf(c.id) !== -1);
  }

  function hasHrp(w, id){
    return (w.hrp || []).indexOf(id) !== -1;
  }

  /** BP status: 'normal' | 'elevated' | 'high' */
  function bpStatus(sys, dia){
    if (sys >= 160 || dia >= 110) return 'high';
    if (sys >= 140 || dia >= 90)  return 'elevated';
    return 'normal';
  }

  MC.schedule = {
    momItems, ancItems, testItems, childItems, allItems, requiredItems,
    statusOf, statusText, itemStatus,
    ga, eddOf, daysToEdd, childAge,
    progressOf, progressOfList, pendingSorted, overdueCount,
    isHighRisk, hrpActive, hasHrp, bpStatus
  };

})(window.MC = window.MC || {});