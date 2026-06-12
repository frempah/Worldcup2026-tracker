
(function () {
  'use strict';

  /* ─── REACT ALIASES ────────────────────────────────────────── */
  var h          = React.createElement;
  var useState   = React.useState;
  var useEffect  = React.useEffect;
  var useRef     = React.useRef;
  var Fragment   = React.Fragment;

  /* ─── CONFIG ────────────────────────────────────────────────── */
  var PAYSTACK_KEY  = 'pk_live_75f6caa32d55fd1de3a2ef92f2821220aace411b';
  var KEY_PREMIUM   = 'wc2026_premium_v3';
  var KEY_ONBOARDED = 'wc2026_onboarded_v3';
  var KEY_PICKS     = 'wc2026_picks_v3';
  var KEY_MATCHES   = 'wc2026_matches_v6';
  var KEY_MATCH_TS  = 'wc2026_match_ts_v6';
  var KEY_INSTALL   = 'wc2026_install_dismissed';
  var CACHE_TTL     = 5 * 60 * 1000; // 5 min
  // June 11 2026 19:00 UTC — confirmed FIFA / Al Jazeera / NBC Sports
  var KICKOFF_UTC   = new Date('2026-06-11T19:00:00Z').getTime();

  /* ─── STORAGE HELPERS ───────────────────────────────────────── */
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {}
  }
  function load(key, fb) {
    try {
      var raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : fb;
    } catch(e) { return fb; }
  }

  /* ─── PAYSTACK ──────────────────────────────────────────────── */
  function isPremium() { return load(KEY_PREMIUM, false) === true; }
  function activatePremium() { save(KEY_PREMIUM, true); }

  function launchPaystack(email, onOk, onCancel) {
    if (typeof PaystackPop === 'undefined') {
      alert('Payment service unavailable. Check your connection and try again.');
      return;
    }
    PaystackPop.setup({
      key:      PAYSTACK_KEY,
      email:    email,
      amount:   2000,
      currency: 'GHS',
      ref:      'WC26_' + Date.now() + '_' + Math.round(Math.random() * 9999),
      onSuccess: function() { activatePremium(); onOk(); },
      onCancel:  onCancel || function() {}
    }).openIframe();
  }

  /* ─── PWA INSTALL ───────────────────────────────────────────── */
  var installEvt = null;
  window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    installEvt = e;
  });

  /* ─── ICON COMPONENTS ───────────────────────────────────────── */
  /**
   * MSIcon — renders a Material Symbols Outlined icon
   * Usage: MSIcon('calendar_month', 'icon-nav')
   * Full list: fonts.google.com/icons
   */
  function MSIcon(name, cls) {
    return h('span', {
      className: 'material-symbols-outlined ' + (cls || ''),
      'aria-hidden': 'true'
    }, name);
  }

  /**
   * Flag — renders a professional SVG flag via flag-icons CSS
   * Uses ISO 3166-1 alpha-2 codes (plus gb-eng / gb-sct for home nations)
   * Source: github.com/lipis/flag-icons
   */
  var FC = {
    'Mexico':'mx',       'South Africa':'za',  'South Korea':'kr',  'Czech Republic':'cz',
    'Canada':'ca',       'Bosnia and Herzegovina':'ba',   'Qatar':'qa',        'Switzerland':'ch',
    'Brazil':'br',       'Morocco':'ma',       'Haiti':'ht',        'Scotland':'gb-sct',
    'United States':'us',          'Paraguay':'py',       'Australia':'au',    'Turkey':'tr',
    'Germany':'de',      'Curacao':'cw',        'Ivory Coast':'ci',  'Ecuador':'ec',
    'Netherlands':'nl',  'Japan':'jp',          'Sweden':'se',       'Tunisia':'tn',
    'Belgium':'be',      'Egypt':'eg',          'Iran':'ir',         'New Zealand':'nz',
    'Spain':'es',        'Cape Verde':'cv',     'Saudi Arabia':'sa', 'Uruguay':'uy',
    'France':'fr',       'Senegal':'sn',        'Iraq':'iq',         'Norway':'no',
    'Argentina':'ar',    'Algeria':'dz',        'Austria':'at',      'Jordan':'jo',
    'Portugal':'pt',     'DR Congo':'cd',       'Uzbekistan':'uz',   'Colombia':'co',
    'England':'gb-eng',  'Croatia':'hr',        'Ghana':'gh',        'Panama':'pa'
  };

  function Flag(props) {
    var code = FC[props.team];
    if (!code) {
      return h('span', {className: 'flag-unknown', title: props.team || '?'},
        MSIcon('flag', 'flag-placeholder-icon')
      );
    }
    return h('span', {
      className: 'fi fi-' + code + ' ' + (props.cls || 'flag-md'),
      title:     props.team,
      role:      'img',
      'aria-label': props.team + ' flag'
    });
  }

  /* A team name is a "slot" label not a real country */
  function isSlot(name) {
    if (!name || name === 'TBD') return true;
    if (name.startsWith('Win') || name.startsWith('2nd') ||
        name.startsWith('Best') || name.startsWith('W Match')) return true;
    return false;
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  /* ─── OFFICIAL FIFA 2026 DATA ───────────────────────────────── */
  /* Source: FIFA.com official draw (Dec 2025) + NBC Sports May 2026 */

  var GROUPS = {
    A: ['Mexico','South Africa','South Korea','Czech Republic'],
    B: ['Canada','Bosnia and Herzegovina','Qatar','Switzerland'],
    C: ['Brazil','Morocco','Haiti','Scotland'],
    D: ['United States','Paraguay','Australia','Turkey'],
    E: ['Germany','Curacao','Ivory Coast','Ecuador'],
    F: ['Netherlands','Japan','Sweden','Tunisia'],
    G: ['Belgium','Egypt','Iran','New Zealand'],
    H: ['Spain','Cape Verde','Saudi Arabia','Uruguay'],
    I: ['France','Senegal','Iraq','Norway'],
    J: ['Argentina','Algeria','Austria','Jordan'],
    K: ['Portugal','DR Congo','Uzbekistan','Colombia'],
    L: ['England','Croatia','Ghana','Panama']
  };

  /* Official R32 slots — confirmed NBC Sports bracket */
  var R32_MATCHES = [
    {id:1,  a:'2nd Grp A', b:'2nd Grp B',  date:'Jun 28', city:'Los Angeles'},
    {id:2,  a:'Win Grp C', b:'2nd Grp F',  date:'Jun 29', city:'Houston'},
    {id:3,  a:'Win Grp E', b:'Best 3rd',   date:'Jun 29', city:'Boston'},
    {id:4,  a:'Win Grp F', b:'2nd Grp C',  date:'Jun 29', city:'Monterrey'},
    {id:5,  a:'2nd Grp E', b:'2nd Grp I',  date:'Jun 30', city:'Dallas'},
    {id:6,  a:'Win Grp I', b:'Best 3rd',   date:'Jun 30', city:'New York/NJ'},
    {id:7,  a:'Win Grp A', b:'Best 3rd',   date:'Jun 30', city:'Mexico City'},
    {id:8,  a:'Win Grp L', b:'Best 3rd',   date:'Jul 1',  city:'Atlanta'},
    {id:9,  a:'Win Grp D', b:'Best 3rd',   date:'Jul 1',  city:'San Francisco'},
    {id:10, a:'Win Grp G', b:'Best 3rd',   date:'Jul 1',  city:'Seattle'},
    {id:11, a:'Win Grp H', b:'2nd Grp J',  date:'Jul 2',  city:'Los Angeles'},
    {id:12, a:'2nd Grp K', b:'2nd Grp L',  date:'Jul 2',  city:'Toronto'},
    {id:13, a:'Win Grp B', b:'Best 3rd',   date:'Jul 2',  city:'Vancouver'},
    {id:14, a:'Win Grp J', b:'2nd Grp H',  date:'Jul 3',  city:'Miami'},
    {id:15, a:'Win Grp K', b:'Best 3rd',   date:'Jul 3',  city:'Guadalajara'},
    {id:16, a:'2nd Grp D', b:'2nd Grp G',  date:'Jul 3',  city:'Dallas'}
  ];

  var BRACKET_ROUNDS = [
    {id:'r32', label:'Round of 32',    n:16, icon:'looks_32'},
    {id:'r16', label:'Round of 16',    n:8,  icon:'looks_16'},
    {id:'qf',  label:'Quarter Finals', n:4,  icon:'looks_4'},
    {id:'sf',  label:'Semi Finals',    n:2,  icon:'looks_two'},
    {id:'fin', label:'The Final',      n:1,  icon:'emoji_events'}
  ];

  var BRACKET_DATA = {
    r32: R32_MATCHES,
    r16: [1,2,3,4,5,6,7,8].map(function(i){ return {id:i,a:'TBD',b:'TBD'}; }),
    qf:  [1,2,3,4].map(function(i)         { return {id:i,a:'TBD',b:'TBD'}; }),
    sf:  [1,2].map(function(i)              { return {id:i,a:'TBD',b:'TBD'}; }),
    fin: [{id:1, a:'TBD', b:'TBD'}]
  };

  /* All 57 prediction fixtures — official FIFA schedule */
  var FIXTURES = [
    /* GROUP STAGE — Matchday 1 — all 24 confirmed */
    {id:'g01',r:'Group Stage',a:'Mexico',     b:'South Africa',date:'Jun 11',city:'Mexico City'},
    {id:'g02',r:'Group Stage',a:'South Korea',b:'Czech Republic',     date:'Jun 11',city:'Guadalajara'},
    {id:'g03',r:'Group Stage',a:'Canada',     b:'Bosnia and Herzegovina', date:'Jun 12',city:'Toronto'},
    {id:'g04',r:'Group Stage',a:'United States',        b:'Paraguay',    date:'Jun 12',city:'Los Angeles'},
    {id:'g05',r:'Group Stage',a:'Australia',  b:'Turkey',      date:'Jun 12',city:'Kansas City'},
    {id:'g06',r:'Group Stage',a:'Qatar',      b:'Switzerland', date:'Jun 13',city:'San Francisco'},
    {id:'g07',r:'Group Stage',a:'Brazil',     b:'Morocco',     date:'Jun 13',city:'New York/NJ'},
    {id:'g08',r:'Group Stage',a:'Haiti',      b:'Scotland',    date:'Jun 13',city:'Boston'},
    {id:'g09',r:'Group Stage',a:'Germany',    b:'Curacao',     date:'Jun 14',city:'Houston'},
    {id:'g10',r:'Group Stage',a:'Ivory Coast',b:'Ecuador',     date:'Jun 14',city:'Philadelphia'},
    {id:'g11',r:'Group Stage',a:'Netherlands',b:'Japan',       date:'Jun 14',city:'Dallas'},
    {id:'g12',r:'Group Stage',a:'Sweden',     b:'Tunisia',     date:'Jun 14',city:'Monterrey'},
    {id:'g13',r:'Group Stage',a:'Belgium',    b:'Egypt',       date:'Jun 15',city:'Seattle'},
    {id:'g14',r:'Group Stage',a:'Iran',       b:'New Zealand', date:'Jun 15',city:'Los Angeles'},
    {id:'g15',r:'Group Stage',a:'Spain',      b:'Cape Verde',  date:'Jun 15',city:'Atlanta'},
    {id:'g16',r:'Group Stage',a:'Saudi Arabia',b:'Uruguay',    date:'Jun 15',city:'Miami'},
    {id:'g17',r:'Group Stage',a:'France',     b:'Senegal',     date:'Jun 16',city:'New York/NJ'},
    {id:'g18',r:'Group Stage',a:'Iraq',       b:'Norway',      date:'Jun 16',city:'Boston'},
    {id:'g19',r:'Group Stage',a:'Argentina',  b:'Algeria',     date:'Jun 16',city:'Kansas City'},
    {id:'g20',r:'Group Stage',a:'Austria',    b:'Jordan',      date:'Jun 16',city:'San Francisco'},
    {id:'g21',r:'Group Stage',a:'Portugal',   b:'Colombia',    date:'Jun 17',city:'Houston'},
    {id:'g22',r:'Group Stage',a:'DR Congo',   b:'Uzbekistan',  date:'Jun 17',city:'Atlanta'},
    {id:'g23',r:'Group Stage',a:'England',    b:'Croatia',     date:'Jun 17',city:'Vancouver'},
    {id:'g24',r:'Group Stage',a:'Ghana',      b:'Panama',      date:'Jun 17',city:'Dallas'},
    /* ROUND OF 32 — all 16 confirmed */
    {id:'r01',r:'Round of 32',a:'2nd Grp A',b:'2nd Grp B',date:'Jun 28',city:'Los Angeles'},
    {id:'r02',r:'Round of 32',a:'Win Grp C',b:'2nd Grp F',date:'Jun 29',city:'Houston'},
    {id:'r03',r:'Round of 32',a:'Win Grp E',b:'Best 3rd', date:'Jun 29',city:'Boston'},
    {id:'r04',r:'Round of 32',a:'Win Grp F',b:'2nd Grp C',date:'Jun 29',city:'Monterrey'},
    {id:'r05',r:'Round of 32',a:'2nd Grp E',b:'2nd Grp I',date:'Jun 30',city:'Dallas'},
    {id:'r06',r:'Round of 32',a:'Win Grp I',b:'Best 3rd', date:'Jun 30',city:'New York/NJ'},
    {id:'r07',r:'Round of 32',a:'Win Grp A',b:'Best 3rd', date:'Jun 30',city:'Mexico City'},
    {id:'r08',r:'Round of 32',a:'Win Grp L',b:'Best 3rd', date:'Jul 1', city:'Atlanta'},
    {id:'r09',r:'Round of 32',a:'Win Grp D',b:'Best 3rd', date:'Jul 1', city:'San Francisco'},
    {id:'r10',r:'Round of 32',a:'Win Grp G',b:'Best 3rd', date:'Jul 1', city:'Seattle'},
    {id:'r11',r:'Round of 32',a:'Win Grp H',b:'2nd Grp J',date:'Jul 2', city:'Los Angeles'},
    {id:'r12',r:'Round of 32',a:'2nd Grp K',b:'2nd Grp L',date:'Jul 2', city:'Toronto'},
    {id:'r13',r:'Round of 32',a:'Win Grp B',b:'Best 3rd', date:'Jul 2', city:'Vancouver'},
    {id:'r14',r:'Round of 32',a:'Win Grp J',b:'2nd Grp H',date:'Jul 3', city:'Miami'},
    {id:'r15',r:'Round of 32',a:'Win Grp K',b:'Best 3rd', date:'Jul 3', city:'Guadalajara'},
    {id:'r16',r:'Round of 32',a:'2nd Grp D',b:'2nd Grp G',date:'Jul 3', city:'Dallas'},
    /* ROUND OF 16 */
    {id:'s01',r:'Round of 16',a:'W Match 1', b:'W Match 2', date:'Jul 5', city:'TBD'},
    {id:'s02',r:'Round of 16',a:'W Match 3', b:'W Match 4', date:'Jul 5', city:'TBD'},
    {id:'s03',r:'Round of 16',a:'W Match 5', b:'W Match 6', date:'Jul 6', city:'TBD'},
    {id:'s04',r:'Round of 16',a:'W Match 7', b:'W Match 8', date:'Jul 6', city:'TBD'},
    {id:'s05',r:'Round of 16',a:'W Match 9', b:'W Match 10',date:'Jul 7', city:'TBD'},
    {id:'s06',r:'Round of 16',a:'W Match 11',b:'W Match 12',date:'Jul 7', city:'TBD'},
    {id:'s07',r:'Round of 16',a:'W Match 13',b:'W Match 14',date:'Jul 8', city:'TBD'},
    {id:'s08',r:'Round of 16',a:'W Match 15',b:'W Match 16',date:'Jul 8', city:'TBD'},
    /* QUARTER FINALS */
    {id:'q01',r:'Quarter Final',a:'TBD',b:'TBD',date:'Jul 10',city:'TBD'},
    {id:'q02',r:'Quarter Final',a:'TBD',b:'TBD',date:'Jul 10',city:'TBD'},
    {id:'q03',r:'Quarter Final',a:'TBD',b:'TBD',date:'Jul 11',city:'TBD'},
    {id:'q04',r:'Quarter Final',a:'TBD',b:'TBD',date:'Jul 11',city:'TBD'},
    /* SEMI FINALS */
    {id:'sf1',r:'Semi Final',a:'TBD',b:'TBD',date:'Jul 14',city:'Dallas'},
    {id:'sf2',r:'Semi Final',a:'TBD',b:'TBD',date:'Jul 15',city:'Atlanta'},
    /* THE FINAL — NY/NJ Stadium · 19:00 UTC */
    {id:'fin',r:'The Final', a:'TBD',b:'TBD',date:'Jul 19',city:'NY/NJ Stadium'}
  ];

  var ROUND_LIST = [
    'Group Stage','Round of 32','Round of 16',
    'Quarter Final','Semi Final','The Final'
  ];

  /* ─── ERROR BOUNDARY ────────────────────────────────────────── */
  class ErrorBoundary extends React.Component {
    constructor(p) { super(p); this.state = { err: false }; }
    static getDerivedStateFromError() { return { err: true }; }
    componentDidCatch(e, i) { console.error('[WC2026]', e, i); }
    render() {
      if (!this.state.err) return this.props.children;
      return h('div', {className:'crash-screen'},
        MSIcon('sports_soccer', 'crash-icon'),
        h('h2', {className:'crash-title'}, 'Oops — App Error'),
        h('p',  {className:'crash-msg'}, 'Something went wrong. Tap below to restart.'),
        h('button', {
          className: 'btn-gold',
          onClick:   function() { window.location.reload(); }
        },
          MSIcon('refresh', 'btn-icon'),
          ' Reload App'
        )
      );
    }
  }

  /* ─── ONBOARDING ────────────────────────────────────────────── */
  var OB = [
    {
      icon:   'emoji_events',
      tag:    'WELCOME',
      line1:  'WORLD CUP',
      line2:  '2026',
      body:   'The biggest football tournament in history. 48 teams. 104 matches. Three host nations across North America.',
      color:  '#c9a84c',
      grad:   'linear-gradient(160deg,#0a0e1a,#1c1200)'
    },
    {
      icon:   'calendar_month',
      tag:    'LIVE SCORES',
      line1:  'EVERY',
      line2:  'MATCH',
      body:   'Real-time scores and results for all 104 matches across 16 official stadiums in USA, Canada and Mexico.',
      color:  '#38bdf8',
      grad:   'linear-gradient(160deg,#0a0e1a,#001830)'
    },
    {
      icon:   'table_chart',
      tag:    'GROUPS & BRACKET',
      line1:  'FULL',
      line2:  'TOURNAMENT',
      body:   'All 12 official FIFA groups. Complete knockout bracket from the new Round of 32 to the Final at NY/NJ Stadium.',
      color:  '#4ade80',
      grad:   'linear-gradient(160deg,#0a0e1a,#001a06)'
    },
    {
      icon:   'sports_score',
      tag:    'PREDICTIONS',
      line1:  'PICK YOUR',
      line2:  'WINNERS',
      body:   'Predict results for every match from Group Stage to the Final on July 19. Track your accuracy all tournament long.',
      color:  '#fb923c',
      grad:   'linear-gradient(160deg,#0a0e1a,#200e00)'
    }
  ];

  function Onboarding(props) {
    var _s  = useState(0);
    var idx = _s[0], setIdx = _s[1];
    var s   = OB[idx];
    var last = idx === OB.length - 1;

    function done() { save(KEY_ONBOARDED, true); props.onDone(); }
    function next() { last ? done() : setIdx(idx + 1); }
    function prev() { idx > 0 && setIdx(idx - 1); }
    function jump(i) { setIdx(i); }

    return h('div', {className: 'ob-root', style: {background: s.grad}},

      /* ── Top bar ── */
      h('div', {className:'ob-topbar'},
        h('button', {
          className: 'ob-nav-btn' + (idx === 0 ? ' ob-nav-hidden' : ''),
          onClick: prev, 'aria-label': 'Previous'
        }, MSIcon('chevron_left', 'ob-nav-icon')),

        h('div', {className:'ob-track'},
          h('div', {
            className: 'ob-fill',
            style: {width: ((idx+1)/OB.length*100)+'%', background: s.color}
          })
        ),

        h('button', {
          className: 'ob-skip' + (last ? ' ob-nav-hidden' : ''),
          onClick: done
        }, 'Skip')
      ),

      /* ── Slide content (key = idx for re-animation) ── */
      h('div', {className:'ob-body', key: idx},

        h('div', {
          className: 'ob-icon-ring',
          style: {borderColor: s.color + '50', boxShadow: '0 0 48px ' + s.color + '28'}
        },
          MSIcon(s.icon, 'ob-icon')
        ),

        h('span', {
          className: 'ob-tag',
          style: {color: s.color, background: s.color+'18', border: '1px solid '+s.color+'38'}
        }, s.tag),

        h('div', {className:'ob-title'},
          h('span', {style:{color: s.color}}, s.line1),
          h('span', {style:{color:'#f0f0f0'}}, s.line2)
        ),

        h('p', {className:'ob-body-text'}, s.body),

        last && h('div', {className:'ob-features'},
          [
            {icon:'calendar_month', label:'Live Scores'},
            {icon:'table_chart',    label:'12 Groups'},
            {icon:'emoji_events',   label:'Full Bracket'},
            {icon:'sports_score',   label:'57 Predictions'},
            {icon:'smartphone',     label:'No App Store'},
            {icon:'check_circle',   label:'100% Free'}
          ].map(function(f) {
            return h('div', {key:f.label, className:'ob-feat'},
              MSIcon(f.icon, 'ob-feat-icon'),
              h('span', {className:'ob-feat-label'}, f.label)
            );
          })
        )
      ),

      /* ── Footer ── */
      h('div', {className:'ob-footer'},

        h('div', {className:'ob-dots'},
          OB.map(function(_, i) {
            return h('button', {
              key:       i,
              className: 'ob-dot' + (i === idx ? ' ob-dot-on' : ''),
              style:     i === idx ? {background: s.color, width:'28px'} : {},
              onClick:   function() { jump(i); },
              'aria-label': 'Slide ' + (i+1)
            });
          })
        ),

        h('button', {
          className: 'ob-cta',
          style:     {background: s.color},
          onClick:   next
        },
          last
            ? h(Fragment, null, MSIcon('sports_soccer','ob-cta-icon'), " Let's Track the World Cup!")
            : h(Fragment, null, 'Next ', MSIcon('arrow_forward','ob-cta-icon'))
        ),

        last && h('p', {className:'ob-footnote'},
          MSIcon('verified', 'footnote-icon'),
          '  Free forever · No account · No App Store needed'
        )
      )
    );
  }

  /* ─── COUNTDOWN ─────────────────────────────────────────────── */
  function Countdown() {
    var _t   = useState(getLeft);
    var time = _t[0], setTime = _t[1];

    function getLeft() {
      var diff = KICKOFF_UTC - Date.now();
      if (diff <= 0) return null;
      return {
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000)  / 60000),
        s: Math.floor((diff % 60000)    / 1000)
      };
    }

    useEffect(function() {
      var id = setInterval(function() { setTime(getLeft()); }, 1000);
      return function() { clearInterval(id); };
    }, []);

    if (!time) return null;

    var units = [
      {v: time.d,       l:'DAYS'},
      {v: pad(time.h),  l:'HRS'},
      {v: pad(time.m),  l:'MIN'},
      {v: pad(time.s),  l:'SEC'}
    ];

    return h('div', {className:'cd-wrap'},

      /* Opening match card */
      h('div', {className:'cd-match'},
        h('div', {className:'cd-badge'},
          MSIcon('radio_button_checked', 'cd-pulse-icon'),
          h('span', null, 'OPENING MATCH')
        ),
        h('div', {className:'cd-teams'},
          h('div', {className:'cd-team'},
            h(Flag, {team:'Mexico', cls:'cd-flag'}),
            h('span', {className:'cd-tname'}, 'Mexico')
          ),
          h('div', {className:'cd-vs'},
            MSIcon('sports_soccer', 'cd-vs-icon')
          ),
          h('div', {className:'cd-team'},
            h(Flag, {team:'South Africa', cls:'cd-flag'}),
            h('span', {className:'cd-tname'}, 'South Africa')
          )
        ),
        h('p', {className:'cd-venue'},
          MSIcon('location_on','cd-venue-icon'),
          ' Estadio Azteca · Jun 11 · 3PM ET / 8PM BST'
        )
      ),

      /* Timer */
      h('div', {className:'cd-timer'},
        units.map(function(u, i) {
          return h(Fragment, {key:u.l},
            h('div', {className:'cd-unit'},
              h('span', {className:'cd-num'}, u.v),
              h('span', {className:'cd-lbl'}, u.l)
            ),
            i < 3 && h('span', {className:'cd-sep'}, ':')
          );
        })
      ),

      /* Stats */
      h('div', {className:'cd-stats'},
        [
          {icon:'groups',         n:'48',  l:'Teams'},
          {icon:'sports_soccer',  n:'104', l:'Matches'},
          {icon:'table_chart',    n:'12',  l:'Groups'},
          {icon:'calendar_month', n:'39',  l:'Days'}
        ].map(function(s) {
          return h('div', {key:s.l, className:'cd-stat'},
            MSIcon(s.icon, 'cd-stat-icon'),
            h('span', {className:'cd-stat-n'}, s.n),
            h('span', {className:'cd-stat-l'}, s.l)
          );
        })
      ),

      h('p', {className:'cd-note'},
        MSIcon('public','cd-note-icon'),
        '  USA · Canada · Mexico  ·  June 11 – July 19, 2026'
      )
    );
  }

  /* ─── INSTALL BANNER ────────────────────────────────────────── */
  function InstallBanner() {
    var _s   = useState(false);
    var show = _s[0], setShow = _s[1];

    useEffect(function() {
      if (window.matchMedia('(display-mode:standalone)').matches) return;
      if (load(KEY_INSTALL, false)) return;
      var t = setTimeout(function() { setShow(true); }, 25000);
      return function() { clearTimeout(t); };
    }, []);

    function tapInstall() {
      if (installEvt) {
        installEvt.prompt();
        installEvt.userChoice.then(function(r) {
          if (r.outcome === 'accepted') setShow(false);
          installEvt = null;
        });
      } else {
        alert('Install on iPhone:\n1. Tap the Share icon below\n2. Select "Add to Home Screen"\n3. Tap Add');
        setShow(false);
      }
    }

    function dismiss() { setShow(false); save(KEY_INSTALL, true); }

    if (!show) return null;

    return h('div', {className:'install-bar'},
      h('div', {className:'install-left'},
        MSIcon('install_mobile', 'install-icon'),
        h('div', null,
          h('p', {className:'install-t'}, 'Install App'),
          h('p', {className:'install-s'}, 'Free · Works offline · No App Store')
        )
      ),
      h('div', {className:'install-right'},
        h('button', {className:'install-btn', onClick:tapInstall}, 'Install'),
        h('button', {className:'install-x',   onClick:dismiss,   'aria-label':'Dismiss'},
          MSIcon('close','install-x-icon')
        )
      )
    );
  }

  /* ─── PREMIUM BANNER ────────────────────────────────────────── */
  function PremiumBanner(props) {
    var _form  = useState(false);
    var form   = _form[0], setForm = _form[1];
    var _email = useState('');
    var email  = _email[0], setEmail = _email[1];
    var _busy  = useState(false);
    var busy   = _busy[0], setBusy = _busy[1];

    function pay() {
      if (!email.includes('@')) { alert('Enter a valid email address'); return; }
      setBusy(true);
      launchPaystack(email,
        function() { setBusy(false); props.onUnlock(); },
        function() { setBusy(false); }
      );
    }

    if (!form) return h('div', {className:'premium-bar'},
      h('div', {className:'premium-left'},
        MSIcon('workspace_premium', 'premium-crown-icon'),
        h('div', null,
          h('p', {className:'premium-t'}, 'Go Premium'),
          h('p', {className:'premium-s'}, 'Ad-free · Full predictions · GHS 20 one-time')
        )
      ),
      h('button', {className:'premium-unlock', onClick:function(){setForm(true);}}, 'Unlock')
    );

    return h('div', {className:'premium-form'},
      h('p', {className:'pf-title'},
        MSIcon('workspace_premium','pf-icon'), '  Unlock Premium — GHS 20'
      ),
      h('input', {
        type:'email', className:'pf-input',
        placeholder:'Your email address',
        value:email,
        onChange:function(e){setEmail(e.target.value);}
      }),
      h('div', {className:'pf-btns'},
        h('button', {
          className:'pf-pay', onClick:pay, disabled:busy
        },
          MSIcon(busy ? 'hourglass_empty' : 'credit_card', 'pf-btn-icon'),
          busy ? ' Opening...' : ' Pay GHS 20'
        ),
        h('button', {
          className:'pf-cancel', onClick:function(){setForm(false);}
        }, 'Cancel')
      ),
      h('p', {className:'pf-secure'},
        MSIcon('lock','pf-lock-icon'), '  Secured by Paystack'
      )
    );
  }

  /* ─── AD SLOT ───────────────────────────────────────────────── */
  function AdSlot() {
    return h('div', {className:'ad-slot'},
      h('p', {className:'ad-lbl'}, 'Advertisement')
    );
  }

  /* ─── HEADER ────────────────────────────────────────────────── */
  function Header(props) {
    return h('header', {className:'app-header'},
      MSIcon('emoji_events', 'header-trophy'),
      h('h1', {className:'header-title'}, 'WORLD CUP 2026'),
      h('p',  {className:'header-sub'}, 'Track Every Match · Build Your Bracket'),
      props.premium && h('span', {className:'premium-badge'},
        MSIcon('workspace_premium','badge-icon'), ' PREMIUM'
      )
    );
  }

  /* ─── TAB BAR ───────────────────────────────────────────────── */
  var TABS = [
    {id:'matches', icon:'calendar_month', label:'Matches'},
    {id:'groups',  icon:'table_chart',    label:'Groups'},
    {id:'bracket', icon:'emoji_events',   label:'Bracket'},
    {id:'predict', icon:'sports_score',   label:'Predict'}
  ];

  function TabBar(props) {
    return h('nav', {className:'tab-bar', role:'navigation', 'aria-label':'Main navigation'},
      TABS.map(function(t) {
        var active = props.active === t.id;
        return h('button', {
          key:       t.id,
          className: 'tab-btn' + (active ? ' tab-btn-on' : ''),
          onClick:   function() { props.onChange(t.id); },
          'aria-pressed': active,
          'aria-label':   t.label
        },
          MSIcon(t.icon, 'tab-icon' + (active ? ' tab-icon-on' : '')),
          h('span', {className:'tab-lbl'}, t.label)
        );
      })
    );
  }

  /* ─── MATCHES TAB ───────────────────────────────────────────── */
  function MatchesTab(props) {
    if (props.loading) return h('div', {className:'center-state'},
      h('div', {className:'spinner'}),
      h('p', null, 'Loading matches...')
    );

    if (!props.matches || !props.matches.length) {
      return h('div', {className:'pre-matches'},
        h(Countdown, null),
        h('div', {className:'pre-hint'},
          MSIcon('notifications_active', 'hint-icon'),
          h('p', null, 'Install the app now — live scores activate automatically on June 11')
        )
      );
    }

    return h('div', {className:'match-list'},
      props.matches.slice(0, 20).map(function(m) {
        return h(MatchCard, {key:m.id, match:m});
      })
    );
  }

  function MatchCard(props) {
    var m    = props.match;
    var home = (m.homeTeam && m.homeTeam.name) || 'TBD';
    var away = (m.awayTeam && m.awayTeam.name) || 'TBD';
    var live = m.status === 'IN_PLAY';
    var done = m.status === 'FINISHED';
    var hs   = m.score && m.score.fullTime ? m.score.fullTime.home : null;
    var as_  = m.score && m.score.fullTime ? m.score.fullTime.away : null;
    var d    = new Date(m.utcDate);
    var dStr = d.toLocaleDateString('en-GB', {day:'numeric',month:'short'});
    var tStr = d.toLocaleTimeString('en-GB', {hour:'2-digit',minute:'2-digit'});

    return h('div', {className:'match-card' + (live ? ' match-card-live' : '')},
      h('div', {className:'mc-meta'},
        h('span', {className:'mc-date'},
          MSIcon('schedule','mc-time-icon'), ' ' + dStr + '  ' + tStr
        ),
        live && h('span', {className:'mc-live'},
          MSIcon('radio_button_checked','mc-live-icon'), ' LIVE'
        )
      ),
      h('div', {className:'mc-row'},
        h('div', {className:'mc-team'},
          h(Flag, {team:home, cls:'mc-flag'}),
          h('span', {className:'mc-name'}, home)
        ),
        h('div', {className:'mc-score'},
          (done || live) && hs !== null
            ? h('span', {className:'mc-score-txt'}, hs + ' : ' + as_)
            : h('span', {className:'mc-vs'}, 'VS')
        ),
        h('div', {className:'mc-team mc-team-r'},
          h('span', {className:'mc-name'}, away),
          h(Flag, {team:away, cls:'mc-flag'})
        )
      )
    );
  }

  /* ─── GROUPS TAB ────────────────────────────────────────────── */
  function GroupsTab() {
    var _g  = useState('A');
    var gk  = _g[0], setGk = _g[1];
    var teams = GROUPS[gk];

    return h('div', {className:'groups-page'},
      h('div', {className:'page-head'},
        h('h2', {className:'page-title'},
          MSIcon('table_chart','page-title-icon'), ' Group Stage'
        ),
        h('p', {className:'page-sub'}, '12 Groups · 48 Teams · 104 Matches')
      ),

      h('div', {className:'group-pills', role:'tablist'},
        Object.keys(GROUPS).map(function(g) {
          return h('button', {
            key:          g,
            className:    'g-pill' + (gk === g ? ' g-pill-on' : ''),
            onClick:      function() { setGk(g); },
            role:         'tab',
            'aria-selected': gk === g
          }, 'Group ' + g);
        })
      ),

      h('div', {className:'gt-wrap'},
        h('div', {className:'gt-head'},
          MSIcon('table_chart','gt-head-icon'),
          h('span', null, 'GROUP ' + gk)
        ),
        h('table', {className:'gt', role:'table'},
          h('thead', null,
            h('tr', null,
              h('th', {className:'gt-th-team', scope:'col'}, 'Team'),
              h('th', {scope:'col'}, 'P'),
              h('th', {scope:'col'}, 'W'),
              h('th', {scope:'col'}, 'D'),
              h('th', {scope:'col'}, 'L'),
              h('th', {scope:'col'}, 'GD'),
              h('th', {scope:'col'}, 'Pts')
            )
          ),
          h('tbody', null,
            teams.map(function(team, i) {
              return h('tr', {key:team, className: i < 2 ? 'gt-qualify' : ''},
                h('td', {className:'gt-td-team'},
                  h(Flag, {team:team, cls:'gt-flag'}),
                  h('span', null, team)
                ),
                h('td',null,'0'), h('td',null,'0'), h('td',null,'0'),
                h('td',null,'0'), h('td',null,'0'),
                h('td', {className:'gt-pts'}, '0')
              );
            })
          )
        ),
        h('div', {className:'gt-legend'},
          h('span', {className:'gt-legend-box'}),
          h('span', null, 'Top 2 advance to Round of 32 · Best 8 third-placed teams also advance')
        )
      )
    );
  }

  /* ─── BRACKET TAB ───────────────────────────────────────────── */
  function BracketTab() {
    var _r   = useState('r32');
    var rnd  = _r[0], setRnd = _r[1];
    var _sel = useState(null);
    var sel  = _sel[0], setSel = _sel[1];
    var data = BRACKET_DATA[rnd] || [];
    var fin  = rnd === 'fin';
    var info = BRACKET_ROUNDS.find(function(r){return r.id===rnd;});

    return h('div', {className:'bracket-page'},
      h('div', {className:'page-head'},
        h('h2', {className:'page-title'},
          MSIcon('emoji_events','page-title-icon'), ' Knockout Bracket'
        ),
        h('p', {className:'page-sub'}, 'Official FIFA 2026 bracket · Opens June 28')
      ),

      /* Round selector */
      h('div', {className:'round-list'},
        BRACKET_ROUNDS.map(function(r) {
          return h('button', {
            key:       r.id,
            className: 'round-row' + (rnd === r.id ? ' round-row-on' : ''),
            onClick:   function() { setRnd(r.id); setSel(null); }
          },
            h('div', {className:'round-row-left'},
              MSIcon(r.icon, 'round-row-icon' + (rnd === r.id ? ' round-row-icon-on' : '')),
              h('span', {className:'round-row-label'}, r.label)
            ),
            h('span', {className:'round-row-count'+(rnd===r.id?' round-row-count-on':'')},
              r.n + (r.n === 1 ? ' Match' : ' Matches')
            )
          );
        })
      ),

      /* Active round header */
      h('div', {className:'round-hdr'},
        h('span', {className:'round-hdr-label'}, info.label),
        fin
          ? h('span', {className:'round-hdr-final'},
              MSIcon('emoji_events','rh-final-icon'), ' Jul 19 · NY/NJ'
            )
          : h('span', {className:'round-hdr-count'}, data.length + ' matches')
      ),

      /* Match cards */
      h('div', {className:'b-list'},
        data.map(function(m, idx) {
          var a   = m.a || 'TBD', b = m.b || 'TBD';
          var pnd = a === 'TBD' || b === 'TBD' || a === 'Best 3rd' || b === 'Best 3rd';
          var open = sel === m.id;
          return h('div', {
            key:       m.id,
            className: 'b-card' + (fin ? ' b-card-final' : '') + (open ? ' b-card-open' : ''),
            onClick:   function() { setSel(open ? null : m.id); }
          },
            h('div', {className:'b-card-top'},
              h('span', {className:'b-num'},
                fin
                  ? h(Fragment,null,MSIcon('emoji_events','b-final-icon'),' FINAL')
                  : 'Match ' + (idx+1)
              ),
              !open && MSIcon('expand_more','b-expand-icon'),
              open  && MSIcon('expand_less','b-expand-icon')
            ),

            /* Team A */
            h('div', {className:'b-team'},
              h('div', {className:'b-team-l'},
                isSlot(a)
                  ? MSIcon('flag','b-slot-icon')
                  : h(Flag, {team:a, cls:'b-flag'}),
                h('div', {className:'b-info'},
                  h('span', {className:'b-name'}, a),
                  h('span', {className:'b-sub'},  m.city || '')
                )
              ),
              h('span', {className:'b-score'}, pnd ? '—' : '0')
            ),

            /* Divider */
            h('div', {className:'b-divider'},
              MSIcon('sports_soccer','b-divider-icon')
            ),

            /* Team B */
            h('div', {className:'b-team'},
              h('div', {className:'b-team-l'},
                isSlot(b)
                  ? MSIcon('flag','b-slot-icon')
                  : h(Flag, {team:b, cls:'b-flag'}),
                h('div', {className:'b-info'},
                  h('span', {className:'b-name'}, b),
                  h('span', {className:'b-sub'},  m.date || '')
                )
              ),
              h('span', {className:'b-score'}, pnd ? '—' : '0')
            ),

            /* Expanded detail */
            open && h('div', {className:'b-detail'},
              MSIcon(pnd ? 'hourglass_empty' : 'info','b-detail-icon'),
              h('span', null, pnd
                ? ' Teams confirmed after Group Stage ends June 27'
                : ' Venue · Extra time & penalties if level after 90 mins'
              )
            )
          );
        })
      ),

      h('div', {className:'bracket-note'},
        MSIcon('info','bn-icon'),
        h('span', null, rnd === 'r32'
          ? ' Top 2 per group + 8 best 3rd-placed teams = 32 teams advance'
          : ' Winners advance · Draws resolved by extra time then penalties'
        )
      )
    );
  }

  /* ─── PREDICT TAB ───────────────────────────────────────────── */
  function PredictTab() {
    var _picks = useState(function(){return load(KEY_PICKS,{});});
    var picks  = _picks[0], setPicks = _picks[1];
    var _rnd   = useState('Group Stage');
    var rnd    = _rnd[0], setRnd = _rnd[1];
    var _flash = useState(false);
    var flash  = _flash[0], setFlash = _flash[1];

    var total   = FIXTURES.length;
    var done    = Object.keys(picks).length;
    var pct     = Math.round(done / total * 100);
    var visible = FIXTURES.filter(function(f){return f.r===rnd;});

    var counts = {};
    ROUND_LIST.forEach(function(r) {
      counts[r] = FIXTURES.filter(function(f){return f.r===r;}).length;
    });

    function pick(id, choice) {
      var next = Object.assign({}, picks);
      next[id] = choice;
      setPicks(next);
      save(KEY_PICKS, next);
      setFlash(true);
      setTimeout(function(){setFlash(false);}, 1400);
    }

    function clearAll() { setPicks({}); save(KEY_PICKS, {}); }

    return h('div', {className:'predict-page'},
      h('div', {className:'page-head'},
        h('h2', {className:'page-title'},
          MSIcon('sports_score','page-title-icon'), ' My Predictions'
        ),
        h('p', {className:'page-sub'}, 'Official FIFA 2026 fixtures · Pick your winners')
      ),

      /* Progress */
      h('div', {className:'progress-card'},
        h('div', {className:'progress-row'},
          h('span', {className:'progress-lbl'},
            MSIcon('bar_chart','progress-icon'), ' Your Progress'
          ),
          h('span', {className:'progress-val'}, done + ' / ' + total + ' picked')
        ),
        h('div', {className:'progress-track'},
          h('div', {className:'progress-fill', style:{width:pct+'%'}})
        )
      ),

      /* Flash */
      h('div', {
        className: 'save-flash' + (flash ? ' save-flash-on' : ''),
        'aria-live': 'polite'
      },
        MSIcon('check_circle','sf-icon'), '  Prediction saved!'
      ),

      /* Round tabs */
      h('div', {className:'predict-rounds', role:'tablist'},
        ROUND_LIST.filter(function(r){return counts[r]>0;}).map(function(r) {
          return h('button', {
            key:          r,
            className:    'pr-tab' + (rnd === r ? ' pr-tab-on' : ''),
            onClick:      function(){setRnd(r);},
            role:         'tab',
            'aria-selected': rnd === r
          }, r + ' (' + counts[r] + ')');
        })
      ),

      /* Fixture cards */
      h('div', {className:'predict-list'},
        visible.map(function(f) {
          var chosen  = picks[f.id];
          var pending = isSlot(f.a) || isSlot(f.b);
          var isFin   = f.r === 'The Final';

          return h('div', {
            key:       f.id,
            className: 'pf-card' + (isFin ? ' pf-card-final' : '')
          },
            /* Card header */
            h('div', {className:'pf-head'},
              h('div', {className:'pf-head-l'},
                h('span', {className:'pf-round'}, f.r),
                h('span', {className:'pf-city'},
                  MSIcon('location_on','pf-city-icon'), ' ' + f.city
                )
              ),
              h('span', {className:'pf-date'},
                MSIcon('calendar_today','pf-date-icon'), ' ' + f.date
              )
            ),

            /* Pick row */
            h('div', {className:'pf-row'},
              /* Team A */
              h('button', {
                className: 'pf-team'
                  + (chosen === f.a ? ' pf-team-on' : '')
                  + (pending       ? ' pf-team-disabled' : ''),
                onClick:  function(){ if(!pending) pick(f.id, f.a); },
                disabled: pending
              },
                isSlot(f.a)
                  ? MSIcon('flag','pf-slot-icon')
                  : h(Flag, {team:f.a, cls:'pf-flag'}),
                h('span', {className:'pf-tname'}, f.a),
                chosen === f.a && MSIcon('check_circle', 'pf-check')
              ),

              /* Draw */
              h('button', {
                className: 'pf-draw'
                  + (chosen === 'draw' ? ' pf-draw-on' : '')
                  + (pending          ? ' pf-team-disabled' : ''),
                onClick:  function(){ if(!pending) pick(f.id, 'draw'); },
                disabled: pending
              }, chosen === 'draw'
                  ? h(Fragment,null,MSIcon('check','pf-draw-check'),' Draw')
                  : 'Draw'
              ),

              /* Team B */
              h('button', {
                className: 'pf-team'
                  + (chosen === f.b ? ' pf-team-on' : '')
                  + (pending       ? ' pf-team-disabled' : ''),
                onClick:  function(){ if(!pending) pick(f.id, f.b); },
                disabled: pending
              },
                isSlot(f.b)
                  ? MSIcon('flag','pf-slot-icon')
                  : h(Flag, {team:f.b, cls:'pf-flag'}),
                h('span', {className:'pf-tname'}, f.b),
                chosen === f.b && MSIcon('check_circle','pf-check')
              )
            ),

            /* Result */
            chosen && h('div', {className:'pf-result'},
              chosen === 'draw'
                ? h(Fragment, null,
                    MSIcon('handshake','pf-result-icon'), '  Predicted a Draw'
                  )
                : h(Fragment, null,
                    isSlot(chosen)
                      ? MSIcon('emoji_events','pf-result-icon')
                      : h(Flag, {team:chosen, cls:'pf-result-flag'}),
                    '  Picked ' + chosen + ' to win'
                  )
            ),

            /* Pending */
            pending && h('div', {className:'pf-pending'},
              MSIcon('hourglass_empty','pf-pend-icon'),
              f.a.startsWith('W Match')
                ? '  Teams confirmed after Round of 32'
                : '  Teams confirmed after Group Stage (June 27)'
            )
          );
        })
      ),

      h('div', {className:'predict-actions'},
        h('button', {className:'clear-btn', onClick:clearAll},
          MSIcon('delete_outline','clear-btn-icon'), '  Clear All Predictions'
        ),
        h('p', {className:'predict-note'},
          MSIcon('save','pn-icon'), '  Predictions saved on this device'
        )
      )
    );
  }

  /* ─── APP ROOT ──────────────────────────────────────────────── */
  function App() {
    var _ob  = useState(function(){return !!load(KEY_ONBOARDED,false);});
    var ob   = _ob[0], setOb = _ob[1];

    var _pm  = useState(function(){return isPremium();});
    var pm   = _pm[0], setPm = _pm[1];

    var _tab = useState('matches');
    var tab  = _tab[0], setTab = _tab[1];

    var _mat = useState([]);
    var mat  = _mat[0], setMat = _mat[1];

    var _lod = useState(true);
    var lod  = _lod[0], setLod = _lod[1];

    var _err = useState(false);
    var err  = _err[0], setErr = _err[1];

    /* Smooth tab transitions */
    var animRef  = useRef('');
    var _anim    = useState('');
    var anim     = _anim[0], setAnim = _anim[1];

    function changeTab(next) {
      if (next === tab || animRef.current) return;
      animRef.current = 'running';
      setAnim('fade-out');
      setTimeout(function() {
        setTab(next);
        setAnim('fade-in');
        setTimeout(function() {
          setAnim('');
          animRef.current = '';
        }, 260);
      }, 160);
    }

    /* Fetch matches */
    useEffect(function() {
      var cached = load(KEY_MATCHES, null);
      var ts     = load(KEY_MATCH_TS, 0);
      if (cached && (Date.now() - ts) < CACHE_TTL) {
        setMat(cached); setLod(false); return;
      }
      fetch('/api/matches')
        .then(function(r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(function(data) {
          var list = (data && data.matches) || [];
          save(KEY_MATCHES, list);
          save(KEY_MATCH_TS, Date.now());
          setMat(list); setErr(false);
        })
        .catch(function() {
          var c = load(KEY_MATCHES, []);
          setMat(c); setErr(true);
        })
        .finally(function() { setLod(false); });
    }, []);

    /* First visit — show onboarding */
    if (!ob) {
      return h(Onboarding, {onDone: function(){setOb(true);}});
    }

    return h('div', {className:'app-root'},

      h(Header, {premium: pm}),
      h(InstallBanner, null),
      !pm && h(PremiumBanner, {onUnlock: function(){setPm(true);}}),
      h(TabBar, {active: tab, onChange: changeTab}),

      err && h('div', {className:'api-warn'},
        MSIcon('wifi_off','api-warn-icon'),
        '  Live data unavailable — showing cached data'
      ),

      !pm && h(AdSlot, null),

      h('div', {className: 'tab-pane ' + anim},
        tab === 'matches' && h(MatchesTab, {matches:mat, loading:lod}),
        tab === 'groups'  && h(GroupsTab,  null),
        tab === 'bracket' && h(BracketTab, null),
        tab === 'predict' && h(PredictTab, null)
      ),

      h('footer', {className:'app-footer'},
        h('a', {href:'/about.html'},   MSIcon('info','footer-icon'),    ' About'),
        h('span', {className:'footer-sep'}, '·'),
        h('a', {href:'/privacy.html'}, MSIcon('privacy_tip','footer-icon'), ' Privacy'),
        h('span', {className:'footer-sep'}, '·'),
        h('span', null, '© 2026 FrempahBrand')
      )
    );
  }

  /* ─── MOUNT ─────────────────────────────────────────────────── */
  var root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    React.createElement(ErrorBoundary, null,
      React.createElement(App, null)
    )
  );

  /* Service Worker */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js')
        .then(function()  { console.info('[WC2026] SW ready'); })
        .catch(function(e){ console.warn('[WC2026] SW failed', e); });
    });
  }

})();
