# Full news HTML

The frontend build reads the published `/api/notes` listing and fetches each
full article. It renders the existing React news components on the build server,
including body paragraphs, headings, lists, and rider/track links. The news index
contains links to every published article. No article limit is applied.

A JSON snapshot outside the React root seeds the interactive page with the same
content. The page still requests fresh data, but its saved content stays available
while loading or if the request fails. Article snapshots are matched by slug so
navigation cannot display another article's snapshot. Text is escaped by React;
embedded JSON escapes `<` to prevent closing the script element.

The build fails if the news API cannot supply its published listing or full
articles. It does not silently deploy incomplete summaries. Existing routes,
article wording, and page styles are retained. No backend deployment is required.

New/edited posts enter the static HTML on the next successful frontend build.
The existing admin publishing code attempts to trigger the deployment workflow
when GITHUB_DEPLOY_TOKEN is configured. This change does not configure that token
or verify production dispatch permissions. The existing daily scheduled workflow
and manual workflow dispatch also rebuild articles.

Checks: `npm run build`, then `python scripts/check_news_html.py`. The latter
compares every generated article's body text and links to the embedded source
data and verifies its canonical and the news index links. After deployment,
inspect a preview and recap with Search Console's live test. This improves content
availability; it does not guarantee indexing or Google Discover placement.
