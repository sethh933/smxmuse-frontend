import LinkedNoteText from "./LinkedNoteText";

export default function ArticleFormattedText({ text = "", entities, depth = 0 }) {
  if (depth > 12) return text;
  const parts = [];
  // Render a small, explicit formatting vocabulary; never interpret HTML.
  const pattern = /\[([^\]\n]+)\]\(([^\s]*)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|~~([^~]+)~~/g;
  let cursor = 0;
  let match;
  while ((match = pattern.exec(text))) {
    if (match.index > cursor) parts.push(<LinkedNoteText key={`text-${cursor}`} text={text.slice(cursor, match.index)} entities={entities} />);
    const key = match.index;
    if (match[1] !== undefined) {
      const href = match[2];
      const safe = /^(https?:\/\/|mailto:)/i.test(href) || /^\/(?![/\\])/.test(href);
      parts.push(safe ? <a key={key} href={href}><ArticleFormattedText text={match[1]} depth={depth + 1} /></a> : match[0]);
    } else {
      const Tag = match[3] !== undefined ? "strong" : match[4] !== undefined ? "em" : "del";
      parts.push(<Tag key={key}><ArticleFormattedText text={match[3] ?? match[4] ?? match[5]} entities={entities} depth={depth + 1} /></Tag>);
    }
    cursor = pattern.lastIndex;
  }
  if (cursor < text.length) parts.push(<LinkedNoteText key={`text-${cursor}`} text={text.slice(cursor)} entities={entities} />);
  return parts;
}

