const { useState, useEffect } = React;

const API_KEY = '63966ee47080428881fe646971ee918f';
const BASE_URL = 'https://api.football-data.org/v4';
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9960426175142172"
     crossorigin="anonymous"></script>

     
// ── CONFIG ──
const PAYSTACK_PUBLIC_KEY = 'pk_test_67a0b83955ef8b9bf81d7';
const PREMIUM_AMOUNT = 20;
const PREMIUM_KEY = 'wc2026_premium';
const CACHE_KEY = 'wc2026_matches';
const CACHE_TIME_KEY = 'wc2026_matches_time';
const FIVE_MINS = 5 * 60 * 1000;

// ── PREMIUM HELPERS ──
function isPremium() {
  try { return localStorage.getItem(PREMIUM_KEY) === 'true'; }
  catch { return false; }
}
function unlockPremium() {
  try { localStorage.setItem(PREMIUM_KEY, 'true'); }
  catch {}
}
function initPaystack(email, onSuccess) {
  const handler = PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email,
    amount: PREMIUM_AMOUNT * 100,
    currency: 'GHS',
    ref: 'WC2026_' + Math.floor(Math.random() * 1000000000),
    metadata: {
      custom_fields: [{ display_name: 'Product', value: 'WC2026 Premium' }]
    },
    onSuccess: () => { unlockPremium(); onSuccess(); },
    onCancel: () => console.log('Payment cancelled'),
  });
  handler.openIframe();
}

// ── PWA INSTALL PROMPT ──
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

// ── STATIC DATA ──
const WC2026_GROUPS = {
  A: { teams: ['Mexico', 'USA', 'Canada', 'New Zealand'] },
  B: { teams: ['Argentina', 'Chile', 'Ecuador', 'Jamaica']},
  C: { teams: ['Brazil', 'Colombia', 'Uruguay', 'Panama']},
  D: { teams: ['France', 'Belgium', 'Poland', 'Paraguay']},
  E: { teams: ['Spain', 'Portugal', 'Turkey', 'Honduras']},
  F: { teams: ['England', 'Netherlands', 'Serbia', 'Venezuela']},
  G: { teams: ['Germany', 'Austria', 'Scotland', 'Bolivia']},
  H: { teams: ['Morocco', 'Senegal', 'Mali', 'Japan']},
  I: { teams: ['Ghana', 'Nigeria', 'Egypt', 'South Korea']},
  J: { teams: ['Cameroon', 'DR Congo', 'South Africa', 'Iran']},
  K: { teams: ['Saudi Arabia', 'UAE', 'Uzbekistan', 'Croatia']},
  L: { teams: ['Australia', 'Switzerland', 'Denmark', 'Italy']},
};

const FLAGS = {
   'Mexico' :'🇲🇽', 'South Africa': '🇿🇦', 'South Korea': '🇰🇷', 'Czech Republic' :'🇨🇿',
  'Canada' :'🇨🇦',  'Bosnia and Herzegovina' :'🇧🇦', 'Qatar': '🇶🇦', 'Switzerland' :'🇨🇭',
  'Brazil' :'🇧🇷', 'Morocco': '🇲🇦', 'Haiti' :'🇭🇹', 'Scotland' :'🏴󠁧󠁢󠁳󠁣󠁴󠁿', 
  'United States' :'🇺🇸', 'Paraguay': '🇵🇾' ,'Australia': '🇦🇺' ,'Turkey' :'🇹🇷' ,
  'Germany' :'🇩🇪', 'Curaçao': '🇨🇼' , 'ivory Coast' :'🇨🇮',  'Ecuador' :'🇪🇨',
  'Netherlands' :'🇳🇱', 'Japan': '🇯🇵',  'Sweden':'🇸🇪',  'Tunisia' :'🇹🇳',
  'Belgium' :'🇧🇪', 'Egypt': '🇪🇬', 'Iran': '🇮🇷', 'New Zealand' :'🇳🇿',
  'Spain' :'🇪🇸', 'Cape Verde':'🇨🇻', 'Saudi Arabia': '🇸🇦','Uruguay' :'🇺🇾',
  'France' :'🇫🇷', 'Senegal': '🇸🇳', 'Iraq': '🇮🇶', 'Norway' :'🇳🇴',
  'Argentina' :"🇦🇷", 'Algeria': '🇩🇿', 'Australia': '🇦🇺', 'Jordan':'🇯🇴',

  'Portugal' :'🇵🇹', 'DR Congo': '🇨🇩', 'Uzbekistan': '🇺🇿', 'Colombia' :'🇨🇴',
  'England' :'🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Croatia': '🇭🇷', 'Ghana': '🇬🇭', 'Panama' :'🇵🇦', 
};

const BRACKET_ROUNDS = [
  { id: 'r32', label: 'Round of 32',    matchCount: 16 },
  { id: 'r16', label: 'Round of 16',    matchCount: 8  },
  { id: 'qf',  label: 'Quarter Finals', matchCount: 4  },
  { id: 'sf',  label: 'Semi Finals',    matchCount: 2  },
  { id: 'fin', label: 'The Final',      matchCount: 1  },
];

const BRACKET_MATCHES = {
  r32: [
    { id:1,  home:'1A', away:'2B' }, { id:2,  home:'1B', away:'2A' },
    { id:3,  home:'1C', away:'2D' }, { id:4,  home:'1D', away:'2C' },
    { id:5,  home:'1E', away:'2F' }, { id:6,  home:'1F', away:'2E' },
    { id:7,  home:'1G', away:'2H' }, { id:8,  home:'1H', away:'2G' },
    { id:9,  home:'1I', away:'2J' }, { id:10, home:'1J', away:'2I' },
    { id:11, home:'1K', away:'2L' }, { id:12, home:'1L', away:'2K' },
    { id:13, home:'T1', away:'T2' }, { id:14, home:'T3', away:'T4' },
    { id:15, home:'T5', away:'T6' }, { id:16, home:'T7', away:'T8' },
  ],
  r16: Array.from({ length:8 }, (_,i) => ({ id:i+1, home:'TBD', away:'TBD' })),
  qf:  Array.from({ length:4 }, (_,i) => ({ id:i+1, home:'TBD', away:'TBD' })),
  sf:  Array.from({ length:2 }, (_,i) => ({ id:i+1, home:'TBD', away:'TBD' })),
  fin: [{ id:1, home:'TBD', away:'TBD' }],
};

const SLOT_LABELS = {
  '1A':'Group A Winner','2A':'Group A Runner-up',
  '1B':'Group B Winner','2B':'Group B Runner-up',
  '1C':'Group C Winner','2C':'Group C Runner-up',
  '1D':'Group D Winner','2D':'Group D Runner-up',
  '1E':'Group E Winner','2E':'Group E Runner-up',
  '1F':'Group F Winner','2F':'Group F Runner-up',
  '1G':'Group G Winner','2G':'Group G Runner-up',
  '1H':'Group H Winner','2H':'Group H Runner-up',
  '1I':'Group I Winner','2I':'Group I Runner-up',
  '1J':'Group J Winner','2J':'Group J Runner-up',
  '1K':'Group K Winner','2K':'Group K Runner-up',
  '1L':'Group L Winner','2L':'Group L Runner-up',
  'T1':'Best 3rd #1','T2':'Best 3rd #2',
  'T3':'Best 3rd #3','T4':'Best 3rd #4',
  'T5':'Best 3rd #5','T6':'Best 3rd #6',
  'T7':'Best 3rd #7','T8':'Best 3rd #8',
  'TBD':'To Be Determined',
};

const PREDICT_MATCHES = [
  { id:'p1',  round:'Group Stage',   home:'Mexico',      away:'USA',          date:'Jun 14' },
  { id:'p2',  round:'Group Stage',   home:'Argentina',   away:'Chile',        date:'Jun 15' },
  { id:'p3',  round:'Group Stage',   home:'Brazil',      away:'Colombia',     date:'Jun 16' },
  { id:'p4',  round:'Group Stage',   home:'France',      away:'Belgium',      date:'Jun 16' },
  { id:'p5',  round:'Group Stage',   home:'Spain',       away:'Portugal',     date:'Jun 17' },
  { id:'p6',  round:'Group Stage',   home:'England',     away:'Netherlands',  date:'Jun 17' },
  { id:'p7',  round:'Group Stage',   home:'Germany',     away:'Austria',      date:'Jun 18' },
  { id:'p8',  round:'Group Stage',   home:'Morocco',     away:'Senegal',      date:'Jun 18' },
  { id:'p9',  round:'Group Stage',   home:'Ghana',       away:'Nigeria',      date:'Jun 19' },
  { id:'p10', round:'Group Stage',   home:'Japan',       away:'South Korea',  date:'Jun 20' },
  { id:'p11', round:'Round of 32',   home:'Group A Win', away:'Group B 2nd',  date:'Jul 1'  },
  { id:'p12', round:'Round of 32',   home:'Group C Win', away:'Group D 2nd',  date:'Jul 1'  },
  { id:'p13', round:'Quarter Final', home:'TBD',         away:'TBD',          date:'Jul 10' },
  { id:'p14', round:'Semi Final',    home:'TBD',         away:'TBD',          date:'Jul 14' },
  { id:'p15', round:'The Final',     home:'TBD',         away:'TBD',          date:'Jul 19' },
];

const ROUND_ORDER = ['Group Stage','Round of 32','Quarter Final','Semi Final','The Final'];

// ────────────────────────────────────────────
// ── ERROR BOUNDARY ──
// ────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, errorMsg: error.message };
  }
  componentDidCatch(error, info) {
    console.error('App crashed:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return React.createElement('div', { className: 'error-screen' },
        React.createElement('div', { className: 'empty-icon' }, '⚽'),
        React.createElement('h2', { style: { color: '#c9a84c', fontFamily: 'Bebas Neue', fontSize: '1.8rem', letterSpacing: '2px' } }, 'Something Went Wrong'),
        React.createElement('p', { style: { color: '#8892a4', fontSize: '0.85rem', margin: '0.5rem 0 1.5rem' } }, 'The app hit an unexpected error'),
        React.createElement('button', {
          className: 'reload-btn',
          onClick: () => window.location.reload()
        }, '🔄 Reload App')
      );
    }
    return this.props.children;
  }
}

// ────────────────────────────────────────────
// ── INSTALL BANNER ──
// ────────────────────────────────────────────
function InstallBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    if (isInstalled) return;
    const dismissed = localStorage.getItem('wc2026_install_dismissed');
    if (dismissed) return;
    const timer = setTimeout(() => setShowBanner(true), 30000);
    return () => clearTimeout(timer);
  }, []);

  async function handleInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setShowBanner(false);
      deferredPrompt = null;
    } else {
      alert('To install on iPhone: tap the Share button ⬆️ then tap "Add to Home Screen"');
      setShowBanner(false);
    }
  }

  function handleDismiss() {
    setShowBanner(false);
    localStorage.setItem('wc2026_install_dismissed', 'true');
  }

  if (!showBanner) return null;

  return React.createElement('div', { className: 'install-banner' },
    React.createElement('div', { className: 'install-left' },
      React.createElement('span', { className: 'install-icon' }, '📲'),
      React.createElement('div', null,
        React.createElement('p', { className: 'install-title' }, 'Install App'),
        React.createElement('p', { className: 'install-sub' }, 'Get instant access on your homescreen')
      )
    ),
    React.createElement('div', { className: 'install-btns' },
      React.createElement('button', { className: 'install-btn', onClick: handleInstall }, 'Install'),
      React.createElement('button', { className: 'install-dismiss', onClick: handleDismiss }, '✕')
    )
  );
}

// ────────────────────────────────────────────
// ── PREMIUM BANNER ──
// ────────────────────────────────────────────
function PremiumBanner({ onUnlock }) {
  const [email, setEmail] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  function handlePay() {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    setLoading(true);
    initPaystack(email, () => {
      setLoading(false);
      onUnlock();
    });
  }

  if (!showForm) {
    return React.createElement('div', { className: 'premium-banner' },
      React.createElement('div', { className: 'premium-left' },
        React.createElement('span', { className: 'premium-crown' }, '👑'),
        React.createElement('div', null,
          React.createElement('p', { className: 'premium-title' }, 'Go Premium'),
          React.createElement('p', { className: 'premium-sub' }, 'Ad-free · Save predictions · GHS 20 once')
        )
      ),
      React.createElement('button', {
        className: 'premium-btn',
        onClick: () => setShowForm(true)
      }, 'Unlock')
    );
  }

  return React.createElement('div', { className: 'premium-form-wrap' },
    React.createElement('p', { className: 'premium-form-title' }, '👑 Unlock Premium — GHS 20'),
    React.createElement('input', {
      className: 'premium-input',
      type: 'email',
      placeholder: 'Enter your email',
      value: email,
      onChange: (e) => setEmail(e.target.value)
    }),
    React.createElement('div', { className: 'premium-form-btns' },
      React.createElement('button', {
        className: 'premium-pay-btn',
        onClick: handlePay,
        disabled: loading
      }, loading ? 'Opening...' : '💳 Pay GHS 20'),
      React.createElement('button', {
        className: 'premium-cancel-btn',
        onClick: () => setShowForm(false)
      }, 'Cancel')
    ),
    React.createElement('p', { className: 'premium-secure' }, '🔒 Secured by Paystack')
  );
}

// ────────────────────────────────────────────
// ── AD SLOT ──
// ────────────────────────────────────────────
function AdSlot() {
  return React.createElement('div', { className: 'ad-slot' },
    React.createElement('p', { className: 'ad-label' }, 'Advertisement')
  );
}

// ────────────────────────────────────────────
// ── HEADER ──
// ────────────────────────────────────────────
function Header({ premium }) {
  return React.createElement('header', { className: 'header' },
    React.createElement('div', { className: 'header-trophy' }, '🏆'),
    React.createElement('h1', null, 'WORLD CUP 2026'),
    React.createElement('p', null, 'Track Every Match · Build Your Bracket'),
    premium && React.createElement('div', { className: 'premium-badge' }, '👑 PREMIUM')
  );
}

// ────────────────────────────────────────────
// ── APP ──
// ────────────────────────────────────────────
function App() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matches');
  const [premium, setPremium] = useState(isPremium());
  const [apiError, setApiError] = useState(false);

  useEffect(() => { fetchMatches(); }, []);

  async function fetchMatches() {
    try {
      // ── Check cache first ──
      const cached = localStorage.getItem(CACHE_KEY);
      const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
      const isFresh = cachedTime && (Date.now() - Number(cachedTime)) < FIVE_MINS;

      if (cached && isFresh) {
        setMatches(JSON.parse(cached));
        setLoading(false);
        return;
      }

      // ── Fetch from Netlify function (API key protected) ──
      const res = await fetch('/.netlify/functions/matches');

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const matchList = data.matches || [];

      // ── Save to cache ──
      localStorage.setItem(CACHE_KEY, JSON.stringify(matchList));
      localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));

      setMatches(matchList);
      setApiError(false);

    } catch (err) {
      console.error('Fetch error:', err);
      setApiError(true);

      // ── Load stale cache on error rather than showing nothing ──
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try { setMatches(JSON.parse(cached)); } catch {}
      }
    } finally {
      setLoading(false);
    }
  }

  const tabs = [
    { id: 'matches', label: '📅 Matches' },
    { id: 'groups',  label: '🗂 Groups'  },
    { id: 'bracket', label: '🏆 Bracket' },
    { id: 'predict', label: '🎯 Predict' },
  ];

  return React.createElement('div', { className: 'app' },

    React.createElement(Header, { premium }),
    React.createElement(InstallBanner, null),

    !premium && React.createElement(PremiumBanner, {
      onUnlock: () => setPremium(true)
    }),

    React.createElement('nav', { className: 'nav-tabs' },
      tabs.map(t =>
        React.createElement('button', {
          key: t.id,
          className: `tab ${activeTab === t.id ? 'active' : ''}`,
          onClick: () => setActiveTab(t.id)
        }, t.label)
      )
    ),

    // API error banner
    apiError && React.createElement('div', { className: 'api-warning' },
      '⚠️ Live data unavailable — showing cached data'
    ),

    !premium && React.createElement(AdSlot, null),

    activeTab === 'matches' && React.createElement(MatchesTab, { matches, loading }),
    activeTab === 'groups'  && React.createElement(GroupsTab, null),
    activeTab === 'bracket' && React.createElement(BracketTab, null),
    activeTab === 'predict' && React.createElement(PredictTab, null),

    React.createElement('footer', { className: 'app-footer' },
      React.createElement('a', { href: '/about.html' }, 'About'),
      React.createElement('span', null, '·'),
      React.createElement('a', { href: '/privacy.html' }, 'Privacy'),
      React.createElement('span', null, '·'),
      React.createElement('span', null, '© 2026 FrempahBrand')
    )
  );
}

// ────────────────────────────────────────────
// ── MATCHES TAB ──
// ────────────────────────────────────────────
function MatchesTab({ matches, loading }) {
  if (loading) return React.createElement('div', { className: 'center-msg' },
    React.createElement('div', { className: 'empty-icon' }, '⚽'),
    React.createElement('p', null, 'Loading matches...')
  );
  if (!matches.length) return React.createElement('div', { className: 'center-msg' },
    React.createElement('div', { className: 'empty-icon' }, '📅'),
    React.createElement('p', null, 'Matches appear here once the tournament begins'),
    React.createElement('span', { className: 'empty-sub' }, '🗓 Opening match: June 11, 2026')
  );
  return React.createElement('div', { className: 'match-list' },
    matches.slice(0, 20).map(m => React.createElement(MatchCard, { key: m.id, match: m }))
  );
}

function MatchCard({ match }) {
  const home = match.homeTeam?.name || 'TBD';
  const away = match.awayTeam?.name || 'TBD';
  const date = new Date(match.utcDate).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
  const time = new Date(match.utcDate).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit'
  });
  const isLive = match.status === 'IN_PLAY';
  const isDone = match.status === 'FINISHED';
  const homeScore = match.score?.fullTime?.home;
  const awayScore = match.score?.fullTime?.away;

  return React.createElement('div', { className: `match-card ${isLive ? 'live-card' : ''}` },
    React.createElement('div', { className: 'match-meta' },
      React.createElement('span', null, date + ' · ' + time),
      isLive && React.createElement('span', { className: 'live-badge' }, '🔴 LIVE')
    ),
    React.createElement('div', { className: 'match-row' },
      React.createElement('div', { className: 'team-block' },
        React.createElement('span', { className: 'flag' }, FLAGS[home] || '🏳️'),
        React.createElement('span', { className: 'team-name' }, home)
      ),
      React.createElement('div', { className: 'score-block' },
        isDone || isLive
          ? `${homeScore ?? '-'} : ${awayScore ?? '-'}`
          : React.createElement('span', { className: 'vs-text' }, 'VS')
      ),
      React.createElement('div', { className: 'team-block right' },
        React.createElement('span', { className: 'team-name' }, away),
        React.createElement('span', { className: 'flag' }, FLAGS[away] || '🏳️')
      )
    )
  );
}

// ────────────────────────────────────────────
// ── GROUPS TAB ──
// ────────────────────────────────────────────
function GroupsTab() {
  const [openGroup, setOpenGroup] = useState('A');
  return React.createElement('div', { className: 'groups-container' },
    React.createElement('h2', { className: 'section-title' }, 'Group Stage'),
    React.createElement('p', { className: 'section-sub' }, '12 Groups · 48 Teams · 104 Matches'),
    React.createElement('div', { className: 'group-pills' },
      Object.keys(WC2026_GROUPS).map(g =>
        React.createElement('button', {
          key: g,
          className: `group-pill ${openGroup === g ? 'active' : ''}`,
          onClick: () => setOpenGroup(g)
        }, `Group ${g}`)
      )
    ),
    React.createElement(GroupTable, {
      groupLetter: openGroup,
      group: WC2026_GROUPS[openGroup]
    })
  );
}

function GroupTable({ groupLetter, group }) {
  return React.createElement('div', { className: 'group-table-wrap' },
    React.createElement('div', { className: 'group-table-header' },
      React.createElement('span', { className: 'group-label' }, `GROUP ${groupLetter}`)
    ),
    React.createElement('table', { className: 'group-table' },
      React.createElement('thead', null,
        React.createElement('tr', null,
          React.createElement('th', { className: 'th-team' }, 'Team'),
          React.createElement('th', null, 'P'),
          React.createElement('th', null, 'W'),
          React.createElement('th', null, 'D'),
          React.createElement('th', null, 'L'),
          React.createElement('th', null, 'GD'),
          React.createElement('th', null, 'Pts')
        )
      ),
      React.createElement('tbody', null,
        group.teams.map((team, i) =>
          React.createElement('tr', {
            key: team,
            className: i < 2 ? 'qualify-row' : ''
          },
            React.createElement('td', { className: 'td-team' },
              React.createElement('span', { className: 'flag-sm' }, FLAGS[team] || '🏳️'),
              team
            ),
            React.createElement('td', null, '0'),
            React.createElement('td', null, '0'),
            React.createElement('td', null, '0'),
            React.createElement('td', null, '0'),
            React.createElement('td', null, '0'),
            React.createElement('td', { className: 'pts' }, '0')
          )
        )
      )
    ),
    React.createElement('div', { className: 'qualify-legend' },
      React.createElement('span', { className: 'legend-dot' }),
      'Top 2 qualify to Round of 32'
    )
  );
}

// ────────────────────────────────────────────
// ── BRACKET TAB ──
// ────────────────────────────────────────────
function BracketTab() {
  const [activeRound, setActiveRound] = useState('r32');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const matches = BRACKET_MATCHES[activeRound];

  return React.createElement('div', { className: 'bracket-container' },
    React.createElement('div', { className: 'bracket-header' },
      React.createElement('h2', { className: 'section-title' }, 'Knockout Bracket'),
      React.createElement('p', { className: 'section-sub' }, 'Bracket unlocks as teams qualify · June 2026')
    ),
    React.createElement('div', { className: 'round-selector' },
      BRACKET_ROUNDS.map(r =>
        React.createElement('button', {
          key: r.id,
          className: `round-btn ${activeRound === r.id ? 'active' : ''}`,
          onClick: () => { setActiveRound(r.id); setSelectedMatch(null); }
        },
          React.createElement('span', { className: 'round-label' }, r.label),
          React.createElement('span', { className: 'round-count' },
            r.matchCount + (r.matchCount === 1 ? ' Match' : ' Matches')
          )
        )
      )
    ),
    React.createElement('div', { className: 'round-title-bar' },
      React.createElement('span', { className: 'round-title-text' },
        BRACKET_ROUNDS.find(r => r.id === activeRound)?.label
      ),
      activeRound === 'fin'
        ? React.createElement('span', { className: 'final-badge' }, '🏆 FINAL')
        : React.createElement('span', { className: 'match-count-badge' }, matches.length + ' matches')
    ),
    React.createElement('div', { className: 'bracket-matches' },
      matches.map((match, idx) =>
        React.createElement(BracketCard, {
          key: match.id,
          match,
          matchNum: idx + 1,
          isFinal: activeRound === 'fin',
          isSelected: selectedMatch === match.id,
          onSelect: () => setSelectedMatch(
            selectedMatch === match.id ? null : match.id
          )
        })
      )
    ),
    React.createElement('div', { className: 'bracket-note' },
      React.createElement('span', null, 'ℹ️'),
      React.createElement('span', null,
        activeRound === 'r32'
          ? '8 best 3rd-placed teams also advance (T1–T8)'
          : 'Winners advance to the next round'
      )
    )
  );
}

function BracketCard({ match, matchNum, isFinal, isSelected, onSelect }) {
  const homeLabel = SLOT_LABELS[match.home] || match.home;
  const awayLabel = SLOT_LABELS[match.away] || match.away;
  const isPending = match.home === 'TBD' || match.away === 'TBD';

  return React.createElement('div', {
    className: `bracket-card ${isFinal ? 'final-card' : ''} ${isSelected ? 'selected-card' : ''}`,
    onClick: onSelect
  },
    React.createElement('div', { className: 'bracket-match-num' },
      isFinal ? '🏆 FINAL' : `Match ${matchNum}`
    ),
    React.createElement('div', { className: 'bracket-teams' },
      React.createElement('div', { className: 'bracket-team' },
        React.createElement('div', { className: 'bracket-team-left' },
          React.createElement('span', { className: 'bracket-flag' }, FLAGS[match.home] || '🏳️'),
          React.createElement('div', { className: 'bracket-team-info' },
            React.createElement('span', { className: 'bracket-team-name' }, match.home),
            React.createElement('span', { className: 'bracket-team-sub' }, homeLabel)
          )
        ),
        React.createElement('span', { className: 'bracket-score' }, isPending ? '-' : '0')
      ),
      React.createElement('div', { className: 'bracket-divider' },
        React.createElement('span', { className: 'bracket-vs' }, 'VS')
      ),
      React.createElement('div', { className: 'bracket-team' },
        React.createElement('div', { className: 'bracket-team-left' },
          React.createElement('span', { className: 'bracket-flag' }, FLAGS[match.away] || '🏳️'),
          React.createElement('div', { className: 'bracket-team-info' },
            React.createElement('span', { className: 'bracket-team-name' }, match.away),
            React.createElement('span', { className: 'bracket-team-sub' }, awayLabel)
          )
        ),
        React.createElement('span', { className: 'bracket-score' }, isPending ? '-' : '0')
      )
    ),
    isSelected && React.createElement('div', { className: 'bracket-detail' },
      React.createElement('span', null,
        isPending
          ? '⏳ Teams confirmed after Group Stage'
          : '📍 Venue & date to be announced'
      )
    )
  );
}

// ────────────────────────────────────────────
// ── PREDICT TAB ──
// ────────────────────────────────────────────
function PredictTab() {
  const [predictions, setPredictions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wc2026_predictions') || '{}'); }
    catch { return {}; }
  });
  const [activeRound, setActiveRound] = useState('Group Stage');
  const [savedFlash, setSavedFlash] = useState(false);

  const rounds = ROUND_ORDER.filter(r => PREDICT_MATCHES.some(m => m.round === r));
  const filteredMatches = PREDICT_MATCHES.filter(m => m.round === activeRound);
  const totalPredicted = Object.keys(predictions).length;
  const totalMatches = PREDICT_MATCHES.length;

  function pickWinner(matchId, winner) {
    const updated = { ...predictions, [matchId]: winner };
    setPredictions(updated);
    try { localStorage.setItem('wc2026_predictions', JSON.stringify(updated)); } catch {}
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  }

  function clearPredictions() {
    setPredictions({});
    try { localStorage.removeItem('wc2026_predictions'); } catch {}
  }

  return React.createElement('div', { className: 'predict-container' },
    React.createElement('div', { className: 'predict-header' },
      React.createElement('h2', { className: 'section-title' }, 'My Predictions'),
      React.createElement('p', { className: 'section-sub' }, 'Pick your winners before each match kicks off')
    ),
    React.createElement('div', { className: 'predict-progress-wrap' },
      React.createElement('div', { className: 'predict-progress-top' },
        React.createElement('span', { className: 'progress-label' }, 'Your Progress'),
        React.createElement('span', { className: 'progress-count' }, `${totalPredicted} / ${totalMatches} picked`)
      ),
      React.createElement('div', { className: 'progress-bar-bg' },
        React.createElement('div', {
          className: 'progress-bar-fill',
          style: { width: `${(totalPredicted / totalMatches) * 100}%` }
        })
      )
    ),
    savedFlash && React.createElement('div', { className: 'save-flash' }, '✅ Prediction saved!'),
    React.createElement('div', { className: 'predict-round-tabs' },
      rounds.map(r =>
        React.createElement('button', {
          key: r,
          className: `predict-round-tab ${activeRound === r ? 'active' : ''}`,
          onClick: () => setActiveRound(r)
        }, r)
      )
    ),
    React.createElement('div', { className: 'predict-matches' },
      filteredMatches.map(match =>
        React.createElement(PredictCard, {
          key: match.id,
          match,
          picked: predictions[match.id],
          onPick: (winner) => pickWinner(match.id, winner)
        })
      )
    ),
    React.createElement('div', { className: 'predict-actions' },
      React.createElement('button', { className: 'clear-btn', onClick: clearPredictions }, '🗑️ Clear All Predictions'),
      React.createElement('div', { className: 'predict-disclaimer' }, '⚡ Predictions saved on your device')
    )
  );
}

function PredictCard({ match, picked, onPick }) {
  const isPending = match.home === 'TBD' || match.away === 'TBD';
  const isFinal = match.round === 'The Final';

  return React.createElement('div', {
    className: `predict-card ${isFinal ? 'predict-final-card' : ''}`
  },
    React.createElement('div', { className: 'predict-match-info' },
      React.createElement('span', { className: 'predict-round-tag' }, match.round),
      React.createElement('span', { className: 'predict-date' }, match.date)
    ),
    React.createElement('div', { className: 'predict-teams-row' },
      React.createElement('button', {
        className: `predict-team-btn ${picked === match.home ? 'picked' : ''} ${isPending ? 'pending-btn' : ''}`,
        onClick: () => !isPending && onPick(match.home),
        disabled: isPending
      },
        React.createElement('span', { className: 'predict-flag' }, FLAGS[match.home] || '🏳️'),
        React.createElement('span', { className: 'predict-team-name' }, match.home),
        picked === match.home && React.createElement('span', { className: 'picked-check' }, '✓')
      ),
      React.createElement('div', { className: 'predict-middle' },
        React.createElement('button', {
          className: `draw-btn ${picked === 'draw' ? 'picked-draw' : ''}`,
          onClick: () => !isPending && onPick('draw'),
          disabled: isPending
        }, picked === 'draw' ? '✓ Draw' : 'Draw')
      ),
      React.createElement('button', {
        className: `predict-team-btn ${picked === match.away ? 'picked' : ''} ${isPending ? 'pending-btn' : ''}`,
        onClick: () => !isPending && onPick(match.away),
        disabled: isPending
      },
        React.createElement('span', { className: 'predict-flag' }, FLAGS[match.away] || '🏳️'),
        React.createElement('span', { className: 'predict-team-name' }, match.away),
        picked === match.away && React.createElement('span', { className: 'picked-check' }, '✓')
      )
    ),
    picked && React.createElement('div', { className: 'picked-result' },
      picked === 'draw'
        ? '🤝 You predicted a Draw'
        : `${FLAGS[picked] || '🏳️'} You picked ${picked} to win`
    ),
    isPending && React.createElement('div', { className: 'pending-notice' }, '⏳ Available after Group Stage')
  );
}

// ────────────────────────────────────────────
// ── MOUNT (with ErrorBoundary) ──
// ────────────────────────────────────────────
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  React.createElement(ErrorBoundary, null,
    React.createElement(App)
  )
);

// ── Service Worker ──
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .catch(err => console.error('SW error:', err));
}