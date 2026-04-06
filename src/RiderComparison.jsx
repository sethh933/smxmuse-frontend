import { useState, useEffect, useRef } from "react";
import debounce from "lodash.debounce";
import { toBlob } from "html-to-image";
import { apiUrl } from "./api";

function getComparisonImageSrc(url) {
  if (!url) return "/smxmuselogo.png";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return apiUrl(`/api/image-proxy?url=${encodeURIComponent(url)}`);
  }

  return url;
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function RiderComparison() {
  const [data, setData] = useState(null);

  const [rider1, setRider1] = useState(null);
  const [rider2, setRider2] = useState(null);
  const [sport, setSport] = useState("sx");
  const [appliedSport, setAppliedSport] = useState("sx");
  const [classId, setClassId] = useState(1);
  const [appliedRider1, setAppliedRider1] = useState(null);
  const [appliedRider2, setAppliedRider2] = useState(null);
  const [rider1Name, setRider1Name] = useState("");
  const [rider2Name, setRider2Name] = useState("");
  const [suggestions1, setSuggestions1] = useState([]);
  const [suggestions2, setSuggestions2] = useState([]);
  const [appliedClassId, setAppliedClassId] = useState(1);
  const [imageStatus, setImageStatus] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const searchRef1 = useRef(null);
  const searchRef2 = useRef(null);
  const comparisonCaptureRef = useRef(null);

  useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      searchRef1.current &&
      !searchRef1.current.contains(event.target)
    ) {
      setSuggestions1([]);
    }

    if (
      searchRef2.current &&
      !searchRef2.current.contains(event.target)
    ) {
      setSuggestions2([]);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  const debouncedFetch = useRef(
    debounce(async (input, setSuggestions) => {
      try {
        const response = await fetch(
          apiUrl(`/api/riders/search?q=${encodeURIComponent(input)}`)
        );
        if (!response.ok) {
          throw new Error("Failed to load rider suggestions.");
        }

        const json = await response.json();
        setSuggestions(json || []);
      } catch (error) {
        setSuggestions([]);
      }
    }, 300)
  ).current;

  useEffect(() => {
    return () => debouncedFetch.cancel();
  }, [debouncedFetch]);

  const handleSearch = (value, setName, setSuggestions) => {
    setName(value);

    if (value.length >= 2) {
      debouncedFetch(value, setSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (rider, setName, setSuggestions, setId) => {
    setName(rider.FullName);
    setSuggestions([]);
    setId(rider.RiderID);
  };

  useEffect(() => {
    if (sport === "sx" && classId === 3) {
      setClassId(1);
    }
  }, [sport, classId]);

  const fetchComparison = async () => {
    if (!rider1 || !rider2) return;

    setAppliedSport(sport);
    setAppliedRider1(rider1);
    setAppliedRider2(rider2);
    setAppliedClassId(classId);

    const url = apiUrl(`/compare?rider1=${rider1}&rider2=${rider2}&sport=${sport}&classid=${classId}`);
    const res = await fetch(url);
    const json = await res.json();
    setData(json);
    setImageStatus("");
  };

  const handleCopyComparisonImage = async () => {
    if (!comparisonCaptureRef.current) return;

    setIsExporting(true);
    setImageStatus("");

    try {
      const imageElements = Array.from(
        comparisonCaptureRef.current.querySelectorAll(".comparison-rider-image")
      );

      await Promise.all(
        imageElements.map(async (img) => {
          const src = img.getAttribute("src");
          if (!src) return;

          const response = await fetch(src);
          const imageBlob = await response.blob();
          const dataUrl = await blobToDataUrl(imageBlob);
          img.setAttribute("data-original-src", src);
          img.setAttribute("src", dataUrl);
        })
      );

      const blob = await toBlob(comparisonCaptureRef.current, {
        cacheBust: true,
        backgroundColor: "#121212",
        pixelRatio: 2
      });

      if (!blob) {
        throw new Error("Failed to generate image.");
      }

      if (
        navigator.clipboard &&
        window.ClipboardItem &&
        typeof navigator.clipboard.write === "function"
      ) {
        await navigator.clipboard.write([
          new window.ClipboardItem({
            [blob.type]: blob
          })
        ]);

        setImageStatus("Comparison copied to clipboard.");
      } else {
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `smxmuse-comparison-${riderMap[r1]?.FullName || "rider-1"}-vs-${riderMap[r2]?.FullName || "rider-2"}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
        setImageStatus("Image downloaded because clipboard image copy is unavailable here.");
      }
    } catch (error) {
      console.error("Failed to export comparison image", error);
      setImageStatus("Could not create the comparison image.");
    } finally {
      const imageElements = Array.from(
        comparisonCaptureRef.current?.querySelectorAll(".comparison-rider-image") || []
      );

      imageElements.forEach((img) => {
        const originalSrc = img.getAttribute("data-original-src");
        if (originalSrc) {
          img.setAttribute("src", originalSrc);
          img.removeAttribute("data-original-src");
        }
      });

      setIsExporting(false);
    }
  };

  const getRiderData = () => {
    if (!data) return { main: {}, heats: {}, qual: {} };

    const main = {};
    const heats = {};
    const qual = {};

    data.main.forEach((r) => {
      main[r.RiderID] = r;
    });

    data.heats.forEach((r) => {
      heats[r.RiderID] = r;
    });

    data.qual.forEach((r) => {
      qual[r.RiderID] = r;
    });

    return { main, heats, qual };
  };

  const getChamps = () => {
    if (!data) return {};

    const champs = {};

    data.championships.forEach((r) => {
      if (!champs[r.RiderID]) champs[r.RiderID] = {};
      champs[r.RiderID][r.ClassID] = r.Titles;
    });

    return champs;
  };

  const { main, heats, qual } = getRiderData();
  const champs = getChamps();

  const riderMap = {};
  if (data?.riders) {
    data.riders.forEach((r) => {
      riderMap[r.RiderID] = r;
    });
  }

  const r1 = appliedRider1;
  const r2 = appliedRider2;
  const isMX = appliedSport === "mx";

  const getStyle = (val1, val2, lowerIsBetter = false) => {
    if (val1 == null || val2 == null) return {};
    if (val1 === val2) return {};

    const better = lowerIsBetter ? val1 < val2 : val1 > val2;

    return better
      ? {
          backgroundColor: "#193d2b",
          fontWeight: "bold"
        }
      : {};
  };

  const titleLabel =
    appliedClassId === 1
      ? `450 ${isMX ? "MX" : "SX"} Titles`
      : appliedClassId === 2
      ? `250 ${isMX ? "MX" : "SX"} Titles`
      : "500 MX Titles";

  return (
    <div className="comparison-page">
      <h1>Rider Comparison</h1>

      <div className="comparison-card">
        <div className="comparison-inputs">
          <div ref={searchRef1} className="search-wrapper comparison-search">
            <input
              value={rider1Name}
              onChange={(e) =>
                handleSearch(e.target.value, setRider1Name, setSuggestions1)
              }
              placeholder="Search Rider 1..."
            />
            {suggestions1.length > 0 && (
              <div className="search-dropdown">
  <div className="search-group-label">Riders</div>

  {suggestions1.map((r) => (
    <div
      key={r.RiderID}
      onClick={() =>
        handleSelect(r, setRider1Name, setSuggestions1, setRider1)
      }
      className="search-result-item"
    >
      <div className="search-result-title">{r.FullName}</div>
      <div className="search-result-subtitle">{r.Country}</div>
    </div>
  ))}
</div>
            )}
          </div>

          <div ref={searchRef2} className="search-wrapper comparison-search">
            <input
              value={rider2Name}
              onChange={(e) =>
                handleSearch(e.target.value, setRider2Name, setSuggestions2)
              }
              placeholder="Search Rider 2..."
            />
            {suggestions2.length > 0 && (
              <div className="search-dropdown">
  <div className="search-group-label">Riders</div>

  {suggestions2.map((r) => (
    <div
      key={r.RiderID}
      onClick={() =>
        handleSelect(r, setRider2Name, setSuggestions2, setRider2)
      }
      className="search-result-item"
    >
      <div className="search-result-title">{r.FullName}</div>
      <div className="search-result-subtitle">{r.Country}</div>
    </div>
  ))}
</div>
            )}
          </div>

          <select value={sport} onChange={(e) => setSport(e.target.value)}>
            <option value="sx">Supercross</option>
            <option value="mx">Motocross</option>
          </select>

          <select
            value={classId}
            onChange={(e) => setClassId(parseInt(e.target.value, 10))}
          >
            {sport === "sx" ? (
              <>
                <option value={1}>450</option>
                <option value={2}>250</option>
              </>
            ) : (
              <>
                <option value={1}>450</option>
                <option value={2}>250</option>
                <option value={3}>500</option>
              </>
            )}
          </select>

          <button
            className="compare-button"
            onClick={fetchComparison}
            disabled={!rider1 || !rider2}
          >
            Compare Riders
          </button>
        </div>
      </div>

        {data && (
          <>
            <div className="comparison-results">
              <div className="comparison-stage">
                <div className="comparison-capture-target" ref={comparisonCaptureRef}>
                <table className="comparison-table">
                <thead>
                  <tr>
                    <th>
    <div className="comparison-rider-header">
      <img
        src="/smxmuselogo.png"
        alt="smxmuse"
        className="comparison-logo"
      />
    </div>
  </th>

                  <th>
                    <div className="comparison-rider-header">
                      <img
                        src={getComparisonImageSrc(riderMap[r1]?.ImageURL)}
                        alt={riderMap[r1]?.FullName || "Rider 1"}
                        className="comparison-rider-image"
                      />
                      <div className="comparison-rider-name">
                        {riderMap[r1]?.FullName}
                      </div>
                    </div>
                  </th>

                  <th>
                    <div className="comparison-rider-header">
                      <img
                        src={getComparisonImageSrc(riderMap[r2]?.ImageURL)}
                        alt={riderMap[r2]?.FullName || "Rider 2"}
                        className="comparison-rider-image"
                      />
                      <div className="comparison-rider-name">
                        {riderMap[r2]?.FullName}
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td colSpan="3" className="comparison-section">
                    {isMX ? "OVERALLS" : "MAIN EVENTS"}
                  </td>
                </tr>

              <tr>
                <td>Starts</td>
                <td style={getStyle(main[r1]?.Starts, main[r2]?.Starts)}>
                  {main[r1]?.Starts}
                </td>
                <td style={getStyle(main[r2]?.Starts, main[r1]?.Starts)}>
                  {main[r2]?.Starts}
                </td>
              </tr>

              <tr>
                <td>Avg Finish</td>
                <td
                  style={getStyle(
                    main[r1]?.AvgFinish,
                    main[r2]?.AvgFinish,
                    true
                  )}
                >
                  {main[r1]?.AvgFinish}
                </td>
                <td
                  style={getStyle(
                    main[r2]?.AvgFinish,
                    main[r1]?.AvgFinish,
                    true
                  )}
                >
                  {main[r2]?.AvgFinish}
                </td>
              </tr>

              <tr>
                <td>Wins</td>
                <td style={getStyle(main[r1]?.Wins, main[r2]?.Wins)}>
                  {main[r1]?.Wins}
                </td>
                <td style={getStyle(main[r2]?.Wins, main[r1]?.Wins)}>
                  {main[r2]?.Wins}
                </td>
              </tr>

              <tr>
                <td>Win %</td>
                <td style={getStyle(main[r1]?.WinPct, main[r2]?.WinPct)}>
                  {main[r1]?.WinPct}
                </td>
                <td style={getStyle(main[r2]?.WinPct, main[r1]?.WinPct)}>
                  {main[r2]?.WinPct}
                </td>
              </tr>

              {isMX && (
                <tr>
                  <td>Moto Wins</td>
                  <td style={getStyle(main[r1]?.MotoWins, main[r2]?.MotoWins)}>
                    {main[r1]?.MotoWins}
                  </td>
                  <td style={getStyle(main[r2]?.MotoWins, main[r1]?.MotoWins)}>
                    {main[r2]?.MotoWins}
                  </td>
                </tr>
              )}

              <tr>
                <td>Podiums</td>
                <td style={getStyle(main[r1]?.Podiums, main[r2]?.Podiums)}>
                  {main[r1]?.Podiums}
                </td>
                <td style={getStyle(main[r2]?.Podiums, main[r1]?.Podiums)}>
                  {main[r2]?.Podiums}
                </td>
              </tr>

              <tr>
                <td>Podium %</td>
                <td style={getStyle(main[r1]?.PodiumPct, main[r2]?.PodiumPct)}>
                  {main[r1]?.PodiumPct}
                </td>
                <td style={getStyle(main[r2]?.PodiumPct, main[r1]?.PodiumPct)}>
                  {main[r2]?.PodiumPct}
                </td>
              </tr>

              <tr>
                <td>Top 5 %</td>
                <td style={getStyle(main[r1]?.Top5Pct, main[r2]?.Top5Pct)}>
                  {main[r1]?.Top5Pct}
                </td>
                <td style={getStyle(main[r2]?.Top5Pct, main[r1]?.Top5Pct)}>
                  {main[r2]?.Top5Pct}
                </td>
              </tr>

              <tr>
                <td>Top 10 %</td>
                <td style={getStyle(main[r1]?.Top10Pct, main[r2]?.Top10Pct)}>
                  {main[r1]?.Top10Pct}
                </td>
                <td style={getStyle(main[r2]?.Top10Pct, main[r1]?.Top10Pct)}>
                  {main[r2]?.Top10Pct}
                </td>
              </tr>

              <tr>
                <td>Laps Led</td>
                <td style={getStyle(main[r1]?.LapsLed, main[r2]?.LapsLed)}>
                  {main[r1]?.LapsLed}
                </td>
                <td style={getStyle(main[r2]?.LapsLed, main[r1]?.LapsLed)}>
                  {main[r2]?.LapsLed}
                </td>
              </tr>

              {!isMX && (
                <>
                  <tr>
                    <td colSpan="3" className="comparison-section">
                      HEATS
                    </td>
                  </tr>

                  <tr>
                    <td>Heat Avg</td>
                    <td
                      style={getStyle(
                        heats[r1]?.HeatAvg ?? null,
                        heats[r2]?.HeatAvg ?? null,
                        true
                      )}
                    >
                      {heats[r1]?.HeatAvg ?? "-"}
                    </td>
                    <td
                      style={getStyle(
                        heats[r2]?.HeatAvg ?? null,
                        heats[r1]?.HeatAvg ?? null,
                        true
                      )}
                    >
                      {heats[r2]?.HeatAvg ?? "-"}
                    </td>
                  </tr>

                  <tr>
                    <td>Heat Wins</td>
                    <td
                      style={getStyle(
                        heats[r1]?.HeatWins ?? null,
                        heats[r2]?.HeatWins ?? null
                      )}
                    >
                      {heats[r1]?.HeatWins ?? 0}
                    </td>
                    <td
                      style={getStyle(
                        heats[r2]?.HeatWins ?? null,
                        heats[r1]?.HeatWins ?? null
                      )}
                    >
                      {heats[r2]?.HeatWins ?? 0}
                    </td>
                  </tr>
                </>
              )}

              <tr>
                <td colSpan="3" className="comparison-section">
                  QUALIFYING
                </td>
              </tr>

              <tr>
                <td>Qual Avg</td>
                <td
                  style={getStyle(
                    qual[r1]?.QualAvg,
                    qual[r2]?.QualAvg,
                    true
                  )}
                >
                  {qual[r1]?.QualAvg}
                </td>
                <td
                  style={getStyle(
                    qual[r2]?.QualAvg,
                    qual[r1]?.QualAvg,
                    true
                  )}
                >
                  {qual[r2]?.QualAvg}
                </td>
              </tr>

              <tr>
                <td>Poles</td>
                <td style={getStyle(qual[r1]?.Poles, qual[r2]?.Poles)}>
                  {qual[r1]?.Poles}
                </td>
                <td style={getStyle(qual[r2]?.Poles, qual[r1]?.Poles)}>
                  {qual[r2]?.Poles}
                </td>
              </tr>

              <tr>
                <td colSpan="3" className="comparison-section">
                  CHAMPIONSHIPS
                </td>
              </tr>

                <tr>
                  <td>{titleLabel}</td>
                  <td
                    style={getStyle(
                      champs[r1]?.[appliedClassId],
                      champs[r2]?.[appliedClassId]
                    )}
                  >
                    {champs[r1]?.[appliedClassId] ?? 0}
                  </td>
                  <td
                    style={getStyle(
                      champs[r2]?.[appliedClassId],
                      champs[r1]?.[appliedClassId]
                    )}
                  >
                    {champs[r2]?.[appliedClassId] ?? 0}
                  </td>
                </tr>
              </tbody>
              </table>
              </div>

                <div className="comparison-floating-share">
                  <div className="comparison-share-rail">
                    <button
                      type="button"
                      className="compare-button comparison-share-button"
                      onClick={handleCopyComparisonImage}
                      disabled={isExporting}
                    >
                      {isExporting ? "Creating..." : "Share"}
                    </button>
                    {imageStatus && <div className="comparison-share-status">{imageStatus}</div>}
                  </div>
                </div>
              </div>
            </div>
          </>
      )}
    </div>
  );
}
