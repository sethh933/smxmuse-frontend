export function articlePlainText(text = "") {
  return text.replace(/\[([^\]]+)\]\([^\s]*\)/g, "$1").replace(/\*\*([^*]+)\*\*|\*([^*]+)\*|~~([^~]+)~~/g, (_, bold, italic, strike) => bold ?? italic ?? strike);
}
