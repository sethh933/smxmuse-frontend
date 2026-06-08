import { useEffect, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { apiUrl } from "./api";
import LinkedNoteText from "./LinkedNoteText";
import Seo from "./SiteSeo";
import { buildAbsoluteUrl } from "./seo";
import { getPostTags, getPostTypeLabel, getPublishedPosts } from "./contentPosts";

const FILTERS = [
  { value: "preRace", label: "Pre-Race" },
  { value: "raceRecap", label: "Race Recaps" }
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

function PostBodyBlock({ block, index, entities }) {
  if (typeof block === "string") {
    return <p key={index}><LinkedNoteText text={block} entities={entities} /></p>;
  }

  return (
    <section key={index} className="notes-body-section">
      {block.heading && <h2>{block.heading}</h2>}
      {block.paragraphs?.map((paragraph, paragraphIndex) => (
        <p key={paragraphIndex}><LinkedNoteText text={paragraph} entities={entities} /></p>
      ))}
      {block.bullets && (
        <ul>
          {block.bullets.map((bullet, bulletIndex) => (
            <li key={bulletIndex}><LinkedNoteText text={bullet} entities={entities} /></li>
          ))}
        </ul>
      )}
      {block.subsections?.map((subsection, subsectionIndex) => (
        <section key={subsectionIndex} className="notes-body-subsection">
          {subsection.heading && <h3>{subsection.heading}</h3>}
          {subsection.paragraphs?.map((paragraph, paragraphIndex) => (
            <p key={paragraphIndex}><LinkedNoteText text={paragraph} entities={entities} /></p>
          ))}
          {subsection.bullets && (
            <ul>
              {subsection.bullets.map((bullet, bulletIndex) => (
                <li key={bulletIndex}><LinkedNoteText text={bullet} entities={entities} /></li>
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
  const [apiPosts, setApiPosts] = useState(null);
  const [apiStatus, setApiStatus] = useState("idle");
  const requestedFilter = searchParams.get("type") || "preRace";
  const activeFilter = FILTERS.some((filter) => filter.value === requestedFilter)
    ? requestedFilter
    : "preRace";
  const fallbackPosts = getPublishedPosts();
  const posts = apiPosts || fallbackPosts;
  const filteredPosts = posts.filter((post) => post.type === activeFilter);

  useEffect(() => {
    let cancelled = false;

    async function loadNotes() {
      setApiStatus("loading");

      try {
        const response = await fetch(apiUrl(`/api/notes?category=${activeFilter}`));

        if (!response.ok) {
          throw new Error(`Notes request failed with ${response.status}`);
        }

        const data = await response.json();

        if (!cancelled) {
          setApiPosts(data);
          setApiStatus("ready");
        }
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setApiPosts(null);
          setApiStatus("fallback");
        }
      }
    }

    loadNotes();

    return () => {
      cancelled = true;
    };
  }, [activeFilter]);

  function setFilter(filter) {
    setSearchParams({ type: filter });
  }

  return (
    <div className="notes-page">
      <Seo
        title="smxmuse Notes"
        description="Read SMXmuse pre-race notes, race recaps, leaderboard posts, and moto stats analysis."
        path="/notes"
      />

      <section className="notes-hero">
        <p className="notes-kicker">SMXMUSE NOTES</p>
        <h1>Race Notes and Analysis</h1>
        <p>
          The written home for smxmuse pre-race notes, race recaps, leaderboard
          posts, and deeper stats and anaylsis.
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
          <h2>{apiStatus === "loading" ? "Loading notes." : "Ready for notes."}</h2>
          <p>
            {apiStatus === "loading"
              ? "Checking for published notes."
              : "Published notes for this category will appear here."}
          </p>
        </section>
      )}
    </div>
  );
}

export function NotePostPage() {
  const { slug } = useParams();
  const [apiPost, setApiPost] = useState(null);
  const [apiStatus, setApiStatus] = useState("loading");
  const fallbackPost = getPublishedPosts().find((candidate) => candidate.slug === slug);
  const post = apiPost || fallbackPost;

  useEffect(() => {
    let cancelled = false;

    async function loadNote() {
      setApiStatus("loading");

      try {
        const response = await fetch(apiUrl(`/api/notes/${slug}`));

        if (!response.ok) {
          throw new Error(`Note request failed with ${response.status}`);
        }

        const data = await response.json();

        if (!cancelled) {
          setApiPost(data);
          setApiStatus(data ? "ready" : "missing");
        }
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setApiPost(null);
          setApiStatus("fallback");
        }
      }
    }

    loadNote();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!post) {
    if (apiStatus === "loading") {
      return (
        <div className="notes-page">
          <section className="notes-empty-state">
            <h2>Loading note.</h2>
            <p>Checking for the published article.</p>
          </section>
        </div>
      );
    }

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
        <h1><LinkedNoteText text={post.title} entities={post.entities} /></h1>
        {post.summary && (
          <p className="notes-post-summary">
            <LinkedNoteText text={post.summary} entities={post.entities} />
          </p>
        )}
        {post.instagramUrl && (
          <a
            className="notes-instagram-link"
            href={post.instagramUrl}
            target="_blank"
            rel="noreferrer"
          >
            View on Instagram
          </a>
        )}
      </header>

      <div className="notes-post-body">
        {post.body?.map((block, index) => (
          <PostBodyBlock key={index} block={block} index={index} entities={post.entities} />
        ))}
      </div>
    </article>
  );
}
