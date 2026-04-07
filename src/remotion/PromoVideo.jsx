import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const palette = {
  bg: '#111111',
  panel: '#181818',
  panelAlt: '#212121',
  border: '#2d2d2d',
  text: '#f6f3ef',
  muted: '#c7c0b6',
  accent: '#63a9ff',
  green: '#174f35',
  kicker: '#d9c19d',
};

const pagePadding = 64;

const BrowserFrame = ({ children, title }) => {
  return (
    <div
      style={{
        width: 920,
        height: 1280,
        borderRadius: 42,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #171717 0%, #121212 100%)',
        border: `1px solid ${palette.border}`,
        boxShadow: '0 24px 80px rgba(0, 0, 0, 0.42)',
      }}
    >
      <div
        style={{
          height: 88,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          borderBottom: `1px solid ${palette.border}`,
          background: '#121212',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <Img src={staticFile('smxmuselogo.png')} style={{ width: 84 }} />
          <div
            style={{
              color: palette.muted,
              fontSize: 24,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {title}
          </div>
        </div>
        <div
          style={{
            width: 270,
            height: 44,
            borderRadius: 14,
            border: `1px solid ${palette.border}`,
            color: '#8f8f8f',
            fontSize: 22,
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
          }}
        >
          Search riders or venues...
        </div>
      </div>
      <div style={{ padding: `${pagePadding}px ${pagePadding}px 56px` }}>{children}</div>
    </div>
  );
};

const HeroCard = ({ kicker, title, body, height = 280 }) => {
  return (
    <div
      style={{
        borderRadius: 34,
        minHeight: height,
        padding: 36,
        border: `1px solid ${palette.border}`,
        background:
          'radial-gradient(circle at top left, rgba(128, 64, 64, 0.18), transparent 34%), radial-gradient(circle at top right, rgba(72, 90, 138, 0.22), transparent 42%), #141414',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      <div
        style={{
          color: palette.kicker,
          fontSize: 22,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}
      >
        {kicker}
      </div>
      <div
        style={{
          color: palette.text,
          fontSize: 62,
          lineHeight: 1.04,
          fontWeight: 700,
        }}
      >
        {title}
      </div>
      <div
        style={{
          color: palette.muted,
          fontSize: 27,
          lineHeight: 1.45,
        }}
      >
        {body}
      </div>
    </div>
  );
};

const SectionTitle = ({ children }) => (
  <div
    style={{
      color: palette.text,
      fontSize: 36,
      fontWeight: 700,
      letterSpacing: '-0.02em',
    }}
  >
    {children}
  </div>
);

const MetricTable = ({ rows, rightLabel, leftLabel = 'Rider' }) => {
  return (
    <div
      style={{
        borderRadius: 28,
        overflow: 'hidden',
        border: `1px solid ${palette.border}`,
        background: palette.panel,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.8fr 1fr',
          padding: '20px 26px',
          borderBottom: `1px solid ${palette.border}`,
          color: palette.text,
          fontWeight: 700,
          fontSize: 24,
        }}
      >
        <div>{leftLabel}</div>
        <div style={{ textAlign: 'right' }}>{rightLabel}</div>
      </div>
      {rows.map((row, index) => (
        <div
          key={row.label}
          style={{
            display: 'grid',
            gridTemplateColumns: '1.8fr 1fr',
            padding: '18px 26px',
            fontSize: 24,
            color: palette.text,
            background: index % 2 ? palette.panelAlt : palette.panel,
            borderTop: index === 0 ? 'none' : `1px solid ${palette.border}`,
          }}
        >
          <div style={{ color: index === 0 ? palette.accent : palette.text }}>{row.label}</div>
          <div
            style={{
              textAlign: 'right',
              fontWeight: row.highlight ? 700 : 500,
              color: row.highlight ? '#9bd0ff' : palette.text,
            }}
          >
            {row.value}
          </div>
        </div>
      ))}
    </div>
  );
};

const ClickPulse = ({ x, y, frameOffset = 0 }) => {
  const frame = useCurrentFrame() - frameOffset;
  const opacity = interpolate(frame, [0, 8, 16], [0, 0.9, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scale = interpolate(frame, [0, 16], [0.6, 1.5], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 64,
        height: 64,
        marginLeft: -32,
        marginTop: -32,
        borderRadius: 999,
        border: `3px solid rgba(99, 169, 255, ${opacity})`,
        transform: `scale(${scale})`,
        opacity,
      }}
    />
  );
};

const SearchBar = ({ text }) => (
  <div
    style={{
      height: 74,
      borderRadius: 18,
      border: `1px solid ${palette.border}`,
      background: '#171717',
      padding: '0 22px',
      display: 'flex',
      alignItems: 'center',
      color: palette.text,
      fontSize: 30,
    }}
  >
    {text}
  </div>
);

const ComparisonTable = () => {
  const rows = [
    ['Starts', '186', '204'],
    ['Avg Finish', '4.2', '5.1'],
    ['Wins', '15', '11'],
    ['Podiums', '48', '39'],
    ['Laps Led', '312', '245'],
  ];

  return (
    <div
      style={{
        borderRadius: 30,
        overflow: 'hidden',
        border: `1px solid ${palette.border}`,
        background: palette.panel,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr 1fr',
          padding: '28px 28px 22px',
          borderBottom: `1px solid ${palette.border}`,
          alignItems: 'end',
          gap: 12,
        }}
      >
        <Img src={staticFile('smxmuselogo.png')} style={{ width: 120 }} />
        <NameColumn name="Ken Roczen" />
        <NameColumn name="Eli Tomac" />
      </div>
      <div
        style={{
          padding: '18px 28px',
          color: palette.text,
          fontSize: 28,
          fontWeight: 700,
          borderBottom: `1px solid ${palette.border}`,
        }}
      >
        MAIN EVENTS: 450 SX
      </div>
      {rows.map((row, index) => (
        <div
          key={row[0]}
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr 1fr',
            padding: '18px 28px',
            fontSize: 24,
            color: palette.text,
            background: index % 2 ? palette.panelAlt : palette.panel,
            borderTop: index === 0 ? 'none' : `1px solid ${palette.border}`,
            alignItems: 'center',
          }}
        >
          <div>{row[0]}</div>
          <div style={{ textAlign: 'center', background: row[1] > row[2] ? palette.green : 'transparent', padding: '12px 0', borderRadius: 0, fontWeight: 700 }}>{row[1]}</div>
          <div style={{ textAlign: 'center', background: row[2] > row[1] ? palette.green : 'transparent', padding: '12px 0', borderRadius: 0, fontWeight: 700 }}>{row[2]}</div>
        </div>
      ))}
    </div>
  );
};

const NameColumn = ({ name }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
    <div
      style={{
        width: 86,
        height: 86,
        borderRadius: 20,
        background: '#2b2b2b',
      }}
    />
    <div style={{ fontSize: 24, color: palette.text, fontWeight: 700, textAlign: 'center' }}>{name}</div>
  </div>
);

const SceneHeading = ({ title, subtitle }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    <div
      style={{
        color: palette.kicker,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        fontSize: 22,
      }}
    >
      Smxmuse
    </div>
    <div style={{ color: palette.text, fontSize: 76, lineHeight: 1.03, fontWeight: 700 }}>{title}</div>
    <div style={{ color: palette.muted, fontSize: 28, lineHeight: 1.4 }}>{subtitle}</div>
  </div>
);

const IntroScene = () => {
  const frame = useCurrentFrame();
  const titleProgress = spring({ fps: 30, frame, config: { damping: 16 } });

  return (
    <AbsoluteFill
      style={{
        padding: '90px 72px',
        background:
          'radial-gradient(circle at top left, rgba(112, 74, 74, 0.25), transparent 28%), radial-gradient(circle at top right, rgba(85, 95, 143, 0.22), transparent 34%), #111111',
      }}
    >
      <Img src={staticFile('smxmuselogo.png')} style={{ width: 210, marginBottom: 48 }} />
      <div
        style={{
          transform: `translateY(${interpolate(titleProgress, [0, 1], [34, 0])}px)`,
          opacity: titleProgress,
        }}
      >
        <SceneHeading
          title="Results and data like never before"
          subtitle="A 30-second walkthrough of the tools motocross fans can use to search careers, compare riders, and explore season trends in one place."
        />
      </div>
      <div
        style={{
          marginTop: 64,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 22,
        }}
      >
        <HeroCard
          kicker="Huge Pages"
          title="Rider profiles, comparisons, and dashboards"
          body="Built to give fans and stat nerds access to race-by-race context without digging through scattered archives."
          height={320}
        />
        <HeroCard
          kicker="Built for discovery"
          title="Search history, season arcs, and track-by-track context"
          body="From current form to all-time records, the site is designed to turn data into something you can browse fast."
          height={320}
        />
      </div>
    </AbsoluteFill>
  );
};

const RiderProfileScene = () => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 90, 180], [0.9, 1, 1.04], {
    easing: Easing.out(Easing.cubic),
    extrapolateRight: 'clamp',
  });
  const translateY = interpolate(frame, [0, 180], [40, -30], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ padding: '70px 80px', background: palette.bg }}>
      <SceneHeading
        title="Deep rider pages"
        subtitle="Career summaries, results history, points finishes, and class-by-class breakdowns built for real digging."
      />
      <div
        style={{
          marginTop: 54,
          display: 'flex',
          justifyContent: 'center',
          transform: `translateY(${translateY}px) scale(${scale})`,
        }}
      >
        <BrowserFrame title="Rider profile">
          <HeroCard
            kicker="James Stewart"
            title="Career stats, results, and points all in one profile"
            body="Search any rider, jump between career tables, and follow the full arc of a name across classes and seasons."
            height={310}
          />
          <div style={{ marginTop: 30, display: 'grid', gap: 20 }}>
            <SectionTitle>Main Events</SectionTitle>
            <MetricTable
              rightLabel="Avg Finish"
              leftLabel="Year / Class"
              rows={[
                { label: '2005 250E', value: '1.00', highlight: true },
                { label: '2006 450', value: '3.25' },
                { label: '2007 450', value: '1.38', highlight: true },
                { label: 'Career 450', value: '4.12' },
              ]}
            />
          </div>
        </BrowserFrame>
      </div>
      <ClickPulse x={860} y={420} frameOffset={60} />
    </AbsoluteFill>
  );
};

const SeasonDashboardScene = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 120, 180], [0.92, 1, 1.06], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ padding: '70px 80px', background: palette.bg }}>
      <SceneHeading
        title="Season dashboard tools"
        subtitle="See who owns the year through standings, starts, laps led, and points progression without leaving the page."
      />
      <div style={{ marginTop: 54, display: 'flex', justifyContent: 'center', transform: `scale(${zoom})` }}>
        <BrowserFrame title="Season dashboard">
          <HeroCard
            kicker="2026 supercross"
            title="Instant season context"
            body="Main-event performance, start stats, race control, and title progression all stacked into one dashboard."
            height={270}
          />
          <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1.2fr 0.95fr', gap: 22 }}>
            <MetricTable
              leftLabel="Rider"
              rightLabel="Points"
              rows={[
                { label: 'Eli Tomac', value: '245', highlight: true },
                { label: 'Hunter Lawrence', value: '245' },
                { label: 'Ken Roczen', value: '240' },
                { label: 'Cooper Webb', value: '220' },
              ]}
            />
            <div
              style={{
                borderRadius: 28,
                border: `1px solid ${palette.border}`,
                background: palette.panel,
                padding: 26,
                display: 'grid',
                gridTemplateRows: 'auto 1fr auto',
                gap: 18,
              }}
            >
              <div style={{ color: palette.text, fontWeight: 700, fontSize: 24 }}>Race Control (Laps Led)</div>
              <div
                style={{
                  width: 250,
                  height: 250,
                  justifySelf: 'center',
                  alignSelf: 'center',
                  borderRadius: 999,
                  background:
                    'conic-gradient(#ffe100 0 38%, #ff7f11 38% 60%, #e00000 60% 81%, #1125aa 81% 88%, #79cf22 88% 93%, #f0a05a 93% 100%)',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 68,
                    borderRadius: 999,
                    background: palette.panel,
                    border: `3px solid rgba(255,255,255,0.08)`,
                  }}
                />
              </div>
              <div style={{ color: palette.muted, fontSize: 21, textAlign: 'center' }}>
                Follow who controlled the season, not just who finished it.
              </div>
            </div>
          </div>
        </BrowserFrame>
      </div>
      <ClickPulse x={510} y={620} frameOffset={90} />
    </AbsoluteFill>
  );
};

const ComparisonScene = () => {
  const frame = useCurrentFrame();
  const slide = interpolate(frame, [0, 60], [24, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ padding: '70px 80px', background: palette.bg }}>
      <SceneHeading
        title="Compare riders side by side"
        subtitle="Put two careers into one view and instantly surface who led in starts, wins, podiums, qualifying, and championships."
      />
      <div style={{ marginTop: 54, display: 'flex', justifyContent: 'center', transform: `translateY(${slide}px)` }}>
        <BrowserFrame title="Comparison tool">
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <SearchBar text="Ken Roczen" />
              <SearchBar text="Eli Tomac" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 140px', gap: 16 }}>
              <SearchBar text="Supercross" />
              <SearchBar text="450" />
              <div
                style={{
                  borderRadius: 18,
                  background: palette.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                Compare
              </div>
            </div>
          </div>
          <div style={{ marginTop: 28 }}>
            <ComparisonTable />
          </div>
        </BrowserFrame>
      </div>
      <ClickPulse x={828} y={468} frameOffset={55} />
    </AbsoluteFill>
  );
};

const ResultsScene = () => {
  const frame = useCurrentFrame();
  const push = interpolate(frame, [0, 100], [40, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ padding: '70px 80px', background: palette.bg }}>
      <SceneHeading
        title="Search decades of results fast"
        subtitle="Browse race pages, class breakdowns, and all-time archive depth without losing the thread of the story."
      />
      <div style={{ marginTop: 54, display: 'flex', justifyContent: 'center', transform: `translateY(${push}px)` }}>
        <BrowserFrame title="Race results">
          <HeroCard
            kicker="Archive depth"
            title="From current weekends to all-time history"
            body="Open race pages, qualifying sheets, heats, LCQs, and motocross overalls with one unified archive flow."
            height={250}
          />
          <div style={{ marginTop: 28, display: 'grid', gap: 18 }}>
            <SectionTitle>450 Main Event</SectionTitle>
            <MetricTable
              leftLabel="Pos / Rider"
              rightLabel="Brand"
              rows={[
                { label: '1  Chase Sexton', value: 'KTM', highlight: true },
                { label: '2  Eli Tomac', value: 'YAM' },
                { label: '3  Ken Roczen', value: 'SUZ' },
                { label: '4  Cooper Webb', value: 'YAM' },
              ]}
            />
          </div>
        </BrowserFrame>
      </div>
      <ClickPulse x={756} y={408} frameOffset={84} />
    </AbsoluteFill>
  );
};

const OutroScene = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fade = interpolate(frame, [0, 30, durationInFrames - 40], [0, 1, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        padding: '110px 80px',
        background:
          'radial-gradient(circle at top center, rgba(94, 112, 183, 0.18), transparent 28%), radial-gradient(circle at bottom left, rgba(126, 64, 64, 0.18), transparent 32%), #101010',
        opacity: fade,
      }}
    >
      <div
        style={{
          marginTop: 'auto',
          marginBottom: 'auto',
          borderRadius: 40,
          border: `1px solid ${palette.border}`,
          background: 'linear-gradient(180deg, #171717 0%, #111111 100%)',
          padding: '56px 52px',
          display: 'flex',
          flexDirection: 'column',
          gap: 26,
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Img src={staticFile('smxmuselogo.png')} style={{ width: 220 }} />
        <div style={{ color: palette.text, fontSize: 78, fontWeight: 700, lineHeight: 1.02 }}>
          Built for fans who want more than box scores
        </div>
        <div style={{ color: palette.muted, fontSize: 30, lineHeight: 1.45, maxWidth: 800 }}>
          SMXmuse puts rider careers, comparisons, season dashboards, and full race history in one archive built to help motocross users access data and results like never before.
        </div>
        <div
          style={{
            marginTop: 10,
            borderRadius: 18,
            border: `1px solid ${palette.border}`,
            padding: '18px 28px',
            color: palette.accent,
            fontSize: 30,
            fontWeight: 700,
          }}
        >
          smxmuse.com
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const PromoVideo = () => {
  return (
    <AbsoluteFill
      style={{
        background: palette.bg,
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <Sequence from={0} durationInFrames={120}>
        <IntroScene />
      </Sequence>
      <Sequence from={120} durationInFrames={180}>
        <RiderProfileScene />
      </Sequence>
      <Sequence from={300} durationInFrames={180}>
        <SeasonDashboardScene />
      </Sequence>
      <Sequence from={480} durationInFrames={180}>
        <ComparisonScene />
      </Sequence>
      <Sequence from={660} durationInFrames={150}>
        <ResultsScene />
      </Sequence>
      <Sequence from={810} durationInFrames={90}>
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
