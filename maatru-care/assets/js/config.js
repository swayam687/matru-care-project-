/* ============================================================
   config.js — constants, policy, schedules, HRP, schemes
   ============================================================ */
(function (MC) {
  'use strict';

  MC.config = {
    APP_NAME: 'Maatru Care',
    DB_KEY:      'mc_db_v7',
    SESSION_KEY: 'mc_session_v7',
    ATTEMPT_KEY: 'mc_attempts_v7',

    TTL: { asha: 30 * 60 * 1000, woman: 15 * 60 * 1000 },
    IDLE_WARN_MS: 60 * 1000,

    MAX_ATTEMPTS: 5,
    LOCKOUT_MS: 5 * 60 * 1000,

    /* demo credentials box shown in login */
    SHOW_DEMO: true
  };

  /* ---------- mom: Td schedule (NHM) ---------- */
  MC.MOM_DEFS = [
    { id:'td1', label:'Td-1', note:'Tetanus-diphtheria — early pregnancy', at:14 },
    { id:'td2', label:'Td-2', note:'4 weeks after Td-1',                   at:42 }
  ];

  MC.BOOSTER_WINDOW_DAYS = 3 * 365;

  MC.TDAP_DEF = {
    id:'tdap',
    label:'Tdap (optional)',
    note:'27–36 weeks — protects newborn from pertussis',
    at:196,
    optional: true
  };

  MC.ANC_DEFS = [
    { id:'anc1', label:'ANC Checkup 1', note:'Before 12 weeks',   at:84  },
    { id:'anc2', label:'ANC Checkup 2', note:'14–20 weeks',       at:140 },
    { id:'anc3', label:'ANC Checkup 3', note:'28–32 weeks',       at:196 },
    { id:'anc4', label:'ANC Checkup 4', note:'36 weeks onwards',  at:252 }
  ];

  MC.TEST_DEFS = [
    { id:'hb1',   label:'Haemoglobin / CBC — 1st trimester', at:84,
      note:'Anaemia screening' },
    { id:'hb2',   label:'Haemoglobin — 2nd trimester',       at:168,
      note:'Re-check at 24–28 weeks' },
    { id:'hb3',   label:'Haemoglobin — 3rd trimester',       at:224,
      note:'Re-check at 32–36 weeks' },
    { id:'bg',    label:'Blood group & Rh',         at:84,  note:'' },
    { id:'hiv',   label:'HIV test',                 at:84,  note:'' },
    { id:'vdrl',  label:'VDRL (Syphilis)',          at:84,  note:'' },
    { id:'hbsag', label:'HBsAg (Hepatitis B)',      at:84,  note:'' },
    { id:'urine', label:'Urine routine',            at:84,  note:'' },
    { id:'tsh',   label:'Thyroid (TSH)',            at:84,  note:'' },
    { id:'malaria', label:'Rapid Malaria Test',     at:84,
      note:'Endemic areas only' },
    { id:'sugar', label:'Blood sugar / GDM screen', at:168,
      note:'24–28 weeks' },
    { id:'usg1',  label:'Ultrasound 1 (dating/NT)', at:84,
      note:'11–13 weeks' },
    { id:'usg2',  label:'Ultrasound 2 (anomaly)',   at:133,
      note:'18–20 weeks' },
    { id:'usg3',  label:'Ultrasound 3 (growth)',    at:224,
      note:'28–32 weeks' }
  ];

  MC.CHILD_SCHEDULE = [
    { key:'bcg',    label:'BCG',                 age:0,    ageLabel:'At birth' },
    { key:'opv0',   label:'OPV-0',               age:0,    ageLabel:'At birth' },
    { key:'hepb0',  label:'Hep B-0',             age:0,    ageLabel:'At birth' },
    { key:'penta1', label:'Pentavalent-1',       age:42,   ageLabel:'6 weeks' },
    { key:'opv1',   label:'OPV-1',               age:42,   ageLabel:'6 weeks' },
    { key:'rota1',  label:'Rotavirus-1',         age:42,   ageLabel:'6 weeks' },
    { key:'pcv1',   label:'PCV-1',               age:42,   ageLabel:'6 weeks' },
    { key:'ipv1',   label:'IPV-1',               age:42,   ageLabel:'6 weeks' },
    { key:'penta2', label:'Pentavalent-2',       age:70,   ageLabel:'10 weeks' },
    { key:'opv2',   label:'OPV-2',               age:70,   ageLabel:'10 weeks' },
    { key:'rota2',  label:'Rotavirus-2',         age:70,   ageLabel:'10 weeks' },
    { key:'flu1',   label:'Influenza (IAP)',     age:182,  ageLabel:'6 months' },
    { key:'tcv1',   label:'Typhoid Conjugate (IAP)', age:182, ageLabel:'6 months' },
    { key:'penta3', label:'Pentavalent-3',       age:98,   ageLabel:'14 weeks' },
    { key:'opv3',   label:'OPV-3',               age:98,   ageLabel:'14 weeks' },
    { key:'rota3',  label:'Rotavirus-3',         age:98,   ageLabel:'14 weeks' },
    { key:'pcv2',   label:'PCV-2',               age:98,   ageLabel:'14 weeks' },
    { key:'ipv2',   label:'IPV-2',               age:98,   ageLabel:'14 weeks' },
    { key:'mr1',    label:'Measles-Rubella-1',   age:270,  ageLabel:'9 months' },
    { key:'je1',    label:'JE-1',                age:270,  ageLabel:'9 months' },
    { key:'pcvb',   label:'PCV Booster',         age:270,  ageLabel:'9 months' },
    { key:'vita1',  label:'Vitamin A (1st)',     age:270,  ageLabel:'9 months' },
    { key:'hepa1',  label:'Hepatitis A-1 (IAP)', age:365,  ageLabel:'12 months' },
    { key:'mr2',    label:'Measles-Rubella-2',   age:480,  ageLabel:'16–24 months' },
    { key:'je2',    label:'JE-2',                age:480,  ageLabel:'16–24 months' },
    { key:'dptb1',  label:'DPT Booster-1',       age:480,  ageLabel:'16–24 months' },
    { key:'opvb',   label:'OPV Booster',         age:480,  ageLabel:'16–24 months' },
    { key:'vita2',  label:'Vitamin A (2nd)',     age:480,  ageLabel:'16–24 months' },
    { key:'hepa2',  label:'Hepatitis A-2 (IAP)', age:545,  ageLabel:'18 months' },
    { key:'tcvb',   label:'TCV Booster (IAP)',   age:730,  ageLabel:'2 years' },
    { key:'dptb2',  label:'DPT Booster-2',       age:1825, ageLabel:'5–6 years' },
    { key:'vita3',  label:'Vitamin A (3rd)',     age:1825, ageLabel:'5–6 years' }
  ];

  MC.HRP_CONDITIONS = [
    { id:'hrp_age_teen',    label:'Teenage pregnancy (<19 years)' },
    { id:'hrp_age_35',      label:'Advanced maternal age (>35 years)' },
    { id:'hrp_primigravida',label:'Primigravida (first pregnancy)' },
    { id:'hrp_grand_multi', label:'Grand multipara (≥5 pregnancies)' },
    { id:'hrp_prev_cs',     label:'Previous Caesarean section' },
    { id:'hrp_prev_still',  label:'History of stillbirth' },
    { id:'hrp_prev_abort',  label:'Recurrent pregnancy loss (≥3)' },
    { id:'hrp_sev_anaemia', label:'Severe anaemia (Hb < 7 g/dL)' },
    { id:'hrp_pih',         label:'Pregnancy-induced hypertension' },
    { id:'hrp_gdm',         label:'Gestational diabetes mellitus' },
    { id:'hrp_hypothyroid', label:'Hypothyroidism' },
    { id:'hrp_tb',          label:'Tuberculosis' },
    { id:'hrp_hiv',         label:'HIV / AIDS' },
    { id:'hrp_syphilis',    label:'Syphilis' },
    { id:'hrp_hepb',        label:'Hepatitis B' },
    { id:'hrp_malaria',     label:'Malaria' },
    { id:'hrp_twin',        label:'Twin / multiple pregnancy' },
    { id:'hrp_rhi',         label:'Rh-negative with sensitisation' },
    { id:'hrp_rti',         label:'RTI / STI' },
    { id:'hrp_cardiac',     label:'Cardiac disease' },
    { id:'hrp_epilepsy',    label:'Epilepsy' },
    { id:'hrp_renal',       label:'Renal disease' },
    { id:'hrp_liver',       label:'Liver disease' },
    { id:'hrp_prev_pph',    label:'Previous postpartum haemorrhage' },
    { id:'hrp_other',       label:'Other medical condition' }
  ];

  MC.SCHEMES = [
    {
      id:'jsy', name:'Janani Suraksha Yojana (JSY)',
      benefit:'Cash assistance for institutional delivery',
      amounts: [
        { label:'Rural — institutional delivery', value:'₹1,400' },
        { label:'Urban — institutional delivery', value:'₹1,000' },
        { label:'Home delivery (SC/ST/BPL)', value:'₹500' },
        { label:'Caesarean section (specialist)', value:'₹1,500' }
      ]
    },
    {
      id:'jssk', name:'Janani Shishu Suraksha Karyakram (JSSK)',
      benefit:'Free delivery, drugs, diagnostics, diet, transport, blood',
      amounts: [
        { label:'Free delivery (including C-section)', value:'100% free' },
        { label:'Free drugs & consumables', value:'100% free' },
        { label:'Free diagnostics & blood', value:'100% free' },
        { label:'Free transport (home ↔ facility)', value:'100% free' },
        { label:'Sick infant (up to 1 year)', value:'100% free' }
      ]
    },
    {
      id:'pmmvy', name:'Pradhan Mantri Matru Vandana Yojana (PMMVY)',
      benefit:'Maternity benefit for first living child',
      amounts: [
        { label:'1st child — 1st instalment', value:'₹3,000' },
        { label:'1st child — 2nd instalment', value:'₹2,000' },
        { label:'2nd child (if girl)', value:'₹6,000' }
      ]
    }
  ];

  MC.FP_METHODS = [
    { id:'lam',   label:'Lactational Amenorrhea Method (LAM)' },
    { id:'ppiucd',label:'PPIUCD (postpartum IUCD)' },
    { id:'pop',   label:'Progestin-only pills (POP)' },
    { id:'inject',label:'Injectable contraceptive (Antara)' },
    { id:'chhaya',label:'Chhaya (Centchroman)' },
    { id:'condom',label:'Condoms' },
    { id:'iucd',  label:'IUCD 380A / 375' },
    { id:'implant',label:'Subdermal implant (single rod)' },
    { id:'steril_f',label:'Female sterilisation' },
    { id:'steril_m',label:'Male sterilisation' },
    { id:'ec',    label:'Emergency contraception' }
  ];

})(window.MC = window.MC || {});