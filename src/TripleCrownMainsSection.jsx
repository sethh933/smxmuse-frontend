import MainEventTable from "./MainEventTable";

function getRaceCoastLabel(raceCoastId, results) {
  const coastId = raceCoastId ?? results?.[0]?.coastid;

  if (coastId === 1) return "West";
  if (coastId === 2) return "East";
  if (coastId === 3) return "East/West";

  return "";
}

function buildConfigs(mains, raceCoastId) {
  if (!mains) return [];

  const configs = [
    {
      key: "class450_main1",
      title: "Premier Class Triple Crown Main 1",
      results: mains.class450_main1,
    },
    {
      key: "class450_main2",
      title: "Premier Class Triple Crown Main 2",
      results: mains.class450_main2,
    },
    {
      key: "class450_main3",
      title: "Premier Class Triple Crown Main 3",
      results: mains.class450_main3,
    },
    {
      key: "class250_main1",
      title: `Lites Class Triple Crown Main 1 (${getRaceCoastLabel(raceCoastId, mains.class250_main1)})`,
      results: mains.class250_main1,
    },
    {
      key: "class250_main2",
      title: `Lites Class Triple Crown Main 2 (${getRaceCoastLabel(raceCoastId, mains.class250_main2)})`,
      results: mains.class250_main2,
    },
    {
      key: "class250_main3",
      title: `Lites Class Triple Crown Main 3 (${getRaceCoastLabel(raceCoastId, mains.class250_main3)})`,
      results: mains.class250_main3,
    },
  ];

  return configs.filter((config) => config.results && config.results.length > 0);
}

export default function TripleCrownMainsSection({ mains, raceCoastId, raceYear, sportId }) {
  const configs = buildConfigs(mains, raceCoastId);

  if (!configs.length) return null;

  return (
    <div style={{ marginTop: 30 }}>
      {configs.map((config) => (
        <div key={config.key} style={{ marginBottom: 24 }}>
          <h3 className="class-header">{config.title}</h3>
          <MainEventTable
            results={config.results}
            raceYear={raceYear}
            sportId={sportId}
            tripleCrownId={0}
          />
        </div>
      ))}
    </div>
  );
}
