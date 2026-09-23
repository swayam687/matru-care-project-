/* ============================================================
   ui.mobile.js — mobile UX enhancements.
   Loads AFTER app.js. Non-invasive: patches DOM post-render.
   Safe to remove.
   Exposes: MC.uiMobile = { greet, stickyHeader, sheet, fab, refresh }
   ============================================================ */
(function(){
  'use strict';

  var topbar = document.getElementById('topbar');
  var app    = document.getElementById('app');

  /* ---------- escape ---------- */
  function esc(s){
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  /* ---------- 1. Auto-hide topbar on scroll ---------- */
  var lastY = 0, ticking = false;
  function onScroll(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      var y = window.scrollY || 0;
      if (!topbar) { ticking = false; return; }
      if (y > 90 && y > lastY + 4)      topbar.classList.add('is-hidden');
      else if (y < lastY - 4 || y < 40) topbar.classList.remove('is-hidden');
      lastY = y;
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, {passive:true});

  /* ---------- 2. Tappable sync chip + pull-to-refresh ---------- */
  function sync(){
    if (window.MC && MC.sync && typeof MC.sync.trigger === 'function') {
      MC.sync.trigger();
    } else if (window.MC && typeof MC.toast === 'function') {
      MC.toast('info', 'Sync started');
    }
  }

  function wireSyncChip(){
    var chip = document.querySelector('[data-sync-chip], .sync-chip');
    if (!chip || chip.dataset.mcWired) return;
    chip.dataset.mcWired = '1';
    chip.style.cursor = 'pointer';
    chip.setAttribute('role','button');
    chip.setAttribute('tabindex','0');
    chip.addEventListener('click', sync);
    chip.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sync(); }
    });
  }

  // pull-to-refresh
  var pStartY = 0, pPulling = false;
  document.addEventListener('touchstart', function(e){
    if (window.scrollY === 0) { pStartY = e.touches[0].clientY; pPulling = true; }
  }, {passive:true});
  document.addEventListener('touchmove', function(e){
    if (!pPulling) return;
    if (e.touches[0].clientY - pStartY > 90) { pPulling = false; sync(); }
  }, {passive:true});
  document.addEventListener('touchend', function(){ pPulling = false; }, {passive:true});

  /* ---------- 3. Scroll active tab into view ---------- */
  function scrollActiveTab(){
    var wrap = document.querySelector('.tabs-wrap .tabs') || document.querySelector('.tabs');
    if (!wrap) return;
    var on = wrap.querySelector('.tab.is-on');
    if (!on) return;
    var wR = wrap.getBoundingClientRect();
    var tR = on.getBoundingClientRect();
    if (tR.left < wR.left + 8 || tR.right > wR.right - 8) {
      on.scrollIntoView({behavior:'smooth', block:'nearest', inline:'center'});
    }
  }

  /* ---------- 4. Greeting injection ---------- */
  function readSession(){
    try {
      var raw = localStorage.getItem('mc_session_v7');
      return raw ? JSON.parse(raw) : null;
    } catch(e){ return null; }
  }

  function t(key, fallback){
    if (window.MC && MC.t && typeof MC.t === 'function') {
      var v = MC.t(key);
      if (v && v !== key) return v;
    }
    return fallback;
  }

  function greet(){
    if (!app) return;
    if (app.querySelector('.greet')) return;        // already injected
    if (app.querySelector('.chip-id')) return;      // patient detail page — skip
    if (!app.querySelector('.page-head')) return;   // not a landing page

    var s = readSession();
    if (!s) return;

    var isAsha = !!(s.workerId || s.kind === 'asha' || s.role === 'asha');
    var name   = s.name || (isAsha ? 'ASHA' : '');
    var meta   = isAsha
      ? (t('role.asha','ASHA') + ' · ' + (s.workerId || s.id || ''))
      : (t('role.patient','Patient') + ' · ' + (s.patientId || s.id || ''));

    var initial = (name || '?').trim().charAt(0).toUpperCase();
    var hello   = t('greet.hello','नमस्ते');

    var node = document.createElement('div');
    node.className = 'greet';
    node.innerHTML =
      '<div class="greet__av">' + esc(initial) + '</div>' +
      '<div class="greet__t">' +
        '<div class="greet__name">' + esc(hello) + ', ' + esc(name) + '</div>' +
        '<div class="greet__meta">' + esc(meta) + '</div>' +
      '</div>';

    var head = app.querySelector('.page-head');
    if (head && head.parentNode) head.parentNode.insertBefore(node, head);
    else app.insertBefore(node, app.firstChild);
  }

  /* ---------- 5. Patient sticky sub-header ---------- */
  var stickyIO = null;
  function stickyHeader(){
    if (!app) return;
    var chip = app.querySelector('.chip-id');
    if (!chip) { removeSticky(); return; }
    if (document.querySelector('.patient-sticky')) return; // already

    var nameEl = app.querySelector('.page-head h1, h1');
    var name   = nameEl ? nameEl.textContent.trim() : 'Patient';
    var id     = chip.textContent.trim();
    var hrp    = !!app.querySelector('.pill--rose, .alert--danger');

    var el = document.createElement('div');
    el.className = 'patient-sticky';
    el.innerHTML =
      '<div class="patient-sticky__name">' + esc(name) + '</div>' +
      (hrp ? '<span class="patient-sticky__dot" title="High risk"></span>' : '') +
      '<span class="patient-sticky__id">' + esc(id) + '</span>';
    document.body.appendChild(el);

    var head = app.querySelector('.page-head') || nameEl;
    if (head && 'IntersectionObserver' in window) {
      if (stickyIO) stickyIO.disconnect();
      stickyIO = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          el.classList.toggle('is-on', !e.isIntersecting);
        });
      }, {rootMargin:'-60px 0px 0px 0px', threshold:0});
      stickyIO.observe(head);
    }
  }
  function removeSticky(){
    var el = document.querySelector('.patient-sticky');
    if (el) el.remove();
    if (stickyIO) { stickyIO.disconnect(); stickyIO = null; }
  }

  /* ---------- 6. Bottom sheet ---------- */
  var backEl = document.getElementById('sheet-back');
  var sheetEl = document.getElementById('sheet');

  function openSheet(opts){
    if (!backEl || !sheetEl) return;
    opts = opts || {};
    sheetEl.innerHTML =
      '<div class="sheet__grip"></div>' +
      (opts.title ? '<div class="sheet__title">' + esc(opts.title) + '</div>' : '') +
      (opts.sub   ? '<div class="sheet__sub">'   + esc(opts.sub)   + '</div>' : '') +
      (opts.html || '');
    backEl.hidden = false; sheetEl.hidden = false;
    requestAnimationFrame(function(){
      backEl.classList.add('is-on');
      sheetEl.classList.add('is-on');
    });
    // wire rows
    sheetEl.querySelectorAll('[data-sheet-close]').forEach(function(b){
      b.addEventListener('click', closeSheet);
    });
  }
  function closeSheet(){
    if (!backEl || !sheetEl) return;
    backEl.classList.remove('is-on');
    sheetEl.classList.remove('is-on');
    setTimeout(function(){ backEl.hidden = true; sheetEl.hidden = true; }, 240);
  }
  backEl && backEl.addEventListener('click', closeSheet);
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') closeSheet();
  });

  /* ---------- 7. FAB ---------- */
  var fabMount = document.getElementById('fab-mount');
  function fab(opts){
    if (!fabMount) return;
    fabMount.innerHTML = '';
    if (!opts) return;
    opts = opts || {};
    var b = document.createElement('button');
    b.className = 'fab' + (opts.variant === 'rose' ? ' fab--rose' : '');
    b.setAttribute('aria-label', opts.label || 'Action');
    if (opts.icon) b.innerHTML = opts.icon;
    b.addEventListener('click', opts.onClick || function(){});
    fabMount.appendChild(b);
  }

  /* ---------- 8. Hook into render cycle ---------- */
  if (app && 'MutationObserver' in window) {
    var mo = new MutationObserver(function(){
      requestAnimationFrame(function(){
        wireSyncChip();
        scrollActiveTab();
        greet();
        stickyHeader();
      });
    });
    mo.observe(app, {childList:true, subtree:false});
    if (topbar) mo.observe(topbar, {childList:true, subtree:true, characterData:true});
  }

  /* ---------- 9. Run once after boot loader ---------- */
  window.addEventListener('load', function(){
    setTimeout(function(){
      wireSyncChip();
      scrollActiveTab();
      greet();
      stickyHeader();
    }, 280); // boot = 200ms, then first render
  });

  /* ---------- 10. Public API ---------- */
  window.MC = window.MC || {};
  MC.uiMobile = {
    greet: greet,
    stickyHeader: stickyHeader,
    removeSticky: removeSticky,
    sheet: { open: openSheet, close: closeSheet },
    fab: fab,
    refresh: sync
  };
})();