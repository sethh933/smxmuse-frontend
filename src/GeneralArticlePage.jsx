import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Seo from "./SiteSeo";
import ArticleFormattedText from "./ArticleFormattedText";
import ArticleTextEditor from "./ArticleTextEditor";
import ArticleTable from "./ArticleTable";
import { parseArticleCsv } from "./articleCsv";
import { moveArticleColumn } from "./articleColumns";
import { apiUrl } from "./api";
import "./styles/generalArticle.css";

const storageKey = "smxmuseGeneralArticlePrototypeV1";
const newBlock = (type) => ({ id: crypto.randomUUID(), type, heading: "", text: "", csv: "", columns: [], rows: [], caption: "", sortColumn: 0, sortDirection: "asc" });
function initialDraft() {
  return { version: 1, title: "", summary: "", date: new Date().toLocaleDateString("en-CA"), tags: "", instagramUrl: "", blocks: [newBlock("text")], entities: { riders: [], tracks: [] } };
}
function instagramLink(value) {
  try { const url = new URL(value); return url.protocol === "https:" && /(^|\.)instagram\.com$/i.test(url.hostname) ? url.href : null; } catch { return null; }
}

export default function GeneralArticlePage() {
  const { slug } = useParams();
  return <GeneralArticleEditor key={slug || "new"} slug={slug} />;
}

function GeneralArticleEditor({ slug }) {
  const [draft, setDraft] = useState(initialDraft);
  const [savedSlug, setSavedSlug] = useState(slug || "");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(!slug);
  const [preview, setPreview] = useState(false);
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState({});
  const [linkStatus, setLinkStatus] = useState("");
  const [resolving, setResolving] = useState(false);
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem("smxmuseAdminToken") || "");
  useEffect(() => {
    if (!slug || !adminToken) return;
    let cancelled = false;
    fetch(apiUrl(`/api/admin/notes/${slug}`), { headers: { "X-Admin-Token": adminToken } })
      .then(async (response) => { if (!response.ok) throw new Error("Could not load article. Check your token."); return response.json(); })
      .then((post) => {
        if (cancelled) return;
        if (!post || post.type !== "general") throw new Error("General article not found.");
        setDraft({ version: 1, ...post, serverSlug: slug, tags: post.tags.join(", "), blocks: post.blocks || [] });
        setSavedSlug(slug); setLoaded(true); setStatus("Article loaded.");
      }).catch((error) => { if (!cancelled) setStatus(error.message); });
    return () => { cancelled = true; };
  }, [slug, adminToken]);
  async function saveRemote(publicationStatus) {
    if (!draft.title.trim()) { setStatus("Enter an article title first."); return; }
    if (draft.instagramUrl && !instagramLink(draft.instagramUrl)) { setStatus("Use a valid Instagram URL."); return; }
    setBusy(true); setStatus("Saving article…");
    try {
      const response = await fetch(apiUrl(savedSlug ? `/api/admin/notes/${savedSlug}` : "/api/admin/notes"), {
        method: savedSlug ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Token": adminToken },
        body: JSON.stringify({ title: draft.title, category: "general", sport: "", season: null,
          publish_date: draft.date, summary: draft.summary, tags: draft.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
          instagram_url: draft.instagramUrl || null, status: publicationStatus, blocks: draft.blocks, featured: Boolean(draft.featured) })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.detail === "string" ? data.detail : "Save failed. Check the article fields and admin token.");
      setSavedSlug(data.slug);
      setDraft((current) => ({ ...current, serverSlug: data.slug }));
      try { localStorage.setItem(storageKey, JSON.stringify({ ...draft, serverSlug: data.slug })); } catch { /* The server copy is already saved. */ }
      setStatus(publicationStatus === "published" ? data.deployment_triggered ? "Published. Social preview rebuild started." : "Published. Social previews will update after the next site build." : "Draft saved to the site.");
    } catch (error) { setStatus(error.message); }
    finally { setBusy(false); }
  }
  function exportDraft() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "smxmuse-article-draft.json"; link.click(); URL.revokeObjectURL(url);
  }
  const update = (values) => { setDraft((current) => ({ ...current, ...values })); setStatus("Unsaved changes"); };
  const updateBlock = (id, values) => update({ blocks: draft.blocks.map((block) => block.id === id ? { ...block, ...values } : block) });
  const move = (index, offset) => { const blocks = [...draft.blocks]; [blocks[index], blocks[index + offset]] = [blocks[index + offset], blocks[index]]; update({ blocks }); };
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(draft)); setStatus("Draft saved in this browser."); }
    catch { setStatus("Could not save in this browser. Keep this tab open and try a smaller table."); }
  }
  function restoreLocalDraft() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (saved?.version !== 1 || !Array.isArray(saved.blocks) || typeof saved.title !== "string") {
        setStatus("No saved local draft found in this browser."); return;
      }
      setDraft(saved); setSavedSlug(saved.serverSlug || "");
      setErrors({}); setLinkStatus(""); setPreview(false);
      setStatus("Local draft restored. This resumes the saved article.");
    } catch { setStatus("Could not restore a local draft from this browser."); }
  }
  function importTable(block, csv) {
    try {
      const data = parseArticleCsv(csv);
      const columns = data.columns.map((column) => ({ ...column, type: block.columns.find((old) => old.label === column.label)?.type || column.type }));
      updateBlock(block.id, { ...data, columns, csv, sortColumn: Math.min(block.sortColumn, columns.length - 1) });
      setErrors((current) => ({ ...current, [block.id]: "" }));
      setLinkStatus("Table imported. Check rider links to refresh automatic profile matches.");
    } catch (error) { setErrors((current) => ({ ...current, [block.id]: error.message })); }
  }
  async function checkLinks() {
    setResolving(true); setLinkStatus("Checking names against the rider directory…");
    const text = [draft.title, draft.summary, ...draft.blocks.flatMap((block) => [block.heading, block.text, block.caption, ...block.rows.flat()])].join("\n");
    try {
      const response = await fetch(apiUrl("/api/admin/article-preview/entities"), { method: "POST", headers: { "Content-Type": "application/json", "X-Admin-Token": adminToken }, body: JSON.stringify({ text }) });
      if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? "Enter your admin token to check rider links." : "Rider lookup unavailable. Start the updated backend and try again.");
      const entities = await response.json();
      setDraft((current) => ({ ...current, entities })); setStatus("Unsaved changes");
      setLinkStatus(`${entities.riders.length} rider profiles detected. Preview the article to test the links.`);
    } catch (error) { setLinkStatus(error.message); }
    finally { setResolving(false); }
  }
  const names = [...new Set(draft.blocks.flatMap((block) => block.rows.flatMap((row) => row.filter((cell, index) => cell && block.columns[index]?.type === "rider"))))];
  const unmatched = names.filter((name) => !draft.entities.riders.some((rider) => rider.name.toLowerCase() === name.toLowerCase()));
  const instagram = instagramLink(draft.instagramUrl);
  return <div className="notes-admin-page general-article">
    <Seo title="General Article" description="Try the general article editor." path="/admin/news/general" robots="noindex,nofollow" />
    <header className="notes-admin-header"><Link to="/admin/news">← News admin</Link><p className="notes-kicker">General article</p><h1>More room for the story.</h1><p>Bring your post beyond the slide. Add context, explore the numbers, and link back to Instagram.</p></header>
    <div className="article-editor-toolbar"><div><button className={!preview ? "active" : ""} onClick={() => setPreview(false)}>Write</button><button className={preview ? "active" : ""} onClick={() => setPreview(true)}>Reader preview</button></div><button className="notes-admin-primary" onClick={save}>Save local draft</button></div>
    <div className="article-editor-toolbar">
      <div>{!slug && <button disabled={busy} onClick={restoreLocalDraft}>Restore local draft</button>}<button onClick={exportDraft}>Export draft backup</button>
      <label>Import draft backup<input type="file" accept=".json,application/json" onChange={async (event) => {
        const file = event.target.files?.[0]; if (!file) return;
        try { const imported = JSON.parse(await file.text());
          if (imported.version !== 1 || !Array.isArray(imported.blocks) || typeof imported.title !== "string") throw new Error("Invalid draft backup.");
          update({ ...imported, serverSlug: "" }); setSavedSlug("");
        } catch (error) { setStatus(error.message); }
      }} /></label></div>
      <div><button disabled={busy || !adminToken || !loaded} onClick={() => saveRemote("draft")}>Save to site</button><button disabled={busy || !adminToken || !loaded} onClick={() => saveRemote("published")}>Publish</button></div>
    </div>
    <p className="article-prototype-note">New articles start blank. Use Restore local draft to resume your last browser backup, or News admin to edit a post saved to the site.</p>
    {savedSlug && <Link to={`/admin/news/preview/${savedSlug}`}>View saved article</Link>}
    <p role="status" className="article-status">{status}</p>
    {preview ? <article className="article-reader">
      <p className="notes-kicker">General article · {draft.date}</p><h1>{draft.title || "Your article title"}</h1>{draft.summary && <p className="article-deck"><ArticleFormattedText text={draft.summary} entities={draft.entities} /></p>}
      {draft.tags && <div className="notes-tag-row">{draft.tags.split(",").filter((tag) => tag.trim()).map((tag, index) => <span key={index}>{tag.trim()}</span>)}</div>}
      {draft.blocks.map((block) => block.type === "table" ? block.columns.length > 0 && <ArticleTable key={`${block.id}-${block.sortColumn}-${block.sortDirection}`} block={block} entities={draft.entities} /> : <section key={block.id}>{block.heading && <h2><ArticleFormattedText text={block.heading} entities={draft.entities} /></h2>}{block.text.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p className="article-paragraph" key={index}><ArticleFormattedText text={paragraph} entities={draft.entities} /></p>)}</section>)}
      {instagram && <a className="article-instagram" href={instagram} target="_blank" rel="noopener noreferrer">See the original post on Instagram ↗</a>}
    </article> : <>
      <section className="notes-admin-panel"><h2>The essentials</h2><label><span><input type="checkbox" checked={Boolean(draft.featured)} onChange={(event) => update({ featured: event.target.checked })} /> Feature on the News page</span></label><div className="notes-admin-grid notes-admin-grid-wide">
        <label>Title<input value={draft.title} onChange={(event) => update({ title: event.target.value })} placeholder="Give your story a headline" /></label>
        <label>Post date<input type="date" value={draft.date} onChange={(event) => update({ date: event.target.value })} /></label>
        <label>Tags<input value={draft.tags} onChange={(event) => update({ tags: event.target.value })} placeholder="History, Analysis, Rider name" /></label>
        <label>Instagram URL<input type="url" value={draft.instagramUrl} onChange={(event) => update({ instagramUrl: event.target.value })} placeholder="https://www.instagram.com/p/…" /></label>
      </div>{draft.instagramUrl && !instagram && <p role="alert">Use a full https://www.instagram.com/ link.</p>}<ArticleTextEditor label="Summary" rows={3} value={draft.summary} onChange={(summary) => update({ summary })} entities={draft.entities} placeholder="A short introduction for the News listing and the top of your article." /></section>
      <div className="article-section-label"><h2>Build your story</h2><span>{draft.blocks.length} blocks</span></div>
      {draft.blocks.map((block, index) => <section key={block.id} className="notes-admin-panel article-block">
        <div className="article-block-toolbar"><strong>{String(index + 1).padStart(2, "0")} / {block.type === "table" ? "Data table" : "Text section"}</strong><div><button aria-label={`Move block ${index + 1} up`} disabled={!index} onClick={() => move(index, -1)}>↑</button><button aria-label={`Move block ${index + 1} down`} disabled={index === draft.blocks.length - 1} onClick={() => move(index, 1)}>↓</button><button onClick={() => update({ blocks: draft.blocks.filter((item) => item.id !== block.id) })}>Remove</button></div></div>
        <label>Heading (optional)<input value={block.heading} onChange={(event) => updateBlock(block.id, { heading: event.target.value })} placeholder={block.type === "table" ? "What the numbers show" : "Set up the next part of your story"} /></label>
        {block.type === "text" ? <ArticleTextEditor label="Body" value={block.text} onChange={(text) => updateBlock(block.id, { text })} entities={draft.entities} placeholder="Write freely. Separate paragraphs with a blank line." /> : <>
          <label>Paste CSV or spreadsheet cells<textarea className="article-csv" rows={5} value={block.csv} onChange={(event) => updateBlock(block.id, { csv: event.target.value })} placeholder={'Rider,Starts,First year\nRider name,42,2015'} /></label>
          <div className="article-import-actions"><button onClick={() => importTable(block, block.csv)}>{block.columns.length ? "Replace table data" : "Import table"}</button><label>Or upload CSV<input type="file" accept=".csv,.tsv,text/csv,text/tab-separated-values" onChange={async (event) => { const file = event.target.files?.[0]; if (file) { try { importTable(block, await file.text()); } catch { setErrors((current) => ({ ...current, [block.id]: "Could not read that file." })); } event.target.value = ""; } }} /></label></div>
          <p className="article-help">First row = column headings. Quoted commas and spreadsheet paste are supported. Import again after editing the source.</p>
          {errors[block.id] && <p role="alert" className="article-error">{errors[block.id]} Your existing table is unchanged.</p>}
          {block.columns.length > 0 && <><p>{block.rows.length.toLocaleString()} rows imported · {block.columns.length} columns</p><p className="article-help">Move columns left or right. The first column stays frozen when scrolling. Reimporting uses the source column order.</p><div className="article-column-settings">{block.columns.map((column, columnIndex) => <div className="article-column-setting" key={columnIndex}><label>{column.label}<select value={column.type} onChange={(event) => updateBlock(block.id, { columns: block.columns.map((item, i) => i === columnIndex ? { ...item, type: event.target.value } : item) })}><option value="text">Text</option><option value="number">Number</option><option value="rider">Rider (auto-link)</option><option value="country">Country (flag only)</option><option value="countryName">Country (flag + name)</option></select></label><div className="article-column-move"><button type="button" disabled={columnIndex === 0} aria-label={`Move ${column.label} left`} onClick={() => updateBlock(block.id, moveArticleColumn(block, columnIndex, columnIndex - 1))}>← Left</button><button type="button" disabled={columnIndex === block.columns.length - 1} aria-label={`Move ${column.label} right`} onClick={() => updateBlock(block.id, moveArticleColumn(block, columnIndex, columnIndex + 1))}>Right →</button></div></div>)}</div>
          <div className="notes-admin-grid"><label>Default sort<select value={block.sortColumn} onChange={(event) => updateBlock(block.id, { sortColumn: Number(event.target.value) })}>{block.columns.map((column, i) => <option value={i} key={i}>{column.label}</option>)}</select></label><label>Direction<select value={block.sortDirection} onChange={(event) => updateBlock(block.id, { sortDirection: event.target.value })}><option value="asc">Ascending</option><option value="desc">Descending</option></select></label></div>
          <label>Source / table note<input value={block.caption} onChange={(event) => updateBlock(block.id, { caption: event.target.value })} placeholder="Source, cutoff date, or what counts in this table" /></label><ArticleTable key={`${block.id}-${block.sortColumn}-${block.sortDirection}-${block.columns.map((column) => column.label).join("|")}`} block={block} entities={draft.entities} /></>}
        </>}
      </section>)}
      <div className="article-add-block"><button onClick={() => update({ blocks: [...draft.blocks, newBlock("text")] })}>+ Text section</button><button onClick={() => update({ blocks: [...draft.blocks, newBlock("table")] })}>+ Data table</button></div>
      <section className="notes-admin-panel"><h2>Automatic profile links</h2><p>Check the whole article at once: summary, every text section and heading, table notes, and rider columns. Check again after adding names.</p><div className="article-import-actions"><label>Admin token<input type="password" value={adminToken} onChange={(event) => setAdminToken(event.target.value)} placeholder="Required for rider lookup only" /></label><button disabled={resolving || !adminToken} onClick={checkLinks}>{resolving ? "Checking…" : "Check rider links"}</button></div><p role="status">{linkStatus}</p>{unmatched.length > 0 && <details><summary>{unmatched.length} table names without a confirmed exact match</summary><p>{unmatched.join(", ")}</p><p>These names need review; unmatched names remain plain text.</p></details>}</section>
    </>}
  </div>;
}



