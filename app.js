 const { useState, useEffect } = React;

const API_KEY = '63966ee47080428881fe646971ee918f';
const BASE_URL = 'https://api.football-data.org/v4';

// ── STATIC GROUP DATA (2026 WC confirmed groups as fallback) ──
const WC2026_GROUPS = {
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

};

const FLAGS = {
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
  return React.createElement('div', { className: 'center-msg' },
    React.createElement('div', { className: 'empty-icon' }, '🏆'),
    React.createElement('p', null, 'Bracket unlocks when Group Stage begins'),
    React.createElement('span', { className: 'empty-sub' }, 'Coming June 11, 2026')
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
