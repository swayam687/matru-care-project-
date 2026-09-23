/* ============================================================
   utils.js — dates, formatting, DOM helpers
   ============================================================ */
(function (MC) {
  'use strict';

  const DAY = 86400000;

  function pad(n){ return String(n).padStart(2, '0'); }

  function iso(d){
    const x = (d instanceof Date) ? new Date(d) : new Date(d);
    x.setHours(0,0,0,0);
    return x.getFullYear() + '-' + pad(x.getMonth()+1) + '-' + pad(x.getDate());
  }
  function today(){ return iso(new Date()); }
  function parseISO(s){
    const p = String(s).split('-').map(Number);
    return new Date(p[0], p[1]-1, p[2]);
  }
  function addDays(s, n){
    const d = parseISO(s); d.setDate(d.getDate() + n); return iso(d);
  }
  function daysAgo(n){ return addDays(today(), -n); }
  function diffDays(a, b){ return Math.round((parseISO(b) - parseISO(a)) / DAY); }

  const MON = ['Jan','Feb','Mar','Apr','May','Jun',
               'Jul','Aug','Sep','Oct','Nov','Dec'];

  function fmtDate(s){
    if(!s) return '—';
    const d = parseISO(s);
    return pad(d.getDate()) + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear();
  }
  function fmtShort(s){
    if(!s) return '—';
    const d = parseISO(s);
    return pad(d.getDate()) + ' ' + MON[d.getMonth()];
  }
  function fmtMonthYear(s){
    if(!s) return '—';
    const d = parseISO(s);
    return MON[d.getMonth()] + ' ' + d.getFullYear();
  }

  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  function normId(s){
    return String(s || '')
      .toUpperCase()
      .replace(/[^A-Z0-9-]/g, '')
      .replace(/-{2,}/g, '-')
      .replace(/^-|-$/g, '');
  }

  function normCode(s, n){
    const d = String(s || '').replace(/\D/g, '');
    return d.length === n ? d : '';
  }

  function initials(name){
    const parts = String(name || '?').trim().split(/\s+/);
    return (parts[0][0] || '?').toUpperCase();
  }

  /**
   * Parse a numeric value tolerating commas as decimal separators.
   * "10,8" → 10.8 · "10.8 g/dL" → 10.8 · "Hb 12" → 12
   */
  function parseNumeric(s){
    if (s == null) return NaN;
    let str = String(s).trim();
    /* If there's no period but there's a comma followed by 1-2 digits at
       the end, treat it as a decimal separator. Otherwise strip commas. */
    if (str.indexOf('.') === -1 && /,\d{1,2}\b/.test(str)) {
      str = str.replace(/,(\d{1,2})\b/, '.$1');
    } else {
      str = str.replace(/,/g, '');
    }
    str = str.replace(/[^\d.\-]/g, '');
    return parseFloat(str);
  }

  function humanMs(ms){
    const total = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    const parts = [];
    if (m) parts.push(m + (m === 1 ? ' minute' : ' minutes'));
    if (s) parts.push(s + (s === 1 ? ' second' : ' seconds'));
    return parts.join(' ') || '0 seconds';
  }

  function mmss(ms){
    const t = Math.max(0, Math.floor(ms / 1000));
    return Math.floor(t / 60) + ':' + pad(t % 60);
  }

  function el(sel, root){ return (root || document).querySelector(sel); }
  function els(sel, root){ return Array.from((root || document).querySelectorAll(sel)); }

  MC.util = {
    DAY, iso, today, parseISO, addDays, daysAgo, diffDays,
    fmtDate, fmtShort, fmtMonthYear, esc, normId, normCode,
    initials, parseNumeric, humanMs, mmss, el, els
  };

})(window.MC = window.MC || {});