import ArticleFormattedText from "./ArticleFormattedText";
import ArticleTable from "./ArticleTable";
import "./styles/generalArticle.css";

export default function GeneralArticleBody({ blocks = [], entities }) {
  return <div className="article-reader">
    {blocks.map((block, index) => block.type === "table"
      ? <ArticleTable key={block.id || index} block={block} entities={entities} />
      : <section key={block.id || index}>
        {block.heading && <h2><ArticleFormattedText text={block.heading} entities={entities} /></h2>}
        {block.text.split(/\n\s*\n/).filter(Boolean).map((paragraph, i) => <p className="article-paragraph" key={i}><ArticleFormattedText text={paragraph} entities={entities} /></p>)}
      </section>)}
  </div>;
}
