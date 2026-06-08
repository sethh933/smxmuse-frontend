import { Link } from "react-router-dom";

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getEntityList(entities) {
  return [
    ...(entities?.riders || []),
    ...(entities?.tracks || [])
  ]
    .filter((entity) => entity?.name && entity?.path)
    .sort((a, b) => b.name.length - a.name.length);
}

function findEntityMatches(text, entities) {
  const matches = [];

  getEntityList(entities).forEach((entity) => {
    const pattern = new RegExp(`(?<![A-Za-z0-9])${escapeRegExp(entity.name)}(?![A-Za-z0-9])`, "gi");
    let match = pattern.exec(text);

    while (match) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[0],
        entity
      });

      match = pattern.exec(text);
    }
  });

  const selectedMatches = [];

  matches
    .sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start))
    .forEach((match) => {
      const overlaps = selectedMatches.some(
        (selected) => match.start < selected.end && match.end > selected.start
      );

      if (!overlaps) {
        selectedMatches.push(match);
      }
    });

  return selectedMatches.sort((a, b) => a.start - b.start);
}

export default function LinkedNoteText({ text, entities }) {
  if (!text) {
    return null;
  }

  const matches = findEntityMatches(text, entities);

  if (!matches.length) {
    return text;
  }

  const parts = [];
  let cursor = 0;

  matches.forEach((match, index) => {
    if (match.start > cursor) {
      parts.push(text.slice(cursor, match.start));
    }

    parts.push(
      <Link key={`${match.entity.type}-${match.entity.id}-${match.start}-${index}`} to={match.entity.path}>
        {match.text}
      </Link>
    );

    cursor = match.end;
  });

  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return parts;
}
