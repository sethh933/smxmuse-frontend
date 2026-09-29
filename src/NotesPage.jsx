import GeneralArticleBody from "./GeneralArticleBody";
import { articlePlainText } from "./articlePlainText";
import ArticleFormattedText from "./ArticleFormattedText";
import { useEffect, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { apiUrl } from "./api";
import LinkedNoteText from "./LinkedNoteText";
import Seo from "./SiteSeo";
import { readNewsSnapshot } from "./newsSnapshot";
import { buildAbsoluteUrl } from "./seo";
import { getPostTags, getPostTypeLabel, getPublishedPosts } from "./contentPosts";
import "./styles/newsHome.css";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "articles", label: "Articles" },
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
  return `/news/${post.slug}`;
}

function getPostDescription(post) {
  return articlePlainText(post.summary || `${getPostTypeLabel(post.type)} from smxmuse.`);
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

export function NotesIndexPage({ initialPosts } = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [apiPosts, setApiPosts] = useState(null);
  const [apiStatus, setApiStatus] = useState("idle");
  const requestedFilter = searchParams.get("type") || "all";
  const activeFilter = FILTERS.some((filter) => filter.value === requestedFilter)
    ? requestedFilter
    : "all";
  const fallbackPosts = initialPosts || readNewsSnapshot()?.posts || getPublishedPosts();
  const posts = [...(apiPosts || fallbackPosts)].sort((a, b) => b.date.localeCompare(a.date));
  const query = searchParams.get("q") || "";
  const filteredPosts = posts.filter((post) =>
    (activeFilter === "all" || (activeFilter === "articles"
      ? !["preRace", "raceRecap"].includes(post.type) : post.type === activeFilter)) &&
    [post.title, post.summary, ...getPostTags(post)].filter(Boolean).join(" ").toLowerCase().includes(query.trim().toLowerCase())
  );
  const featured = activeFilter === "all" && !query.trim()
    ? posts.find((post) => post.featured) || posts[0] : null;
  const feed = filteredPosts.filter((post) => post.slug !== featured?.slug);

  useEffect(() => {
    let cancelled = false;

    async function loadNotes() {
      setApiStatus("loading");

      try {
        const response = await fetch(apiUrl("/api/notes"));

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
  }, []);

  function setFilter(filter) {
    const params = new URLSearchParams(searchParams);
    if (filter === "all") params.delete("type");
    else params.set("type", filter);
    setSearchParams(params);
  }

  return (
    <div className="notes-page news-home">
      <Seo
        title="smxmuse News"
        description="Read smxmuse pre-race notes, race recaps, leaderboard posts, and moto stats analysis."
        path="/news"
      />

      <section className="notes-hero">
        <p className="notes-kicker">SMXMUSE NEWS</p>
        <h1>Stories, Stats &amp; Race Notes</h1>
        <p>
          Race previews, recaps, and a deeper look at the numbers behind the sport.
        </p>
      </section>

      <div className="news-browse-tools">
      <section className="notes-filter-bar" aria-label="Filter posts">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className={activeFilter === filter.value ? "active" : ""}
            aria-pressed={activeFilter === filter.value}
            onClick={() => setFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </section>
      <label className="news-search">Search posts
        <input type="search" placeholder="Try a rider, race, or topic…" value={query} onChange={(event) => {
          const params = new URLSearchParams(searchParams);
          if (event.target.value) params.set("q", event.target.value);
          else params.delete("q");
          setSearchParams(params, { replace: true });
        }} />
      </label>
      </div>

      {featured && <article className="news-featured">
        <div className="news-featured-label">{featured.featured ? "Featured story" : "Latest story"}<span>From the smxmuse feed</span></div>
        <div className="news-featured-content">
          <PostMeta post={featured} />
          <h2><Link to={buildPostPath(featured)}>{featured.title}</Link></h2>
          <p>{getPostDescription(featured)}</p>
          <div className="notes-tag-row">{getPostTags(featured).slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}</div>
          <Link className="news-read-link" to={buildPostPath(featured)}>Read the story <span aria-hidden="true">↗</span></Link>
        </div>
      </article>}

      {feed.length > 0 ? (<>
        <div className="news-feed-heading"><h2>{featured ? "More stories" : "Latest posts"}</h2><span>{feed.length} {feed.length === 1 ? "post" : "posts"}</span></div>
        <section className="notes-grid">
          {feed.map((post) => (
            <article key={post.slug} className="notes-card">
              <PostMeta post={post} />
              <h2>
                <Link to={buildPostPath(post)}>{post.title}</Link>
              </h2>
              <p className="notes-card-summary">{getPostDescription(post)}</p>
              {getPostTags(post).length > 0 && (
                <div className="notes-tag-row">
                  {getPostTags(post).slice(0, 4).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </section>
      </>) : !featured ? (
        <section className="notes-empty-state">
          <h2>{apiStatus === "loading" ? "Loading posts…" : query ? "No matching posts" : "More stories are on the way"}</h2>
          <p>
            {apiStatus === "loading"
              ? "Checking for published posts."
              : query ? "Try another rider, race, or topic, or choose a different category." : "Published posts in this category will appear here."}
          </p>
        </section>
      ) : null}
    </div>
  );
}

export function NotePostPage({ initialPost } = {}) {
  const { slug } = useParams();
  const [apiPost, setApiPost] = useState(null);
  const [apiStatus, setApiStatus] = useState("loading");
  const snapshot = readNewsSnapshot();
  const savedPost = initialPost || snapshot?.post;
  const fallbackPost = savedPost?.slug === slug ? savedPost
    : getPublishedPosts().find((candidate) => candidate.slug === slug);
  const post = apiPost?.slug === slug ? apiPost : fallbackPost;

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

    return <Navigate to="/news" replace />;
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
            name: "smxmuse"
          },
          url: buildAbsoluteUrl(buildPostPath(post))
        }}
      />

      <Link to="/news" className="notes-back-link">Back to news</Link>

      <header className="notes-post-header">
        <PostMeta post={post} />
        <h1>{post.title}</h1>
        {post.summary && (
          <p className="notes-post-summary">
            <ArticleFormattedText text={post.summary} entities={post.entities} />
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
        {post.type === "general" && <GeneralArticleBody blocks={post.blocks} entities={post.entities} />}
        {post.body?.map((block, index) => (
          <PostBodyBlock key={index} block={block} index={index} entities={post.entities} />
        ))}
      </div>
    </article>
  );
}
