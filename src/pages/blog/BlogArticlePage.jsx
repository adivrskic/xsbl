import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { blogArticles } from "../../data/blogArticles";
import { ArrowLeft, ArrowRight } from "lucide-react";
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

  if (!article) {
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

        <div className="blog-article__body">
          {article.body.map(function (block, i) {
            if (block.type === "h2") return <h2 key={i}>{block.text}</h2>;
            if (block.type === "h3") return <h3 key={i}>{block.text}</h3>;
            return <p key={i}>{block.text}</p>;
          })}
        </div>

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

        {related.length > 0 && (
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
        )}
      </article>
    </div>
  );
}
