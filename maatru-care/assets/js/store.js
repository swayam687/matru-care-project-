/* ============================================================
   store.js — persistence, session, authentication, lockout
   ============================================================ */
(function (MC) {
  'use strict';

  const U = MC.util;
  const C = MC.config;

  const store = {
    db: null,

    /* ---------- database ---------- */
    load(){
      try {
        const raw = localStorage.getItem(C.DB_KEY);
        this.db = raw ? JSON.parse(raw) : null;
      } catch (e) {
        this.db = null;
      }
      if (!this.db) {
        this.db = MC.seed();
        this.save();
      }
      return this.db;
    },

    save(){
      try { localStorage.setItem(C.DB_KEY, JSON.stringify(this.db)); }
      catch (e) { /* quota / private mode — fail silently */ }
    },

    reset(){
      try { localStorage.removeItem(C.DB_KEY); } catch (e) {}
      this.db = MC.seed();
      this.save();
    },

    /* ---------- lookups ---------- */
    woman(id){
      return (this.db.women || []).find(w => w.id === id) || null;
    },

    asha(id){
      return (this.db.asha || []).find(a => a.id === id) || null;
    },

    /* FIXED: both sides normalised before comparison */
    womanByPatientId(pid){
      const want = U.normId(pid);
      return (this.db.women || []).find(w =>
        U.normId(w.patientId) === want
      ) || null;
    },

    ashaByWorkerId(wid){
      const want = U.normId(wid);
      return (this.db.asha || []).find(a =>
        U.normId(a.workerId) === want
      ) || null;
    },

    /* ---------- session ---------- */
    session: {
      get(){
        try {
          const raw = sessionStorage.getItem(C.SESSION_KEY);
          return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
      },

      set(role, id){
        const s = { role, id, issuedAt: Date.now(), lastSeen: Date.now() };
        try { sessionStorage.setItem(C.SESSION_KEY, JSON.stringify(s)); } catch (e) {}
        return s;
      },

      clear(){
        try { sessionStorage.removeItem(C.SESSION_KEY); } catch (e) {}
      },

      touch(){
        const s = this.get();
        if (!s) return null;
        s.lastSeen = Date.now();
        try { sessionStorage.setItem(C.SESSION_KEY, JSON.stringify(s)); } catch (e) {}
        return s;
      },

      /** Returns { ok, reason, msLeft } */
      check(){
        const s = this.get();
        if (!s) return { ok: false, reason: 'none' };
        const ttl = C.TTL[s.role] || C.TTL.woman;
        const idle = Date.now() - (s.lastSeen || s.issuedAt);
        const age  = Date.now() - s.issuedAt;
        const left = Math.min(ttl - idle, ttl - age);
        if (left <= 0) return { ok: false, reason: 'expired' };
        return { ok: true, msLeft: left, session: s };
      }
    },

    /* ---------- login attempts / lockout ---------- */
    attempts: {
      all(){
        try {
          const raw = localStorage.getItem(C.ATTEMPT_KEY);
          return raw ? JSON.parse(raw) : {};
        } catch (e) { return {}; }
      },
      save(o){
        try { localStorage.setItem(C.ATTEMPT_KEY, JSON.stringify(o)); } catch (e) {}
      },
      lockedFor(key){
        const a = this.all()[key];
        if (!a || !a.until) return 0;
        const left = a.until - Date.now();
        if (left <= 0) { this.clear(key); return 0; }
        return left;
      },
      record(key){
        const all = this.all();
        const rec = all[key] || { count: 0, until: 0 };
        rec.count += 1;
        if (rec.count >= C.MAX_ATTEMPTS) {
          rec.until = Date.now() + C.LOCKOUT_MS;
          rec.count = 0;
        }
        all[key] = rec;
        this.save(all);
        return rec;
      },
      clear(key){
        const all = this.all();
        if (all[key]) { delete all[key]; this.save(all); }
      }
    },

    /* ---------- high-level auth ---------- */
    loginWoman(patientId, mobileLast4){
      const pidKey = 'w:' + U.normId(patientId);

      const locked = this.attempts.lockedFor(pidKey);
      if (locked) {
        return { ok:false, lockedMs:locked,
          error:'Too many failed attempts. Try again in ' +
                U.humanMs(locked) + '.' };
      }

      const woman = this.womanByPatientId(patientId);
      const code  = U.normCode(mobileLast4, 4);

      if (!woman || !code) {
        this.attempts.record(pidKey);
        return { ok:false, error:'Patient ID or mobile digits are incorrect.' };
      }

      const expected = String(woman.phone || '').replace(/\D/g, '').slice(-4);
      if (code !== expected) {
        this.attempts.record(pidKey);
        return { ok:false, error:'Patient ID or mobile digits are incorrect.' };
      }

      this.attempts.clear(pidKey);
      const session = this.session.set('woman', woman.id);
      return { ok:true, session };
    },

    loginAsha(workerId, pin){
      const key = 'a:' + U.normId(workerId);

      const locked = this.attempts.lockedFor(key);
      if (locked) {
        return { ok:false, lockedMs:locked,
          error:'Too many failed attempts. Try again in ' +
                U.humanMs(locked) + '.' };
      }

      const asha = this.ashaByWorkerId(workerId);
      if (!asha || String(pin) !== String(asha.pin)) {
        this.attempts.record(key);
        return { ok:false, error:'Worker ID or PIN is incorrect.' };
      }

      this.attempts.clear(key);
      const session = this.session.set('asha', asha.id);
      return { ok:true, session };
    }
  };

  MC.store = store;

})(window.MC = window.MC || {});