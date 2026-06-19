import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { apiUrl } from "./api";
import { getPostTags, getPostTypeLabel } from "./contentPosts";
import LinkedNoteText from "./LinkedNoteText";
import Seo from "./SiteSeo";

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${date}T12:00:00`));
}

function AdminNoteMeta({ note }) {
  const details = [
    formatDate(note.date),
    getPostTypeLabel(note.type),
    note.race,
    note.season,
    note.status
  ].filter(Boolean);

  return <p className="notes-post-meta">{details.join(" / ")}</p>;
}

function AdminNoteBodyBlock({ block, index, entities }) {
  return (
    <section key={index} className="notes-body-section">
      {block.heading && <h2>{block.heading}</h2>}
      {block.subsections?.map((subsection, subsectionIndex) => (
        <section key={subsectionIndex} className="notes-body-subsection">
          {subsection.heading && <h3>{subsection.heading}</h3>}
          {subsection.paragraphs?.map((paragraph, paragraphIndex) => (
            <p key={paragraphIndex}><LinkedNoteText text={paragraph} entities={entities} /></p>
          ))}
        </section>
      ))}
    </section>
  );
}

function DetectedLinksPanel({ entities }) {
  const riders = entities?.riders || [];
  const tracks = entities?.tracks || [];

  if (!riders.length && !tracks.length) {
    return null;
  }

  return (
    <section className="notes-admin-detected-links">
      <h2>Detected Links</h2>
      <p className="notes-admin-detected-links-note">
        Admin preview only. These chips are not shown on public notes.
      </p>
      {riders.length > 0 && (
        <div>
          <h3>Riders</h3>
          <div className="notes-tag-row">
            {riders.map((rider) => (
              <Link key={`rider-${rider.id}`} to={rider.path}>{rider.name}</Link>
            ))}
          </div>
        </div>
      )}
      {tracks.length > 0 && (
        <div>
          <h3>Tracks</h3>
          <div className="notes-tag-row">
            {tracks.map((track) => (
              <Link key={`track-${track.sportId}-${track.id}`} to={track.path}>{track.name}</Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export function NotesAdminListPage() {
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem("smxmuseAdminToken") || "");
  const [status, setStatus] = useState("draft");
  const [notes, setNotes] = useState([]);
  const [loadStatus, setLoadStatus] = useState("");
  const [linkBackfillStatus, setLinkBackfillStatus] = useState("");
  const [deleteStatus, setDeleteStatus] = useState("");

  useEffect(() => {
    localStorage.setItem("smxmuseAdminToken", adminToken);
  }, [adminToken]);

  async function loadNotes(nextStatus = status) {
    setLoadStatus("Loading notes...");

    try {
      const response = await fetch(apiUrl(`/api/admin/notes?status=${nextStatus}`), {
        headers: {
          "X-Admin-Token": adminToken
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || `Load failed with ${response.status}`);
      }

      setNotes(data);
      setLoadStatus(data.length ? "" : `No ${nextStatus} notes found.`);
    } catch (error) {
      setLoadStatus(error.message || "Load failed.");
      setNotes([]);
    }
  }

  useEffect(() => {
    if (adminToken) {
      loadNotes(status);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function changeStatus(nextStatus) {
    setStatus(nextStatus);
    loadNotes(nextStatus);
  }

  async function backfillEntityLinks() {
    setLinkBackfillStatus("Refreshing detected links...");

    try {
      const response = await fetch(apiUrl("/api/admin/notes/backfill-entity-links"), {
        method: "POST",
        headers: {
          "X-Admin-Token": adminToken
        }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || `Refresh failed with ${response.status}`);
      }

      setLinkBackfillStatus(`Detected links refreshed for ${data.rebuilt} notes.`);
      loadNotes(status);
    } catch (error) {
      setLinkBackfillStatus(error.message || "Detected link refresh failed.");
    }
  }

  async function deleteDraft(note) {
    if (note.status !== "draft") {
      setDeleteStatus("Only draft posts can be deleted.");
      return;
    }

    const confirmed = window.confirm(`Delete draft "${note.title}"? This cannot be undone.`);

    if (!confirmed) {
      return;
    }

    setDeleteStatus("Deleting draft...");

    try {
      const response = await fetch(apiUrl(`/api/admin/notes/${note.slug}`), {
        method: "DELETE",
        headers: {
          "X-Admin-Token": adminToken
        }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || `Delete failed with ${response.status}`);
      }

      setDeleteStatus("Draft deleted.");
      loadNotes(status);
    } catch (error) {
      setDeleteStatus(error.message || "Delete failed.");
    }
  }

  return (
    <div className="notes-admin-page">
      <Seo
        title="News Admin"
        description="Manage SMXmuse news drafts and published posts."
        path="/admin/news"
        robots="noindex,nofollow"
      />

      <section className="notes-admin-header">
        <p className="notes-kicker">News Admin</p>
        <h1>Manage News</h1>
        <p>Review drafts and published race news before they go live.</p>
      </section>

      <section className="notes-admin-panel">
        <div className="notes-admin-list-toolbar">
          <label>
            Admin Token
            <input
              type="password"
              value={adminToken}
              onChange={(event) => setAdminToken(event.target.value)}
              placeholder="Required to load drafts"
            />
          </label>

          <div className="notes-admin-filter-buttons">
            <button
              type="button"
              className={status === "draft" ? "active" : ""}
              onClick={() => changeStatus("draft")}
            >
              Drafts
            </button>
            <button
              type="button"
              className={status === "published" ? "active" : ""}
              onClick={() => changeStatus("published")}
            >
              Published
            </button>
          </div>

          <button type="button" onClick={() => loadNotes(status)}>Refresh</button>
          <button type="button" onClick={backfillEntityLinks}>Refresh Links</button>
          <Link to="/admin/news/new" className="notes-admin-created-link">New post</Link>
        </div>

        {loadStatus && <p className="notes-admin-status">{loadStatus}</p>}
        {linkBackfillStatus && <p className="notes-admin-status">{linkBackfillStatus}</p>}
        {deleteStatus && <p className="notes-admin-status">{deleteStatus}</p>}
      </section>

      <section className="notes-admin-list">
        {notes.map((note) => (
          <article key={note.id} className="notes-card">
            <AdminNoteMeta note={note} />
            <h2>{note.title}</h2>
            {note.summary && <p className="notes-card-summary">{note.summary}</p>}
            {getPostTags(note).length > 0 && (
              <div className="notes-tag-row">
                {getPostTags(note).map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            )}
            <div className="notes-admin-card-actions">
              <Link to={`/admin/news/edit/${note.slug}`}>Edit</Link>
              <Link to={`/admin/news/preview/${note.slug}`}>Preview</Link>
              {note.status === "published" && <Link to={`/news/${note.slug}`}>Public page</Link>}
              {note.status === "draft" && (
                <button type="button" onClick={() => deleteDraft(note)}>Delete draft</button>
              )}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export function NotesAdminPreviewPage() {
  const { slug } = useParams();
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem("smxmuseAdminToken") || "");
  const [note, setNote] = useState(null);
  const [loadStatus, setLoadStatus] = useState("Loading note...");

  useEffect(() => {
    localStorage.setItem("smxmuseAdminToken", adminToken);
  }, [adminToken]);

  useEffect(() => {
    let cancelled = false;

    async function loadNote() {
      setLoadStatus("Loading note...");

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

        if (!cancelled) {
          setNote(data);
          setLoadStatus(data ? "" : "Note not found.");
        }
      } catch (error) {
        if (!cancelled) {
          setLoadStatus(error.message || "Load failed.");
        }
      }
    }

    if (adminToken) {
      loadNote();
    } else {
      setLoadStatus("Enter your admin token to preview this draft.");
    }

    return () => {
      cancelled = true;
    };
  }, [adminToken, slug]);

  if (!note && loadStatus === "Note not found.") {
    return <Navigate to="/admin/news" replace />;
  }

  return (
    <article className="notes-page notes-post-page">
      <Seo
        title={note?.title || "Draft Preview"}
        description="Preview SMXmuse note draft."
        path={`/admin/news/preview/${slug}`}
        robots="noindex,nofollow"
      />

      <Link to="/admin/news" className="notes-back-link">Back to admin news</Link>

      {!note ? (
        <section className="notes-empty-state">
          <label>
            Admin Token
            <input
              type="password"
              value={adminToken}
              onChange={(event) => setAdminToken(event.target.value)}
              placeholder="Required to preview"
            />
          </label>
          <p>{loadStatus}</p>
        </section>
      ) : (
        <>
          <header className="notes-post-header">
            <AdminNoteMeta note={note} />
            <h1><LinkedNoteText text={note.title} entities={note.entities} /></h1>
            {note.summary && (
              <p className="notes-post-summary">
                <LinkedNoteText text={note.summary} entities={note.entities} />
              </p>
            )}
          </header>

          <div className="notes-post-body">
            <DetectedLinksPanel entities={note.entities} />
            {note.body?.map((block, index) => (
              <AdminNoteBodyBlock key={index} block={block} index={index} entities={note.entities} />
            ))}
          </div>
        </>
      )}
    </article>
  );
}
