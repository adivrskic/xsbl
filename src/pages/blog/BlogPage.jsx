import { useState } from "react";
import { Link } from "react-router-dom";
import { blogArticles } from "../../data/blogArticles";
import { ArrowRight } from "lucide-react";
import "../../styles/blog.css";

function CategoryPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={"blog-cat-pill" + (active ? " blog-cat-pill--active" : "")}
    >
      {label}
    </button>
  );
}

function FeaturedCard({ article }) {
  return (
    <Link to={"/blog/" + article.slug} className="blog-featured">
      <div className="blog-featured__meta">
        <span className="blog-cat-badge blog-cat-badge--accent">
          {article.category}
        </span>
        <span className="blog-mono-sm">{article.readTime}</span>
      </div>
      <h2 className="blog-featured__title">{article.title}</h2>
      <p className="blog-featured__sub">{article.subtitle}</p>
      <div className="blog-featured__cta">
        Read article <ArrowRight size={14} className="blog-featured__arrow" />
      </div>
    </Link>
  );
}

function ArticleRow({ article }) {
  return (
    <Link to={"/blog/" + article.slug} className="blog-row">
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="blog-row__meta">
          <span className="blog-cat-badge blog-cat-badge--muted">
            {article.category}
          </span>
          <span className="blog-mono-xs">
            {new Date(article.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
        <h3 className="blog-row__title">{article.title}</h3>
        <p className="blog-row__sub">{article.subtitle}</p>
      </div>
      <div className="blog-row__time">{article.readTime}</div>
    </Link>
  );
}

export default function BlogPage() {
  var [category, setCategory] = useState("All");

  var categories = ["All"];
  for (var i = 0; i < blogArticles.length; i++) {
    if (categories.indexOf(blogArticles[i].category) === -1)
      categories.push(blogArticles[i].category);
  }

  var featured = blogArticles.filter(function (a) {
    return a.featured;
  });
  var filtered =
    category === "All"
      ? blogArticles
      : blogArticles.filter(function (a) {
          return a.category === category;
        });
  var nonFeatured = filtered.filter(function (a) {
    return !a.featured;
  });

  return (
    <div>
      <div className="blog-page">
        <div className="blog-header">
          <div className="blog-header__eyebrow">
            <span className="blog-header__eyebrow-line" /> Blog
          </div>
          <h1 className="blog-header__title">Accessibility insights</h1>
          <p className="blog-header__desc">
            Guides, industry news, and practical advice for building an
            accessible web.
          </p>
        </div>

        <div className="blog-categories">
          {categories.map(function (cat) {
            return (
              <CategoryPill
                key={cat}
                label={cat}
                active={category === cat}
                onClick={function () {
                  setCategory(cat);
                }}
              />
            );
          })}
        </div>

        {category === "All" && featured.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: featured.length > 1 ? "1fr 1fr" : "1fr",
              gap: "1rem",
              marginBottom: "2rem",
            }}
            className="grid-1-mobile"
          >
            {featured.map(function (a) {
              return <FeaturedCard key={a.slug} article={a} />;
            })}
          </div>
        )}

        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}
        >
          {(category === "All" ? nonFeatured : filtered).map(function (a) {
            return <ArticleRow key={a.slug} article={a} />;
          })}
        </div>

        {filtered.length === 0 && (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              color: "var(--ink50)",
            }}
          >
            No articles in this category yet.
          </div>
        )}
      </div>
    </div>
  );
}
