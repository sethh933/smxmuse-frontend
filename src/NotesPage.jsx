import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import Seo from "./SiteSeo";
import { buildAbsoluteUrl } from "./seo";
import { getPostTags, getPostTypeLabel, getPublishedPosts } from "./contentPosts";

const FILTERS = [
  { value: "preRace", label: "Pre-Race" },
  { value: "raceRecap", label: "Race Recaps" },
  { value: "leaderboard", label: "Leaderboards" },
  { value: "analysis", label: "Analysis" }
];

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${date}T12:00:00`));
}

function buildPostPath(post) {
  return `/notes/${post.slug}`;
}

function getPostDescription(post) {
  return post.summary || `${getPostTypeLabel(post.type)} from SMXmuse.`;
}

function PostMeta({ post }) {
  const details = [
    formatDate(post.date),
    getPostTypeLabel(post.type),
    post.race,
    post.round ? `Round ${post.round}` : null,
    post.season
  ].filter(Boolean);

  return <p className="notes-post-meta">{details.join(" / ")}</p>;
}

function PostBodyBlock({ block, index }) {
  if (typeof block === "string") {
    return <p key={index}>{block}</p>;
  }

  return (
    <section key={index} className="notes-body-section">
      {block.heading && <h2>{block.heading}</h2>}
      {block.paragraphs?.map((paragraph, paragraphIndex) => (
        <p key={paragraphIndex}>{paragraph}</p>
      ))}
      {block.bullets && (
        <ul>
          {block.bullets.map((bullet, bulletIndex) => (
            <li key={bulletIndex}>{bullet}</li>
          ))}
        </ul>
      )}
      {block.subsections?.map((subsection, subsectionIndex) => (
        <section key={subsectionIndex} className="notes-body-subsection">
          {subsection.heading && <h3>{subsection.heading}</h3>}
          {subsection.paragraphs?.map((paragraph, paragraphIndex) => (
            <p key={paragraphIndex}>{paragraph}</p>
          ))}
          {subsection.bullets && (
            <ul>
              {subsection.bullets.map((bullet, bulletIndex) => (
                <li key={bulletIndex}>{bullet}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </section>
  );
}

export function NotesIndexPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedFilter = searchParams.get("type") || "preRace";
  const activeFilter = FILTERS.some((filter) => filter.value === requestedFilter)
    ? requestedFilter
    : "preRace";
  const posts = getPublishedPosts();
  const filteredPosts = posts.filter((post) => post.type === activeFilter);

  function setFilter(filter) {
    setSearchParams({ type: filter });
  }

  return (
    <div className="notes-page">
      <Seo
        title="SMXmuse Notes"
        description="Read SMXmuse pre-race notes, race recaps, leaderboard posts, and moto stats analysis."
        path="/notes"
      />

      <section className="notes-hero">
        <p className="notes-kicker">SMXMUSE NOTES</p>
        <h1>Notes</h1>
        <p>
          The written home for SMXmuse pre-race notes, race recaps, leaderboard
          posts, and deeper stat pulls.
        </p>
      </section>

      <section className="notes-filter-bar" aria-label="Filter notes">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className={activeFilter === filter.value ? "active" : ""}
            onClick={() => setFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </section>

      {filteredPosts.length > 0 ? (
        <section className="notes-grid">
          {filteredPosts.map((post) => (
            <article key={post.slug} className="notes-card">
              <PostMeta post={post} />
              <h2>
                <Link to={buildPostPath(post)}>{post.title}</Link>
              </h2>
              <p className="notes-card-summary">{getPostDescription(post)}</p>
              {getPostTags(post).length > 0 && (
                <div className="notes-tag-row">
                  {getPostTags(post).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </section>
      ) : (
        <section className="notes-empty-state">
          <h2>Ready for notes.</h2>
          <p>
            Add posts in <code>src/contentPosts.js</code>, then they will appear here with
            filterable archive cards and individual article pages.
          </p>
        </section>
      )}
    </div>
  );
}

export function NotePostPage() {
  const { slug } = useParams();
  const posts = getPublishedPosts();
  const post = posts.find((candidate) => candidate.slug === slug);

  if (!post) {
    return <Navigate to="/notes" replace />;
  }

  return (
    <article className="notes-page notes-post-page">
      <Seo
        title={post.title}
        description={getPostDescription(post)}
        path={buildPostPath(post)}
        type="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: getPostDescription(post),
          datePublished: post.date,
          author: {
            "@type": "Organization",
            name: "SMXmuse"
          },
          url: buildAbsoluteUrl(buildPostPath(post))
        }}
      />

      <Link to="/notes" className="notes-back-link">Back to notes</Link>

      <header className="notes-post-header">
        <PostMeta post={post} />
        <h1>{post.title}</h1>
        {post.summary && <p className="notes-post-summary">{post.summary}</p>}
        {post.instagramUrl && (
          <a
            className="notes-instagram-link"
            href={post.instagramUrl}
            target="_blank"
            rel="noreferrer"
          >
            View original Instagram post
          </a>
        )}
      </header>

      <div className="notes-post-body">
        {post.body?.map((block, index) => (
          <PostBodyBlock key={index} block={block} index={index} />
        ))}
      </div>
    </article>
  );
}
