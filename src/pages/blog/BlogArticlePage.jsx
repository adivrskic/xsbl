import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { blogArticles } from "../../data/blogArticles";
import { ArrowLeft, ArrowRight } from "lucide-react";
import FadeIn from "../../components/landing/FadeIn";
import "../../styles/blog.css";

function formatDate(dateStr, long) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: long ? "long" : "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogArticlePage() {
  var { slug } = useParams();
  var navigate = useNavigate();
  var [progress, setProgress] = useState(0);
  var articleRef = useRef(null);

  var article = blogArticles.find(function (a) {
    return a.slug === slug;
  });
  var articleIndex = blogArticles.findIndex(function (a) {
    return a.slug === slug;
  });
  var prev = articleIndex > 0 ? blogArticles[articleIndex - 1] : null;
  var next =
    articleIndex < blogArticles.length - 1
      ? blogArticles[articleIndex + 1]
      : null;

  var related = article
    ? blogArticles
        .filter(function (a) {
          return a.category === article.category && a.slug !== slug;
        })
        .slice(0, 2)
    : [];
  if (related.length < 2) {
    var others = blogArticles.filter(function (a) {
      return a.slug !== slug && related.indexOf(a) === -1;
    });
    while (related.length < 2 && others.length > 0)
      related.push(others.shift());
  }

  useEffect(
    function () {
      var handler = function () {
        if (!articleRef.current) return;
        var rect = articleRef.current.getBoundingClientRect();
        var total = rect.height - window.innerHeight;
        var scrolled = -rect.top;
        setProgress(Math.min(100, Math.max(0, (scrolled / total) * 100)));
      };
      window.addEventListener("scroll", handler, { passive: true });
      return function () {
        window.removeEventListener("scroll", handler);
      };
    },
    [slug]
  );

  useEffect(
    function () {
      window.scrollTo(0, 0);
    },
    [slug]
  );

  // Inject Article structured data (ld+json) for SEO rich results
  useEffect(
    function () {
      if (!article) return;

      var wordCount = article.body
        .filter(function (b) {
          return b.type === "p";
        })
        .reduce(function (sum, b) {
          return sum + (b.text || "").split(/\s+/).length;
        }, 0);

      var ld = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.title,
        description: article.subtitle || "",
        datePublished: article.date,
        dateModified: article.date,
        author: {
          "@type": "Organization",
          name: "xsbl",
          url: "https://xsbl.io",
        },
        publisher: {
          "@type": "Organization",
          name: "xsbl",
          url: "https://xsbl.io",
          logo: {
            "@type": "ImageObject",
            url: "https://xsbl.io/favicon-96x96.png",
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": "https://xsbl.io/blog/" + article.slug,
        },
        wordCount: wordCount,
        articleSection: article.category,
        inLanguage: "en-US",
      };

      var script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = "article-structured-data";
      script.textContent = JSON.stringify(ld);

      // Remove any previous article ld+json
      var existing = document.getElementById("article-structured-data");
      if (existing) existing.remove();

      document.head.appendChild(script);

      return function () {
        var el = document.getElementById("article-structured-data");
        if (el) el.remove();
      };
    },
    [article, slug]
  );

  if (!article) {
    // Handle /blog/feed.xml — show RSS info page
    if (slug === "feed.xml") {
      return (
        <div className="blog-article-page" style={{ paddingTop: "8rem" }}>
          <FadeIn>
            <div
              style={{ textAlign: "center", maxWidth: 420, margin: "0 auto" }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginBottom: "1.2rem" }}
              >
                <path d="M4 11a9 9 0 0 1 9 9" />
                <path d="M4 4a16 16 0 0 1 16 16" />
                <circle cx="5" cy="19" r="1" />
              </svg>
              <h1
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "1.6rem",
                  fontWeight: 700,
                  marginBottom: "0.6rem",
                }}
              >
                RSS Feed
              </h1>
              <p
                style={{
                  fontSize: "0.95rem",
                  color: "var(--ink50)",
                  lineHeight: 1.7,
                  marginBottom: "1.5rem",
                }}
              >
                Subscribe to our RSS feed to get new articles delivered to your
                favorite reader. Works with Feedly, Reeder, Inoreader, and any
                RSS-compatible app.
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem",
                  alignItems: "center",
                }}
              >
                <a
                  href="/blog/feed.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.7rem 1.5rem",
                    borderRadius: 8,
                    background: "var(--accent)",
                    color: "white",
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    textDecoration: "none",
                  }}
                >
                  Open feed
                </a>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--ink50)",
                    margin: 0,
                  }}
                >
                  Copy this URL into your reader:
                </p>
                <code
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.72rem",
                    padding: "0.4rem 0.8rem",
                    borderRadius: 6,
                    background: "var(--ink04)",
                    color: "var(--accent)",
                    userSelect: "all",
                  }}
                >
                  https://xsbl.io/blog/feed.xml
                </code>
              </div>
              <div style={{ marginTop: "2rem" }}>
                <Link
                  to="/blog"
                  style={{
                    color: "var(--accent)",
                    fontSize: "0.88rem",
                    textDecoration: "none",
                  }}
                >
                  ← Back to blog
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      );
    }

    return (
      <div className="blog-404">
        <div className="blog-404__inner">
          <h1 className="blog-404__title">Article not found</h1>
          <Link to="/blog" className="blog-404__link">
            ← Back to blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div ref={articleRef}>
      <div
        className="blog-progress"
        style={{ width: progress + "%" }}
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress"
      />

      <article className="blog-article-page">
        <FadeIn>
          <div className="blog-article__meta">
            <span className="blog-cat-badge blog-cat-badge--accent">
              {article.category}
            </span>
            <time className="blog-mono-xs" dateTime={article.date}>
              {formatDate(article.date, true)}
            </time>
            <span className="blog-pipe" aria-hidden="true" />
            <span className="blog-mono-xs">{article.readTime} read</span>
          </div>

          <h1 className="blog-article__title">{article.title}</h1>
          <p className="blog-article__subtitle">{article.subtitle}</p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="blog-article__body">
            {article.body.map(function (block, i) {
              if (block.type === "h2") return <h2 key={i}>{block.text}</h2>;
              if (block.type === "h3") return <h3 key={i}>{block.text}</h3>;
              return <p key={i}>{block.text}</p>;
            })}
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="blog-cta-box">
            <div className="blog-cta-box__title">
              Ready to fix your accessibility issues?
            </div>
            <p className="blog-cta-box__desc">
              Scan your site free. Get AI-powered fixes as pull requests.
            </p>
            <Link to="/signup" className="btn btn-accent">
              Start scanning free
            </Link>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <nav className="blog-nav" aria-label="Article navigation">
            {prev ? (
              <Link to={"/blog/" + prev.slug} className="blog-nav__link">
                <div className="blog-nav__label">
                  <ArrowLeft size={11} /> Previous
                </div>
                <div className="blog-nav__title">{prev.title}</div>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                to={"/blog/" + next.slug}
                className="blog-nav__link blog-nav__link--next"
              >
                <div className="blog-nav__label">
                  Next <ArrowRight size={11} />
                </div>
                <div className="blog-nav__title">{next.title}</div>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </FadeIn>

        {related.length > 0 && (
          <FadeIn delay={0.25}>
            <div className="blog-related">
              <h2 className="blog-related__heading">Related articles</h2>
              <div className="blog-related__grid grid-1-mobile">
                {related.map(function (a) {
                  return (
                    <Link
                      key={a.slug}
                      to={"/blog/" + a.slug}
                      className="blog-related__card"
                    >
                      <span className="blog-related__cat">{a.category}</span>
                      <div className="blog-related__title">{a.title}</div>
                      <div className="blog-related__time">{a.readTime}</div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </FadeIn>
        )}
      </article>
    </div>
  );
}
