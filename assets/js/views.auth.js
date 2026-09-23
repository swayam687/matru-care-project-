/* ============================================================
   views.auth.js — login screens + language picker
   ============================================================ */
(function (MC) {
  'use strict';

  const U = MC.util;
  const I = MC.ui.ICON;
  const t = function (k) { return MC.i18n.t(k); };

  function brandMark(){
    return '<span class="brand__mark">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
      ' stroke-linecap="round" stroke-linejoin="round" style="color:#fff">' +
      '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>' +
      '</svg></span>';
  }

  function aside(){
    return '<aside class="auth__aside">' +
      '<div class="auth__brand">' + brandMark() +
        '<div><div class="auth__brandname">' + U.esc(t('app.name')) + '</div>' +
        '<div class="auth__brandsub">' + U.esc(t('app.sub')) + '</div></div>' +
      '</div>' +
      '<div class="auth__hero">' +
        '<h1>Every mother tracked.<br>Every dose on time.</h1>' +
        '<p>A single record shared between the ASHA worker and the family — ' +
        'ANC checkups, Td doses, child immunisation, lab tests and BP, all in one place.</p>' +
        '<ul class="auth__points">' +
          '<li><span class="tick">' + I.check + '</span>' +
            'Automatic due-date reminders from LMP and date of birth</li>' +
          '<li><span class="tick">' + I.check + '</span>' +
            'Td booster flagged automatically within 3 years</li>' +
          '<li><span class="tick">' + I.check + '</span>' +
            'BP trend with high-reading alerts for early referral</li>' +
          '<li><span class="tick">' + I.check + '</span>' +
            'Records update live — the family sees what the ASHA records</li>' +
        '</ul>' +
      '</div>' +
      '<div class="auth__aside-foot">' +
        'For use by registered ASHA workers and enrolled beneficiaries only. ' +
        'All access is logged.' +
      '</div>' +
    '</aside>';
  }

  function langPill(){
    const opts = MC.i18n.options();
    return '<div class="lang-pill">' +
      '<span class="lang-pill__icon">' + I.globe + '</span>' +
      '<select data-act="set-lang" aria-label="Language" ' +
        'class="lang-pill__select">' +
        opts.map(function (o) {
          return '<option value="' + o.code + '"' +
            (o.code === MC.i18n.lang ? ' selected' : '') + '>' +
            U.esc(o.label) + '</option>';
        }).join('') +
      '</select>' +
    '</div>';
  }

  function languagePicker(showCancel){
    const opts = MC.i18n.options();
    return '<div class="langpicker">' +
      '<div class="langpicker__card">' +
        '<div class="langpicker__brand">' + brandMark() +
          '<span class="auth__brandname" style="color:#fff">' +
            U.esc('Maatru Care') + '</span>' +
        '</div>' +
        '<h1 class="langpicker__title">Choose your language</h1>' +
        '<p class="langpicker__sub">आपली भाषा निवडा · अपनी भाषा चुनें</p>' +
        '<div class="langpicker__opts">' +
          opts.map(function (o) {
            return '<button class="langpicker__opt" data-act="set-lang" ' +
              'data-lang="' + o.code + '">' + U.esc(o.label) + '</button>';
          }).join('') +
        '</div>' +
        (showCancel
          ? '<button class="btn btn--ghost btn--block" ' +
            'style="margin-top:18px" data-act="close-lang">Cancel</button>'
          : '') +
        '<div class="langpicker__note">You can change this later from Settings.</div>' +
      '</div>' +
    '</div>';
  }

  function landing(){
    return '<div class="auth">' + aside() +
      '<main class="auth__panel"><div class="auth__card">' +
        langPill() +
        '<div class="auth__card-head">' +
          '<h2>' + U.esc(t('auth.signin')) + '</h2>' +
          '<p>' + U.esc(t('auth.choose')) + '</p>' +
        '</div>' +

        '<button class="pickrow" data-act="role" data-role="woman" ' +
          'style="display:flex;align-items:center;gap:14px;width:100%;' +
          'background:var(--surface);border:1px solid var(--line-strong);' +
          'border-radius:var(--r-md);padding:16px;text-align:left;' +
          'box-shadow:var(--sh-xs);margin-bottom:12px">' +
          '<span class="session__avatar" style="background:var(--rose-50);' +
            'color:var(--rose-700);width:42px;height:42px;font-size:17px">' +
            I.user + '</span>' +
          '<span style="flex:1">' +
            '<b style="display:block;font-size:14.5px;color:var(--ink-900)">' +
              U.esc(t('auth.woman')) + '</b>' +
            '<span class="u-small u-muted">' + U.esc(t('auth.woman.sub')) + '</span>' +
          '</span>' +
        '</button>' +

        '<button class="pickrow" data-act="role" data-role="asha" ' +
          'style="display:flex;align-items:center;gap:14px;width:100%;' +
          'background:var(--surface);border:1px solid var(--line-strong);' +
          'border-radius:var(--r-md);padding:16px;text-align:left;' +
          'box-shadow:var(--sh-xs)">' +
          '<span class="session__avatar" style="background:var(--brand-50);' +
            'color:var(--brand-800);width:42px;height:42px;font-size:17px">' +
            I.shield + '</span>' +
          '<span style="flex:1">' +
            '<b style="display:block;font-size:14.5px;color:var(--ink-900)">' +
              U.esc(t('auth.asha')) + '</b>' +
            '<span class="u-small u-muted">' + U.esc(t('auth.asha.sub')) + '</span>' +
          '</span>' +
        '</button>' +

        '<div class="auth__legal">Protected health information. ' +
          'Do not share credentials.</div>' +
      '</div></main></div>';
  }

  function womanLogin(){
    return '<div class="auth">' + aside() +
      '<main class="auth__panel"><div class="auth__card">' +
        langPill() +
        '<button class="auth-back" data-act="role" data-role="landing">' +
          I.back + ' ' + U.esc(t('auth.back')) + '</button>' +
        '<div class="auth__card-head">' +
          '<h2>' + U.esc(t('auth.woman')) + '</h2>' +
          '<p>Enter the Patient ID given to you by your ASHA worker, ' +
          'then the last 4 digits of your registered mobile number.</p>' +
        '</div>' +
        '<form class="auth-form" data-act="login-woman" novalidate>' +
          '<div class="form__error" data-slot="error" hidden></div>' +
          '<label class="field">' +
            '<span class="field__label">Patient ID</span>' +
            '<span class="field__wrap">' + I.id +
              '<input class="input--lg" name="pid" type="text"' +
              ' placeholder="MC-RMP-0001" autocomplete="off"' +
              ' autocapitalize="characters" spellcheck="false" required>' +
            '</span>' +
            '<span class="field__hint">Format: MC-XXX-0000</span>' +
          '</label>' +
          '<label class="field">' +
            '<span class="field__label">Mobile number — last 4 digits</span>' +
            '<span class="field__wrap">' + I.phone +
              '<input class="input--code" name="code" type="tel"' +
              ' inputmode="numeric" maxlength="4" placeholder="••••"' +
              ' autocomplete="off" required>' +
            '</span>' +
            '<span class="field__hint">Used only to verify your identity.</span>' +
          '</label>' +
          '<button class="btn btn--block auth-submit" type="submit">' +
            I.lock + ' ' + U.esc(t('auth.signin')) + '</button>' +
        '</form>' +
        '<div class="auth__switch">' +
          U.esc(t('auth.asha')) + '? ' +
          '<button data-act="role" data-role="asha">' +
            U.esc(t('auth.signin')) + '</button>' +
        '</div>' +
        demoBox('woman') +
      '</div></main></div>';
  }

  function ashaLogin(){
    return '<div class="auth">' + aside() +
      '<main class="auth__panel"><div class="auth__card">' +
        langPill() +
        '<button class="auth-back" data-act="role" data-role="landing">' +
          I.back + ' ' + U.esc(t('auth.back')) + '</button>' +
        '<div class="auth__card-head">' +
          '<h2>' + U.esc(t('auth.asha')) + '</h2>' +
          '<p>Use the Worker ID and PIN issued by your PHC supervisor.</p>' +
        '</div>' +
        '<form class="auth-form" data-act="login-asha" novalidate>' +
          '<div class="form__error" data-slot="error" hidden></div>' +
          '<label class="field">' +
            '<span class="field__label">Worker ID</span>' +
            '<span class="field__wrap">' + I.shield +
              '<input class="input--lg" name="wid" type="text"' +
              ' placeholder="ASHA-001" autocomplete="off"' +
              ' autocapitalize="characters" spellcheck="false" required>' +
            '</span>' +
          '</label>' +
          '<label class="field">' +
            '<span class="field__label">PIN</span>' +
            '<span class="field__wrap">' + I.lock +
              '<input class="input--code" name="pin" type="password"' +
              ' inputmode="numeric" maxlength="6" placeholder="••••"' +
              ' autocomplete="off" required>' +
            '</span>' +
          '</label>' +
          '<button class="btn btn--block auth-submit" type="submit">' +
            I.lock + ' ' + U.esc(t('auth.signin')) + '</button>' +
        '</form>' +
        '<div class="auth__switch" style="margin-top:14px;font-size:12.5px;color:var(--ink-500)">' +
          U.esc(t('auth.pin.forgot')) +
        '</div>' +
        '<div class="auth__switch">' +
          U.esc(t('auth.woman')) + '? ' +
          '<button data-act="role" data-role="woman">' +
            U.esc(t('auth.signin')) + '</button>' +
        '</div>' +
        demoBox('asha') +
      '</div></main></div>';
  }

  function demoBox(kind){
    if (!MC.config.SHOW_DEMO) return '';
    const db = MC.store.db;
    let rows = '';
    if (kind === 'woman') {
      rows = db.women.map(function (w) {
        return '<div class="demo__row">' +
          '<span class="demo__name">' + U.esc(w.name) + '</span>' +
          '<span class="demo__cred">' + U.esc(w.patientId) + ' · ' +
            String(w.phone).replace(/\D/g, '').slice(-4) + '</span>' +
        '</div>';
      }).join('');
    } else {
      rows = db.asha.map(function (a) {
        return '<div class="demo__row">' +
          '<span class="demo__name">' + U.esc(a.name) + '</span>' +
          '<span class="demo__cred">' + U.esc(a.workerId) + ' · ' +
            U.esc(a.pin) + '</span>' +
        '</div>';
      }).join('');
    }
    return '<details class="demo demo--prominent">' +
      '<summary>' + I.info + ' ' + U.esc(t('auth.demo.title')) + '</summary>' +
      '<div class="demo__body">' + rows +
        '<div class="demo__note">' + U.esc(t('auth.demo.note')) + '</div>' +
      '</div></details>';
  }

  MC.views = MC.views || {};
  MC.views.auth = {
    landing: landing,
    womanLogin: womanLogin,
    ashaLogin: ashaLogin,
    languagePicker: languagePicker
  };
})(window.MC = window.MC || {});