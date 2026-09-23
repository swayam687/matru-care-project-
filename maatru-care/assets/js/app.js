/* ============================================================
   app.js — router, events, session, offline banner, boot
   ============================================================ */
(function (MC) {
  'use strict';

  const U  = MC.util;
  const UI = MC.ui;
  const S  = MC.store;
  const I  = UI.ICON;
  const t  = function (k) { return MC.i18n.t(k); };

  const state = {
    screen:   'landing',
    langScreen: null,
    ashaTab:  'home',
    womanTab: 'home',
    womanView: null,
    wid:      null,
    tab:      'overview',
    expandId: null,
    expand:   {},
    patientFilter: { q: '', chip: 'all' }
  };

  let idleTimer  = null;
  let lastWarned = false;
  let booted     = false;

  /* ---------- offline banner ---------- */
  function renderOfflineBanner(){
    let el = document.getElementById('offline-banner');
    if (!el) {
      el = document.createElement('div');
      el.id = 'offline-banner';
      el.className = 'offline-banner';
      document.body.appendChild(el);
    }
    if (navigator.onLine) {
      el.classList.remove('is-on');
    } else {
      el.innerHTML = I.wifiOff + ' <span>' + U.esc(t('offline.banner')) + '</span>';
      el.classList.add('is-on');
    }
  }
  window.addEventListener('online',  renderOfflineBanner);
  window.addEventListener('offline', renderOfflineBanner);

  /* ---------- boot loader ---------- */
  function showBootLoader(){
    if (booted) return;
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = '<div class="boot-loader">' +
        '<div class="boot-loader__spinner"></div>' +
        '<div class="boot-loader__text">' + U.esc(t('common.loading')) + '</div>' +
      '</div>';
    }
  }

  /* ---------- offline sync simulation ---------- */
  const sync = {
    state: 'synced',
    pending: 0,
    _t1: null, _t2: null,
    markDirty(){
      this.state = 'saved';
      this.pending++;
      renderSyncChip();
      clearTimeout(this._t1);
      this._t1 = setTimeout(() => {
        this.state = 'syncing';
        renderSyncChip();
        clearTimeout(this._t2);
        this._t2 = setTimeout(() => {
          this.state = 'synced';
          this.pending = 0;
          renderSyncChip();
        }, 1400);
      }, 1800);
    }
  };
  MC.sync = sync;

  /* ---------- render ---------- */
  function render(){
    renderTopbar();
    renderAppNav();
    document.getElementById('app').innerHTML = viewHTML();
    renderSyncChip();
    renderOfflineBanner();
    booted = true;
  }

  function renderTopbar(){
    const bar = document.getElementById('topbar');
    const s   = S.session.check();
    if (!s.ok || state.langScreen) { bar.innerHTML = ''; return; }

    const isAsha = s.session.role === 'asha';
    const person = isAsha ? S.asha(s.session.id) : S.woman(s.session.id);
    if (!person) { bar.innerHTML = ''; return; }

    bar.innerHTML = '<div class="topbar">' +
      '<div class="brand">' +
        '<span class="brand__mark">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"' +
          ' stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>' +
        '</span>' +
        '<span class="brand__text">' +
          '<span class="brand__name">' + U.esc(t('app.name')) + '</span>' +
          '<span class="brand__sub">' + U.esc(t('app.sub')) + '</span>' +
        '</span>' +
      '</div>' +
      '<div class="topbar__spacer"></div>' +
      '<div id="sync-chip-slot"></div>' +
      '<div class="session">' +
        '<span class="session__avatar">' + U.esc(U.initials(person.name)) + '</span>' +
        '<span class="session__meta">' +
          '<span class="session__name">' + U.esc(person.name) + '</span>' +
          '<span class="session__role">' +
            (isAsha ? 'ASHA Worker' : 'Patient') + '</span>' +
        '</span>' +
        '<button class="session__out" data-act="logout"' +
          ' aria-label="Sign out">' + I.out + '</button>' +
      '</div>' +
    '</div>';
  }

  function renderSyncChip(){
    const slot = document.getElementById('sync-chip-slot');
    if (!slot) return;
    const st = sync.state;
    const label = st === 'saved'   ? t('offline.saved')
                : st === 'syncing' ? t('offline.syncing')
                : t('offline.synced');
    const icon  = st === 'saved'   ? '●'
                : st === 'syncing' ? '↻'
                : '✓';
    slot.innerHTML = '<span class="sync-chip sync-chip--' + st + '" ' +
      'title="' + (sync.pending ? sync.pending + ' ' + t('offline.queue') : '') + '">' +
      '<span class="sync-chip__icon">' + icon + '</span>' +
      '<span class="sync-chip__label">' + U.esc(label) + '</span>' +
    '</span>';
  }

  function renderAppNav(){
    const nav = document.getElementById('appnav');
    const s   = S.session.check();
    if (!s.ok || state.langScreen) {
      nav.innerHTML = '';
      document.body.classList.remove('has-appnav');
      return;
    }
    document.body.classList.add('has-appnav');
    const isAsha = s.session.role === 'asha';

    if (isAsha) {
      const active = state.wid ? 'patients' : state.ashaTab;
      nav.innerHTML = navHTML([
        ['home',     t('nav.home'),     I.home],
        ['patients', t('nav.patients'), I.user],
        ['tasks',    t('nav.tasks'),    I.check],
        ['more',     t('nav.more'),     I.grid]
      ], active, 'nav');
    } else {
      const activeWomanTab = state.womanView === 'detail' ? 'more' : state.womanTab;
      nav.innerHTML = navHTML([
        ['home',   t('woman.tab.home'),   I.home],
        ['visits', t('woman.tab.visits'), I.cal],
        ['care',   t('woman.tab.care'),   I.heart],
        ['more',   t('woman.tab.more'),   I.grid]
      ], activeWomanTab, 'woman-tab');
    }
  }

  function navHTML(items, active, act){
    return '<div class="appnav__inner">' +
      items.map(function (it) {
        return '<button class="appnav__item' +
          (it[0] === active ? ' is-on' : '') + '"' +
          ' data-act="' + act + '" data-tab="' + it[0] + '"' +
          ' aria-label="' + U.esc(it[1]) + '">' +
          it[2] + '<span class="appnav__item__label">' +
          U.esc(it[1]) + '</span></button>';
      }).join('') +
    '</div>';
  }

  function viewHTML(){
    if (state.langScreen) {
      return MC.views.auth.languagePicker(state.langScreen === 'settings');
    }

    const s = S.session.check();
    if (!s.ok) {
      if (!MC.i18n.has()) return MC.views.auth.languagePicker(false);
      if (state.screen === 'woman-login') return MC.views.auth.womanLogin();
      if (state.screen === 'asha-login')  return MC.views.auth.ashaLogin();
      return MC.views.auth.landing();
    }

    if (s.session.role === 'asha') {
      if (state.wid) {
        const w = S.woman(state.wid);
        if (!w) { state.wid = null; return ashaHome(); }
        return MC.views.detail.view(w, true, state);
      }
      return ashaHome();
    }

    /* woman */
    const w = S.woman(s.session.id);
    if (!w) { S.session.clear(); return MC.views.auth.landing(); }
    if (state.womanView === 'detail') {
      return MC.views.detail.view(w, false, state);
    }
    if (state.womanTab === 'visits') return MC.views.woman.visits();
    if (state.womanTab === 'care')   return MC.views.woman.care();
    if (state.womanTab === 'more')   return MC.views.woman.more();
    return MC.views.woman.home();
  }

  function ashaHome(){
    if (state.ashaTab === 'patients') return MC.views.asha.patients();
    if (state.ashaTab === 'tasks')    return MC.views.asha.tasks();
    if (state.ashaTab === 'more')     return MC.views.asha.more();
    return MC.views.asha.today();
  }

  /* ---------- watchdog ---------- */
  function startWatchdog(){
    stopWatchdog();
    idleTimer = setInterval(function () {
      const s = S.session.check();
      if (!s.ok) {
        if (s.reason === 'expired' && S.session.get()) {
          S.session.clear();
          state.wid = null; state.tab = 'overview';
          state.ashaTab = 'home'; state.womanTab = 'home';
          state.womanView = null;
          state.screen = 'landing';
          UI.toast('Session expired — please sign in again.', 'bad');
          render();
        }
        return;
      }
      if (s.msLeft < MC.config.IDLE_WARN_MS && !lastWarned) {
        lastWarned = true;
        UI.toast('Your session will expire in ' + U.humanMs(s.msLeft) + '.', 'info');
      }
      if (s.msLeft > MC.config.IDLE_WARN_MS) lastWarned = false;
    }, 15000);
  }
  function stopWatchdog(){
    if (idleTimer) { clearInterval(idleTimer); idleTimer = null; }
    lastWarned = false;
  }

  /* ---------- click events ---------- */
  document.addEventListener('click', function (e) {
    if (S.session.get()) S.session.touch();

    const el = e.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act;

    if (act === 'open-lang') {
      state.langScreen = 'settings';
      render();
      return;
    }

    if (act === 'set-lang') {
      const lang = el.dataset.lang || el.value;
      if (lang) {
        MC.i18n.set(lang);
        state.langScreen = null;
        render();
      }
      return;
    }

    if (act === 'close-lang') {
      state.langScreen = null;
      render();
      return;
    }

    if (act === 'role') {
      const role = el.dataset.role;
      state.screen = role === 'landing' ? 'landing'
                   : role === 'woman'   ? 'woman-login'
                   : 'asha-login';
      render();
      return;
    }

    if (act === 'logout') {
      S.session.clear();
      stopWatchdog();
      state.screen  = 'landing';
      state.wid     = null;
      state.tab     = 'overview';
      state.ashaTab = 'home';
      state.womanTab= 'home';
      state.womanView = null;
      state.langScreen = null;
      state.expandId = null;
      state.expand  = {};
      state.patientFilter = { q: '', chip: 'all' };
      render();
      UI.toast('Signed out safely.', 'ok');
      return;
    }

    if (act === 'nav') {
      const tab = el.dataset.tab;
      if (['home','patients','tasks','more'].indexOf(tab) !== -1) {
        state.ashaTab = tab;
        state.wid     = null;
        state.expandId = null;
      }
      render();
      return;
    }

    if (act === 'woman-tab') {
      const tab = el.dataset.tab;
      if (['home','visits','care','more'].indexOf(tab) !== -1) {
        state.womanTab = tab;
        state.womanView = null;
      }
      render();
      return;
    }

    if (act === 'woman-view') {
      state.womanView = 'detail';
      state.tab = el.dataset.tab || 'overview';
      state.expandId = null;
      render();
      return;
    }

    if (act === 'woman-ask') {
      UI.toast('DWIT will reply in your language soon.', 'info');
      return;
    }

    if (act === 'call-asha') {
      const phone = el.dataset.phone;
      if (phone) window.location.href = 'tel:' + phone;
      return;
    }

    if (act === 'patient-filter') {
      state.patientFilter.chip = el.dataset.chip;
      render();
      return;
    }

    if (act === 'open') {
      state.wid = el.dataset.id;
      state.tab = 'overview';
      state.expandId = null;
      state.expand = {};
      render();
      return;
    }

    if (act === 'back') {
      if (state.womanView === 'detail') {
        state.womanView = null;
        state.womanTab = 'more';
      } else {
        state.wid = null;
      }
      state.expandId = null;
      render();
      return;
    }

    if (act === 'tab') {
      const oldBar = document.querySelector('.tabs');
      const stripScroll = oldBar ? oldBar.scrollLeft : 0;

      state.tab = el.dataset.tab;
      state.expandId = null;
      render();

      const newBar = document.querySelector('.tabs');
      if (newBar) {
        newBar.scrollLeft = stripScroll;
        const active = newBar.querySelector('.tab.is-on');
        if (active && active.offsetLeft < stripScroll) {
          newBar.scrollLeft = active.offsetLeft - 8;
        } else if (active && (active.offsetLeft + active.offsetWidth) >
                              stripScroll + newBar.clientWidth) {
          newBar.scrollLeft = active.offsetLeft +
                              active.offsetWidth - newBar.clientWidth + 8;
        }
      }
      return;
    }

    if (act === 'expand') {
      const id = el.dataset.item;
      state.expandId = state.expandId === id ? null : id;
      render();
      return;
    }

    if (act === 'toggle') {
      const sess = S.session.check();
      if (!sess.ok || sess.session.role !== 'asha') {
        UI.toast('Only an ASHA worker can update records.', 'bad');
        return;
      }
      const w = S.woman(el.dataset.wid);
      if (!w) return;
      const id = el.dataset.item;
      const ashaName = (S.asha(sess.session.id) || {}).name || 'ASHA';
      if (w.done[id]) delete w.done[id];
      else w.done[id] = { date: U.today(), by: ashaName };
      S.save();
      sync.markDirty();
      render();
      return;
    }

    if (act === 'scan') {
      UI.toast('NFC / QR scanning will be available in the DWIT field build.', 'info');
      return;
    }
    if (act === 'noop') {
      UI.toast('Coming soon.', 'info');
      return;
    }
  });

  /* ---------- change events ---------- */
  document.addEventListener('change', function (e) {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act;

    if (act === 'set-lang' && el.tagName === 'SELECT') {
      MC.i18n.set(el.value);
      render();
      return;
    }

    if (act !== 'hrp' && act !== 'scheme' && act !== 'fp') return;

    const sess = S.session.check();
    if (!sess.ok || sess.session.role !== 'asha') {
      UI.toast('Only an ASHA worker can update records.', 'bad');
      el.checked = !el.checked;
      return;
    }
    const w = S.woman(el.dataset.wid);
    if (!w) return;

    if (act === 'hrp') {
      w.hrp = w.hrp || [];
      const id = el.dataset.hrp;
      const i = w.hrp.indexOf(id);
      if (i === -1) w.hrp.push(id); else w.hrp.splice(i, 1);
    } else {
      const field = act === 'scheme' ? 'schemes' : 'fp';
      const id = el.dataset.scheme || el.dataset.fp;
      w[field] = w[field] || [];
      const i = w[field].indexOf(id);
      if (i === -1) w[field].push(id); else w[field].splice(i, 1);
    }
    S.save();
    sync.markDirty();
    render();
  });

  /* ---------- search input ---------- */
  document.addEventListener('input', function (e) {
    const el = e.target.closest('[data-act="patient-search"]');
    if (!el) return;
    state.patientFilter.q = el.value;
    /* re-render only the list portion */
    const app = document.getElementById('app');
    if (!app) return;
    /* Preserve focus + caret by re-rendering and re-focusing */
    const caret = el.selectionStart;
    const val   = el.value;
    app.innerHTML = viewHTML();
    const next = app.querySelector('[data-act="patient-search"]');
    if (next) {
      next.focus();
      try { next.setSelectionRange(caret, caret); } catch(err) {}
      if (next.value !== val) next.value = val;
    }
  });

  /* ---------- form submits ---------- */
  document.addEventListener('submit', function (e) {
    const form = e.target.closest('form[data-act]');
    if (!form) return;
    e.preventDefault();
    const act = form.dataset.act;

    if (act === 'login-woman') {
      const fd  = new FormData(form);
      const res = S.loginWoman(fd.get('pid'), fd.get('code'));
      const box = form.querySelector('[data-slot="error"]');
      if (!res.ok) {
        box.hidden = false;
        box.innerHTML = I.alert + '<span>' + U.esc(res.error) + '</span>';
        form.querySelector('[name="code"]').value = '';
        form.querySelector('[name="code"]').focus();
        return;
      }
      box.hidden = true;
      state.screen = 'app';
      state.womanTab = 'home';
      state.womanView = null;
      state.tab = 'overview';
      startWatchdog();
      render();
      UI.toast('Signed in.', 'ok');
      return;
    }

    if (act === 'login-asha') {
      const fd  = new FormData(form);
      const res = S.loginAsha(fd.get('wid'), fd.get('pin'));
      const box = form.querySelector('[data-slot="error"]');
      if (!res.ok) {
        box.hidden = false;
        box.innerHTML = I.alert + '<span>' + U.esc(res.error) + '</span>';
        form.querySelector('[name="pin"]').value = '';
        form.querySelector('[name="pin"]').focus();
        return;
      }
      box.hidden = true;
      state.screen = 'app';
      state.wid = null;
      state.ashaTab = 'home';
      state.tab = 'overview';
      startWatchdog();
      render();
      UI.toast('Signed in as ASHA worker.', 'ok');
      return;
    }

    const sess = S.session.check();
    if (!sess.ok || sess.session.role !== 'asha') {
      UI.toast('Only an ASHA worker can update records.', 'bad');
      return;
    }
    const w = S.woman(form.dataset.wid);
    if (!w) return;
    const fd = new FormData(form);
    const ashaName = (S.asha(sess.session.id) || {}).name || 'ASHA';

    if (act === 'saveresult') {
      const id = form.dataset.item;
      w.done[id] = {
        date:  fd.get('date') || U.today(),
        by:    ashaName,
        value: String(fd.get('value') || '').trim(),
        note:  String(fd.get('note') || '').trim()
      };
      state.expandId = null;
      S.save();
      sync.markDirty();
      render();
      UI.toast('Result saved.', 'ok');
      return;
    }

    if (act === 'addbp') {
      const sys = parseInt(fd.get('sys'), 10);
      const dia = parseInt(fd.get('dia'), 10);
      if (!sys || !dia) {
        UI.toast('Systolic and diastolic values are required.', 'bad');
        return;
      }
      w.bp = w.bp || [];
      w.bp.push({
        date:   fd.get('date') || U.today(),
        sys:    sys, dia: dia,
        pulse:  fd.get('pulse')  ? parseInt(fd.get('pulse'), 10) : null,
        weight: fd.get('weight') ? parseFloat(fd.get('weight'))  : null,
        note:   String(fd.get('note') || '').trim()
      });
      w.bp.sort(function (a, b) { return a.date.localeCompare(b.date); });
      S.save();
      sync.markDirty();
      render();
      UI.toast(sys >= 140 || dia >= 90
        ? 'Reading saved — this is in the high range.'
        : 'Reading saved.', sys >= 140 || dia >= 90 ? 'bad' : 'ok');
      return;
    }

    if (act === 'addvisit') {
      const note = String(fd.get('note') || '').trim();
      if (!note) return;
      w.visits = w.visits || [];
      w.visits.push({ date: fd.get('date') || U.today(), note: note, by: ashaName });
      S.save();
      sync.markDirty();
      render();
      UI.toast('Visit logged.', 'ok');
      return;
    }
  });

  /* ---------- boot ---------- */
  function boot(){
    showBootLoader();
    MC.i18n.load();
    S.load();
    const s = S.session.check();
    if (s.ok) {
      state.screen = 'app';
      if (s.session.role === 'asha') state.ashaTab = 'home';
      else state.womanTab = 'home';
      startWatchdog();
    } else {
      S.session.clear();
      state.screen = 'landing';
      if (!MC.i18n.has()) state.langScreen = 'first';
    }
    /* small delay so the skeleton is visible on fast devices */
    setTimeout(function () { render(); }, 200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  MC.app = { render: render, state: state };

})(window.MC = window.MC || {});