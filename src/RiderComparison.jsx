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

function isComparisonWinner(val1, val2, lowerIsBetter = false) {
  if (val1 == null && val2 == null) return false;
  if (val1 == null) return false;
  if (val2 == null) return true;
  if (val1 === val2) return false;

  return lowerIsBetter ? val1 < val2 : val1 > val2;
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Failed to generate canvas image."));
      }
    }, "image/png");
  });
}

function drawRoundedRect(ctx, x, y, width, height, radius, fillStyle) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
  ctx.restore();
}

function fitText(ctx, text, maxWidth) {
  const safeText = text == null ? "" : String(text);
  if (ctx.measureText(safeText).width <= maxWidth) return safeText;

  let trimmed = safeText;
  while (trimmed.length > 0 && ctx.measureText(`${trimmed}...`).width > maxWidth) {
    trimmed = trimmed.slice(0, -1);
  }

  return trimmed ? `${trimmed}...` : "";
}

async function loadImageForCanvas(src) {
  if (!src) return null;

  try {
    const response = await fetch(src);
    if (!response.ok) return null;

    const blob = await response.blob();
    const dataUrl = await blobToDataUrl(blob);

    const image = new Image();
    image.decoding = "async";

    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = dataUrl;
    });

    return image;
  } catch (error) {
    console.error("Failed to load image for canvas export", error);
    return null;
  }
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
      const imageFileName = `smxmuse-comparison-${riderMap[r1]?.FullName || "rider-1"}-vs-${riderMap[r2]?.FullName || "rider-2"}.png`;
      const isMobileExport =
        typeof window !== "undefined" &&
        window.matchMedia("(max-width: 768px), (pointer: coarse)").matches;
      let blob;

      if (isMobileExport) {
        blob = await createMobileComparisonImage();
      } else {
        const imageElements = Array.from(
          comparisonCaptureRef.current.querySelectorAll(".comparison-rider-image")
        );

        await Promise.all(
          imageElements.map(async (img) => {
            const src = img.getAttribute("src");
            if (!src) return;

            try {
              const response = await fetch(src);
              const imageBlob = await response.blob();
              const dataUrl = await blobToDataUrl(imageBlob);
              img.setAttribute("data-original-src", src);
              img.setAttribute("src", dataUrl);
            } catch (error) {
              console.error("Failed to inline comparison image", error);
            }
          })
        );

        blob = await toBlob(comparisonCaptureRef.current, {
          cacheBust: true,
          backgroundColor: "#121212",
          pixelRatio: 2
        });
      }

      if (!blob) throw new Error("Failed to generate image.");

      const imageMimeType = blob.type || "image/png";
      const imageFile = new File([blob], imageFileName, { type: imageMimeType });

      if (
        isMobileExport &&
        navigator.share &&
        (!navigator.canShare || navigator.canShare({ files: [imageFile] }))
      ) {
        await navigator.share({
          files: [imageFile],
          title: "SMX Muse rider comparison"
        });

        setImageStatus("Comparison ready to share.");
      } else if (
        navigator.clipboard &&
        window.ClipboardItem &&
        typeof navigator.clipboard.write === "function"
      ) {
        await navigator.clipboard.write([
          new window.ClipboardItem({
            [imageMimeType]: blob
          })
        ]);

        setImageStatus("Comparison copied to clipboard.");
      } else {
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = imageFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
        setImageStatus(
          isMobileExport
            ? "Image downloaded because native file sharing is unavailable here."
            : "Image downloaded because clipboard image copy is unavailable here."
        );
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
    return isComparisonWinner(val1, val2, lowerIsBetter)
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

  const selectedClassLabel =
    appliedClassId === 1 ? "450" : appliedClassId === 2 ? "250" : "500";
  const selectedSportLabel = isMX ? "MX" : "SX";
  const mainSectionLabel = isMX
    ? `OVERALLS: ${selectedClassLabel} ${selectedSportLabel}`
    : `MAIN EVENTS: ${selectedClassLabel} ${selectedSportLabel}`;
  const heatsSectionLabel = `HEATS: ${selectedClassLabel} ${selectedSportLabel}`;
  const qualifyingSectionLabel = `QUALIFYING: ${selectedClassLabel} ${selectedSportLabel}`;
  const rider1Titles = champs[r1]?.[appliedClassId] ?? 0;
  const rider2Titles = champs[r2]?.[appliedClassId] ?? 0;
  const comparisonSections = [
    {
      label: mainSectionLabel,
      rows: [
        { label: "Starts", value1: main[r1]?.Starts ?? null, value2: main[r2]?.Starts ?? null },
        { label: "Avg Finish", value1: main[r1]?.AvgFinish ?? null, value2: main[r2]?.AvgFinish ?? null, lowerIsBetter: true },
        { label: "Wins", value1: main[r1]?.Wins ?? null, value2: main[r2]?.Wins ?? null },
        { label: "Win %", value1: main[r1]?.WinPct ?? null, value2: main[r2]?.WinPct ?? null },
        ...(isMX
          ? [{ label: "Moto Wins", value1: main[r1]?.MotoWins ?? null, value2: main[r2]?.MotoWins ?? null }]
          : []),
        { label: "Podiums", value1: main[r1]?.Podiums ?? null, value2: main[r2]?.Podiums ?? null },
        { label: "Podium %", value1: main[r1]?.PodiumPct ?? null, value2: main[r2]?.PodiumPct ?? null },
        { label: "Top 5 %", value1: main[r1]?.Top5Pct ?? null, value2: main[r2]?.Top5Pct ?? null },
        { label: "Top 10 %", value1: main[r1]?.Top10Pct ?? null, value2: main[r2]?.Top10Pct ?? null },
        { label: "Laps Led", value1: main[r1]?.LapsLed ?? null, value2: main[r2]?.LapsLed ?? null }
      ]
    },
    ...(!isMX
      ? [{
          label: heatsSectionLabel,
          rows: [
            { label: "Heat Avg", value1: heats[r1]?.HeatAvg ?? null, value2: heats[r2]?.HeatAvg ?? null, lowerIsBetter: true, display1: heats[r1]?.HeatAvg ?? "-", display2: heats[r2]?.HeatAvg ?? "-" },
            { label: "Heat Wins", value1: heats[r1]?.HeatWins ?? null, value2: heats[r2]?.HeatWins ?? null, display1: heats[r1]?.HeatWins ?? 0, display2: heats[r2]?.HeatWins ?? 0 }
          ]
        }]
      : []),
    {
      label: qualifyingSectionLabel,
      rows: [
        { label: "Qual Avg", value1: qual[r1]?.QualAvg ?? null, value2: qual[r2]?.QualAvg ?? null, lowerIsBetter: true },
        { label: "Poles", value1: qual[r1]?.Poles ?? null, value2: qual[r2]?.Poles ?? null }
      ]
    },
    {
      label: "CHAMPIONSHIPS",
      rows: [
        { label: titleLabel, value1: rider1Titles, value2: rider2Titles, display1: rider1Titles, display2: rider2Titles }
      ]
    }
  ];

  const createMobileComparisonImage = async () => {
    const canvasWidth = 1200;
    const pagePadding = 40;
    const cardPadding = 28;
    const rowHeight = 54;
    const sectionHeight = 44;
    const headerHeight = 150;
    const footerHeight = 36;
    const cardWidth = canvasWidth - pagePadding * 2;
    const tableWidth = cardWidth - cardPadding * 2;
    const labelColWidth = 360;
    const valueColWidth = (tableWidth - labelColWidth) / 2;
    const contentHeight = comparisonSections.reduce(
      (sum, section) => sum + sectionHeight + section.rows.length * rowHeight,
      0
    );
    const canvasHeight = pagePadding * 2 + cardPadding * 2 + headerHeight + contentHeight + footerHeight;

    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas is unavailable on this device.");
    }

    const [logoImage, rider1Image, rider2Image] = await Promise.all([
      loadImageForCanvas("/smxmuselogo.png"),
      loadImageForCanvas(getComparisonImageSrc(riderMap[r1]?.ImageURL)),
      loadImageForCanvas(getComparisonImageSrc(riderMap[r2]?.ImageURL))
    ]);

    ctx.fillStyle = "#121212";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    drawRoundedRect(ctx, pagePadding, pagePadding, cardWidth, canvasHeight - pagePadding * 2, 20, "#171717");

    const cardX = pagePadding;
    const cardY = pagePadding;
    const tableX = cardX + cardPadding;
    let currentY = cardY + cardPadding;

    if (logoImage) {
      const logoWidth = 120;
      const logoHeight = (logoImage.height / logoImage.width) * logoWidth;
      ctx.drawImage(logoImage, tableX, currentY, logoWidth, logoHeight);
    }

    ctx.fillStyle = "#ffffff";
    ctx.font = "700 26px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const rider1CenterX = tableX + labelColWidth + valueColWidth / 2;
    const rider2CenterX = tableX + labelColWidth + valueColWidth + valueColWidth / 2;
    const avatarSize = 72;
    const avatarY = currentY + 4;

    const drawAvatar = (image, centerX) => {
      const avatarX = centerX - avatarSize / 2;
      drawRoundedRect(ctx, avatarX, avatarY, avatarSize, avatarSize, 14, "#2a2a2a");
      if (image) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(avatarX + 14, avatarY);
        ctx.lineTo(avatarX + avatarSize - 14, avatarY);
        ctx.quadraticCurveTo(avatarX + avatarSize, avatarY, avatarX + avatarSize, avatarY + 14);
        ctx.lineTo(avatarX + avatarSize, avatarY + avatarSize - 14);
        ctx.quadraticCurveTo(avatarX + avatarSize, avatarY + avatarSize, avatarX + avatarSize - 14, avatarY + avatarSize);
        ctx.lineTo(avatarX + 14, avatarY + avatarSize);
        ctx.quadraticCurveTo(avatarX, avatarY + avatarSize, avatarX, avatarY + avatarSize - 14);
        ctx.lineTo(avatarX, avatarY + 14);
        ctx.quadraticCurveTo(avatarX, avatarY, avatarX + 14, avatarY);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(image, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();
      }
    };

    drawAvatar(rider1Image, rider1CenterX);
    drawAvatar(rider2Image, rider2CenterX);

    ctx.fillText(fitText(ctx, riderMap[r1]?.FullName || "Rider 1", valueColWidth - 24), rider1CenterX, avatarY + avatarSize + 24);
    ctx.fillText(fitText(ctx, riderMap[r2]?.FullName || "Rider 2", valueColWidth - 24), rider2CenterX, avatarY + avatarSize + 24);

    currentY += headerHeight;

    comparisonSections.forEach((section) => {
      ctx.fillStyle = "#1b1b1b";
      ctx.fillRect(tableX, currentY, tableWidth, sectionHeight);
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 18px Arial";
      ctx.textAlign = "left";
      ctx.fillText(section.label, tableX + 16, currentY + sectionHeight / 2 + 1);
      currentY += sectionHeight;

      section.rows.forEach((row) => {
        const rowY = currentY;
        const winner1 = isComparisonWinner(row.value1, row.value2, row.lowerIsBetter);
        const winner2 = isComparisonWinner(row.value2, row.value1, row.lowerIsBetter);

        ctx.fillStyle = "#141414";
        ctx.fillRect(tableX, rowY, tableWidth, rowHeight);

        if (winner1) {
          ctx.fillStyle = "#193d2b";
          ctx.fillRect(tableX + labelColWidth, rowY, valueColWidth, rowHeight);
        }

        if (winner2) {
          ctx.fillStyle = "#193d2b";
          ctx.fillRect(tableX + labelColWidth + valueColWidth, rowY, valueColWidth, rowHeight);
        }

        ctx.strokeStyle = "#2a2a2a";
        ctx.lineWidth = 1;
        ctx.strokeRect(tableX, rowY, tableWidth, rowHeight);
        ctx.beginPath();
        ctx.moveTo(tableX + labelColWidth, rowY);
        ctx.lineTo(tableX + labelColWidth, rowY + rowHeight);
        ctx.moveTo(tableX + labelColWidth + valueColWidth, rowY);
        ctx.lineTo(tableX + labelColWidth + valueColWidth, rowY + rowHeight);
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "500 18px Arial";
        ctx.textAlign = "left";
        ctx.fillText(fitText(ctx, row.label, labelColWidth - 28), tableX + 16, rowY + rowHeight / 2 + 1);

        const display1 = row.display1 ?? (row.value1 ?? "-");
        const display2 = row.display2 ?? (row.value2 ?? "-");

        ctx.font = `${winner1 ? "700" : "500"} 18px Arial`;
        ctx.textAlign = "center";
        ctx.fillText(String(display1), tableX + labelColWidth + valueColWidth / 2, rowY + rowHeight / 2 + 1);

        ctx.font = `${winner2 ? "700" : "500"} 18px Arial`;
        ctx.fillText(String(display2), tableX + labelColWidth + valueColWidth + valueColWidth / 2, rowY + rowHeight / 2 + 1);

        currentY += rowHeight;
      });
    });

    ctx.fillStyle = "#a1a1aa";
    ctx.font = "500 15px Arial";
    ctx.textAlign = "right";
    ctx.fillText("smxmuse.com", cardX + cardWidth - cardPadding, canvasHeight - pagePadding - 16);

    return canvasToBlob(canvas);
  };

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
                    {mainSectionLabel}
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
                      {heatsSectionLabel}
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
                  {qualifyingSectionLabel}
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
                  <td style={getStyle(rider1Titles, rider2Titles)}>
                    {rider1Titles}
                  </td>
                  <td style={getStyle(rider2Titles, rider1Titles)}>
                    {rider2Titles}
                  </td>
                </tr>
              </tbody>
              </table>
              <div className="comparison-capture-footer">smxmuse.com</div>
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
