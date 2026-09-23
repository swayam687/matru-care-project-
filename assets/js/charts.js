/* ============================================================
   charts.js — BP trend SVG (uses CSS tokens)
   ============================================================ */
(function (MC) {
  'use strict';

  const U = MC.util;

  function cssVar(name, fallback){
    try {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue(name).trim();
      return v || fallback;
    } catch (e) { return fallback; }
  }

  function bpChart(log){
    const data = (log || []).slice(-10);

    if (data.length < 2) {
      return '<div class="empty">Add at least 2 readings to see the trend.</div>';
    }

    const SYS = cssVar('--chart-sys', '#be123c');
    const DIA = cssVar('--chart-dia', '#0f766e');

    const W = 660, H = 210;
    const PL = 40, PR = 16, PT = 14, PB = 32;
    const MIN = 50, MAX = 180;

    const x = i => PL + (W - PL - PR) * (i / (data.length - 1));
    const y = v => PT + (H - PT - PB) * (1 - (v - MIN) / (MAX - MIN));

    const line = key =>
      data.map((d, i) => x(i).toFixed(1) + ',' + y(d[key]).toFixed(1)).join(' ');

    const dots = key =>
      data.map((d, i) =>
        '<circle cx="' + x(i).toFixed(1) + '" cy="' + y(d[key]).toFixed(1) +
        '" r="3.6" fill="' + (key === 'sys' ? SYS : DIA) + '"/>'
      ).join('');

    const grid = [60, 90, 120, 150, 180].map(v =>
      '<line x1="' + PL + '" x2="' + (W - PR) + '" y1="' + y(v).toFixed(1) +
      '" y2="' + y(v).toFixed(1) + '" stroke="#eef2f7" stroke-width="1"/>' +
      '<text x="' + (PL - 7) + '" y="' + (y(v) + 4).toFixed(1) +
      '" font-size="10" font-weight="600" fill="#94a3b8" text-anchor="end">' +
      v + '</text>'
    ).join('');

    const step = Math.max(1, Math.ceil(data.length / 5));
    const labels = data.map((d, i) =>
      i % step === 0
        ? '<text x="' + x(i).toFixed(1) + '" y="' + (H - 10) +
          '" font-size="10" font-weight="600" fill="#94a3b8" text-anchor="middle">' +
          U.fmtShort(d.date) + '</text>'
        : ''
    ).join('');

    return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img"' +
      ' aria-label="Blood pressure trend over the last ' + data.length + ' readings"' +
      ' style="max-height:230px;width:100%">' +
      '<rect x="' + PL + '" y="' + y(180).toFixed(1) + '"' +
        ' width="' + (W - PL - PR) + '"' +
        ' height="' + (y(140) - y(180)).toFixed(1) + '"' +
        ' fill="#fee2e2" opacity="0.55"/>' +
      grid +
      '<polyline points="' + line('sys') + '" fill="none" stroke="' + SYS + '"' +
        ' stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<polyline points="' + line('dia') + '" fill="none" stroke="' + DIA + '"' +
        ' stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>' +
      dots('sys') + dots('dia') + labels +
    '</svg>';
  }

  MC.charts = { bpChart };

})(window.MC = window.MC || {});