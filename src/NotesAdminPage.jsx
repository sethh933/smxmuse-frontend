import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiUrl } from "./api";
import Seo from "./SiteSeo";

const CATEGORY_OPTIONS = [
  { value: "preRace", label: "Pre-Race" },
  { value: "raceRecap", label: "Race Recap" }
];

const SPORT_OPTIONS = [
  { value: "Motocross", sportId: 2, label: "MX" },
  { value: "Supercross", sportId: 1, label: "SX" },
  { value: "SMX", sportId: 3, label: "SMX" }
];

function createSlides(count = 6) {
  return Array.from({ length: count }, () => ({
    heading: "",
    body: ""
  }));
}

function createDefaultSections() {
  return [
    {
      heading: "450 Class",
      slides: createSlides()
    },
    {
      heading: "250 Class",
      slides: createSlides()
    }
  ];
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeSectionsForForm(noteSections) {
  const baseSections = noteSections?.length ? noteSections : createDefaultSections();

  return baseSections.map((section) => {
    const slides = section.slides?.length ? section.slides : createSlides();
    const paddedSlides = slides.length >= 6
      ? slides
      : [...slides, ...createSlides(6 - slides.length)];

    return {
      heading: section.heading || "",
      slides: paddedSlides.map((slide) => ({
        heading: slide.heading || "",
        body: slide.body || ""
      }))
    };
  });
}

export default function NotesAdminPage() {
  const { slug } = useParams();
  const isEditing = Boolean(slug);
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem("smxmuseAdminToken") || "");
  const [category, setCategory] = useState("preRace");
  const [sport, setSport] = useState("Motocross");
  const [season, setSeason] = useState(2026);
  const [raceId, setRaceId] = useState("");
  const [race, setRace] = useState("");
  const [publishDate, setPublishDate] = useState(getToday());
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState("450MX, 250MX");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [sections, setSections] = useState(createDefaultSections);
  const [races, setRaces] = useState([]);
  const [raceLoadStatus, setRaceLoadStatus] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [createdPath, setCreatedPath] = useState("");
  const [loadStatus, setLoadStatus] = useState("");

  const selectedSport = useMemo(
    () => SPORT_OPTIONS.find((option) => option.value === sport) || SPORT_OPTIONS[0],
    [sport]
  );

  useEffect(() => {
    localStorage.setItem("smxmuseAdminToken", adminToken);
  }, [adminToken]);

  useEffect(() => {
    let cancelled = false;

    async function loadDraft() {
      if (!isEditing || !adminToken) {
        return;
      }

      setLoadStatus("Loading draft...");

      try {
        const response = await fetch(apiUrl(`/api/admin/notes/${slug}`), {
          headers: {
            "X-Admin-Token": adminToken
          }
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.detail || `Load failed with ${response.status}`);
        }

        if (!data) {
          throw new Error("Draft not found.");
        }

        if (!cancelled) {
          setCategory(data.type || "preRace");
          setSport(data.sport || "Motocross");
          setSeason(data.season || 2026);
          setRaceId(data.raceId || "");
          setRace(data.race || "");
          setPublishDate(data.date || getToday());
          setTitle(data.title || "");
          setSummary(data.summary || "");
          setTags((data.tags || []).join(", "));
          setInstagramUrl(data.instagramUrl || "");
          setSections(normalizeSectionsForForm(data.sections));
          setLoadStatus("");
        }
      } catch (error) {
        if (!cancelled) {
          setLoadStatus(error.message || "Load failed.");
        }
      }
    }

    loadDraft();

    return () => {
      cancelled = true;
    };
  }, [adminToken, isEditing, slug]);

  useEffect(() => {
    if (!isEditing && race && season && category) {
      const categoryLabel = CATEGORY_OPTIONS.find((option) => option.value === category)?.label || "Notes";
      setTitle(`${season} ${race} ${categoryLabel} Notes`);
    }
  }, [category, isEditing, race, season]);

  async function loadRaces() {
    setRaceLoadStatus("Loading races...");

    try {
      const response = await fetch(apiUrl(`/api/races?sport_id=${selectedSport.sportId}&year=${season}`));

      if (!response.ok) {
        throw new Error(`Race lookup failed with ${response.status}`);
      }

      const data = await response.json();
      setRaces(data);
      setRaceLoadStatus(data.length ? "" : "No races found for that sport/year.");
    } catch (error) {
      setRaceLoadStatus(error.message || "Race lookup failed.");
    }
  }

  function selectRace(value) {
    setRaceId(value);
    const selectedRace = races.find((candidate) => String(candidate.race_id) === String(value));

    if (selectedRace) {
      setRace(selectedRace.track_name);
      setPublishDate(selectedRace.race_date || publishDate);
    }
  }

  function updateSection(sectionIndex, updates) {
    setSections((currentSections) =>
      currentSections.map((section, index) =>
        index === sectionIndex ? { ...section, ...updates } : section
      )
    );
  }

  function updateSlide(sectionIndex, slideIndex, updates) {
    setSections((currentSections) =>
      currentSections.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        return {
          ...section,
          slides: section.slides.map((slide, currentSlideIndex) =>
            currentSlideIndex === slideIndex ? { ...slide, ...updates } : slide
          )
        };
      })
    );
  }

  function addSlide(sectionIndex) {
    setSections((currentSections) =>
      currentSections.map((section, index) =>
        index === sectionIndex
          ? { ...section, slides: [...section.slides, { heading: "", body: "" }] }
          : section
      )
    );
  }

  function buildPayload(status) {
    return {
      title,
      category,
      sport,
      season: Number(season),
      race_id: raceId ? Number(raceId) : null,
      race,
      publish_date: publishDate,
      summary,
      tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      instagram_url: instagramUrl || null,
      status,
      sections
    };
  }

  async function saveNote(status) {
    setSaveStatus(status === "published" ? "Publishing..." : isEditing ? "Updating draft..." : "Saving draft...");
    setCreatedPath("");

    try {
      const savePath = isEditing ? `/api/admin/notes/${slug}` : "/api/admin/notes";
      const response = await fetch(apiUrl(savePath), {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Token": adminToken
        },
        body: JSON.stringify(buildPayload(status))
      });

      const responseText = await response.text();
      let data = null;

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error(
            "Save did not reach the notes API. Make sure the backend is running and restart the frontend dev server."
          );
        }
      }

      if (!response.ok) {
        throw new Error(data?.detail || `Save failed with ${response.status}`);
      }

      setCreatedPath(data.path?.replace(/^\/notes/, "/news") || "");
      setSaveStatus(status === "published" ? "Published." : isEditing ? "Draft updated." : "Draft saved.");
    } catch (error) {
      setSaveStatus(error.message || "Save failed.");
    }
  }

  return (
    <div className="notes-admin-page">
      <Seo
        title={isEditing ? "Edit News Post" : "News Admin"}
        description={`${isEditing ? "Edit" : "Create"} SMXmuse pre-race notes and race recaps.`}
        path={isEditing ? `/admin/news/edit/${slug}` : "/admin/news/new"}
        robots="noindex,nofollow"
      />

      <section className="notes-admin-header">
        <p className="notes-kicker">News Admin</p>
        <h1>{isEditing ? "Edit Race News" : "Create Race News"}</h1>
        <p>
          {isEditing
            ? "Update a saved draft or publish it when it is ready."
            : "Build pre-race notes and race recaps from class sections and slide boxes."}
        </p>
        {loadStatus && <p className="notes-admin-status">{loadStatus}</p>}
      </section>

      <section className="notes-admin-panel">
        <div className="notes-admin-grid">
          <label>
            Admin Token
            <input
              type="password"
              value={adminToken}
              onChange={(event) => setAdminToken(event.target.value)}
              placeholder="Required to save"
            />
          </label>

          <label>
            Category
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label>
            Sport
            <select value={sport} onChange={(event) => setSport(event.target.value)}>
              {SPORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label>
            Season
            <input
              type="number"
              value={season}
              onChange={(event) => setSeason(event.target.value)}
            />
          </label>
        </div>

        <div className="notes-admin-race-row">
          <button type="button" onClick={loadRaces}>Load Races</button>
          <label>
            Race
            <select value={raceId} onChange={(event) => selectRace(event.target.value)}>
              <option value="">Select race</option>
              {races.map((raceOption) => (
                <option key={raceOption.race_id} value={raceOption.race_id}>
                  Round {raceOption.round} - {raceOption.track_name}
                </option>
              ))}
            </select>
          </label>
          {raceLoadStatus && <p className="notes-admin-status">{raceLoadStatus}</p>}
        </div>

        <div className="notes-admin-grid notes-admin-grid-wide">
          <label>
            Title
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>

          <label>
            Publish Date
            <input
              type="date"
              value={publishDate}
              onChange={(event) => setPublishDate(event.target.value)}
            />
          </label>

          <label>
            Tags
            <input value={tags} onChange={(event) => setTags(event.target.value)} />
          </label>

          <label>
            Instagram URL
            <input value={instagramUrl} onChange={(event) => setInstagramUrl(event.target.value)} />
          </label>
        </div>

        <label className="notes-admin-full">
          Summary
          <textarea
            rows={3}
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
          />
        </label>
      </section>

      {sections.map((section, sectionIndex) => (
        <section key={sectionIndex} className="notes-admin-panel">
          <div className="notes-admin-section-heading">
            <label>
              Section Heading
              <input
                value={section.heading}
                onChange={(event) => updateSection(sectionIndex, { heading: event.target.value })}
              />
            </label>
            <button type="button" onClick={() => addSlide(sectionIndex)}>Add Slide</button>
          </div>

          <div className="notes-admin-slides">
            {section.slides.map((slide, slideIndex) => (
              <article key={slideIndex} className="notes-admin-slide">
                <p className="notes-admin-slide-number">Slide {slideIndex + 1}</p>
                <label>
                  Heading
                  <input
                    value={slide.heading}
                    onChange={(event) =>
                      updateSlide(sectionIndex, slideIndex, { heading: event.target.value })
                    }
                    placeholder="Rider or topic"
                  />
                </label>
                <label>
                  Body
                  <textarea
                    rows={7}
                    value={slide.body}
                    onChange={(event) =>
                      updateSlide(sectionIndex, slideIndex, { body: event.target.value })
                    }
                    placeholder="Paste this slide's text"
                  />
                </label>
              </article>
            ))}
          </div>
        </section>
      ))}

      <section className="notes-admin-actions">
        <button type="button" onClick={() => saveNote("draft")}>Save Draft</button>
        <button type="button" className="notes-admin-primary" onClick={() => saveNote("published")}>
          Publish
        </button>
        {saveStatus && <p className="notes-admin-status">{saveStatus}</p>}
        {createdPath && (
          <Link to={createdPath} className="notes-admin-created-link">
            View note
          </Link>
        )}
      </section>
    </div>
  );
}
