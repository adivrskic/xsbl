import { useState } from "react";
import { Link } from "react-router-dom";
import { blogArticles } from "../../data/blogArticles";
import { ArrowRight } from "lucide-react";
import FadeIn from "../../components/landing/FadeIn";
import "../../styles/blog.css";

function RssIcon({ size }) {
  return (
    <svg
      width={size || 14}
      height={size || 14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 11a9 9 0 0 1 9 9" />
      <path d="M4 4a16 16 0 0 1 16 16" />
      <circle cx="5" cy="19" r="1" />
    </svg>
  );
}

function CategoryPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={"blog-cat-pill" + (active ? " blog-cat-pill--active" : "")}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
      <div className="blog-row__content">
        <div className="blog-row__meta">
          <span className="blog-cat-badge blog-cat-badge--muted">
            {article.category}
          </span>
          <time className="blog-mono-xs" dateTime={article.date}>
            {formatDate(article.date)}
          </time>
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
        <FadeIn>
          <div className="blog-header">
            <div className="blog-header__eyebrow">
              <span className="blog-header__eyebrow-line" aria-hidden="true" />{" "}
              Blog
            </div>
            <h1 className="blog-header__title">Accessibility insights</h1>
            <p className="blog-header__desc">
              Guides, industry news, and practical advice for building an
              accessible web.
            </p>
            <a
              href="/blog/feed.xml"
              className="blog-rss-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Subscribe to RSS feed"
            >
              <RssIcon size={13} />
              RSS feed
            </a>
          </div>
        </FadeIn>

        <FadeIn delay={0.05}>
          <div
            className="blog-categories"
            role="group"
            aria-label="Filter articles by category"
          >
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
        </FadeIn>

        {category === "All" && featured.length > 0 && (
          <FadeIn delay={0.1}>
            <div
              className={
                "blog-featured-grid" +
                (featured.length <= 1 ? " blog-featured-grid--single" : "")
              }
            >
              {featured.map(function (a) {
                return <FeaturedCard key={a.slug} article={a} />;
              })}
            </div>
          </FadeIn>
        )}

        <FadeIn delay={0.15}>
          <div className="blog-list" aria-live="polite">
            {(category === "All" ? nonFeatured : filtered).map(function (a) {
              return <ArticleRow key={a.slug} article={a} />;
            })}
          </div>
        </FadeIn>

        {filtered.length === 0 && (
          <div className="blog-empty" role="status">
            No articles in this category yet.
          </div>
        )}
      </div>
    </div>
  );
}
