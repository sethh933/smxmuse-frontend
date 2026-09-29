import { useRef, useState } from "react";
import ArticleFormattedText from "./ArticleFormattedText";

export default function ArticleTextEditor({ label, value, onChange, rows = 8, placeholder, entities }) {
  const input = useRef(null);
  const selection = useRef({ start: 0, end: 0 });
  const [linkOpen, setLinkOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  function remember() {
    selection.current = { start: input.current.selectionStart, end: input.current.selectionEnd };
  }
  function replace(text, startOffset = 0, endOffset = text.length) {
    const { start, end } = selection.current;
    onChange(value.slice(0, start) + text + value.slice(end));
    requestAnimationFrame(() => {
      input.current?.focus();
      input.current?.setSelectionRange(start + startOffset, start + endOffset);
    });
  }
  function format(marker) {
    const { start, end } = selection.current;
    const selected = value.slice(start, end);
    if (selected.startsWith(marker) && selected.endsWith(marker) && selected.length >= marker.length * 2) {
      replace(selected.slice(marker.length, -marker.length));
    } else if (value.slice(start - marker.length, start) === marker && value.slice(end, end + marker.length) === marker) {
      selection.current = { start: start - marker.length, end: end + marker.length };
      replace(selected);
    } else {
      const content = selected || "text";
      replace(marker + content + marker, marker.length, marker.length + content.length);
    }
  }
  function openLink() {
    const selected = value.slice(selection.current.start, selection.current.end);
    const existing = /^\[([^\]]+)\]\(([^\s]*)\)$/.exec(selected);
    setLinkText(existing ? existing[1] : selected);
    setUrl(existing ? existing[2] : "");
    setError(""); setLinkOpen(true);
  }
  function insertLink() {
    const href = url.trim();
    if (!/^(https?:\/\/|mailto:)/i.test(href) && !/^\/(?![/\\])/.test(href)) {
      setError("Enter a full https:// link or a site path starting with /."); return;
    }
    if (!linkText.trim() || /[[\]\n]/.test(linkText)) {
      setError("Enter link text without brackets or line breaks."); return;
    }
    replace(`[${linkText}](${href.replace(/\s/g, (char) => encodeURIComponent(char)).replace(/\(/g, "%28").replace(/\)/g, "%29")})`);
    setLinkOpen(false);
  }
  return <div className="article-text-editor">
    <div className="article-format-toolbar" role="group" aria-label={`${label} formatting`}>
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => format("**")} title="Bold (Ctrl+B)"><strong>Bold</strong></button>
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => format("*")} title="Italic (Ctrl+I)"><em>Italic</em></button>
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => format("~~")}><del>Strikethrough</del></button>
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={openLink}>Add / edit link</button>
      <button type="button" aria-pressed={showPreview} onClick={() => setShowPreview(!showPreview)}>Formatting preview</button>
    </div>
    <label>{label}<textarea ref={input} rows={rows} value={value} placeholder={placeholder} onSelect={remember} onClick={remember} onKeyUp={remember} onChange={(event) => onChange(event.target.value)} onKeyDown={(event) => {
      if ((event.ctrlKey || event.metaKey) && ["b", "i", "k"].includes(event.key.toLowerCase())) {
        event.preventDefault(); remember();
        if (event.key.toLowerCase() === "k") openLink();
        else format(event.key.toLowerCase() === "b" ? "**" : "*");
      }
    }} /></label>
    {linkOpen && <div className="article-link-form">
      <label>Link text<input value={linkText} onChange={(event) => setLinkText(event.target.value)} /></label>
      <label>Destination URL<input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Paste the race page URL" /></label>
      {error && <p role="alert">{error}</p>}
      <button type="button" onClick={insertLink}>Apply link</button>
      <button type="button" onClick={() => { replace(linkText); setLinkOpen(false); }}>Remove link</button>
      <button type="button" onClick={() => setLinkOpen(false)}>Cancel</button>
    </div>}
    <p className="article-help">Select text, then choose formatting or add a link. Formatting markers appear here; the reader preview shows the finished text.</p>
    {showPreview && <div className="article-format-preview"><ArticleFormattedText text={value} entities={entities} /></div>}
  </div>;
}

