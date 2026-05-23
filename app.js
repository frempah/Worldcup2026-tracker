const { useState, useEffect } = React;

const API_KEY = '63966ee47080428881fe646971ee918f';
const BASE_URL = 'https://api.football-data.org/v4';

// ── PREMIUM CONFIG ──
const PAYSTACK_PUBLIC_KEY = 'pk_test_67a0b83955ef8b9bf81d7';
const PREMIUM_AMOUNT = 20;
const PREMIUM_KEY = 'wc2026_premium';

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
    email: email,
    amount: PREMIUM_AMOUNT * 100,
    currency: 'GHS',
    ref: 'WC2026_' + Math.floor(Math.random() * 1000000000),
    metadata: { custom_fields: [{ display_name: 'Product', value: 'WC2026 Premium' }] },
    onSuccess: function(transaction) {
      unlockPremium();
      onSuccess();
    },
    onCancel: function() {
      console.log('Payment cancelled');
    }
  });
  handler.openIframe();
}

// ── GROUP DATA ──
const WC2026_GROUPS = {
   A: { teams: ['Mexico',  'South Africa',  'South Korea',  'Czech Republic']},
  B: { teams: ['Canada',   'Bosnia and Herzegovina',  'Qatar',  'Switzerland']},
  C: { teams: ['Brazil',  'Morocco',  'Haiti',  'Scotland']},
  D: { teams: ['United States', 'Paraguay', 'Australia', 'Turkey']},
  E: { teams: ['Germany',  'Curaçao', 'ivory Coast',  'Ecuador']},
  F: { teams: ['Netherlands',  'Japan', 'Sweden', 'Tunisia ']},
  G: { teams: ['Belgium', 'Egypt',  'Iran',  'New Zealand']},
  H: { teams: ['Spain', 'Cape Verde', 'Saudi Arabia',  'Uruguay']},
  I: { teams: ['France',  'Senegal',  'Iraq', 'Norway ']},
  J: { teams: ['Argentina', 'Algeria', 'Australia',  'Jordan']},
  K: { teams: ['Portugal',  'DR Congo',  'Uzbekistan',  'Colombia ']},

  L: { teams: ['England',  'Croatia',  'Ghana',  'Panama ']},
}

// ── FLAGS ──
const FLAGS = {
  'Mexico': '🇲🇽', 'USA': '🇺🇸', 'Canada': '🇨🇦',
  'Argentina': '🇦🇷', 'Chile': '🇨🇱', 'Ecuador': '🇪🇨',
  'Brazil': '🇧🇷', 'Colombia': '🇨🇴', 'Uruguay': '🇺🇾',
  'Paraguay': '🇵🇾', 'Venezuela': '🇻🇪', 'Bolivia': '🇧🇴',
  'Jamaica': '🇯🇲', 'Panama': '🇵🇦', 'Honduras': '🇭🇳',
  'New Zealand': '🇳🇿', 'Costa Rica': '🇨🇷', 'El Salvador': '🇸🇻',
  'France': '🇫🇷', 'Belgium': '🇧🇪', 'Poland': '🇵🇱',
  'Spain': '🇪🇸', 'Portugal': '🇵🇹', 'Turkey': '🇹🇷',
  'England': '🇬🇧', 'Netherlands': '🇳🇱', 'Serbia': '🇷🇸',
  'Germany': '🇩🇪', 'Austria': '🇦🇹', 'Scotland': '🇬🇧',
  'Croatia': '🇭🇷', 'Switzerland': '🇨🇭', 'Denmark': '🇩🇰',
  'Italy': '🇮🇹', 'Norway': '🇳🇴', 'Sweden': '🇸🇪',
  'Wales': '🇬🇧', 'Finland': '🇫🇮', 'Ukraine': '🇺🇦',
  'Greece': '🇬🇷', 'Romania': '🇷🇴', 'Hungary': '🇭🇺',
  'Slovakia': '🇸🇰', 'Czech Republic': '🇨🇿', 'Slovenia': '🇸🇮',
  'Albania': '🇦🇱', 'Iceland': '🇮🇸',
  'Morocco': '🇲🇦', 'Senegal': '🇸🇳', 'Mali': '🇲🇱',
  'Ghana': '🇬🇭', 'Nigeria': '🇳🇬', 'Egypt': '🇪🇬',
  'Cameroon': '🇨🇲', 'DR Congo': '🇨🇩', 'South Africa': '🇿🇦',
  'Tunisia': '🇹🇳', 'Algeria': '🇩🇿', 'Ivory Coast': '🇨🇮',
  'Burkina Faso': '🇧🇫', 'Tanzania': '🇹🇿', 'Zambia': '🇿🇲',
  'Angola': '🇦🇴', 'Uganda': '🇺🇬', 'Kenya': '🇰🇪',
  'Guinea': '🇬🇳', 'Cape Verde': '🇨🇻', 'Namibia': '🇳🇦',
  'Benin': '🇧🇯', 'Comoros': '🇰🇲',
  'Japan': '🇯🇵', 'South Korea': '🇰🇷', 'Iran': '🇮🇷',
  'Saudi Arabia': '🇸🇦', 'UAE': '🇦🇪', 'Uzbekistan': '🇺🇿',
  'Iraq': '🇮🇶', 'Qatar': '🇶🇦', 'Australia': '🇦🇺',
  'China': '🇨🇳', 'Jordan': '🇯🇴', 'Oman': '🇴🇲',
  'Bahrain': '🇧🇭', 'Kuwait': '🇰🇼', 'Syria': '🇸🇾',
  'Vietnam': '🇻🇳', 'Thailand': '🇹🇭', 'Kyrgyzstan': '🇰🇬',
  'Tajikistan': '🇹🇯', 'Palestine': '🇵🇸',
  'Fiji': '🇫🇯', 'Papua New Guinea': '🇵🇬',
  'TBD': '🏳️',
};

// ── BRACKET DATA ──
const BRACKET_ROUNDS = [
  { id: 'r32', label: 'Round of 32',    matchCount: 16 },
  { id: 'r16', label: 'Round of 16',    matchCount: 8  },
  { id: 'qf',  label: 'Quarter Finals', matchCount: 4  },
  { id: 'sf',  label: 'Semi Finals',    matchCount: 2  },
  { id: 'fin', label: 'The Final',      matchCount: 1  },
];

const BRACKET_MATCHES = {
  r32: [
    { id: 1,  home: '1A', away: '2B' },
    { id: 2,  home: '1B', away: '2A' },
    { id: 3,  home: '1C', away: '2D' },
    { id: 4,  home: '1D', away: '2C' },
    { id: 5,  home: '1E', away: '2F' },
    { id: 6,  home: '1F', away: '2E' },
    { id: 7,  home: '1G', away: '2H' },
    { id: 8,  home: '1H', away: '2G' },
    { id: 9,  home: '1I', away: '2J' },
    { id: 10, home: '1J', away: '2I' },
    { id: 11, home: '1K', away: '2L' },
    { id: 12, home: '1L', away: '2K' },
    { id: 13, home: 'T1', away: 'T2' },
    { id: 14, home: 'T3', away: 'T4' },
    { id: 15, home: 'T5', away: 'T6' },
    { id: 16, home: 'T7', away: 'T8' },
  ],
  r16: Array.from({ length: 8 }, (_, i) => ({ id: i+1, home: 'TBD', away: 'TBD' })),
  qf:  Array.from({ length: 4 }, (_, i) => ({ id: i+1, home: 'TBD', away: 'TBD' })),
  sf:  Array.from({ length: 2 }, (_, i) => ({ id: i+1, home: 'TBD', away: 'TBD' })),
  fin: [{ id: 1, home: 'TBD', away: 'TBD' }],
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

// ── PREDICT DATA ──
const PREDICT_MATCHES = [
  { id: 'p1',  round: 'Group Stage',   home: 'Mexico',      away: 'USA',         date: 'Jun 14' },
  { id: 'p2',  round: 'Group Stage',   home: 'Argentina',   away: 'Chile',       date: 'Jun 15' },
  { id: 'p3',  round: 'Group Stage',   home: 'Brazil',      away: 'Colombia',    date: 'Jun 16' },
  { id: 'p4',  round: 'Group Stage',   home: 'France',      away: 'Belgium',     date: 'Jun 16' },
  { id: 'p5',  round: 'Group Stage',   home: 'Spain',       away: 'Portugal',    date: 'Jun 17' },
  { id: 'p6',  round: 'Group Stage',   home: 'England',     away: 'Netherlands', date: 'Jun 17' },
  { id: 'p7',  round: 'Group Stage',   home: 'Germany',     away: 'Austria',     date: 'Jun 18' },
  { id: 'p8',  round: 'Group Stage',   home: 'Morocco',     away: 'Senegal',     date: 'Jun 18' },
  { id: 'p9',  round: 'Group Stage',   home: 'Ghana',       away: 'Nigeria',     date: 'Jun 19' },
  { id: 'p10', round: 'Group Stage',   home: 'Japan',       away: 'South Korea', date: 'Jun 20' },
  { id: 'p11', round: 'Round of 32',   home: 'Group A Win', away: 'Group B 2nd', date: 'Jul 1'  },
  { id: 'p12', round: 'Round of 32',   home: 'Group C Win', away: 'Group D 2nd', date: 'Jul 1'  },
  { id: 'p13', round: 'Quarter Final', home: 'TBD',         away: 'TBD',         date: 'Jul 10' },
  { id: 'p14', round: 'Semi Final',    home: 'TBD',         away: 'TBD',         date: 'Jul 14' },
  { id: 'p15', round: 'The Final',     home: 'TBD',         away: 'TBD',         date: 'Jul 19' },
];

const ROUND_ORDER = ['Group Stage', 'Round of 32', 'Quarter Final', 'Semi Final', 'The Final'];

// ── PREMIUM BANNER ──
function PremiumBanner({ onUnlock }) {
  const [email, setEmail] = React.useState('');
  const [showForm, setShowForm] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  function handlePay() {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email');
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

// ── AD SLOT ──
function AdSlot() {
  return React.createElement('div', { className: 'ad-slot' },
    React.createElement('p', { className: 'ad-label' }, 'Advertisement'),
    React.createElement('ins', {
      className: 'adsbygoogle',
      style: { display: 'block' },
      'data-ad-client': 'ca-pub-YOUR_PUBLISHER_ID',
      'data-ad-slot': 'YOUR_AD_SLOT_ID',
      'data-ad-format': 'auto',
      'data-full-width-responsive': 'true'
    }),
    React.createElement('script', null, '(adsbygoogle = window.adsbygoogle || []).push({});')
  );
}

// ── APP ──
function App() {
  const [matches, setMatches] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('matches');
  const [premium, setPremium] = React.useState(isPremium());

  React.useEffect(() => { fetchMatches(); }, []);

  async function fetchMatches() {
    try {
      const res = await fetch(`${BASE_URL}/competitions/WC/matches`, {
        headers: { 'X-Auth-Token': API_KEY }
      });
      const data = await res.json();
      setMatches(data.matches || []);
    } catch (err) {
      console.error('API error:', err);
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
    !premium && React.createElement(AdSlot, null),
    activeTab === 'matches' && React.createElement(MatchesTab, { matches, loading }),
    activeTab === 'groups'  && React.createElement(GroupsTab, null),
    activeTab === 'bracket' && React.createElement(BracketTab, null),
    activeTab === 'predict' && React.createElement(PredictTab, null)
  );
}

// ── HEADER ──
function Header({ premium }) {
  return React.createElement('header', { className: 'header' },
    React.createElement('div', { className: 'header-trophy' }, '🏆'),
    React.createElement('h1', null, 'WORLD CUP 2026'),
    React.createElement('p', null, 'Track Every Match · Build Your Bracket'),
    premium && React.createElement('div', { className: 'premium-badge' }, '👑 PREMIUM')
  );
}

// ── MATCHES TAB ──
function MatchesTab({ matches, loading }) {
  if (loading) return React.createElement('div', { className: 'center-msg' }, '⚽ Loading matches...');
  if (!matches.length) return React.createElement('div', { className: 'center-msg' },
    React.createElement('div', { className: 'empty-icon' }, '📅'),
    React.createElement('p', null, 'Matches will appear here once the tournament begins'),
    React.createElement('span', { className: 'empty-sub' }, 'Opening match: June 11, 2026')
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

// ── GROUPS TAB ──
function GroupsTab() {
  const [openGroup, setOpenGroup] = React.useState('A');
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
    React.createElement(GroupTable, { groupLetter: openGroup, group: WC2026_GROUPS[openGroup] })
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

// ── BRACKET TAB ──
function BracketTab() {
  const [activeRound, setActiveRound] = React.useState('r32');
  const [selectedMatch, setSelectedMatch] = React.useState(null);
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
          onSelect: () => setSelectedMatch(selectedMatch === match.id ? null : match.id)
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
            React.createElement('span', { className: 'bracket-team-name' }, match.home === 'TBD' ? 'TBD' : match.home),
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
            React.createElement('span', { className: 'bracket-team-name' }, match.away === 'TBD' ? 'TBD' : match.away),
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

// ── PREDICT TAB ──
function PredictTab() {
  const [predictions, setPredictions] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem('wc2026_predictions') || '{}');
    } catch { return {}; }
  });
  const [activeRound, setActiveRound] = React.useState('Group Stage');
  const [savedFlash, setSavedFlash] = React.useState(false);

  const rounds = ROUND_ORDER.filter(r =>
    PREDICT_MATCHES.some(m => m.round === r)
  );

  const filteredMatches = PREDICT_MATCHES.filter(m => m.round === activeRound);
  const totalPredicted = Object.keys(predictions).length;
  const totalMatches = PREDICT_MATCHES.length;

  function pickWinner(matchId, winner) {
    const updated = { ...predictions, [matchId]: winner };
    setPredictions(updated);
    try {
      localStorage.setItem('wc2026_predictions', JSON.stringify(updated));
    } catch(e) {}
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  }

  function clearPredictions() {
    setPredictions({});
    try { localStorage.removeItem('wc2026_predictions'); } catch(e) {}
  }

  return React.createElement('div', { className: 'predict-container' },
    React.createElement('div', { className: 'predict-header' },
      React.createElement('h2', { className: 'section-title' }, 'My Predictions'),
      React.createElement('p', { className: 'section-sub' }, 'Pick your winners before each match kicks off')
    ),
    React.createElement('div', { className: 'predict-progress-wrap' },
      React.createElement('div', { className: 'predict-progress-top' },
        React.createElement('span', { className: 'progress-label' }, 'Your Progress'),
        React.createElement('span', { className: 'progress-count' },
          `${totalPredicted} / ${totalMatches} picked`
        )
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
      React.createElement('button', {
        className: 'clear-btn',
        onClick: clearPredictions
      }, '🗑️ Clear All Predictions'),
      React.createElement('div', { className: 'predict-disclaimer' },
        '⚡ Predictions are saved on your device'
      )
    )
  );
}

function PredictCard({ match, picked, onPick }) {
  const isPending = match.home === 'TBD' || match.away === 'TBD';
  const homeFlag  = FLAGS[match.home] || '🏳️';
  const awayFlag  = FLAGS[match.away] || '🏳️';
  const isFinal   = match.round === 'The Final';

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
        React.createElement('span', { className: 'predict-flag' }, homeFlag),
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
        React.createElement('span', { className: 'predict-flag' }, awayFlag),
        React.createElement('span', { className: 'predict-team-name' }, match.away),
        picked === match.away && React.createElement('span', { className: 'picked-check' }, '✓')
      )
    ),
    picked && React.createElement('div', { className: 'picked-result' },
      React.createElement('span', null,
        picked === 'draw'
          ? '🤝 You predicted a Draw'
          : `${FLAGS[picked] || '🏳️'} You picked ${picked} to win`
      )
    ),
    isPending && React.createElement('div', { className: 'pending-notice' },
      '⏳ Available after Group Stage'
    )
  );
}

// ── MOUNT ──
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/worldcup2026-tracker/sw.js')
    .catch(err => console.error('SW:', err));
}