/* ============================================================
   seed.js — demo dataset (replace with real data / API)
   ============================================================ */
(function (MC) {
  'use strict';

  const U = MC.util;

  function done(pairs){
    const o = {};
    pairs.forEach(function (p) {
      o[p[0]] = { date: U.daysAgo(p[1]), by: 'Kavita Singh' };
      if (p[2]) o[p[0]].value = p[2];
    });
    return o;
  }

  MC.seed = function seed(){

    const asha = [{
      id: 'a1', workerId: 'ASHA-001', pin: '1234',
      name: 'Kavita Singh', phone: '98765 43210',
      block: 'Rampur Block', phc: 'PHC Rampur'
    }];

    /* ---------------- 1. Sunita Devi ---------------- */
    const w1 = {
      id: 'w1', patientId: 'MC-RMP-0001', name: 'Sunita Devi',
      age: 26, phone: '90000 11111',
      address: 'H.No. 42, Ward 3, Near Handpump',
      village: 'Rampur', pincode: '244901',
      husband: 'Ramesh Kumar', bloodGroup: 'B+',
      lmp: U.daysAgo(210), previousDelivery: null, ashaId: 'a1',
      risk: [], hrp: ['hrp_primigravida'], schemes: ['jssk'], fp: [],
      children: [],
      bp: [
        { date: U.daysAgo(126), sys:112, dia:72, pulse:78, weight:48, note:'1st ANC' },
        { date: U.daysAgo(70),  sys:118, dia:76, pulse:82, weight:53, note:'2nd ANC' },
        { date: U.daysAgo(14),  sys:124, dia:80, pulse:84, weight:57, note:'3rd ANC — mild swelling' }
      ],
      medicines: [
        { name: 'IFA (Iron + Folic Acid)', dose: '1 tablet', timing: 'After dinner',
          purpose: 'Prevents anaemia', note: 'Continue until 6 months after delivery' },
        { name: 'Calcium', dose: '1 tablet', timing: 'After breakfast',
          purpose: 'Baby\'s bones & teeth', note: 'Take 2 hours apart from IFA' },
        { name: 'Albendazole 400 mg', dose: '1 tablet', timing: 'Single dose',
          purpose: 'Deworming' }
      ],
      visits: [
        { date: U.daysAgo(126), by:'Kavita Singh',
          note:'First home visit. Pregnancy registered, IFA tablets given.' },
        { date: U.daysAgo(70),  by:'Kavita Singh',
          note:'Explained danger signs. Advised USG-2 at CHC.' },
        { date: U.daysAgo(14),  by:'Kavita Singh',
          note:'BP slightly elevated. Advised rest, reduced salt. Review in 2 weeks.' }
      ],
      nextVisit: { date: U.today(), time: '09:30', type: 'ANC follow-up',
                   note: 'BP check + 3rd trimester advice', at: 'Home' },
      referrals: [],
      followUps: [
        { id: 'fu1', due: U.today(), reason: 'Confirm BP is stable',
          type: 'Check-up', done: false }
      ],
      done: done([
        ['td1',195], ['td2',165],
        ['anc1',126], ['anc2',70], ['anc3',14],
        ['hb1',190,'10.8 g/dL'], ['bg',190,'B+'], ['hiv',190,'Non-reactive'],
        ['vdrl',190,'Non-reactive'], ['hbsag',190,'Negative'],
        ['urine',190,'Normal'], ['tsh',190,'2.1 mIU/L'],
        ['malaria',190,'Negative'], ['sugar',42,'92 mg/dL'],
        ['usg1',190,'Single live fetus'], ['usg2',77,'Normal anatomy'],
        ['hb2',56,'10.2 g/dL']
      ])
    };

    /* ---------------- 2. Rekha Kumari ---------------- */
    const w2 = {
      id: 'w2', patientId: 'MC-RMP-0002', name: 'Rekha Kumari',
      age: 22, phone: '90000 22222',
      address: 'Behind Govt. School, Lane 2',
      village: 'Rampur', pincode: '244901',
      husband: 'Ajay Kumar', bloodGroup: 'O+',
      lmp: U.daysAgo(70), previousDelivery: null, ashaId: 'a1',
      risk: [], hrp: [], schemes: ['jssk', 'pmmvy'], fp: [],
      children: [],
      bp: [
        { date: U.daysAgo(56), sys:108, dia:68, pulse:76, weight:45, note:'Registration visit' }
      ],
      medicines: [
        { name: 'IFA (Iron + Folic Acid)', dose: '1 tablet', timing: 'After dinner',
          purpose: 'Prevents anaemia' },
        { name: 'Calcium', dose: '1 tablet', timing: 'After breakfast',
          purpose: 'Baby\'s bones & teeth' },
        { name: 'Folic acid 5 mg', dose: '1 tablet', timing: 'Morning',
          purpose: 'Prevents birth defects' }
      ],
      visits: [
        { date: U.daysAgo(56), by:'Kavita Singh',
          note:'Pregnancy confirmed. Td-1 given. IFA + calcium started.' }
      ],
      nextVisit: { date: U.today(), time: '11:00', type: 'ANC visit',
                   note: 'Td-2 + 1st trimester tests', at: 'Home' },
      referrals: [], followUps: [],
      done: done([['td1',56]])
    };

    /* ---------------- 3. Priya Yadav ---------------- */
    const w3 = {
      id: 'w3', patientId: 'MC-RMP-0003', name: 'Priya Yadav',
      age: 30, phone: '90000 33333',
      address: 'Plot 7, Yadav Mohalla, Main Road',
      village: 'Rampur', pincode: '244901',
      husband: 'Suresh Yadav', bloodGroup: 'A+',
      lmp: U.daysAgo(238), previousDelivery: U.daysAgo(1825), ashaId: 'a1',
      risk: [], hrp: ['hrp_prev_cs', 'hrp_grand_multi'],
      schemes: ['jsy', 'jssk'], fp: ['ppiucd'],
      children: [{ id:'c1', name:'Aarav Yadav', dob: U.daysAgo(1825), gender:'M' }],
      bp: [
        { date: U.daysAgo(154), sys:110, dia:70, pulse:80, weight:52, note:'ANC-1' },
        { date: U.daysAgo(98),  sys:114, dia:74, pulse:84, weight:56, note:'ANC-2' },
        { date: U.daysAgo(42),  sys:116, dia:76, pulse:82, weight:60, note:'ANC-3' }
      ],
      medicines: [
        { name: 'IFA (Iron + Folic Acid)', dose: '1 tablet', timing: 'After dinner',
          purpose: 'Prevents anaemia' },
        { name: 'Calcium', dose: '1 tablet', timing: 'After breakfast',
          purpose: 'Baby\'s bones & teeth' },
        { name: 'Tab Metformin 500 mg', dose: '1 tablet twice daily',
          timing: 'After meals', purpose: 'Controls blood sugar (GDM)',
          note: 'Continued from previous pregnancy' }
      ],
      visits: [
        { date: U.daysAgo(154), by:'Kavita Singh', note:'Td-2 given. IFA continued.' },
        { date: U.daysAgo(42),  by:'Kavita Singh',
          note:'Td booster due — 2 Td doses within 3 years. Explained to family.' }
      ],
      nextVisit: { date: U.addDays(U.today(), 1), time: '10:00', type: 'ANC visit',
                   note: 'Td booster due this week', at: 'Home' },
      referrals: [
        { id: 'r1', date: U.daysAgo(3), to: 'PHC Rampur',
          address: 'PHC Rampur, Main Road, Rampur 244901',
          reason: 'Growth scan review', type: 'Scan', status: 'pending' }
      ],
      followUps: [
        { id: 'fu2', due: U.daysAgo(1), reason: 'Post-referral check',
          type: 'Check-up', done: false }
      ],
      done: (function () {
        const d = done([
          ['td1',224], ['td2',196], ['tdb',42],
          ['anc1',154], ['anc2',98], ['anc3',42],
          ['hb1',224,'11.2 g/dL'], ['bg',224,'A+'], ['hiv',224,'Non-reactive'],
          ['vdrl',224,'Non-reactive'], ['hbsag',224,'Negative'],
          ['urine',224,'Normal'], ['tsh',224,'1.8 mIU/L'],
          ['malaria',224,'Negative'], ['sugar',70,'88 mg/dL'],
          ['usg1',224,'Normal'], ['usg2',140,'Normal'], ['usg3',28,'Growth normal'],
          ['hb2',98,'10.9 g/dL'], ['hb3',14,'10.4 g/dL']
        ]);
        MC.CHILD_SCHEDULE.forEach(function (v) {
          if (v.age <= 480) {
            d['c1_' + v.key] = {
              date: U.addDays(U.daysAgo(1825), v.age + 3),
              by: 'Kavita Singh'
            };
          }
        });
        return d;
      })()
    };

    /* ---------------- 4. Anita Sharma ---------------- */
    const w4 = {
      id: 'w4', patientId: 'MC-RMP-0004', name: 'Anita Sharma',
      age: 24, phone: '90000 44444',
      address: 'Ward 6, Near Temple',
      village: 'Rampur', pincode: '244901',
      husband: 'Vikash Sharma', bloodGroup: 'AB+',
      lmp: U.daysAgo(285), previousDelivery: null, ashaId: 'a1',
      risk: [], hrp: [], schemes: ['jsy', 'jssk', 'pmmvy'], fp: ['lam'],
      children: [{ id:'c2', name:'Baby Sharma', dob: U.daysAgo(5), gender:'F' }],
      bp: [
        { date: U.daysAgo(200), sys:110, dia:70, pulse:78, weight:50, note:'ANC-1' },
        { date: U.daysAgo(140), sys:114, dia:72, pulse:80, weight:55, note:'ANC-2' },
        { date: U.daysAgo(85),  sys:118, dia:76, pulse:82, weight:60, note:'ANC-3' },
        { date: U.daysAgo(30),  sys:122, dia:78, pulse:84, weight:64, note:'ANC-4' },
        { date: U.daysAgo(5),   sys:118, dia:76, pulse:80, weight:62, note:'Post-delivery check' }
      ],
      medicines: [
        { name: 'IFA (Iron + Folic Acid)', dose: '1 tablet', timing: 'After dinner',
          purpose: 'Prevents anaemia', note: 'Postpartum — continue for 6 months' },
        { name: 'Calcium', dose: '1 tablet', timing: 'After breakfast',
          purpose: 'Bones & teeth' },
        { name: 'Vitamin A', dose: '1 dose', timing: 'Single dose',
          purpose: 'Boosts immunity', note: 'Given within 8 weeks of delivery' }
      ],
      visits: [
        { date: U.daysAgo(5), by:'Kavita Singh',
          note:'Delivered at CHC — baby girl, 2.9 kg. Birth doses given. Both stable.' }
      ],
      nextVisit: { date: U.today(), time: '14:00', type: 'PNC visit',
                   note: 'Newborn weight + mother BP', at: 'Home' },
      referrals: [],
      followUps: [
        { id: 'fu3', due: U.today(), reason: 'Newborn weight check',
          type: 'Check-up', done: false }
      ],
      done: done([
        ['td1',270], ['td2',240],
        ['anc1',200], ['anc2',140], ['anc3',85], ['anc4',30],
        ['hb1',270,'10.4 g/dL'], ['bg',270,'AB+'], ['hiv',270,'Non-reactive'],
        ['vdrl',270,'Non-reactive'], ['hbsag',270,'Negative'],
        ['urine',270,'Normal'], ['tsh',270,'2.4 mIU/L'],
        ['malaria',270,'Negative'], ['sugar',130,'90 mg/dL'],
        ['usg1',270,'Normal'], ['usg2',180,'Normal'], ['usg3',60,'Normal'],
        ['hb2',140,'10.1 g/dL'], ['hb3',60,'9.8 g/dL'],
        ['c2_bcg',5], ['c2_opv0',5], ['c2_hepb0',5]
      ])
    };

    return { asha: asha, women: [w1, w2, w3, w4] };
  };
})(window.MC = window.MC || {});