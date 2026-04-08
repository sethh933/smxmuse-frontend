import { AbsoluteFill, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame } from 'remotion';

const c = { bg: '#0d0d10', shell: '#151518', panel: '#19191d', alt: '#242428', border: '#2f3036', text: '#f5f3ee', muted: '#b9b2a8', soft: '#908a82', accent: '#5da7ff', green: '#1f6b45', gold: '#dbc39e' };
const nav = ['Home', 'Riders', 'Seasons', 'Race Results', 'Leaderboards', 'Comparison Tool', 'About'];
const countries = ['United States', 'Argentina', 'Australia', 'Belgium', 'Bolivia', 'Brazil', 'Canada', 'Chile', 'Colombia', 'Costa Rica', 'Czechia', 'Denmark', 'Finland', 'France', 'Germany', 'Ireland', 'Italy', 'Japan'];
const decades = [['2020s', '7 seasons'], ['2010s', '10 seasons'], ['2000s', '10 seasons'], ['1990s', '10 seasons'], ['1980s', '10 seasons'], ['1970s', '6 seasons']];
const compareRows = [['Starts', '32', '37'], ['Avg Finish', '3.59', '3.46'], ['Wins', '13', '13'], ['Win %', '40.6', '35.1'], ['Podiums', '23', '24'], ['Podium %', '71.9', '64.9'], ['Top 5 %', '84.4', '81.1'], ['Top 10 %', '93.8', '97.3'], ['Laps Led', '262', '187']];
const boards = [
  ['Main Event Wins', [['Jeremy McGrath', '72'], ['Eli Tomac', '57'], ['James Stewart', '50'], ['Ricky Carmichael', '48'], ['Chad Reed', '44'], ['Ryan Villopoto', '41'], ['Ryan Dungey', '34'], ['Cooper Webb', '31']]],
  ['Main Event Podiums', [['Chad Reed', '132'], ['Jeremy McGrath', '111'], ['Eli Tomac', '110'], ['Ryan Dungey', '101'], ['Ricky Carmichael', '87'], ['Ken Roczen', '84'], ['Cooper Webb', '81'], ['Mike LaRocco', '81']]],
  ['Main Event Starts', [['Chad Reed', '265'], ['Mike LaRocco', '228'], ['Kevin Windham', '207'], ['Eli Tomac', '196'], ['Nicholas Wey', '192'], ['Larry Ward', '190'], ['Justin Barcia', '180'], ['Cooper Webb', '152']]],
  ['Heat Wins', [['Jeremy McGrath', '101'], ['James Stewart', '98'], ['Chad Reed', '72'], ['Ricky Carmichael', '68'], ['Ken Roczen', '57'], ['Jeff Ward', '57'], ['Eli Tomac', '52'], ['Cooper Webb', '22']]],
];

const lerp = (a, b, t) => a + (b - a) * t;
const cursorAt = (points, frame) => {
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    if (frame <= b.f) {
      const t = Math.max(0, Math.min(1, (frame - a.f) / (b.f - a.f)));
      const e = Easing.bezier(0.22, 1, 0.36, 1)(t);
      return { x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e) };
    }
  }
  return points[points.length - 1];
};

const Stage = ({ children, scale = 1, x = 0, y = 0 }) => <div style={{ position: 'absolute', left: '50%', top: 170, transform: `translateX(-50%) translate(${x}px, ${y}px) scale(${scale})`, transformOrigin: 'center top' }}>{children}</div>;
const Caption = ({ title, body }) => <div style={{ position: 'absolute', top: 58, left: 70, width: 540, display: 'grid', gap: 12 }}><div style={{ color: c.gold, letterSpacing: '0.14em', textTransform: 'uppercase', fontSize: 18 }}>Feature tour</div><div style={{ color: c.text, fontSize: 56, lineHeight: 1.03, fontWeight: 700 }}>{title}</div><div style={{ color: c.muted, fontSize: 24, lineHeight: 1.38 }}>{body}</div></div>;
const Chip = ({ children, active = false, style }) => <div style={{ height: 42, padding: '0 18px', borderRadius: 10, background: active ? '#f7f4ef' : '#303036', color: active ? '#131316' : c.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, ...style }}>{children}</div>;
const Card = ({ children, style }) => <div style={{ borderRadius: 26, border: `1px solid ${c.border}`, background: 'radial-gradient(circle at top left, rgba(126,73,73,0.18), transparent 28%), radial-gradient(circle at top right, rgba(83,95,146,0.2), transparent 38%), #15161a', ...style }}>{children}</div>;

const Shell = ({ children, focus = -1, search = 'Search riders or venues...' }) => (
  <div style={{ width: 1440, height: 900, borderRadius: 34, overflow: 'hidden', background: c.shell, border: `1px solid ${c.border}`, boxShadow: '0 36px 120px rgba(0,0,0,0.42)', display: 'flex', flexDirection: 'column' }}>
    <div style={{ height: 84, borderBottom: `1px solid ${c.border}`, padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#121216' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <Img src={staticFile('smxmuselogo.png')} style={{ width: 86 }} />
        <div style={{ display: 'flex', gap: 24, color: c.text, fontSize: 18 }}>{nav.map((item, i) => <div key={item} style={{ fontWeight: focus === i ? 700 : 500, opacity: focus === i ? 1 : 0.88 }}>{item}</div>)}</div>
      </div>
      <div style={{ width: 322, height: 42, borderRadius: 10, border: `1px solid ${c.border}`, background: '#18181d', display: 'flex', alignItems: 'center', padding: '0 14px', color: search === 'Search riders or venues...' ? '#7d7b84' : c.text, fontSize: 14 }}>{search}</div>
    </div>
    <div style={{ flex: 1, padding: 22, overflow: 'hidden' }}>{children}</div>
  </div>
);

const Cursor = ({ points, clicks = [] }) => {
  const frame = useCurrentFrame();
  const p = cursorAt(points, frame);
  return <>
    {clicks.map((f) => {
      const o = interpolate(frame - f, [0, 5, 14], [0, 0.75, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      const s = interpolate(frame - f, [0, 14], [16, 70], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      return <div key={f} style={{ position: 'absolute', left: p.x - s / 2, top: p.y - s / 2, width: s, height: s, borderRadius: 999, border: `3px solid rgba(93,167,255,${o})` }} />;
    })}
    <div style={{ position: 'absolute', left: p.x, top: p.y, width: 28, height: 38, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.4))' }}>
      <svg viewBox="0 0 28 38" width="28" height="38"><path d="M2 2L24 19H15L17 34L11.5 36L9.2 21.2L2 28V2Z" fill="#f7f7f7" stroke="#101114" strokeWidth="1.5" strokeLinejoin="round" /></svg>
    </div>
  </>;
};

const Landing = () => {
  const f = useCurrentFrame();
  const typed = 'jett'.slice(0, Math.floor(interpolate(f, [78, 102], [0, 4], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })));
  const s = interpolate(f, [0, 58, 102, 138], [0.78, 0.88, 1.2, 1.16], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const x = interpolate(f, [0, 58, 102], [0, 0, -180], { extrapolateRight: 'clamp' });
  const y = interpolate(f, [0, 58, 102], [0, 0, -125], { extrapolateRight: 'clamp' });
  const drop = interpolate(f, [86, 92], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return <AbsoluteFill style={{ background: c.bg }}>
    <Caption title="A faster way into the archive" body="Open on the landing page, punch into search, and head straight into a rider profile with an ad-style zoom." />
    <Stage scale={s} x={x} y={y}>
      <Shell search={typed || 'Search riders or venues...'}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.75fr 0.9fr', gap: 18 }}>
          <Card style={{ padding: 34, minHeight: 410 }}><div style={{ color: c.gold, fontSize: 18, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Supercross and motocross archive</div><div style={{ color: c.text, fontSize: 74, lineHeight: 1.02, fontWeight: 700, marginTop: 18 }}>Everything in one place, from the latest gate drop to all-time history.</div><div style={{ color: c.muted, fontSize: 24, lineHeight: 1.45, marginTop: 22, maxWidth: 760 }}>SMXmuse is built for race results, rider profiles, season dashboards, comparison tools, and all-time leaderboards.</div><div style={{ display: 'flex', gap: 14, marginTop: 30 }}><Chip active>Explore results</Chip><Chip>Compare riders</Chip><Chip>Open current season</Chip></div></Card>
          <Card style={{ padding: 28, minHeight: 410 }}><div style={{ color: c.gold, fontSize: 18, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Rider of the day</div><div style={{ display: 'flex', gap: 18, marginTop: 22 }}><div style={{ width: 124, height: 164, borderRadius: 20, background: '#101114' }} /><div style={{ display: 'grid', gap: 14 }}><div style={{ color: c.text, fontSize: 24, fontWeight: 700 }}>Joe Zamperini</div><div style={{ color: c.muted, fontSize: 21, lineHeight: 1.45, maxWidth: 310 }}>A daily random pull from the SMXmuse rider archive.</div><Chip active style={{ width: 176 }}>Open rider profile</Chip></div></div></Card>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.65fr 0.85fr', gap: 18, marginTop: 18 }}>
          <Card style={{ padding: 26 }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><div style={{ color: c.gold, fontSize: 18, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Most recent race</div><div style={{ color: c.text, fontSize: 18 }}>View full race page</div></div><div style={{ color: c.text, fontSize: 36, fontWeight: 700, marginTop: 16 }}>The Dome at America&apos;s Center Supercross</div><div style={{ color: c.muted, fontSize: 22, marginTop: 8 }}>Round 12 / April 3, 2026</div></Card>
          <Card style={{ padding: 26 }}><div style={{ color: c.gold, fontSize: 18, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Featured</div><div style={{ color: c.text, fontSize: 36, fontWeight: 700, marginTop: 16 }}>SMXmuse Grids</div><div style={{ color: c.muted, fontSize: 22, lineHeight: 1.45, marginTop: 12 }}>A daily 3x3 grid trivia game powered by the database.</div></Card>
        </div>
        <div style={{ position: 'absolute', right: 24, top: 60, width: 322, height: drop ? 258 : 0, opacity: drop, borderRadius: 14, overflow: 'hidden', border: `1px solid ${c.border}`, background: '#191a1e', boxShadow: '0 18px 38px rgba(0,0,0,0.35)' }}>
          <div style={{ height: 42, display: 'flex', alignItems: 'center', padding: '0 16px', color: c.muted, fontSize: 16, borderBottom: `1px solid ${c.border}` }}>Riders</div>
          {['Jett Lawrence', 'Jett Reynolds', 'Jetti Pifer', 'Kimble Jett'].map((name, i) => <div key={name} style={{ height: 54, padding: '10px 16px', borderTop: i ? `1px solid ${c.border}` : 'none' }}><div style={{ color: c.text, fontSize: 18 }}>{name}</div><div style={{ color: c.soft, fontSize: 14 }}>{i ? 'United States' : 'Australia'}</div></div>)}
        </div>
      </Shell>
    </Stage>
    <Cursor points={[{ f: 0, x: 790, y: 860 }, { f: 26, x: 880, y: 642 }, { f: 52, x: 880, y: 248 }, { f: 86, x: 882, y: 246 }, { f: 112, x: 778, y: 372 }, { f: 138, x: 778, y: 372 }]} clicks={[54, 116]} />
  </AbsoluteFill>;
};

const Rider = () => {
  const f = useCurrentFrame();
  const scale = interpolate(f, [0, 36, 96], [1.16, 0.86, 0.92], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const x = interpolate(f, [0, 36], [-200, 0], { extrapolateRight: 'clamp' });
  const y = interpolate(f, [0, 36], [-120, 0], { extrapolateRight: 'clamp' });
  const tab = f < 54 ? 0 : f < 102 ? 1 : 2;
  return <AbsoluteFill style={{ background: c.bg }}>
    <Caption title="The profile view does the digging for you" body="Tabs keep career stats, race-by-race results, and points finishes connected so the profile feels like a home base." />
    <Stage scale={scale} x={x} y={y}><Shell focus={1}>
      <Card style={{ padding: 28, minHeight: 276, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 8 }}><div style={{ width: 122, height: 122, borderRadius: 999, background: '#2b2d31', border: '4px solid #3b3d43' }} /><div style={{ color: c.text, fontSize: 64, fontWeight: 700 }}>Jett Lawrence</div><div style={{ color: c.text, fontSize: 28, fontWeight: 700 }}>AU</div></div>
        <div style={{ display: 'flex', gap: 14, marginTop: 28 }}><Chip active={tab === 0}>Career Stats</Chip><Chip active={tab === 1}>Career Results</Chip><Chip active={tab === 2}>Points Standings</Chip></div>
        <div style={{ display: 'flex', gap: 14, marginTop: 18 }}><Chip active>Combined</Chip><Chip>SX</Chip><Chip>MX</Chip></div>
      </Card>
      {tab === 0 ? <Card style={{ marginTop: 24, padding: 22 }}><div style={{ color: c.text, fontSize: 34, fontWeight: 700, marginBottom: 14 }}>Main Events</div>{[['2021', '250E', 'HON', '9', '5.11', '5', '3', '177'], ['2022', '250E', 'HON', '8', '1.75', '8', '4', '192'], ['2023', '250W', 'HON', '9', '1.44', '9', '6', '223'], ['2024', '450', 'HON', '17', '3.35', '10', '8', '351']].map((r, i) => <div key={r[0]} style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', padding: '14px 0', color: c.text, fontSize: 18, borderTop: i ? `1px solid ${c.border}` : 'none', background: i % 2 ? '#242428' : 'transparent' }}>{r.map((v) => <div key={v} style={{ paddingLeft: 12 }}>{v}</div>)}</div>)}</Card> : null}
      {tab === 1 ? <Card style={{ marginTop: 24, padding: 22 }}>{[['1', 'Budds Creek Motocross Park', '2025-08-23', '450MX', 'HON'], ['1', 'Unadilla MX', '2025-08-16', '450MX', 'HON'], ['6', 'Ironman Raceway', '2025-08-09', '450MX', 'HON'], ['2', 'Washougal MX Park', '2025-07-19', '450MX', 'HON']].map((r, i) => <div key={r[1]} style={{ display: 'grid', gridTemplateColumns: '90px 1.7fr 160px 110px 90px', padding: '16px 0', color: c.text, fontSize: 18, borderTop: i ? `1px solid ${c.border}` : 'none', background: i % 2 ? '#242428' : 'transparent' }}>{r.map((v, j) => <div key={v} style={{ paddingLeft: 12, color: j === 1 ? '#6573ff' : c.text }}>{v}</div>)}</div>)}</Card> : null}
      {tab === 2 ? <Card style={{ marginTop: 24, padding: 22 }}>{[['2025', '1', '509', '450MX', 'HON'], ['2025', '18', '71', '450SX', 'HON'], ['2024', '9', '210', '450MX', 'HON'], ['2024', '1', '351', '450SX', 'HON'], ['2023', '1', '550', '450MX', 'HON']].map((r, i) => <div key={`${r[0]}-${r[1]}`} style={{ display: 'grid', gridTemplateColumns: '140px 140px 160px 140px 140px', padding: '16px 0', color: c.text, fontSize: 18, borderTop: i ? `1px solid ${c.border}` : 'none', background: i % 2 ? '#242428' : 'transparent' }}>{r.map((v, j) => <div key={v} style={{ paddingLeft: 12, color: j === 0 ? '#68a6ff' : c.text }}>{v}</div>)}</div>)}</Card> : null}
    </Shell></Stage>
    <Cursor points={[{ f: 0, x: 800, y: 224 }, { f: 34, x: 556, y: 338 }, { f: 82, x: 690, y: 338 }, { f: 130, x: 822, y: 338 }, { f: 149, x: 822, y: 338 }]} clicks={[36, 84, 132]} />
  </AbsoluteFill>;
};

const Riders = () => {
  const f = useCurrentFrame();
  const mode = f >= 52;
  return <AbsoluteFill style={{ background: c.bg }}>
    <Caption title="Browse riders from different angles" body="Jump in alphabetically, then flip straight into countries to open up the archive by nation." />
    <Stage scale={interpolate(f, [0, 28], [0.88, 0.92], { extrapolateRight: 'clamp' })} y={18}><Shell focus={1}>
      <div style={{ color: c.text, fontSize: 66, fontWeight: 700, marginTop: 8 }}>Riders</div><div style={{ color: c.muted, fontSize: 22, marginTop: 6 }}>6,215 Riders</div>
      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}><Chip active={!mode}>Last Name</Chip><Chip active={mode}>Countries</Chip></div>
      {!mode ? <>
        <Card style={{ marginTop: 22, padding: 24 }}><div style={{ color: c.text, fontSize: 28, fontWeight: 700 }}>Featured Riders</div><div style={{ color: c.muted, fontSize: 20, marginTop: 12 }}>Quick access to a few of the riders who have been guessed the most in SMXmuse grids during the past week.</div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 14, marginTop: 18 }}>{['Eli Tomac', 'Ken Roczen', 'Jett Lawrence', 'Dylan Ferrandis', 'Ryan Villopoto', 'James Stewart', 'Ryan Dungey', 'Justin Barcia'].map((name) => <div key={name} style={{ borderRadius: 18, border: `1px solid ${c.border}`, background: '#202125', padding: 12 }}><div style={{ height: 134, borderRadius: 14, background: '#2b2d31' }} /><div style={{ color: c.text, fontSize: 16, fontWeight: 700, marginTop: 10 }}>{name}</div></div>)}</div></Card>
        <Card style={{ marginTop: 20, padding: 24 }}><div style={{ color: c.text, fontSize: 28, fontWeight: 700 }}>Browse by last name</div><div style={{ color: c.muted, fontSize: 20, marginTop: 12 }}>Jump into the archive alphabetically across every rider in the database.</div></Card>
      </> : <Card style={{ marginTop: 22, padding: 24 }}><div style={{ color: c.text, fontSize: 30, fontWeight: 700 }}>Browse by country</div><div style={{ color: c.muted, fontSize: 20, marginTop: 12 }}>Open a country page to get the same rider layout you already use on each nation page.</div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 22 }}>{countries.map((country) => <div key={country} style={{ height: 60, borderRadius: 12, background: '#2b2b2f', display: 'flex', alignItems: 'center', padding: '0 18px', color: c.text, fontSize: 18 }}>{country}</div>)}</div></Card>}
    </Shell></Stage>
    <Cursor points={[{ f: 0, x: 652, y: 164 }, { f: 18, x: 392, y: 354 }, { f: 52, x: 502, y: 354 }, { f: 89, x: 502, y: 354 }]} clicks={[54]} />
  </AbsoluteFill>;
};

const Seasons = () => {
  const f = useCurrentFrame();
  const scroll = interpolate(f, [18, 84], [0, -208], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  return <AbsoluteFill style={{ background: c.bg }}>
    <Caption title="Season pages tell the whole story" body="Lead with the season selector, then drift from standings into charts so the table view and the visual view feel connected." />
    <Stage scale={interpolate(f, [0, 36], [0.88, 0.95], { extrapolateRight: 'clamp' })} y={8}><Shell focus={2}>
      <div style={{ transform: `translateY(${scroll}px)` }}>
        <Card style={{ padding: 34, minHeight: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: c.gold, letterSpacing: '0.14em', textTransform: 'uppercase', fontSize: 18 }}>Season dashboard</div><div style={{ color: c.text, fontSize: 72, fontWeight: 700, marginTop: 20 }}>2026 450 Supercross</div><div style={{ color: c.muted, fontSize: 24, lineHeight: 1.45, marginTop: 18, textAlign: 'center', maxWidth: 740 }}>Track the totals and averages from each rider over the course of a season, then switch sport, year, or class to jump into another deep dive.</div><div style={{ display: 'flex', gap: 12, marginTop: 26 }}><Chip active>SX</Chip><Chip>2026</Chip><Chip>450</Chip><Chip active style={{ background: c.accent, color: 'white' }}>Go</Chip></div></Card>
        <Card style={{ marginTop: 22, padding: 22 }}><div style={{ color: c.text, fontSize: 28, fontWeight: 700, marginBottom: 18 }}>Main Event Performance</div>{[['Eli Tomac', '245'], ['Hunter Lawrence', '245'], ['Ken Roczen', '240'], ['Cooper Webb', '220'], ['Justin Cooper', '198'], ['Joey Savatgy', '153']].map((r, i) => <div key={r[0]} style={{ display: 'grid', gridTemplateColumns: '1.2fr repeat(8, 0.7fr)', padding: '14px 12px', color: c.text, fontSize: 16, background: i % 2 ? '#232428' : '#17181c', borderTop: i ? `1px solid ${c.border}` : 'none' }}><div style={{ color: '#6f7dff' }}>{r[0]}</div><div>{r[1]}</div><div>{[4, 3, 3, 1, 0, 0][i]}</div><div>{[8, 9, 8, 5, 2, 0][i]}</div><div>{[10, 11, 10, 8, 7, 2][i]}</div><div>{[11, 11, 12, 12, 11, 9][i]}</div><div>{[1, 1, 1, 1, 2, 5][i]}</div><div>{[3.42, 3.5, 3.58, 4.42, 5.75, 8.09][i]}</div><div>{[12, 12, 12, 12, 12, 11][i]}</div></div>)}</Card>
        <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.2fr', gap: 18, marginTop: 22 }}>
          <Card style={{ padding: 26, minHeight: 280 }}><div style={{ color: c.text, fontSize: 26, fontWeight: 700 }}>Race Control (Laps Led)</div><div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 26 }}><div style={{ width: 230, height: 230, borderRadius: 999, background: 'conic-gradient(#ffe100 0 38%, #ff7f11 38% 60%, #e00000 60% 81%, #1125aa 81% 88%, #79cf22 88% 93%, #f0a05a 93% 100%)', position: 'relative' }}><div style={{ position: 'absolute', inset: 62, borderRadius: 999, background: c.panel }} /></div></div></Card>
          <Card style={{ padding: 26, minHeight: 280 }}><div style={{ color: c.text, fontSize: 26, fontWeight: 700 }}>Championship Progression</div><div style={{ position: 'relative', height: 250, marginTop: 24 }}><div style={{ position: 'absolute', inset: 0, borderLeft: `2px solid ${c.border}`, borderBottom: `2px solid ${c.border}` }} />{[['#93a0ff', 'M 20 210 C 180 180, 300 170, 430 130 C 560 95, 700 70, 860 40'], ['#ff8a1c', 'M 20 200 C 180 150, 300 120, 430 90 C 560 65, 700 45, 860 30'], ['#f20b0b', 'M 20 205 C 180 165, 300 115, 430 86 C 560 56, 700 34, 860 28'], ['#f8ef00', 'M 20 198 C 180 172, 300 126, 430 98 C 560 72, 700 49, 860 34']].map(([color, path]) => <svg key={color} width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}><path d={path} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" /></svg>)}</div></Card>
        </div>
      </div>
    </Shell></Stage>
    <Cursor points={[{ f: 0, x: 756, y: 164 }, { f: 22, x: 546, y: 166 }, { f: 50, x: 546, y: 166 }, { f: 104, x: 550, y: 610 }]} clicks={[24]} />
  </AbsoluteFill>;
};

const Results = () => {
  const f = useCurrentFrame();
  const scroll = interpolate(f, [18, 84], [0, -210], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  return <AbsoluteFill style={{ background: c.bg }}>
    <Caption title="Race Results are one click away" body="Use the archive browser to move from today to the 1970s without changing how the page works." />
    <Stage scale={interpolate(f, [0, 24], [0.9, 0.95], { extrapolateRight: 'clamp' })}><Shell focus={3}>
      <div style={{ transform: `translateY(${scroll}px)` }}>
        <Card style={{ padding: 34, minHeight: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: c.gold, fontSize: 18, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Archive browser</div><div style={{ color: c.text, fontSize: 74, fontWeight: 700, marginTop: 16 }}>Race Results</div><div style={{ color: c.muted, fontSize: 24, textAlign: 'center', lineHeight: 1.45, marginTop: 18, maxWidth: 620 }}>Pick a sport, then click a decade to dive into each year and open every round from the archive.</div><div style={{ display: 'flex', gap: 14, marginTop: 22 }}><Chip active>SX</Chip><Chip>MX</Chip></div></Card>
        <div style={{ display: 'grid', gap: 18, marginTop: 22 }}>{decades.map(([label, count]) => <Card key={label} style={{ padding: '26px 28px', height: 114, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ color: c.text, fontSize: 42, fontWeight: 700 }}>{label}</div><div style={{ color: c.muted, fontSize: 20, marginTop: 6 }}>{count}</div></div><div style={{ width: 52, height: 52, borderRadius: 999, background: '#262831', color: c.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>+</div></Card>)}</div>
      </div>
    </Shell></Stage>
    <Cursor points={[{ f: 0, x: 720, y: 164 }, { f: 22, x: 540, y: 340 }, { f: 60, x: 540, y: 620 }]} clicks={[24]} />
  </AbsoluteFill>;
};

const Leaderboards = () => {
  const f = useCurrentFrame();
  const selected = f >= 56 ? 'Cooper Webb' : '';
  return <AbsoluteFill style={{ background: c.bg }}>
    <Caption title="Leaderboards stay in sync" body="Select one rider and the page calls them out across every table, which makes the all-time view feel way more alive." />
    <Stage scale={interpolate(f, [0, 22], [0.92, 0.95], { extrapolateRight: 'clamp' })}><Shell focus={4}>
      <Card style={{ padding: 28, minHeight: 214, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: c.text, fontSize: 70, fontWeight: 700 }}>All Time Leaderboards</div><div style={{ color: c.muted, fontSize: 24, lineHeight: 1.4, marginTop: 12, textAlign: 'center', maxWidth: 760 }}>Switch between disciplines and classes to compare the riders who sit at the top of the all-time stat categories.</div><div style={{ display: 'grid', gap: 10, marginTop: 20 }}><div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}><Chip active>SX</Chip><Chip>MX</Chip></div><div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}><Chip active>450</Chip><Chip>250</Chip></div></div></Card>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginTop: 20 }}>{boards.map(([title, rows]) => <Card key={title} style={{ padding: 18, minHeight: 520 }}><div style={{ color: c.text, fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 14 }}>{title}</div>{rows.map((row, i) => { const on = row[0] === selected; return <div key={row[0]} style={{ display: 'grid', gridTemplateColumns: '44px 1fr 60px', alignItems: 'center', height: 44, color: c.text, fontSize: 16, padding: '0 10px', background: on ? 'rgba(255,255,255,0.16)' : 'transparent', borderTop: i ? `1px solid ${c.border}` : `1px solid ${c.border}` }}><div>{i + 1}</div><div style={{ color: '#7c84ff', fontWeight: on ? 700 : 500 }}>{row[0]}</div><div style={{ textAlign: 'right', fontWeight: on ? 700 : 500 }}>{row[1]}</div></div>; })}</Card>)}</div>
    </Shell></Stage>
    <Cursor points={[{ f: 0, x: 790, y: 164 }, { f: 24, x: 338, y: 616 }, { f: 90, x: 338, y: 616 }]} clicks={[58]} />
  </AbsoluteFill>;
};

const Comparison = () => {
  const f = useCurrentFrame();
  const show = spring({ fps: 30, frame: f - 18, config: { damping: 18, stiffness: 100 } });
  return <AbsoluteFill style={{ background: c.bg }}>
    <Caption title="Then finish with a direct rider matchup" body="Lock in Jett Lawrence and Haiden Deegan on Supercross 250 so the last beat lands on a clear, shareable comparison." />
    <Stage scale={interpolate(f, [0, 24], [0.9, 0.96], { extrapolateRight: 'clamp' })}><Shell focus={5}>
      <div style={{ color: c.text, fontSize: 68, fontWeight: 700, textAlign: 'center', marginTop: 26 }}>Rider Comparison</div>
      <Card style={{ marginTop: 26, padding: 18 }}><div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1.15fr 0.72fr 0.38fr 0.64fr', gap: 12 }}><div style={{ height: 52, borderRadius: 10, background: '#17181c', border: `1px solid ${c.border}`, color: c.text, display: 'flex', alignItems: 'center', padding: '0 16px', fontSize: 16 }}>Jett Lawrence</div><div style={{ height: 52, borderRadius: 10, background: '#17181c', border: `1px solid ${c.border}`, color: c.text, display: 'flex', alignItems: 'center', padding: '0 16px', fontSize: 16 }}>Haiden Deegan</div><div style={{ height: 52, borderRadius: 10, background: '#17181c', border: `1px solid ${c.border}`, color: c.text, display: 'flex', alignItems: 'center', padding: '0 16px', fontSize: 16 }}>Supercross</div><div style={{ height: 52, borderRadius: 10, background: '#17181c', border: `1px solid ${c.border}`, color: c.text, display: 'flex', alignItems: 'center', padding: '0 16px', fontSize: 16 }}>250</div><div style={{ height: 52, borderRadius: 10, background: c.accent, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700 }}>Compare Riders</div></div></Card>
      <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center', transform: `scale(${lerp(0.94, 1, show)})`, opacity: show }}><div style={{ width: 740, borderRadius: 18, overflow: 'hidden', border: `1px solid ${c.border}`, background: '#121317' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr', padding: '22px 20px 12px', alignItems: 'end', borderBottom: `1px solid ${c.border}` }}><Img src={staticFile('smxmuselogo.png')} style={{ width: 98 }} /><div style={{ textAlign: 'center' }}><div style={{ width: 54, height: 54, borderRadius: 14, background: '#313339', margin: '0 auto' }} /><div style={{ color: c.text, fontSize: 18, fontWeight: 700, marginTop: 10 }}>Jett Lawrence</div></div><div style={{ textAlign: 'center' }}><div style={{ width: 54, height: 54, borderRadius: 14, background: '#313339', margin: '0 auto' }} /><div style={{ color: c.text, fontSize: 18, fontWeight: 700, marginTop: 10 }}>Haiden Deegan</div></div></div>
        <div style={{ padding: '14px 18px', color: c.text, fontSize: 22, fontWeight: 700, borderBottom: `1px solid ${c.border}` }}>MAIN EVENTS: 250 SX</div>
        {compareRows.map((row, i) => { const l = Number.parseFloat(row[1]) > Number.parseFloat(row[2]); const r = Number.parseFloat(row[2]) > Number.parseFloat(row[1]); return <div key={row[0]} style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr', fontSize: 22, color: c.text, background: i % 2 ? '#17181c' : '#101116', borderTop: i ? `1px solid ${c.border}` : 'none' }}><div style={{ padding: '14px 18px' }}>{row[0]}</div><div style={{ padding: '14px 18px', textAlign: 'center', background: l ? 'rgba(31,107,69,0.75)' : 'transparent', fontWeight: l ? 700 : 500 }}>{row[1]}</div><div style={{ padding: '14px 18px', textAlign: 'center', background: r ? 'rgba(31,107,69,0.75)' : 'transparent', fontWeight: r ? 700 : 500 }}>{row[2]}</div></div>; })}
      </div></div>
    </Shell></Stage>
    <Cursor points={[{ f: 0, x: 924, y: 164 }, { f: 20, x: 816, y: 334 }, { f: 90, x: 816, y: 334 }]} clicks={[24]} />
  </AbsoluteFill>;
};

const End = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ background: 'radial-gradient(circle at top left, rgba(118,77,77,0.2), transparent 26%), radial-gradient(circle at top right, rgba(86,95,151,0.2), transparent 34%), #0d0d10', padding: '140px 86px' }}>
    <div style={{ marginTop: 'auto', marginBottom: 'auto', borderRadius: 34, border: `1px solid ${c.border}`, background: 'linear-gradient(180deg, #17181c 0%, #101116 100%)', boxShadow: '0 30px 100px rgba(0,0,0,0.42)', padding: '62px 54px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 22, opacity: interpolate(f, [0, 18], [0, 1], { extrapolateRight: 'clamp' }), transform: `translateY(${interpolate(f, [0, 26], [28, 0], { extrapolateRight: 'clamp' })}px)` }}>
      <Img src={staticFile('smxmuselogo.png')} style={{ width: 180 }} />
      <div style={{ color: c.text, fontSize: 72, lineHeight: 1.02, fontWeight: 700 }}>Quick, deep, and built to be explored</div>
      <div style={{ color: c.muted, fontSize: 28, lineHeight: 1.42, maxWidth: 760 }}>SMXmuse turns rider history, season context, archive results, and all-time stats into one clean motion-ready browsing experience.</div>
      <div style={{ marginTop: 8, borderRadius: 14, background: c.accent, color: 'white', fontSize: 28, fontWeight: 700, padding: '14px 22px' }}>smxmuse.com</div>
    </div>
  </AbsoluteFill>;
};

export const PromoVideo = () => <AbsoluteFill style={{ background: c.bg, fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
  <Sequence from={0} durationInFrames={150}><Landing /></Sequence>
  <Sequence from={150} durationInFrames={150}><Rider /></Sequence>
  <Sequence from={300} durationInFrames={90}><Riders /></Sequence>
  <Sequence from={390} durationInFrames={120}><Seasons /></Sequence>
  <Sequence from={510} durationInFrames={90}><Results /></Sequence>
  <Sequence from={600} durationInFrames={150}><Leaderboards /></Sequence>
  <Sequence from={750} durationInFrames={150}><Comparison /></Sequence>
  <Sequence from={900} durationInFrames={60}><End /></Sequence>
</AbsoluteFill>;
