import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = path.join(projectRoot, "dist");
const sourceHtml = await readFile(path.join(distRoot, "index.html"), "utf8");
const siteUrl = "https://smxmuse.com";
const apiBase = (process.env.PRERENDER_API_URL || process.env.VITE_API_URL || "").replace(/\/+$/, "");

if (!apiBase && process.env.PRERENDER_SKIP_DYNAMIC !== "1") {
  throw new Error("Set VITE_API_URL or PRERENDER_API_URL so the build can load /seo/prerender.json.");
}

const fallbackPages = [
  {
    path: "/",
    title: "Supercross, Motocross, SMX, and WMX Stats and Results",
    description: "Smxmuse is a Supercross, Motocross, SMX, and WMX stats archive with rider profiles, race results, season dashboards, comparisons, and all-time leaderboards.",
    heading: "Everything in one place, from the latest gate drop to all-time history.",
  },
  {
    path: "/about",
    title: "About smxmuse",
    description: "Learn what smxmuse covers, how the Supercross, Motocross, SMX, and WMX stats archive was built, and where to send feedback or business inquiries.",
  },
  {
    path: "/riders",
    title: "Browse Riders",
    description: "Browse the full smxmuse rider archive by last name or country, including featured riders and country pages.",
    heading: "Riders",
  },
  {
    path: "/results",
    title: "Supercross, Motocross, SMX, and WMX Race Results Archive",
    description: "Browse Supercross, Motocross, SMX, and WMX race results by decade and season, then open full round-by-round result pages.",
    heading: "Race Results",
  },
  {
    path: "/news",
    title: "Supercross and Motocross News and Analysis",
    description: "Read smxmuse Supercross and Motocross race notes, previews, recaps, and data-driven analysis.",
    heading: "Race Notes and Analysis",
  },
  {
    path: "/leaderboards",
    title: "All-Time Supercross, Motocross, SMX, and WMX Leaderboards",
    description: "Browse all-time smxmuse leaderboards for wins, podiums, starts, and career milestones across Supercross, Motocross, SMX, and WMX.",
    heading: "All Time Leaderboards",
  },
  {
    path: "/compare",
    title: "Compare Supercross, Motocross, SMX, and WMX Riders",
    description: "Compare Supercross, Motocross, SMX, and WMX riders head to head across career wins, podiums, starts, championships, and season statistics.",
    heading: "Rider Comparison",
  },
];

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function removeSeoTags(html) {
  return html
    .replace(/\s*<title>[\s\S]*?<\/title>/i, "")
    .replace(/\s*<meta\s+name=["'](?:description|robots|twitter:card|twitter:title|twitter:description|twitter:image)["'][^>]*>/gi, "")
    .replace(/\s*<meta\s+property=["'](?:og:title|og:description|og:type|og:url|og:image)["'][^>]*>/gi, "")
    .replace(/\s*<link\s+rel=["']canonical["'][^>]*>/gi, "")
    .replace(/\s*<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, "");
}

function renderPage(page) {
  const riderRoute = page.path.match(/^\/rider\/([^/]+)(?:\/(results|points))?$/);
  const riderId = riderRoute?.[1].match(/(\d+)$/)?.[1];
  const canonical = `${siteUrl}${page.path === "/" ? "/" : page.path}`;
  const fullTitle = `${page.title} | smxmuse`;
  const image = page.image || `${siteUrl}/smxmuselogo.png`;
  const type = page.type || "website";
  const tags = [
    riderRoute
      ? '<style data-prerender-style="true">.seo-prerender-shell{max-width:1100px;margin:2rem auto;padding:2rem;text-align:center}.seo-prerender-shell nav a{margin:0 12px}</style>'
      : '<style data-prerender-style="true">.seo-prerender-shell{display:none!important}</style>',
    `<title>${escapeHtml(fullTitle)}</title>`,
    `<meta name="description" content="${escapeHtml(page.description)}" />`,
    '<meta name="robots" content="index,follow" />',
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta property="og:title" content="${escapeHtml(fullTitle)}" />`,
    `<meta property="og:description" content="${escapeHtml(page.description)}" />`,
    `<meta property="og:type" content="${escapeHtml(type)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${escapeHtml(fullTitle)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(page.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
  ];

  if (page.jsonLd) {
    const json = JSON.stringify(page.jsonLd).replaceAll("<", "\\u003c");
    tags.push(`<script type="application/ld+json" data-seo-jsonld="true">${json}</script>`);
  }

  const heading = page.heading ? `<h1>${escapeHtml(page.heading)}</h1>` : "";
  const schedule = Array.isArray(page.schedule) && page.schedule.length > 0
    ? `<section><h2>Season Schedule, Results, and Winners</h2><table><thead><tr><th>Round</th><th>Track</th><th>Location</th><th>Date</th><th>Winners</th></tr></thead><tbody>${page.schedule.map((race) => `<tr><td>${escapeHtml(race.round)}</td><td><a href="${escapeHtml(race.href)}">${escapeHtml(race.track)}</a></td><td>${escapeHtml(race.location)}</td><td>${escapeHtml(race.date)}</td><td>${(race.winners || []).map((winner) => `<a href="${escapeHtml(winner.riderHref)}">${escapeHtml(winner.class)}: ${escapeHtml(winner.rider)}</a>`).join(", ")}</td></tr>`).join("")}</tbody></table></section>`
    : "";
  const resultSections = Array.isArray(page.resultSections)
    ? page.resultSections.map((section) => {
        const motoHeadings = section.showMotos ? "<th>Moto 1</th><th>Moto 2</th>" : "";
        const rows = (section.rows || []).map((row) => {
          const motoCells = section.showMotos
            ? `<td>${escapeHtml(row.moto1 ?? "")}</td><td>${escapeHtml(row.moto2 ?? "")}</td>`
            : "";
          return `<tr><td>${escapeHtml(row.position)}</td><td><a href="${escapeHtml(row.riderHref)}">${escapeHtml(row.rider)}</a></td><td>${escapeHtml(row.brand)}</td>${motoCells}</tr>`;
        }).join("");
        return `<section><h2>${escapeHtml(section.heading)}</h2><table><thead><tr><th>Position</th><th>Rider</th><th>Brand</th>${motoHeadings}</tr></thead><tbody>${rows}</tbody></table></section>`;
      }).join("")
    : "";
  const overview = Array.isArray(page.careerOverview) && page.careerOverview.length
    ? `<section class="rider-career-overview" aria-label="Career overview"><table class="career-overview-table"><caption>Career summary <span>· All classes</span></caption><thead><tr>${["Discipline", "Starts", "Wins", "Podiums", "Avg Finish"].map(label => `<th scope="col">${label}</th>`).join("")}</tr></thead><tbody>${page.careerOverview.map(row => `<tr><th scope="row" title="${escapeHtml(row.label)}">${escapeHtml(row.code)}</th>${[row.starts, row.wins, row.podiums].map(value => `<td>${value == null ? "—" : escapeHtml(Number(value).toLocaleString("en-US"))}</td>`).join("")}<td>${row.averageFinish == null ? "—" : escapeHtml(Number(row.averageFinish).toFixed(2))}</td></tr>`).join("")}</tbody></table><p class="career-overview-footnote">SX main events · MX, SMX &amp; WMX overalls</p></section>`
    : "";
  const riderBasePath = riderRoute ? `/rider/${riderRoute[1]}` : "";
  const riderLinks = riderRoute
    ? `<nav aria-label="Rider profile"><a href="${escapeHtml(riderBasePath)}">Career Stats</a><a href="${escapeHtml(riderBasePath)}/results">Career Results</a><a href="${escapeHtml(riderBasePath)}/points">Points Standings</a></nav>`
    : "";
  const shell = `<main class="seo-prerender-shell" data-prerendered="true">${heading}${page.careerOverview ? "" : `<p>${escapeHtml(page.body || page.description)}</p>`}${riderLinks}${overview}${schedule}${resultSections}</main>`;
  const snapshot = riderRoute
    ? `<script type="application/json" id="rider-profile-snapshot">${JSON.stringify({riderId, heading: page.heading, path: page.path, careerOverview: page.careerOverview, title: page.title, description: page.description, image: page.image, type: page.type, jsonLd: page.jsonLd}).replaceAll("<", "\\u003c")}</script>`
    : "";
  return removeSeoTags(sourceHtml)
    .replace("</head>", `    ${tags.join("\n    ")}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${shell}</div>${snapshot}`);

}

function renderSpaShell() {
  const tags = [
    "<title>Supercross, Motocross, SMX, and WMX Stats and Results | smxmuse</title>",
    '<meta name="description" content="Explore Supercross, Motocross, SMX, and WMX rider stats, race results, season dashboards, and historical data on smxmuse." />',
    '<meta name="robots" content="index,follow" />',
  ];

  // This document is used only when Azure cannot find a prerendered route.
  // It intentionally has no canonical URL: React adds the route's real
  // canonical after it loads, instead of every fallback claiming to be home.
  return removeSeoTags(sourceHtml)
    .replace("</head>", `    ${tags.join("\n    ")}\n  </head>`)
    .replace(/<div id="root">[\s\S]*?<\/div>/i, '<div id="root"></div>');
}

function outputFileFor(routePath) {
  if (routePath === "/") return path.join(distRoot, "index.html");
  const safeSegments = routePath.split("/").filter(Boolean).map((segment) => decodeURIComponent(segment));
  return path.join(distRoot, ...safeSegments, "index.html");
}

let pages = fallbackPages;
if (process.env.PRERENDER_SKIP_DYNAMIC !== "1") {
  const response = await fetch(`${apiBase}/seo/prerender.json`);
  if (!response.ok) {
    throw new Error(`Prerender manifest request failed with ${response.status}: ${response.statusText}`);
  }
  const manifest = await response.json();
  if (!Array.isArray(manifest.pages) || manifest.pages.length === 0) {
    throw new Error("Prerender manifest did not contain any pages.");
  }
  pages = manifest.pages;
  if (pages.some(page => /^\/rider\/[^/]+$/.test(page.path) && !Array.isArray(page.careerOverview))) {
    throw new Error("Rider career summaries are missing from the API. Deploy the rider SEO backend before building this frontend.");
  }
}

const uniquePages = new Map(pages.map((page) => [page.path, page]));
await writeFile(path.join(distRoot, "spa-shell.html"), renderSpaShell(), "utf8");

for (const page of uniquePages.values()) {
  const outputFile = outputFileFor(page.path);
  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, renderPage(page), "utf8");
}

console.log(`Prerendered ${uniquePages.size.toLocaleString("en-US")} routes plus a neutral SPA fallback.`);
