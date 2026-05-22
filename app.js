const { useState, useEffect } = React;

const API_KEY = '63966ee47080428881fe646971ee918f';
const BASE_URL = 'https://api.football-data.org/v4';


 // ── STATIC GROUP DATA (2026 WC confirmed groups as fallback) ──
const WC2026_GROUPS = {
  A: { teams: ['Mexico', 'USA', 'Canada', 'New Zealand'] },
  B: { teams: ['Argentina', 'Chile', 'Ecuador', 'Jamaica'] },
  C: { teams: ['Brazil', 'Colombia', 'Uruguay', 'Panama'] },
  D: { teams: ['France', 'Belgium', 'Poland', 'Paraguay'] },
  E: { teams: ['Spain', 'Portugal', 'Turkey', 'Honduras'] },
  F: { teams: ['England', 'Netherlands', 'Serbia', 'Venezuela'] },
  G: { teams: ['Germany', 'Austria', 'Scotland', 'Bolivia'] },
  H: { teams: ['Morocco', 'Senegal', 'Mali', 'Japan'] },
  I: { teams: ['Ghana', 'Nigeria', 'Egypt', 'South Korea'] },
  J: { teams: ['Cameroon', 'DR Congo', 'South Africa', 'Iran'] },
  K: { teams: ['Saudi Arabia', 'UAE', 'Uzbekistan', 'Croatia'] },
  L: { teams: ['Australia', 'Switzerland', 'Denmark', 'Italy'] },
};


const FLAGS = {
   // North America
  'Mexico': '🇲🇽', 'USA': '🇺🇸', 'Canada': '🇨🇦',
  // South America
  'Argentina': '🇦🇷', 'Chile': '🇨🇱', 'Ecuador': '🇪🇨',
  'Brazil': '🇧🇷', 'Colombia': '🇨🇴', 'Uruguay': '🇺🇾',
  'Paraguay': '🇵🇾', 'Venezuela': '🇻🇪', 'Bolivia': '🇧🇴',
  // CONCACAF
  'Jamaica': '🇯🇲', 'Panama': '🇵🇦', 'Honduras': '🇭🇳',
  'New Zealand': '🇳🇿',
  // Europe
  'France': '🇫🇷', 'Belgium': '🇧🇪', 'Poland': '🇵🇱',
  'Spain': '🇪🇸', 'Portugal': '🇵🇹', 'Turkey': '🇹🇷',
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Netherlands': '🇳🇱', 'Serbia': '🇷🇸',
  'Germany': '🇩🇪', 'Austria': '🇦🇹', 'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Croatia': '🇭🇷', 'Switzerland': '🇨🇭', 'Denmark': '🇩🇰',
  'Italy': '🇮🇹',
  // Africa
  'Morocco': '🇲🇦', 'Senegal': '🇸🇳', 'Mali': '🇲🇱',
  'Ghana': '🇬🇭', 'Nigeria': '🇳🇬', 'Egypt': '🇪🇬',
  'Cameroon': '🇨🇲', 'DR Congo': '🇨🇩', 'South Africa': '🇿🇦',
  // Asia
  'Japan': '🇯🇵', 'South Korea': '🇰🇷', 'Iran': '🇮🇷',
  'Saudi Arabia': '🇸🇦', 'UAE': '🇦🇪', 'Uzbekistan': '🇺🇿',
  // Oceania
  'Australia': '🇦🇺',
};

// ── MAIN APP ──
function App() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matches');

  useEffect(() => { fetchMatches(); }, []);

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
    React.createElement(Header, null),
    React.createElement('nav', { className: 'nav-tabs' },
      tabs.map(t =>
        React.createElement('button', {
          key: t.id,
          className: `tab ${activeTab === t.id ? 'active' : ''}`,
          onClick: () => setActiveTab(t.id)
        }, t.label)
      )
    ),
    activeTab === 'matches' && React.createElement(MatchesTab, { matches, loading }),
    activeTab === 'groups'  && React.createElement(GroupsTab, null),
    activeTab === 'bracket' && React.createElement(BracketTab, null),
    activeTab === 'predict' && React.createElement(PredictTab, null)
  );
}

// ── HEADER ──
function Header() {
  return React.createElement('header', { className: 'header' },
    React.createElement('div', { className: 'header-trophy' }, '🏆'),
    React.createElement('h1', null, 'WORLD CUP 2026'),
    React.createElement('p', null, 'Track Every Match · Build Your Bracket')
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
  const [openGroup, setOpenGroup] = useState('A');

  return React.createElement('div', { className: 'groups-container' },
    React.createElement('h2', { className: 'section-title' }, 'Group Stage'),
    React.createElement('p', { className: 'section-sub' }, '12 Groups · 48 Teams · 104 Matches'),

    // Group selector pills
    React.createElement('div', { className: 'group-pills' },
      Object.keys(WC2026_GROUPS).map(g =>
        React.createElement('button', {
          key: g,
          className: `group-pill ${openGroup === g ? 'active' : ''}`,
          onClick: () => setOpenGroup(g)
        }, `Group ${g}`)
      )
    ),

    // Active group table
    React.createElement(GroupTable, { groupLetter: openGroup, group: WC2026_GROUPS[openGroup] })
  );
}

function GroupTable({ groupLetter, group }) {
  return React.createElement('div', { className: 'group-table-wrap' },
    React.createElement('div', { className: 'group-table-header' },
      React.createElement('span', { className: 'group-label' }, `GROUP ${groupLetter}`),
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

// ── BRACKET TAB (placeholder — Phase 3) ──
function BracketTab() {
  // ── BRACKET DATA ──
const BRACKET_ROUNDS = [
  { id: 'r32',  label: 'Round of 32', matchCount: 16 },
  { id: 'r16',  label: 'Round of 16', matchCount: 8  },
  { id: 'qf',   label: 'Quarter Finals', matchCount: 4 },
  { id: 'sf',   label: 'Semi Finals', matchCount: 2  },
  { id: 'fin',  label: 'The Final', matchCount: 1   },
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
  r16: Array.from({ length: 8  }, (_, i) => ({ id: i+1, home: 'TBD', away: 'TBD' })),
  qf:  Array.from({ length: 4  }, (_, i) => ({ id: i+1, home: 'TBD', away: 'TBD' })),
  sf:  Array.from({ length: 2  }, (_, i) => ({ id: i+1, home: 'TBD', away: 'TBD' })),
  fin: [{ id: 1, home: 'TBD', away: 'TBD' }],
};

// Labels explained
const SLOT_LABELS = {
  '1A':'Group A Winner', '2A':'Group A Runner-up',
  '1B':'Group B Winner', '2B':'Group B Runner-up',
  '1C':'Group C Winner', '2C':'Group C Runner-up',
  '1D':'Group D Winner', '2D':'Group D Runner-up',
  '1E':'Group E Winner', '2E':'Group E Runner-up',
  '1F':'Group F Winner', '2F':'Group F Runner-up',
  '1G':'Group G Winner', '2G':'Group G Runner-up',
  '1H':'Group H Winner', '2H':'Group H Runner-up',
  '1I':'Group I Winner', '2I':'Group I Runner-up',
  '1J':'Group J Winner', '2J':'Group J Runner-up',
  '1K':'Group K Winner', '2K':'Group K Runner-up',
  '1L':'Group L Winner', '2L':'Group L Runner-up',
  'T1':'Best 3rd #1', 'T2':'Best 3rd #2',
  'T3':'Best 3rd #3', 'T4':'Best 3rd #4',
  'T5':'Best 3rd #5', 'T6':'Best 3rd #6',
  'T7':'Best 3rd #7', 'T8':'Best 3rd #8',
  'TBD':'To Be Determined',
};

// ── BRACKET TAB ──
function BracketTab() {
  const [activeRound, setActiveRound] = useState('r32');
  const [selectedMatch, setSelectedMatch] = useState(null);

  const matches = BRACKET_MATCHES[activeRound];

  return React.createElement('div', { className: 'bracket-container' },

    // Header
    React.createElement('div', { className: 'bracket-header' },
      React.createElement('h2', { className: 'section-title' }, 'Knockout Bracket'),
      React.createElement('p', { className: 'section-sub' },
        'Bracket unlocks as teams qualify · June 2026'
      )
    ),

    // Round selector
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

    // Round title bar
    React.createElement('div', { className: 'round-title-bar' },
      React.createElement('span', { className: 'round-title-text' },
        BRACKET_ROUNDS.find(r => r.id === activeRound)?.label
      ),
      activeRound === 'fin'
        ? React.createElement('span', { className: 'final-badge' }, '🏆 FINAL')
        : React.createElement('span', { className: 'match-count-badge' },
            matches.length + ' matches'
          )
    ),

    // Match cards
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

    // Bottom note
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
    // Match number
    React.createElement('div', { className: 'bracket-match-num' },
      isFinal ? '🏆 FINAL' : `Match ${matchNum}`
    ),

    // Team rows
    React.createElement('div', { className: 'bracket-teams' },

      // Home team
      React.createElement('div', { className: 'bracket-team home-team' },
        React.createElement('div', { className: 'bracket-team-left' },
          React.createElement('span', { className: 'bracket-flag' },
            FLAGS[match.home] || '🏳️'
          ),
          React.createElement('div', { className: 'bracket-team-info' },
            React.createElement('span', { className: 'bracket-team-name' },
              match.home === 'TBD' ? 'TBD' : match.home
            ),
            React.createElement('span', { className: 'bracket-team-sub' }, homeLabel)
          )
        ),
        React.createElement('span', { className: 'bracket-score' },
          isPending ? '-' : '0'
        )
      ),

      // Divider
      React.createElement('div', { className: 'bracket-divider' },
        React.createElement('span', { className: 'bracket-vs' }, 'VS')
      ),

      // Away team
      React.createElement('div', { className: 'bracket-team away-team' },
        React.createElement('div', { className: 'bracket-team-left' },
          React.createElement('span', { className: 'bracket-flag' },
            FLAGS[match.away] || '🏳️'
          ),
          React.createElement('div', { className: 'bracket-team-info' },
            React.createElement('span', { className: 'bracket-team-name' },
              match.away === 'TBD' ? 'TBD' : match.away
            ),
            React.createElement('span', { className: 'bracket-team-sub' }, awayLabel)
          )
        ),
        React.createElement('span', { className: 'bracket-score' },
          isPending ? '-' : '0'
        )
      )
    ),

    // Expanded detail on tap
    isSelected && React.createElement('div', { className: 'bracket-detail' },
      React.createElement('span', null,
        isPending
          ? '⏳ Teams will be confirmed after Group Stage'
          : '📍 Venue & date to be announced'
      )
    )
  );
}







  );
}

// ── PREDICT TAB (placeholder — Phase 4) ──
function PredictTab() {
  return React.createElement('div', { className: 'center-msg' },
    React.createElement('div', { className: 'empty-icon' }, '🎯'),
    React.createElement('p', null, 'Predictions open soon'),
    React.createElement('span', { className: 'empty-sub' }, 'Pick your winners before each match')
  );
}

// ── MOUNT ──
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/worldcup2026-tracker/sw.js')
    .catch(err => console.error('SW:', err));
}
