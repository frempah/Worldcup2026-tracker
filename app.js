/**
 * WORLD CUP 2026 TRACKER — app.js
 * FrempahBrand · world26trphy.vercel.app
 * Features: Live Scores · Groups · Bracket · Predictions · Quiz · Profile
 */
(function () {
'use strict';

/* ─── REACT ──────────────────────────────────────────────────── */
var h          = React.createElement;
var useState   = React.useState;
var useEffect  = React.useEffect;
var useRef     = React.useRef;
var Fragment   = React.Fragment;

/* ─── CONFIG ─────────────────────────────────────────────────── */

var PAYSTACK_KEY = 'pk_live_75f6caa32d55fd1de3a2ef92f2821220aace411b';


var DIRECT_API_KEY = '63966ee47080428881fe646971ee918f';

var CACHE_TTL  = 5 * 60 * 1000; // 5 minutes

/* ─── STORAGE KEYS ───────────────────────────────────────────── */
var K = {
  premium:   'wc2026_premium_v3',
  onboarded: 'wc2026_onboarded_v3',
  picks:     'wc2026_picks_v3',
  matches:   'wc2026_matches_v10',
  matchTs:   'wc2026_match_ts_v10',
  install:   'wc2026_install_v3',
  user:      'wc2026_user_v1',
  quizHs:    'wc2026_quiz_hs_v1',
  quizTotal: 'wc2026_quiz_total_v1',
  quizPlayed:'wc2026_quiz_played_v1',
  joined:    'wc2026_joined_v1',
};

/* ─── STORAGE HELPERS ────────────────────────────────────────── */
function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {} }
function load(k, fb) {
  try { var r = localStorage.getItem(k); return r !== null ? JSON.parse(r) : fb; }
  catch(e) { return fb; }
}
function pad(n) { return String(n).padStart(2,'0'); }

/* ─── PAYSTACK ───────────────────────────────────────────────── */
function isPremium() { return load(K.premium, false) === true; }
function launchPaystack(email, ok, cancel) {
  if (typeof PaystackPop === 'undefined') { alert('Payment unavailable. Check connection.'); return; }
  PaystackPop.setup({
    key: PAYSTACK_KEY, email: email, amount: 2000, currency: 'GHS',
    ref: 'WC26_' + Date.now(),
    onSuccess: function() { save(K.premium, true); ok(); },
    onCancel:  cancel || function() {}
  }).openIframe();
}

/* ─── PWA INSTALL ────────────────────────────────────────────── */
var installEvt = null;
window.addEventListener('beforeinstallprompt', function(e) { e.preventDefault(); installEvt = e; });

/* ─── ICON HELPER ────────────────────────────────────────────── */
function MSIcon(name, cls) {
  return h('span', { className: 'material-symbols-outlined ' + (cls||''), 'aria-hidden':'true' }, name);
}

/* ─── FLAG CODES ─────────────────────────────────────────────── */
var FC = {
  'Mexico':'mx','South Africa':'za','South Korea':'kr','Czech Republic':'cz',
  'Canada':'ca','Bosnia and Herzegovina':'ba','Qatar':'qa','Switzerland':'ch',
  'Brazil':'br','Morocco':'ma','Haiti':'ht','Scotland':'gb-sct',
  'United States':'us','Paraguay':'py','Australia':'au','Turkey':'tr',
  'Germany':'de','Curacao':'cw','Ivory Coast':'ci','Ecuador':'ec',
  'Netherlands':'nl','Japan':'jp','Sweden':'se','Tunisia':'tn',
  'Belgium':'be','Egypt':'eg','Iran':'ir','New Zealand':'nz',
  'Spain':'es','Cape Verde':'cv','Saudi Arabia':'sa','Uruguay':'uy',
  'France':'fr','Senegal':'sn','Iraq':'iq','Norway':'no',
  'Argentina':'ar','Algeria':'dz','Austria':'at','Jordan':'jo',
  'Portugal':'pt','DR Congo':'cd','Uzbekistan':'uz','Colombia':'co',
  'England':'gb-eng','Croatia':'hr','Ghana':'gh','Panama':'pa',
};
function Flag(p) {
  var code = FC[p.team] || FC[(p.team||'').replace('Korea Republic','South Korea')];
  if (!code) return h('span',{className:'flag-unknown'},MSIcon('flag','icon-sm'));
  return h('span',{className:'fi fi-'+code+' '+(p.cls||'flag-md'),title:p.team,'aria-label':p.team+' flag'});
}
function isSlot(n) {
  return !n||n==='TBD'||n.startsWith('Win')||n.startsWith('2nd')||
         n.startsWith('Best')||n.startsWith('W Match');
}

/* ─── OFFICIAL FIFA 2026 DATA ────────────────────────────────── */
/* Source: FIFA.com official draw December 2025 */
var GROUPS = {
  A:['Mexico','South Africa','South Korea','Czech Republic'],
  B:['Canada','Bosnia and Herzegovina','Qatar','Switzerland'],
  C:['Brazil','Morocco','Haiti','Scotland'],
  D:['United States','Paraguay','Australia','Turkey'],
  E:['Germany','Curacao','Ivory Coast','Ecuador'],
  F:['Netherlands','Japan','Sweden','Tunisia'],
  G:['Belgium','Egypt','Iran','New Zealand'],
  H:['Spain','Cape Verde','Saudi Arabia','Uruguay'],
  I:['France','Senegal','Iraq','Norway'],
  J:['Argentina','Algeria','Austria','Jordan'],
  K:['Portugal','DR Congo','Uzbekistan','Colombia'],
  L:['England','Croatia','Ghana','Panama']
};

var FIXTURES = [
  {id:'g01',r:'Group Stage',a:'Mexico',b:'South Africa',date:'Jun 11',city:'Mexico City'},
  {id:'g02',r:'Group Stage',a:'South Korea',b:'Czech Republic',date:'Jun 11',city:'Guadalajara'},
  {id:'g03',r:'Group Stage',a:'Canada',b:'Bosnia and Herzegovina',date:'Jun 12',city:'Toronto'},
  {id:'g04',r:'Group Stage',a:'United States',b:'Paraguay',date:'Jun 12',city:'Los Angeles'},
  {id:'g05',r:'Group Stage',a:'Australia',b:'Turkey',date:'Jun 12',city:'Kansas City'},
  {id:'g06',r:'Group Stage',a:'Qatar',b:'Switzerland',date:'Jun 13',city:'San Francisco'},
  {id:'g07',r:'Group Stage',a:'Brazil',b:'Morocco',date:'Jun 13',city:'New York/NJ'},
  {id:'g08',r:'Group Stage',a:'Haiti',b:'Scotland',date:'Jun 13',city:'Boston'},
  {id:'g09',r:'Group Stage',a:'Germany',b:'Curacao',date:'Jun 14',city:'Houston'},
  {id:'g10',r:'Group Stage',a:'Ivory Coast',b:'Ecuador',date:'Jun 14',city:'Philadelphia'},
  {id:'g11',r:'Group Stage',a:'Netherlands',b:'Japan',date:'Jun 14',city:'Dallas'},
  {id:'g12',r:'Group Stage',a:'Sweden',b:'Tunisia',date:'Jun 14',city:'Monterrey'},
  {id:'g13',r:'Group Stage',a:'Belgium',b:'Egypt',date:'Jun 15',city:'Seattle'},
  {id:'g14',r:'Group Stage',a:'Iran',b:'New Zealand',date:'Jun 15',city:'Los Angeles'},
  {id:'g15',r:'Group Stage',a:'Spain',b:'Cape Verde',date:'Jun 15',city:'Atlanta'},
  {id:'g16',r:'Group Stage',a:'Saudi Arabia',b:'Uruguay',date:'Jun 15',city:'Miami'},
  {id:'g17',r:'Group Stage',a:'France',b:'Senegal',date:'Jun 16',city:'New York/NJ'},
  {id:'g18',r:'Group Stage',a:'Iraq',b:'Norway',date:'Jun 16',city:'Boston'},
  {id:'g19',r:'Group Stage',a:'Argentina',b:'Algeria',date:'Jun 16',city:'Kansas City'},
  {id:'g20',r:'Group Stage',a:'Austria',b:'Jordan',date:'Jun 16',city:'San Francisco'},
  {id:'g21',r:'Group Stage',a:'Portugal',b:'Colombia',date:'Jun 17',city:'Houston'},
  {id:'g22',r:'Group Stage',a:'DR Congo',b:'Uzbekistan',date:'Jun 17',city:'Atlanta'},
  {id:'g23',r:'Group Stage',a:'England',b:'Croatia',date:'Jun 17',city:'Vancouver'},
  {id:'g24',r:'Group Stage',a:'Ghana',b:'Panama',date:'Jun 17',city:'Dallas'},
  {id:'r01',r:'Round of 32',a:'2nd Grp A',b:'2nd Grp B',date:'Jun 28',city:'Los Angeles'},
  {id:'r02',r:'Round of 32',a:'Win Grp C',b:'2nd Grp F',date:'Jun 29',city:'Houston'},
  {id:'r03',r:'Round of 32',a:'Win Grp E',b:'Best 3rd',date:'Jun 29',city:'Boston'},
  {id:'r04',r:'Round of 32',a:'Win Grp F',b:'2nd Grp C',date:'Jun 29',city:'Monterrey'},
  {id:'r05',r:'Round of 32',a:'2nd Grp E',b:'2nd Grp I',date:'Jun 30',city:'Dallas'},
  {id:'r06',r:'Round of 32',a:'Win Grp I',b:'Best 3rd',date:'Jun 30',city:'New York/NJ'},
  {id:'r07',r:'Round of 32',a:'Win Grp A',b:'Best 3rd',date:'Jun 30',city:'Mexico City'},
  {id:'r08',r:'Round of 32',a:'Win Grp L',b:'Best 3rd',date:'Jul 1',city:'Atlanta'},
  {id:'r09',r:'Round of 32',a:'Win Grp D',b:'Best 3rd',date:'Jul 1',city:'San Francisco'},
  {id:'r10',r:'Round of 32',a:'Win Grp G',b:'Best 3rd',date:'Jul 1',city:'Seattle'},
  {id:'r11',r:'Round of 32',a:'Win Grp H',b:'2nd Grp J',date:'Jul 2',city:'Los Angeles'},
  {id:'r12',r:'Round of 32',a:'2nd Grp K',b:'2nd Grp L',date:'Jul 2',city:'Toronto'},
  {id:'r13',r:'Round of 32',a:'Win Grp B',b:'Best 3rd',date:'Jul 2',city:'Vancouver'},
  {id:'r14',r:'Round of 32',a:'Win Grp J',b:'2nd Grp H',date:'Jul 3',city:'Miami'},
  {id:'r15',r:'Round of 32',a:'Win Grp K',b:'Best 3rd',date:'Jul 3',city:'Guadalajara'},
  {id:'r16',r:'Round of 32',a:'2nd Grp D',b:'2nd Grp G',date:'Jul 3',city:'Dallas'},
  {id:'s01',r:'Round of 16',a:'W Match 1',b:'W Match 2',date:'Jul 5',city:'TBD'},
  {id:'s02',r:'Round of 16',a:'W Match 3',b:'W Match 4',date:'Jul 5',city:'TBD'},
  {id:'s03',r:'Round of 16',a:'W Match 5',b:'W Match 6',date:'Jul 6',city:'TBD'},
  {id:'s04',r:'Round of 16',a:'W Match 7',b:'W Match 8',date:'Jul 6',city:'TBD'},
  {id:'s05',r:'Round of 16',a:'W Match 9',b:'W Match 10',date:'Jul 7',city:'TBD'},
  {id:'s06',r:'Round of 16',a:'W Match 11',b:'W Match 12',date:'Jul 7',city:'TBD'},
  {id:'s07',r:'Round of 16',a:'W Match 13',b:'W Match 14',date:'Jul 8',city:'TBD'},
  {id:'s08',r:'Round of 16',a:'W Match 15',b:'W Match 16',date:'Jul 8',city:'TBD'},
  {id:'q01',r:'Quarter Final',a:'TBD',b:'TBD',date:'Jul 10',city:'TBD'},
  {id:'q02',r:'Quarter Final',a:'TBD',b:'TBD',date:'Jul 10',city:'TBD'},
  {id:'q03',r:'Quarter Final',a:'TBD',b:'TBD',date:'Jul 11',city:'TBD'},
  {id:'q04',r:'Quarter Final',a:'TBD',b:'TBD',date:'Jul 11',city:'TBD'},
  {id:'sf1',r:'Semi Final',a:'TBD',b:'TBD',date:'Jul 14',city:'Dallas'},
  {id:'sf2',r:'Semi Final',a:'TBD',b:'TBD',date:'Jul 15',city:'Atlanta'},
  {id:'fin',r:'The Final',a:'TBD',b:'TBD',date:'Jul 19',city:'NY/NJ Stadium'}
];

var BRACKET_ROUNDS = [
  {id:'r32',label:'Round of 32',n:16,icon:'looks_32'},
  {id:'r16',label:'Round of 16',n:8, icon:'looks_16'},
  {id:'qf', label:'Quarter Finals',n:4,icon:'looks_4'},
  {id:'sf', label:'Semi Finals',n:2, icon:'looks_two'},
  {id:'fin',label:'The Final',n:1,   icon:'emoji_events'}
];
var BRACKET_DATA = {
  r32:[
    {id:1,a:'2nd Grp A',b:'2nd Grp B',date:'Jun 28',city:'Los Angeles'},
    {id:2,a:'Win Grp C',b:'2nd Grp F',date:'Jun 29',city:'Houston'},
    {id:3,a:'Win Grp E',b:'Best 3rd', date:'Jun 29',city:'Boston'},
    {id:4,a:'Win Grp F',b:'2nd Grp C',date:'Jun 29',city:'Monterrey'},
    {id:5,a:'2nd Grp E',b:'2nd Grp I',date:'Jun 30',city:'Dallas'},
    {id:6,a:'Win Grp I',b:'Best 3rd', date:'Jun 30',city:'New York/NJ'},
    {id:7,a:'Win Grp A',b:'Best 3rd', date:'Jun 30',city:'Mexico City'},
    {id:8,a:'Win Grp L',b:'Best 3rd', date:'Jul 1', city:'Atlanta'},
    {id:9,a:'Win Grp D',b:'Best 3rd', date:'Jul 1', city:'San Francisco'},
    {id:10,a:'Win Grp G',b:'Best 3rd',date:'Jul 1', city:'Seattle'},
    {id:11,a:'Win Grp H',b:'2nd Grp J',date:'Jul 2',city:'Los Angeles'},
    {id:12,a:'2nd Grp K',b:'2nd Grp L',date:'Jul 2',city:'Toronto'},
    {id:13,a:'Win Grp B',b:'Best 3rd', date:'Jul 2',city:'Vancouver'},
    {id:14,a:'Win Grp J',b:'2nd Grp H',date:'Jul 3',city:'Miami'},
    {id:15,a:'Win Grp K',b:'Best 3rd', date:'Jul 3',city:'Guadalajara'},
    {id:16,a:'2nd Grp D',b:'2nd Grp G',date:'Jul 3',city:'Dallas'}
  ],
  r16:[1,2,3,4,5,6,7,8].map(function(i){return{id:i,a:'TBD',b:'TBD'};}),
  qf: [1,2,3,4].map(function(i){return{id:i,a:'TBD',b:'TBD'};}),
  sf: [1,2].map(function(i){return{id:i,a:'TBD',b:'TBD'};}),
  fin:[{id:1,a:'TBD',b:'TBD'}]
};

/* ─── QUIZ QUESTIONS ─────────────────────────────────────────── */
/* 30 questions — shuffled per session */
var ALL_QUESTIONS = [
  {q:'How many teams compete in the 2026 FIFA World Cup?',opts:['32','40','48','64'],a:2,fact:'2026 expanded to 48 teams — the biggest World Cup in history.'},
  {q:'Which city hosts the opening match of the 2026 World Cup?',opts:['Los Angeles','New York','Mexico City','Toronto'],a:2,fact:'Estadio Azteca in Mexico City hosts Mexico vs South Africa on June 11.'},
  {q:'Where is the 2026 World Cup Final held?',opts:['SoFi Stadium','MetLife Stadium','AT&T Stadium','Estadio Azteca'],a:1,fact:'MetLife Stadium in New Jersey hosts the Final on July 19.'},
  {q:'What brand-new knockout round was introduced for 2026?',opts:['Round of 48','Round of 32','Preliminary Round','Play-off Stage'],a:1,fact:'The Round of 32 is new — the 48-team format required an extra knockout round.'},
  {q:'How many nations co-host the 2026 World Cup?',opts:['1','2','3','4'],a:2,fact:'USA, Canada and Mexico co-host — only the second time 3 nations share hosting duties.'},
  {q:'Which group is Ghana in for 2026?',opts:['Group H','Group J','Group K','Group L'],a:3,fact:'Ghana is in Group L alongside England, Croatia and Panama.'},
  {q:'How many groups are there in the 2026 group stage?',opts:['8','10','12','16'],a:2,fact:'The expanded 48-team format uses 12 groups of 4 teams.'},
  {q:'Who does Mexico face in the opening match?',opts:['USA','Canada','South Africa','Scotland'],a:2,fact:'Mexico plays South Africa on June 11 at Estadio Azteca.'},
  {q:'Which African team is in Group C alongside Brazil?',opts:['Egypt','Senegal','Morocco','Ghana'],a:2,fact:'Morocco, the 2022 semi-finalists, are in Group C with Brazil, Haiti and Scotland.'},
  {q:'When is the 2026 World Cup Final?',opts:['July 12','July 15','July 18','July 19'],a:3,fact:'The Final is on July 19, 2026 at MetLife Stadium, New Jersey.'},
  {q:'Who won the 2022 FIFA World Cup?',opts:['France','Brazil','Argentina','Croatia'],a:2,fact:'Argentina won the 2022 World Cup in Qatar, beating France on penalties.'},
  {q:'Which country has won the most FIFA World Cups?',opts:['Germany','Argentina','Italy','Brazil'],a:3,fact:'Brazil has won 5 World Cups — 1958, 1962, 1970, 1994 and 2002.'},
  {q:'Who holds the record for most World Cup goals ever?',opts:['Ronaldo','Pele','Miroslav Klose','Gerd Müller'],a:2,fact:'Miroslav Klose of Germany scored 16 World Cup goals across 4 tournaments.'},
  {q:'Which country hosted the first FIFA World Cup in 1930?',opts:['Brazil','Argentina','Chile','Uruguay'],a:3,fact:'Uruguay hosted and won the inaugural 1930 FIFA World Cup.'},
  {q:'Which African team made history by reaching the 2022 semi-finals?',opts:['Senegal','Ghana','Cameroon','Morocco'],a:3,fact:'Morocco became the first African team ever to reach a World Cup semi-final.'},
  {q:'Who won the Golden Boot at the 2022 World Cup?',opts:['Messi','Mbappé','Giroud','Álvarez'],a:1,fact:'Kylian Mbappé won the Golden Boot with 8 goals, including a final hat-trick.'},
  {q:'Which year did France last win the World Cup before 2026?',opts:['2006','2010','2014','2018'],a:3,fact:'France won in Russia 2018, defeating Croatia 4-2 in the final.'},
  {q:'Which nation has appeared in the most World Cup finals?',opts:['Brazil','Italy','Germany','Argentina'],a:2,fact:'Germany/West Germany have appeared in 8 World Cup finals, winning 4.'},
  {q:'Which group features both France and Senegal in 2026?',opts:['Group G','Group H','Group I','Group J'],a:2,fact:'Group I is a group of death with France, Senegal, Iraq and Norway.'},
  {q:'Who is Argentina grouped with in 2026?',opts:['Brazil','France','Algeria','Germany'],a:2,fact:'Argentina faces Algeria, Austria and Jordan in Group J.'},
  {q:'How many African nations qualified for the 2026 World Cup?',opts:['9','11','13','15'],a:2,fact:'A record 13 African nations qualified for the 2026 World Cup.'},
  {q:'What does VAR stand for in football?',opts:['Video Assistance Review','Visual Aid Referee','Video Assistant Referee','Virtual Action Replay'],a:2,fact:'VAR — Video Assistant Referee — has been used at World Cups since Russia 2018.'},
  {q:'How long is a standard football match?',opts:['80 minutes','90 minutes','100 minutes','120 minutes'],a:1,fact:'90 minutes standard — two 45-minute halves plus injury time added by the referee.'},
  {q:'Which group has both Germany and Ivory Coast in 2026?',opts:['Group D','Group E','Group F','Group G'],a:1,fact:'Group E has Germany, Curacao, Ivory Coast and Ecuador.'},
  {q:'Where does England play their first 2026 match?',opts:['Boston','Vancouver','New York','Dallas'],a:1,fact:'England vs Croatia on June 17 is played in Vancouver, Canada.'},
  {q:'Which team did Ghana beat in the 2010 Round of 16?',opts:['Germany','USA','Australia','England'],a:1,fact:'Ghana beat USA 2-1 in extra time in the 2010 Round of 16 in South Africa.'},
  {q:'How many World Cups has Portugal\'s Cristiano Ronaldo played in?',opts:['3','4','5','6'],a:2,fact:'Ronaldo has played in 5 World Cups — 2006, 2010, 2014, 2018 and 2022.'},
  {q:'What is the maximum number of players in a World Cup squad in 2026?',opts:['23','26','30','32'],a:1,fact:'FIFA expanded squads to 26 players from the 2022 World Cup onwards.'},
  {q:'Which host city in the USA has the largest stadium for 2026?',opts:['Los Angeles','Dallas','New York/NJ','Miami'],a:2,fact:'MetLife Stadium (New York/NJ) with 82,500 capacity hosts the Final — largest WC venue.'},
  {q:'Who does Brazil face in their opening 2026 World Cup match?',opts:['Haiti','Scotland','Morocco','Ecuador'],a:2,fact:'Brazil opens Group C against Morocco on June 13 at MetLife Stadium, New York/NJ.'}
];

function shuffleQuestions() {
  var q = ALL_QUESTIONS.slice();
  for (var i = q.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = q[i]; q[i] = q[j]; q[j] = t;
  }
  return q.slice(0, 5);
}

/* ─── AVATAR EMOJIS ──────────────────────────────────────────── */
var AVATARS = ['⚽','🏆','🎯','🦁','🐉','🦅','🌟','🔥','💎','⚡','🎪','🏅','🥇','🦊','🐯'];
var TEAMS_LIST = Object.keys(GROUPS).reduce(function(acc, g) {
  return acc.concat(GROUPS[g]);
}, []).sort();

/* ─── ERROR BOUNDARY ─────────────────────────────────────────── */
class ErrorBoundary extends React.Component {
  constructor(p) { super(p); this.state = {crashed:false}; }
  static getDerivedStateFromError() { return {crashed:true}; }
  componentDidCatch(e,i) { console.error('[WC2026]',e,i); }
  render() {
    if (!this.state.crashed) return this.props.children;
    return h('div',{className:'crash-screen'},
      MSIcon('sports_soccer','crash-icon'),
      h('h2',{className:'crash-title'},'Oops! App Error'),
      h('p', {className:'crash-msg'}, 'Something went wrong. Tap to restart.'),
      h('button',{className:'btn-gold',onClick:function(){window.location.reload();}},
        MSIcon('refresh','btn-icon'), ' Reload')
    );
  }
}

/* ─── ONBOARDING ─────────────────────────────────────────────── */
var OB_SLIDES = [
  {icon:'emoji_events',tag:'WELCOME',l1:'WORLD CUP',l2:'2026',
   body:'The biggest tournament in history. 48 teams. 104 matches. USA, Canada & Mexico. Starting June 11.',
   color:'#c9a84c',bg:'linear-gradient(160deg,#0a0e1a,#1c1200)'},
  {icon:'calendar_month',tag:'LIVE SCORES',l1:'EVERY',l2:'MATCH',
   body:'Real-time scores for all 104 matches. Live updates from all 16 host stadiums. Never miss a goal.',
   color:'#38bdf8',bg:'linear-gradient(160deg,#0a0e1a,#001830)'},
  {icon:'table_chart',tag:'GROUPS & BRACKET',l1:'FULL',l2:'TOURNAMENT',
   body:'All 12 official FIFA groups and the complete knockout bracket from Round of 32 to the Final.',
   color:'#4ade80',bg:'linear-gradient(160deg,#0a0e1a,#001a06)'},
  {icon:'sports_score',tag:'PREDICT & QUIZ',l1:'PLAY &',l2:'WIN',
   body:'Predict every match result. Test your football knowledge with our daily World Cup quiz.',
   color:'#fb923c',bg:'linear-gradient(160deg,#0a0e1a,#200e00)'}
];

function Onboarding(props) {
  var _s = useState(0); var idx = _s[0], setIdx = _s[1];
  var s = OB_SLIDES[idx];
  var last = idx === OB_SLIDES.length - 1;
  function done() { save(K.onboarded,true); props.onDone(); }
  function next() { last ? done() : setIdx(idx+1); }
  return h('div',{className:'ob-root',style:{background:s.bg}},
    h('div',{className:'ob-topbar'},
      h('button',{className:'ob-nav-btn'+(idx===0?' ob-hidden':''),onClick:function(){idx>0&&setIdx(idx-1);},'aria-label':'Previous'},
        MSIcon('chevron_left','ob-nav-icon')),
      h('div',{className:'ob-track'},
        h('div',{className:'ob-fill',style:{width:((idx+1)/OB_SLIDES.length*100)+'%',background:s.color}})),
      h('button',{className:'ob-skip'+(last?' ob-hidden':''),onClick:done},'Skip')
    ),
    h('div',{className:'ob-body',key:idx},
      h('div',{className:'ob-icon-ring',style:{borderColor:s.color+'50',boxShadow:'0 0 48px '+s.color+'28'}},
        MSIcon(s.icon,'ob-icon')),
      h('span',{className:'ob-tag',style:{color:s.color,background:s.color+'18',border:'1px solid '+s.color+'40'}},s.tag),
      h('div',{className:'ob-title'},
        h('span',{style:{color:s.color}},s.l1),
        h('span',{style:{color:'#f0f0f0'}},s.l2)),
      h('p',{className:'ob-body-text'},s.body),
      last && h('div',{className:'ob-features'},
        [{icon:'calendar_month',l:'Live Scores'},{icon:'table_chart',l:'12 Groups'},
         {icon:'emoji_events',l:'Full Bracket'},{icon:'sports_score',l:'Predictions'},
         {icon:'quiz',l:'Daily Quiz'},{icon:'check_circle',l:'100% Free'}
        ].map(function(f){
          return h('div',{key:f.l,className:'ob-feat'},
            MSIcon(f.icon,'ob-feat-icon'),h('span',{className:'ob-feat-label'},f.l));
        })
      )
    ),
    h('div',{className:'ob-footer'},
      h('div',{className:'ob-dots'},
        OB_SLIDES.map(function(_,i){
          return h('button',{key:i,className:'ob-dot'+(i===idx?' ob-dot-on':''),
            style:i===idx?{background:s.color,width:'28px'}:{},
            onClick:function(){setIdx(i);}});
        })
      ),
      h('button',{className:'ob-cta',style:{background:s.color},onClick:next},
        last ? h(Fragment,null,MSIcon('sports_soccer','ob-cta-icon')," Let's Go!")
              : h(Fragment,null,'Next ',MSIcon('arrow_forward','ob-cta-icon'))),
      last && h('p',{className:'ob-footnote'},
        MSIcon('verified','footnote-icon'),'  Free forever · No account · No App Store')
    )
  );
}

/* ─── PROFILE MODAL ──────────────────────────────────────────── */
function ProfileModal(props) {
  var user = props.user;
  var _n = useState(user.name||'');
  var name = _n[0], setName = _n[1];
  var _t = useState(user.team||'');
  var team = _t[0], setTeam = _t[1];
  var _av = useState(user.avatar||'⚽');
  var av = _av[0], setAv = _av[1];

  var picks = load(K.picks, {});
  var picksCount = Object.keys(picks).length;
  var quizHs = load(K.quizHs, 0);
  var quizPlayed = load(K.quizPlayed, 0);
  var quizTotal = load(K.quizTotal, 0);

  function save_profile() {
    var u = {name:name,team:team,avatar:av,joined:user.joined||Date.now()};
    props.onSave(u);
  }

  // Achievements
  var badges = [
    {icon:'star',label:'Early Adopter',desc:'Installed on opening day',earned:true},
    {icon:'sports_score',label:'Predictor',desc:'Made 10+ predictions',earned:picksCount>=10},
    {icon:'quiz',label:'Quiz Player',desc:'Played a quiz round',earned:quizPlayed>0},
    {icon:'military_tech',label:'Quiz Ace',desc:'Scored 5/5 on quiz',earned:quizHs>=5},
    {icon:'emoji_events',label:'All In',desc:'Predicted all 57 matches',earned:picksCount>=57},
    {icon:'public',label:'World Cup Fan',desc:'Used app 5+ days',earned:false},
  ];

  // Prediction accuracy
  var completedMatches = (props.matches||[]).filter(function(m){return m.status==='FINISHED';});
  var correct = 0;
  completedMatches.forEach(function(m) {
    var home = (m.homeTeam&&m.homeTeam.name)||'';
    var away = (m.awayTeam&&m.awayTeam.name)||'';
    var hs = m.score&&m.score.fullTime?m.score.fullTime.home:null;
    var as_ = m.score&&m.score.fullTime?m.score.fullTime.away:null;
    if (hs===null) return;
    var actualWinner = hs>as_?home:as_>hs?away:'draw';
    var fid = 'g'+String(completedMatches.indexOf(m)+1).padStart(2,'0');
    var userPick = picks[fid];
    if (userPick && userPick.toLowerCase().includes(actualWinner.toLowerCase().split(' ')[0])) correct++;
  });
  var accuracy = completedMatches.length ? Math.round(correct/completedMatches.length*100) : 0;

  return h('div',{className:'modal-overlay',onClick:function(e){if(e.target===e.currentTarget)props.onClose();}},
    h('div',{className:'modal-card'},
      h('div',{className:'modal-header'},
        h('h2',{className:'modal-title'},MSIcon('person','modal-title-icon'),' My Profile'),
        h('button',{className:'modal-close',onClick:props.onClose},MSIcon('close',''))
      ),

      h('div',{className:'profile-avatar-row'},
        AVATARS.map(function(a){
          return h('button',{key:a,className:'av-opt'+(av===a?' av-opt-on':''),
            onClick:function(){setAv(a);}},a);
        })
      ),

      h('div',{className:'profile-fields'},
        h('label',{className:'pf-label'},'Your Name'),
        h('input',{className:'pf-input',type:'text',placeholder:'Enter your name',
          value:name,maxLength:20,onChange:function(e){setName(e.target.value);}}),
        h('label',{className:'pf-label'},'Favourite Team'),
        h('select',{className:'pf-input',value:team,onChange:function(e){setTeam(e.target.value);}},
          h('option',{value:''},'-- Pick a team --'),
          TEAMS_LIST.map(function(t){return h('option',{key:t,value:t},t);})
        )
      ),

      h('button',{className:'btn-gold',style:{width:'100%',justifyContent:'center',marginBottom:'1rem'},
        onClick:save_profile},MSIcon('save','btn-icon'),' Save Profile'),

      // Stats cards
      h('div',{className:'stats-row'},
        h('div',{className:'stat-card'},
          h('span',{className:'stat-card-n'},picksCount),
          h('span',{className:'stat-card-l'},'Picks Made')
        ),
        h('div',{className:'stat-card'},
          h('span',{className:'stat-card-n'},accuracy+'%'),
          h('span',{className:'stat-card-l'},'Accuracy')
        ),
        h('div',{className:'stat-card'},
          h('span',{className:'stat-card-n'},quizHs+'/5'),
          h('span',{className:'stat-card-l'},'Best Quiz')
        )
      ),

      // Achievements
      h('div',{className:'achievements-section'},
        h('p',{className:'achievements-title'},MSIcon('military_tech','ach-title-icon'),' Achievements'),
        h('div',{className:'badges-grid'},
          badges.map(function(b){
            return h('div',{key:b.label,className:'badge-card'+(b.earned?'':' badge-locked')},
              MSIcon(b.icon,'badge-icon'+(b.earned?' badge-icon-earned':'')),
              h('span',{className:'badge-label'},b.label),
              h('span',{className:'badge-desc'},b.desc)
            );
          })
        )
      )
    )
  );
}

/* ─── INSTALL BANNER ─────────────────────────────────────────── */
function InstallBanner() {
  var _s = useState(false); var show = _s[0], setShow = _s[1];
  useEffect(function() {
    if (window.matchMedia('(display-mode:standalone)').matches) return;
    if (load(K.install,false)) return;
    var t = setTimeout(function(){setShow(true);},20000);
    return function(){clearTimeout(t);};
  },[]);
  function tap() {
    if (installEvt) {
      installEvt.prompt();
      installEvt.userChoice.then(function(r){if(r.outcome==='accepted')setShow(false);installEvt=null;});
    } else {
      alert('Install on iPhone:\n1. Tap Share ⬆\n2. "Add to Home Screen"\n3. Tap Add ✅');
      setShow(false);
    }
  }
  if (!show) return null;
  return h('div',{className:'install-bar'},
    h('div',{className:'install-left'},
      MSIcon('install_mobile','install-icon'),
      h('div',null,h('p',{className:'install-t'},'Install App'),h('p',{className:'install-s'},'Free · Offline · No App Store'))
    ),
    h('div',{className:'install-right'},
      h('button',{className:'install-btn',onClick:tap},'Install'),
      h('button',{className:'install-x',onClick:function(){setShow(false);save(K.install,true);}},MSIcon('close',''))
    )
  );
}

/* ─── PREMIUM BANNER ─────────────────────────────────────────── */
function PremiumBanner(props) {
  var _f = useState(false); var form = _f[0], setForm = _f[1];
  var _e = useState(''); var email = _e[0], setEmail = _e[1];
  var _b = useState(false); var busy = _b[0], setBusy = _b[1];
  function pay() {
    if (!email.includes('@')) { alert('Enter a valid email'); return; }
    setBusy(true);
    launchPaystack(email,function(){setBusy(false);props.onUnlock();},function(){setBusy(false);});
  }
  if (!form) return h('div',{className:'premium-bar'},
    h('div',{className:'premium-left'},
      MSIcon('workspace_premium','premium-crown-icon'),
      h('div',null,h('p',{className:'premium-t'},'Go Premium'),h('p',{className:'premium-s'},'Ad-free · GHS 20 one-time'))
    ),
    h('button',{className:'premium-unlock',onClick:function(){setForm(true);}},'Unlock')
  );
  return h('div',{className:'premium-form'},
    h('p',{className:'pf-title'},MSIcon('workspace_premium','pf-icon'),'  Unlock Premium — GHS 20'),
    h('input',{type:'email',className:'pf-input',placeholder:'Your email',value:email,onChange:function(e){setEmail(e.target.value);}}),
    h('div',{className:'pf-btns'},
      h('button',{className:'pf-pay',onClick:pay,disabled:busy},MSIcon(busy?'hourglass_empty':'credit_card','pf-btn-icon'),busy?' Opening...':' Pay GHS 20'),
      h('button',{className:'pf-cancel',onClick:function(){setForm(false);}},'Cancel')
    ),
    h('p',{className:'pf-secure'},MSIcon('lock','pf-lock-icon'),'  Secured by Paystack')
  );
}

/* ─── HEADER ─────────────────────────────────────────────────── */
function Header(props) {
  var user = props.user||{};
  return h('header',{className:'app-header'},
    h('div',{className:'header-inner'},
      h('div',{className:'header-left'},
        MSIcon('emoji_events','header-trophy'),
        h('div',null,
          h('h1',{className:'header-title'},'WORLD CUP 2026'),
          h('p',{className:'header-sub'},'Track Every Match')
        )
      ),
      h('button',{className:'header-profile-btn',onClick:props.onProfileOpen,'aria-label':'My Profile'},
        h('span',{className:'header-avatar'},user.avatar||'⚽'),
        props.premium && MSIcon('workspace_premium','header-crown')
      )
    )
  );
}

/* ─── TAB BAR ────────────────────────────────────────────────── */
var TABS = [
  {id:'matches',icon:'calendar_month',label:'Matches'},
  {id:'groups', icon:'table_chart',   label:'Groups'},
  {id:'bracket',icon:'emoji_events',  label:'Bracket'},
  {id:'predict',icon:'sports_score',  label:'Predict'},
  {id:'quiz',   icon:'quiz',          label:'Quiz'}
];
function TabBar(props) {
  return h('nav',{className:'tab-bar'},
    TABS.map(function(t){
      var on = props.active===t.id;
      return h('button',{key:t.id,className:'tab-btn'+(on?' tab-btn-on':''),
        onClick:function(){props.onChange(t.id);},'aria-pressed':on},
        MSIcon(t.icon,'tab-icon'+(on?' tab-icon-on':'')),
        h('span',{className:'tab-lbl'},t.label)
      );
    })
  );
}

/* ─── COUNTDOWN ──────────────────────────────────────────────── */
var KICKOFF = new Date('2026-06-11T19:00:00Z').getTime();
function Countdown() {
  function getLeft() {
    var d = KICKOFF - Date.now();
    if (d<=0) return null;
    return {d:Math.floor(d/86400000),h:Math.floor((d%86400000)/3600000),
            m:Math.floor((d%3600000)/60000),s:Math.floor((d%60000)/1000)};
  }
  var _t = useState(getLeft); var t = _t[0], setT = _t[1];
  useEffect(function(){var id=setInterval(function(){setT(getLeft());},1000);return function(){clearInterval(id);};},[]);
  if (!t) return null;
  return h('div',{className:'cd-wrap'},
    h('div',{className:'cd-match'},
      h('div',{className:'cd-badge'},h('span',{className:'cd-badge-dot'}),h('span',null,'OPENING MATCH')),
      h('div',{className:'cd-teams'},
        h('div',{className:'cd-team'},h(Flag,{team:'Mexico',cls:'cd-flag'}),h('span',{className:'cd-tname'},'Mexico')),
        h('div',{className:'cd-vs'},MSIcon('sports_soccer','cd-vs-icon')),
        h('div',{className:'cd-team'},h(Flag,{team:'South Africa',cls:'cd-flag'}),h('span',{className:'cd-tname'},'South Africa'))
      ),
      h('p',{className:'cd-venue'},MSIcon('location_on','cd-venue-icon'),' Estadio Azteca · Jun 11 · 3PM ET / 8PM BST')
    ),
    h('div',{className:'cd-timer'},
      [{v:t.d,l:'DAYS'},{v:pad(t.h),l:'HRS'},{v:pad(t.m),l:'MIN'},{v:pad(t.s),l:'SEC'}].map(function(u,i){
        return h(Fragment,{key:u.l},
          h('div',{className:'cd-unit'},h('span',{className:'cd-num'},u.v),h('span',{className:'cd-lbl'},u.l)),
          i<3&&h('span',{className:'cd-sep'},':')
        );
      })
    ),
    h('div',{className:'cd-stats'},
      [{n:'48',l:'Teams'},{n:'104',l:'Matches'},{n:'12',l:'Groups'},{n:'39',l:'Days'}].map(function(s){
        return h('div',{key:s.l,className:'cd-stat'},h('span',{className:'cd-stat-n'},s.n),h('span',{className:'cd-stat-l'},s.l));
      })
    ),
    h('p',{className:'cd-note'},MSIcon('public','cd-note-icon'),'  USA · Canada · Mexico  ·  June 11 – July 19')
  );
}

/* ─── MATCHES TAB ────────────────────────────────────────────── */
function MatchesTab(props) {
  var _filter = useState('all'); var filter = _filter[0], setFilter = _filter[1];

  if (props.loading) return h('div',{className:'center-state'},
    h('div',{className:'spinner'}),h('p',null,'Loading matches...')
  );

  if (!props.matches||!props.matches.length) {
    return h('div',{className:'pre-matches'},
      h(Countdown,null),
      h('div',{className:'pre-hint'},
        MSIcon('notifications_active','hint-icon'),
        h('p',null,'Live scores are now active — updating every 5 minutes')
      )
    );
  }

  var all = props.matches;
  var now = Date.now();
  var today = new Date().toDateString();

  var live     = all.filter(function(m){return m.status==='IN_PLAY'||m.status==='PAUSED';});
  var finished = all.filter(function(m){
    return m.status==='FINISHED' && new Date(m.utcDate).toDateString()===today;
  });
  var upcoming = all.filter(function(m){
    return (m.status==='TIMED'||m.status==='SCHEDULED') && new Date(m.utcDate).getTime()>now;
  }).slice(0,10);

  var displayed = filter==='live'     ? live
                : filter==='today'    ? live.concat(finished).concat(upcoming.slice(0,5))
                : filter==='finished' ? all.filter(function(m){return m.status==='FINISHED';}).slice(0,15)
                : live.concat(finished).concat(upcoming).slice(0,20);

  return h('div',{className:'matches-page'},
    // Filter pills
    h('div',{className:'match-filters'},
      [{id:'all',l:'All'},{id:'live',l:'🔴 Live'},{id:'today',l:'Today'},{id:'finished',l:'Results'}].map(function(f){
        return h('button',{key:f.id,className:'mf-pill'+(filter===f.id?' mf-pill-on':''),
          onClick:function(){setFilter(f.id);}},f.l);
      })
    ),
    live.length>0 && filter!=='finished' && h('div',{className:'section-label'},
      MSIcon('radio_button_checked','sl-icon'),' LIVE NOW'
    ),
    h('div',{className:'match-list'},
      displayed.length
        ? displayed.map(function(m){return h(MatchCard,{key:m.id,match:m});})
        : h('div',{className:'empty-state'},MSIcon('sports_soccer','empty-icon'),h('p',null,'No matches found'))
    )
  );
}

function MatchCard(props) {
  var m    = props.match;
  // Handle both "name" and direct string team names from API
  var home = (m.homeTeam&&(m.homeTeam.shortName||m.homeTeam.name))||'TBD';
  var away = (m.awayTeam&&(m.awayTeam.shortName||m.awayTeam.name))||'TBD';
  var live = m.status==='IN_PLAY'||m.status==='PAUSED';
  var done = m.status==='FINISHED';
  var hs   = m.score&&m.score.fullTime?m.score.fullTime.home:null;
  var as_  = m.score&&m.score.fullTime?m.score.fullTime.away:null;
  var d    = new Date(m.utcDate);
  var dStr = d.toLocaleDateString('en-GB',{day:'numeric',month:'short'});
  var tStr = d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
  var grp  = m.group ? m.group.replace('GROUP_','Group ') : (m.stage||'').replace('_',' ');
  return h('div',{className:'match-card'+(live?' match-live':'')+(done?' match-done':'')},
    h('div',{className:'mc-meta'},
      h('span',{className:'mc-date'},MSIcon('schedule','mc-time-icon'),' '+dStr+'  '+tStr),
      h('span',{className:'mc-group'},grp),
      live&&h('span',{className:'mc-live-badge'},MSIcon('radio_button_checked','mc-live-icon'),' LIVE')
    ),
    h('div',{className:'mc-row'},
      h('div',{className:'mc-team'},
        h(Flag,{team:home,cls:'mc-flag'}),
        h('span',{className:'mc-name'},home)
      ),
      h('div',{className:'mc-score-block'},
        done||live
          ? h('span',{className:'mc-score-txt'}, (hs!==null?hs:'-')+' : '+(as_!==null?as_:'-'))
          : h('span',{className:'mc-vs'},'VS')
      ),
      h('div',{className:'mc-team mc-team-r'},
        h('span',{className:'mc-name'},away),
        h(Flag,{team:away,cls:'mc-flag'})
      )
    ),
    done&&hs!==null&&h('div',{className:'mc-result'},
      hs>as_?'🏆 '+home+' win':as_>hs?'🏆 '+away+' win':'🤝 Draw'
    )
  );
}

/* ─── GROUPS TAB ─────────────────────────────────────────────── */
function GroupsTab() {
  var _g = useState('A'); var gk = _g[0], setGk = _g[1];
  return h('div',{className:'groups-page'},
    h('div',{className:'page-head'},
      h('h2',{className:'page-title'},MSIcon('table_chart','page-title-icon'),' Group Stage'),
      h('p',{className:'page-sub'},'12 Groups · 48 Teams · Top 2 per group advance')
    ),
    h('div',{className:'group-pills'},
      Object.keys(GROUPS).map(function(g){
        return h('button',{key:g,className:'g-pill'+(gk===g?' g-pill-on':''),onClick:function(){setGk(g);}},
          'Group '+g);
      })
    ),
    h('div',{className:'gt-wrap'},
      h('div',{className:'gt-head'},
        MSIcon('table_chart','gt-head-icon'),h('span',null,'GROUP '+gk)
      ),
      h('table',{className:'gt'},
        h('thead',null,
          h('tr',null,
            h('th',{className:'gt-th-team'},'Team'),
            h('th',null,'P'),h('th',null,'W'),h('th',null,'D'),
            h('th',null,'L'),h('th',null,'GD'),h('th',null,'Pts')
          )
        ),
        h('tbody',null,
          GROUPS[gk].map(function(team,i){
            return h('tr',{key:team,className:i<2?'gt-qualify':''},
              h('td',{className:'gt-td-team'},h(Flag,{team:team,cls:'gt-flag'}),h('span',null,team)),
              h('td',null,'0'),h('td',null,'0'),h('td',null,'0'),
              h('td',null,'0'),h('td',null,'0'),h('td',{className:'gt-pts'},'0')
            );
          })
        )
      ),
      h('div',{className:'gt-legend'},
        h('span',{className:'gt-legend-box'}),
        h('span',null,' Top 2 qualify · Best 8 third-placed teams also advance')
      )
    )
  );
}

/* ─── BRACKET TAB ────────────────────────────────────────────── */
function BracketTab() {
  var _r = useState('r32'); var rnd = _r[0], setRnd = _r[1];
  var _sel = useState(null); var sel = _sel[0], setSel = _sel[1];
  var data = BRACKET_DATA[rnd]||[];
  var fin = rnd==='fin';
  var info = BRACKET_ROUNDS.find(function(r){return r.id===rnd;});
  return h('div',{className:'bracket-page'},
    h('div',{className:'page-head'},
      h('h2',{className:'page-title'},MSIcon('emoji_events','page-title-icon'),' Knockout Bracket'),
      h('p',{className:'page-sub'},'Official FIFA 2026 · Opens June 28')
    ),
    h('div',{className:'round-list'},
      BRACKET_ROUNDS.map(function(r){
        return h('button',{key:r.id,className:'round-row'+(rnd===r.id?' round-row-on':''),
          onClick:function(){setRnd(r.id);setSel(null);}},
          h('div',{className:'round-row-left'},
            MSIcon(r.icon,'round-row-icon'+(rnd===r.id?' round-row-icon-on':'')),
            h('span',{className:'round-row-label'},r.label)
          ),
          h('span',{className:'round-row-count'+(rnd===r.id?' round-row-count-on':'')},
            r.n+(r.n===1?' Match':' Matches'))
        );
      })
    ),
    h('div',{className:'round-hdr'},
      h('span',{className:'round-hdr-label'},info.label),
      fin
        ? h('span',{className:'round-hdr-final'},MSIcon('emoji_events','rh-final-icon'),' Jul 19 · NY/NJ')
        : h('span',{className:'round-hdr-count'},data.length+' matches')
    ),
    h('div',{className:'b-list'},
      data.map(function(m,idx){
        var a=m.a||'TBD',b=m.b||'TBD';
        var pnd=a==='TBD'||b==='TBD'||a==='Best 3rd'||b==='Best 3rd';
        var open=sel===m.id;
        return h('div',{key:m.id,className:'b-card'+(fin?' b-card-final':'')+(open?' b-card-open':''),
          onClick:function(){setSel(open?null:m.id);}},
          h('div',{className:'b-card-top'},
            h('span',{className:'b-num'},fin?h(Fragment,null,MSIcon('emoji_events','b-final-icon'),' FINAL'):'Match '+(idx+1)),
            open?MSIcon('expand_less','b-expand-icon'):MSIcon('expand_more','b-expand-icon')
          ),
          h('div',{className:'b-team'},
            h('div',{className:'b-team-l'},
              isSlot(a)?MSIcon('flag','b-slot-icon'):h(Flag,{team:a,cls:'b-flag'}),
              h('div',{className:'b-info'},h('span',{className:'b-name'},a),h('span',{className:'b-sub'},m.city||''))
            ),
            h('span',{className:'b-score'},pnd?'—':'0')
          ),
          h('div',{className:'b-divider'},MSIcon('sports_soccer','b-divider-icon')),
          h('div',{className:'b-team'},
            h('div',{className:'b-team-l'},
              isSlot(b)?MSIcon('flag','b-slot-icon'):h(Flag,{team:b,cls:'b-flag'}),
              h('div',{className:'b-info'},h('span',{className:'b-name'},b),h('span',{className:'b-sub'},m.date||''))
            ),
            h('span',{className:'b-score'},pnd?'—':'0')
          ),
          open&&h('div',{className:'b-detail'},
            MSIcon(pnd?'hourglass_empty':'info','b-detail-icon'),
            h('span',null,pnd?' Teams confirmed after Group Stage ends June 27':' Venue · Extra time & penalties if level after 90 mins')
          )
        );
      })
    ),
    h('div',{className:'bracket-note'},
      MSIcon('info','bn-icon'),
      h('span',null,rnd==='r32'
        ?' Top 2 per group + 8 best 3rd-placed teams = 32 teams total'
        :' Winners advance · Draws resolved by extra time then penalties')
    )
  );
}

/* ─── PREDICT TAB ────────────────────────────────────────────── */
function PredictTab() {
  var _picks = useState(function(){return load(K.picks,{});});
  var picks = _picks[0], setPicks = _picks[1];
  var _rnd = useState('Group Stage'); var rnd = _rnd[0], setRnd = _rnd[1];
  var _flash = useState(false); var flash = _flash[0], setFlash = _flash[1];

  var total = FIXTURES.length;
  var done  = Object.keys(picks).length;
  var pct   = Math.round(done/total*100);
  var rounds = ['Group Stage','Round of 32','Round of 16','Quarter Final','Semi Final','The Final'];
  var visible = FIXTURES.filter(function(f){return f.r===rnd;});
  var counts = {}; rounds.forEach(function(r){counts[r]=FIXTURES.filter(function(f){return f.r===r;}).length;});

  function pick(id,choice) {
    var next = Object.assign({},picks); next[id]=choice;
    setPicks(next); save(K.picks,next);
    setFlash(true); setTimeout(function(){setFlash(false);},1400);
  }

  return h('div',{className:'predict-page'},
    h('div',{className:'page-head'},
      h('h2',{className:'page-title'},MSIcon('sports_score','page-title-icon'),' My Predictions'),
      h('p',{className:'page-sub'},'57 matches · Pick your winners')
    ),
    h('div',{className:'progress-card'},
      h('div',{className:'progress-row'},
        h('span',{className:'progress-lbl'},MSIcon('bar_chart','progress-icon'),' Progress'),
        h('span',{className:'progress-val'},done+' / '+total)
      ),
      h('div',{className:'progress-track'},
        h('div',{className:'progress-fill',style:{width:pct+'%'}}))
    ),
    h('div',{className:'save-flash'+(flash?' save-flash-on':''),'aria-live':'polite'},
      MSIcon('check_circle','sf-icon'),'  Saved!'),
    h('div',{className:'predict-rounds'},
      rounds.filter(function(r){return counts[r]>0;}).map(function(r){
        return h('button',{key:r,className:'pr-tab'+(rnd===r?' pr-tab-on':''),
          onClick:function(){setRnd(r);}},r+' ('+counts[r]+')');
      })
    ),
    h('div',{className:'predict-list'},
      visible.map(function(f){
        var chosen=picks[f.id], pending=isSlot(f.a)||isSlot(f.b), isFin=f.r==='The Final';
        return h('div',{key:f.id,className:'pf-card'+(isFin?' pf-card-final':'')},
          h('div',{className:'pf-head'},
            h('div',{className:'pf-head-l'},
              h('span',{className:'pf-round'},f.r),
              h('span',{className:'pf-city'},MSIcon('location_on','pf-city-icon'),' '+f.city)
            ),
            h('span',{className:'pf-date'},MSIcon('calendar_today','pf-date-icon'),' '+f.date)
          ),
          h('div',{className:'pf-row'},
            h('button',{className:'pf-team'+(chosen===f.a?' pf-team-on':'')+(pending?' pf-team-disabled':''),
              onClick:function(){if(!pending)pick(f.id,f.a);},disabled:pending},
              isSlot(f.a)?MSIcon('flag','pf-slot-icon'):h(Flag,{team:f.a,cls:'pf-flag'}),
              h('span',{className:'pf-tname'},f.a),
              chosen===f.a&&MSIcon('check_circle','pf-check')
            ),
            h('button',{className:'pf-draw'+(chosen==='draw'?' pf-draw-on':'')+(pending?' pf-team-disabled':''),
              onClick:function(){if(!pending)pick(f.id,'draw');},disabled:pending},
              chosen==='draw'?h(Fragment,null,MSIcon('check','pf-draw-check'),' Draw'):'Draw'
            ),
            h('button',{className:'pf-team'+(chosen===f.b?' pf-team-on':'')+(pending?' pf-team-disabled':''),
              onClick:function(){if(!pending)pick(f.id,f.b);},disabled:pending},
              isSlot(f.b)?MSIcon('flag','pf-slot-icon'):h(Flag,{team:f.b,cls:'pf-flag'}),
              h('span',{className:'pf-tname'},f.b),
              chosen===f.b&&MSIcon('check_circle','pf-check')
            )
          ),
          chosen&&h('div',{className:'pf-result'},
            chosen==='draw'
              ?h(Fragment,null,MSIcon('handshake','pf-result-icon'),'  Predicted a Draw')
              :h(Fragment,null,isSlot(chosen)?MSIcon('emoji_events','pf-result-icon'):h(Flag,{team:chosen,cls:'pf-result-flag'}),'  Picked '+chosen+' to win')
          ),
          pending&&h('div',{className:'pf-pending'},
            MSIcon('hourglass_empty','pf-pend-icon'),
            f.a.startsWith('W Match')?' Teams confirmed after Round of 32':' Teams confirmed after Group Stage (June 27)')
        );
      })
    ),
    h('div',{className:'predict-actions'},
      h('button',{className:'clear-btn',onClick:function(){setPicks({});save(K.picks,{});}},
        MSIcon('delete_outline','clear-btn-icon'),'  Clear All'),
      h('p',{className:'predict-note'},MSIcon('save','pn-icon'),'  Saved on this device')
    )
  );
}

/* ─── QUIZ TAB ───────────────────────────────────────────────── */
var QUIZ_STATE = {idle:0, playing:1, answer:2, done:3};

function QuizTab() {
  var _state = useState(QUIZ_STATE.idle); var qs = _state[0], setQs = _state[1];
  var _qList = useState([]); var qList = _qList[0], setQList = _qList[1];
  var _qIdx  = useState(0);  var qIdx  = _qIdx[0],  setQIdx  = _qIdx[1];
  var _score = useState(0);  var score = _score[0], setScore = _score[1];
  var _sel   = useState(null);var sel   = _sel[0],   setSel   = _sel[1];
  var _time  = useState(15); var time  = _time[0],  setTime  = _time[1];
  var timerRef = useRef(null);

  var hs = load(K.quizHs, 0);

  function startQuiz() {
    var q = shuffleQuestions();
    setQList(q); setQIdx(0); setScore(0); setSel(null); setTime(15);
    setQs(QUIZ_STATE.playing);
  }

  function handleAnswer(optIdx) {
    if (qs !== QUIZ_STATE.playing) return;
    clearInterval(timerRef.current);
    setSel(optIdx);
    var correct = qList[qIdx].a === optIdx;
    if (correct) setScore(function(s){return s+1;});
    setQs(QUIZ_STATE.answer);
  }

  function nextQuestion() {
    if (qIdx >= qList.length - 1) {
      // Quiz done
      var finalScore = score + (sel === qList[qIdx].a ? 1 : 0);
      // Don't double count — use score as is (already updated)
      var hs2 = load(K.quizHs, 0);
      if (finalScore > hs2) save(K.quizHs, finalScore);
      save(K.quizPlayed, (load(K.quizPlayed,0)||0) + 1);
      save(K.quizTotal,  (load(K.quizTotal,0)||0)  + finalScore);
      setQs(QUIZ_STATE.done);
    } else {
      setQIdx(function(i){return i+1;});
      setSel(null); setTime(15);
      setQs(QUIZ_STATE.playing);
    }
  }

  // Timer
  useEffect(function() {
    if (qs !== QUIZ_STATE.playing) return;
    timerRef.current = setInterval(function() {
      setTime(function(t) {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleAnswer(-1); // timeout = wrong
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return function() { clearInterval(timerRef.current); };
  }, [qs, qIdx]);

  var q = qList[qIdx];

  // IDLE STATE
  if (qs === QUIZ_STATE.idle) {
    return h('div',{className:'quiz-page'},
      h('div',{className:'page-head'},
        h('h2',{className:'page-title'},MSIcon('quiz','page-title-icon'),' World Cup Quiz'),
        h('p',{className:'page-sub'},'5 questions · 15 seconds each')
      ),
      h('div',{className:'quiz-idle'},
        h('div',{className:'quiz-idle-icon'},MSIcon('quiz','quiz-big-icon')),
        h('h3',{className:'quiz-idle-title'},'Test Your Football Knowledge'),
        h('p',{className:'quiz-idle-sub'},'30 questions about the 2026 World Cup, football history and the teams. How many can you get right?'),
        h('div',{className:'quiz-hs-row'},
          h('div',{className:'quiz-hs-card'},
            MSIcon('military_tech','quiz-hs-icon'),
            h('span',{className:'quiz-hs-n'},hs+'/5'),
            h('span',{className:'quiz-hs-l'},'Best Score')
          ),
          h('div',{className:'quiz-hs-card'},
            MSIcon('quiz','quiz-hs-icon'),
            h('span',{className:'quiz-hs-n'},load(K.quizPlayed,0)),
            h('span',{className:'quiz-hs-l'},'Rounds Played')
          )
        ),
        h('button',{className:'btn-gold quiz-start-btn',onClick:startQuiz},
          MSIcon('play_arrow','btn-icon'),' Start Quiz')
      )
    );
  }

  // DONE STATE
  if (qs === QUIZ_STATE.done) {
    var finalSc = score;
    var msg = finalSc===5?'Perfect Score! You\'re a football genius! 🏆'
            : finalSc>=4?'Outstanding! Almost perfect! ⭐'
            : finalSc>=3?'Good effort! Keep practicing! 👍'
            : finalSc>=2?'Not bad! Study up and try again!'
            : 'Keep going — every World Cup fan starts somewhere!';
    return h('div',{className:'quiz-page'},
      h('div',{className:'page-head'},
        h('h2',{className:'page-title'},MSIcon('quiz','page-title-icon'),' Quiz Results')
      ),
      h('div',{className:'quiz-done'},
        h('div',{className:'quiz-done-score'},
          h('span',{className:'quiz-done-num'},finalSc),
          h('span',{className:'quiz-done-denom'},'/5')
        ),
        h('p',{className:'quiz-done-msg'},msg),
        finalSc>hs&&h('div',{className:'quiz-new-hs'},
          MSIcon('military_tech','qs-hs-icon'),' New High Score!'
        ),
        h('div',{className:'quiz-done-btns'},
          h('button',{className:'btn-gold',onClick:startQuiz},MSIcon('refresh','btn-icon'),' Play Again'),
          h('button',{className:'quiz-share-btn',onClick:function(){
            var text = 'I scored '+finalSc+'/5 on the World Cup 2026 Quiz!\nCan you beat me? ⚽🏆\nworld26trphy.vercel.app';
            if (navigator.share) { navigator.share({text:text}); }
            else { navigator.clipboard&&navigator.clipboard.writeText(text).then(function(){alert('Score copied! Share it!');});}
          }},MSIcon('share','btn-icon'),' Share Score')
        )
      )
    );
  }

  // PLAYING / ANSWER STATE
  if (!q) return null;
  var timerPct = (time/15*100);

  return h('div',{className:'quiz-page'},
    h('div',{className:'page-head'},
      h('h2',{className:'page-title'},MSIcon('quiz','page-title-icon'),' Quiz'),
      h('p',{className:'page-sub'},'Question '+(qIdx+1)+' of '+qList.length)
    ),
    h('div',{className:'quiz-play'},

      // Progress dots
      h('div',{className:'quiz-progress-dots'},
        qList.map(function(_,i){
          return h('div',{key:i,className:'qpd'+(i<qIdx?' qpd-done':i===qIdx?' qpd-active':'')});
        })
      ),

      // Timer bar
      h('div',{className:'quiz-timer-track'},
        h('div',{className:'quiz-timer-fill',style:{
          width:timerPct+'%',
          background:time>8?'#4ade80':time>4?'#fb923c':'#f87171'
        }})
      ),
      h('div',{className:'quiz-timer-num'},
        MSIcon('timer','qt-icon'),h('span',{className:time<=5?'qt-urgent':''},time+'s')
      ),

      // Score
      h('div',{className:'quiz-score-row'},
        MSIcon('star','qs-icon'),h('span',null,' Score: '+score+' / '+qList.length)
      ),

      // Question
      h('div',{className:'quiz-question-card'},
        h('p',{className:'quiz-q-text'},q.q)
      ),

      // Options
      h('div',{className:'quiz-options'},
        q.opts.map(function(opt,i){
          var cls = 'quiz-opt';
          if (qs===QUIZ_STATE.answer) {
            if (i===q.a)         cls += ' quiz-opt-correct';
            else if (i===sel)    cls += ' quiz-opt-wrong';
          }
          return h('button',{key:i,className:cls,
            onClick:function(){if(qs===QUIZ_STATE.playing)handleAnswer(i);},
            disabled:qs===QUIZ_STATE.answer},
            h('span',{className:'quiz-opt-letter'},['A','B','C','D'][i]),
            h('span',{className:'quiz-opt-text'},opt),
            qs===QUIZ_STATE.answer&&i===q.a&&MSIcon('check_circle','quiz-opt-icon-correct'),
            qs===QUIZ_STATE.answer&&i===sel&&i!==q.a&&MSIcon('cancel','quiz-opt-icon-wrong')
          );
        })
      ),

      // Fact after answer
      qs===QUIZ_STATE.answer&&h('div',{className:'quiz-fact'},
        MSIcon('lightbulb','quiz-fact-icon'),
        h('p',null,q.fact)
      ),

      // Next button
      qs===QUIZ_STATE.answer&&h('button',{className:'btn-gold quiz-next-btn',onClick:nextQuestion},
        qIdx>=qList.length-1
          ? h(Fragment,null,MSIcon('emoji_events','btn-icon'),' See Results')
          : h(Fragment,null,'Next ',MSIcon('arrow_forward','btn-icon'))
      )
    )
  );
}

/* ─── AD SLOT ────────────────────────────────────────────────── */
function AdSlot() {
  useEffect(function(){try{(window.adsbygoogle=window.adsbygoogle||[]).push({});}catch(e){};},[]);
  return h('div',{className:'ad-slot'},
    h('ins',{
      className:'adsbygoogle',style:{display:'block'},
      'data-ad-client':'ca-pub-9960426175142172',
      'data-ad-slot':'AUTO',
      'data-ad-format':'auto',
      'data-full-width-responsive':'true'
    }),
    h('p',{className:'ad-lbl'},'Advertisement')
  );
}

/* ─── APP ROOT ───────────────────────────────────────────────── */
function App() {
  /* Onboarding */
  var _ob = useState(function(){return !!load(K.onboarded,false);});
  var ob = _ob[0], setOb = _ob[1];

  /* Premium */
  var _pm = useState(function(){return isPremium();});
  var pm = _pm[0], setPm = _pm[1];

  /* Active tab */
  var _tab = useState('matches');
  var tab = _tab[0], setTab = _tab[1];

  /* Matches data */
  var _mat = useState([]); var mat = _mat[0], setMat = _mat[1];
  var _lod = useState(true);var lod = _lod[0], setLod = _lod[1];
  var _err = useState(false);var err = _err[0], setErr = _err[1];

  /* Profile modal */
  var _prof = useState(false); var profOpen = _prof[0], setProfOpen = _prof[1];
  var _user = useState(function(){return load(K.user,{name:'',team:'',avatar:'⚽',joined:Date.now()});});
  var user = _user[0], setUser = _user[1];

  /* Tab transition */
  var animRef = useRef('');
  var _anim = useState(''); var anim = _anim[0], setAnim = _anim[1];

  function changeTab(next) {
    if (next===tab||animRef.current) return;
    animRef.current='run';
    setAnim('fade-out');
    setTimeout(function(){
      setTab(next);setAnim('fade-in');
      setTimeout(function(){setAnim('');animRef.current='';},260);
    },160);
  }

  /* ── FETCH MATCHES — BULLETPROOF VERSION ── */
  function doFetch() {
    setLod(true);

    // Check cache first
    var cached = load(K.matches, null);
    var ts     = load(K.matchTs, 0);
    if (cached && Array.isArray(cached) && cached.length > 0 && (Date.now()-ts) < CACHE_TTL) {
      setMat(cached); setLod(false); return;
    }

    function onGot(list) {
      if (list && list.length) {
        save(K.matches, list); save(K.matchTs, Date.now());
        setMat(list); setErr(false); setLod(false);
      } else {
        onFail(new Error('Empty list'));
      }
    }

    function onFail(e) {
      console.warn('[WC2026]', e&&e.message);
      // Try direct API as final fallback
      if (DIRECT_API_KEY && DIRECT_API_KEY !== '63966ee47080428881fe646971ee918f') {
        fetch('https://api.football-data.org/v4/competitions/WC/matches',
          {headers:{'X-Auth-Token':DIRECT_API_KEY}})
          .then(function(r){return r.json();})
          .then(function(d){onGot((d&&d.matches)||[]);})
          .catch(function(){
            var c = load(K.matches,[]);
            setMat(c); setErr(true); setLod(false);
          });
      } else {
        var c = load(K.matches,[]);
        setMat(c); setErr(true); setLod(false);
      }
    }

    // Primary: Vercel /api/matches
    fetch('/api/matches')
      .then(function(r) {
        if (!r.ok) throw new Error('HTTP '+r.status);
        return r.json();
      })
      .then(function(d) { onGot((d&&d.matches)||[]); })
      .catch(onFail);
  }

  useEffect(function() {
    // Record first joined date
    if (!load(K.joined,null)) save(K.joined, Date.now());
    doFetch();
    // Refresh every 5 minutes
    var id = setInterval(doFetch, CACHE_TTL);
    return function() { clearInterval(id); };
  }, []);

  // Show onboarding first visit
  if (!ob) return h(Onboarding, {onDone:function(){setOb(true);}});

  return h('div',{className:'app-root'},
    h(Header,{premium:pm,user:user,onProfileOpen:function(){setProfOpen(true);}}),
    h(InstallBanner,null),
    !pm && h(PremiumBanner,{onUnlock:function(){setPm(true);}}),
    h(TabBar,{active:tab,onChange:changeTab}),

    err && h('div',{className:'api-warn'},
      MSIcon('wifi_off','api-warn-icon'),'  Live data unavailable — showing cached data',
      h('button',{className:'api-retry-btn',onClick:doFetch},MSIcon('refresh',''))
    ),

    !pm && h(AdSlot,null),

    h('div',{className:'tab-pane '+anim},
      tab==='matches' && h(MatchesTab,{matches:mat,loading:lod}),
      tab==='groups'  && h(GroupsTab,null),
      tab==='bracket' && h(BracketTab,null),
      tab==='predict' && h(PredictTab,null),
      tab==='quiz'    && h(QuizTab,null)
    ),

    h('footer',{className:'app-footer'},
      h('a',{href:'/about.html'},MSIcon('info','footer-icon'),' About'),
      h('span',{className:'footer-sep'},'·'),
      h('a',{href:'/privacy.html'},MSIcon('privacy_tip','footer-icon'),' Privacy'),
      h('span',{className:'footer-sep'},'·'),
      h('span',null,'© 2026 FrempahBrand')
    ),

    profOpen && h(ProfileModal,{
      user:user,matches:mat,
      onSave:function(u){setUser(u);save(K.user,u);setProfOpen(false);},
      onClose:function(){setProfOpen(false);}
    })
  );
}

/* ─── MOUNT ──────────────────────────────────────────────────── */
var root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(ErrorBoundary,null,React.createElement(App,null)));

/* Service Worker */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .then(function(){ console.info('[WC2026] SW ready'); })
      .catch(function(e){ console.warn('[WC2026] SW fail',e); });
  });
}

})();