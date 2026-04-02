import MainEventTable from "./MainEventTable";

/* ---------------------------------------
   Helper: build the correct heading
--------------------------------------- */
function getMainEventHeading(classid, results) {
  if (classid === 1) {
    return "Premier Class Main Event";
  }

  if (classid === 2) {
    const coastId = results?.[0]?.coastid;

    if (coastId === 1) return "Lites Class Main Event (West)";
    if (coastId === 2) return "Lites Class Main Event (East)";
    if (coastId === 3) return "Lites Class Main Event (East/West)";

    return "Lites Class Main Event";
  }

  return "Main Event";
}

/* ---------------------------------------
   Main Event Section Component
--------------------------------------- */
export default function MainEventSection({ class450, class250 }) {
  return (
    <div className="main-event-section">
      {class450 && class450.length > 0 && (
        <>
          <h3 className="class-header">
            {getMainEventHeading(1, class450)}
          </h3>
          <MainEventTable results={class450} />
        </>
      )}

      {class250 && class250.length > 0 && (
        <>
          <h3 className="class-header">
            {getMainEventHeading(2, class250)}
          </h3>
          <MainEventTable results={class250} />
        </>
      )}
    </div>
  );
}