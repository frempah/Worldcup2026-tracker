const { useState, useEffect } = React;

const API_KEY = 'YOUR_API_KEY_HERE';
const BASE_URL = 'https://api.football-data.org/v4';

function App() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matches');

  useEffect(() => {
    fetchMatches();
  }, []);

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

  return React.createElement('div', { className: 'app' },
    React.createElement(Header, null),
    React.createElement(NavTabs, { activeTab, setActiveTab }),
    loading
      ? React.createElement('div', { className: 'loader' }, '⚽ Loading...')
      : React.createElement(MatchList, { matches })
  );
}

function Header() {
  return React.createElement('header', { className: 'header' },
    React.createElement('h1', null, '🏆 World Cup 2026'),
    React.createElement('p', null, 'Track Every Match · Build Your Bracket')
  );
}

function NavTabs({ activeTab, setActiveTab }) {
  const tabs = ['matches', 'groups', 'bracket', 'predict'];
  return React.createElement('nav', { className: 'nav-tabs' },
    tabs.map(tab =>
      React.createElement('button', {
        key: tab,
        className: `tab ${activeTab === tab ? 'active' : ''}`,
        onClick: () => setActiveTab(tab)
      }, tab.charAt(0).toUpperCase() + tab.slice(1))
    )
  );
}

function MatchList({ matches }) {
  if (!matches.length) {
    return React.createElement('div', { className: 'empty' },
      '📅 Matches will appear here once the tournament begins'
    );
  }
  return React.createElement('div', { className: 'match-list' },
    matches.slice(0, 10).map(match =>
      React.createElement(MatchCard, { key: match.id, match })
    )
  );
}

function MatchCard({ match }) {
  const home = match.homeTeam?.name || 'TBD';
  const away = match.awayTeam?.name || 'TBD';
  const date = new Date(match.utcDate).toLocaleDateString();
  const status = match.status;

  return React.createElement('div', { className: 'match-card' },
    React.createElement('div', { className: 'match-date' }, date),
    React.createElement('div', { className: 'match-teams' },
      React.createElement('span', { className: 'team' }, home),
      React.createElement('span', { className: 'vs' }, 'VS'),
      React.createElement('span', { className: 'team' }, away)
    ),
    React.createElement('div', { className: `match-status ${status.toLowerCase()}` }, status)
  );
}

// Mount the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/worldcup2026-tracker/sw.js')
    .then(() => console.log('SW registered'))
    .catch(err => console.error('SW error:', err));
}

