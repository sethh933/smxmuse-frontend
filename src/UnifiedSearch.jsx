import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function UnifiedSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ riders: [], tracks: [] });
  const [showDropdown, setShowDropdown] = useState(false);

  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch search results
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ riders: [], tracks: [] });
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/search?q=${encodeURIComponent(query)}`
        );

        const data = await res.json();

        setResults({
          riders: data.riders || [],
          tracks: data.tracks || [],
        });

        setShowDropdown(true);
      } catch (err) {
        console.error(err);
      }
    }, 250); // debounce

    return () => clearTimeout(timeout);
  }, [query]);

  const selectRider = (rider) => {
    setQuery("");
    setShowDropdown(false);
    navigate(`/rider/${rider.RiderID}`);
  };

  const selectTrack = (track) => {
  setQuery("");
  setShowDropdown(false);
  navigate(`/track/${track.SportID}/${track.TrackID}`);
};

  const hasResults =
    results.riders.length > 0 || results.tracks.length > 0;

  return (
    <div className="unified-search" ref={wrapperRef}>
      <input
        type="text"
        placeholder="Search riders or venues..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (query.length >= 2) setShowDropdown(true);
        }}
      />

      {showDropdown && query.length >= 2 && (
        <div className="unified-search-dropdown">

          {results.riders.length > 0 && (
            <>
              <div className="search-group-label">Riders</div>
              {results.riders.map((r) => (
                <div
                  key={r.RiderID}
                  className="search-result-item"
                  onClick={() => selectRider(r)}
                >
                  <div className="search-result-title">{r.FullName}</div>
                  <div className="search-result-subtitle">
                    {r.Country || "Unknown"}
                  </div>
                </div>
              ))}
            </>
          )}

          {results.tracks.length > 0 && (
  <>
    {/* SUPERcross */}
    {results.tracks.filter(t => t.SportID === 1).length > 0 && (
      <>
        <div className="search-group-label">Supercross Venues</div>
        {results.tracks
          .filter(t => t.SportID === 1)
          .map((t) => (
            <div
              key={`sx-${t.TrackID}`}
              className="search-result-item"
              onClick={() => selectTrack(t)}
            >
              <div className="search-result-title">{t.TrackName}</div>
              <div className="search-result-subtitle">{t.State || ""}</div>
            </div>
          ))}
      </>
    )}

    {/* MOTOcross */}
    {results.tracks.filter(t => t.SportID === 2).length > 0 && (
      <>
        <div className="search-group-label">Motocross Venues</div>
        {results.tracks
          .filter(t => t.SportID === 2)
          .map((t) => (
            <div
              key={`mx-${t.TrackID}`}
              className="search-result-item"
              onClick={() => selectTrack(t)}
            >
              <div className="search-result-title">{t.TrackName}</div>
              <div className="search-result-subtitle">{t.State || ""}</div>
            </div>
          ))}
      </>
    )}
  </>
)}

          {!hasResults && (
            <div className="no-search-results">No results found</div>
          )}
        </div>
      )}
    </div>
  );
}

export default UnifiedSearch;