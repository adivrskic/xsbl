import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { blogArticles } from "../../data/blogArticles";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function BlogArticlePage() {
  var { t } = useTheme();
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

  // Related articles (same category, exclude current)
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

  // Reading progress
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

  // Scroll to top on article change
  useEffect(
    function () {
      window.scrollTo(0, 0);
    },
    [slug]
  );

  if (!article) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              fontFamily: "var(--serif)",
              fontSize: "2rem",
              marginBottom: "0.5rem",
            }}
          >
            Article not found
          </h1>
          <Link
            to="/blog"
            style={{
              color: t.accent,
              textDecoration: "none",
              fontFamily: "var(--mono)",
              fontSize: "0.82rem",
            }}
          >
            ← Back to blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div ref={articleRef}>
      {/* Progress bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: progress + "%",
          height: 2,
          background: t.accent,
          zIndex: 200,
          transition: "width 0.1s",
        }}
      />

      {/* Article */}
      <article
        style={{
          maxWidth: 680,
          margin: "0 auto",
          padding: "7rem clamp(1.5rem, 3vw, 2.5rem) 4rem",
        }}
      >
        {/* Meta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            marginBottom: "1.2rem",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.6rem",
              fontWeight: 600,
              padding: "0.15rem 0.5rem",
              borderRadius: 3,
              textTransform: "uppercase",
              background: t.accent + "12",
              color: t.accent,
            }}
          >
            {article.category}
          </span>
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.65rem",
              color: t.ink50,
            }}
          >
            {new Date(article.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span style={{ width: 1, height: 12, background: t.ink20 }} />
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.65rem",
              color: t.ink50,
            }}
          >
            {article.readTime} read
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: "var(--serif)",
            fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
            fontWeight: 700,
            color: t.ink,
            lineHeight: 1.18,
            marginBottom: "0.8rem",
            letterSpacing: "-0.02em",
          }}
        >
          {article.title}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "1.1rem",
            color: t.ink50,
            lineHeight: 1.65,
            marginBottom: "2.5rem",
            fontStyle: "italic",
            paddingBottom: "2rem",
            borderBottom: "1px solid " + t.ink08,
          }}
        >
          {article.subtitle}
        </p>

        {/* Body */}
        <div style={{ fontSize: "1.02rem", color: t.ink, lineHeight: 1.85 }}>
          {article.body.map(function (block, i) {
            if (block.type === "h2") {
              return (
                <h2
                  key={i}
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "1.35rem",
                    fontWeight: 700,
                    color: t.ink,
                    marginTop: "2.2rem",
                    marginBottom: "0.8rem",
                    letterSpacing: "-0.01em",
                    lineHeight: 1.25,
                  }}
                >
                  {block.text}
                </h2>
              );
            }
            if (block.type === "h3") {
              return (
                <h3
                  key={i}
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: t.ink,
                    marginTop: "1.5rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  {block.text}
                </h3>
              );
            }
            return (
              <p key={i} style={{ marginBottom: "1.1rem", color: t.ink50 }}>
                {block.text}
              </p>
            );
          })}
        </div>

        {/* CTA */}
        <div
          style={{
            marginTop: "3rem",
            padding: "2rem",
            borderRadius: 14,
            background: t.accentBg,
            border: "1px solid " + t.accent + "18",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "var(--serif)",
              fontSize: "1.15rem",
              fontWeight: 700,
              color: t.ink,
              marginBottom: "0.5rem",
            }}
          >
            Ready to fix your accessibility issues?
          </div>
          <p
            style={{
              fontSize: "0.88rem",
              color: t.ink50,
              marginBottom: "1rem",
              lineHeight: 1.6,
            }}
          >
            Scan your site free. Get AI-powered fixes as pull requests.
          </p>
          <Link
            to="/signup"
            style={{
              display: "inline-block",
              padding: "0.6rem 1.4rem",
              borderRadius: 8,
              background: t.accent,
              color: "white",
              textDecoration: "none",
              fontFamily: "var(--body)",
              fontSize: "0.88rem",
              fontWeight: 600,
            }}
          >
            Start scanning free →
          </Link>
        </div>

        {/* Prev / Next */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem",
            marginTop: "3rem",
            paddingTop: "2rem",
            borderTop: "1px solid " + t.ink08,
          }}
        >
          {prev ? (
            <Link
              to={"/blog/" + prev.slug}
              style={{ textDecoration: "none", flex: 1 }}
            >
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.6rem",
                  color: t.ink50,
                  marginBottom: "0.2rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.2rem",
                }}
              >
                <ArrowLeft size={11} /> Previous
              </div>
              <div
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "0.92rem",
                  fontWeight: 600,
                  color: t.ink,
                  lineHeight: 1.3,
                }}
              >
                {prev.title}
              </div>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              to={"/blog/" + next.slug}
              style={{ textDecoration: "none", flex: 1, textAlign: "right" }}
            >
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.6rem",
                  color: t.ink50,
                  marginBottom: "0.2rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: "0.2rem",
                }}
              >
                Next <ArrowRight size={11} />
              </div>
              <div
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "0.92rem",
                  fontWeight: 600,
                  color: t.ink,
                  lineHeight: 1.3,
                }}
              >
                {next.title}
              </div>
            </Link>
          ) : (
            <div />
          )}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div style={{ marginTop: "3rem" }}>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.62rem",
                color: t.ink50,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "0.8rem",
                fontWeight: 600,
              }}
            >
              Related articles
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.8rem",
              }}
              className="grid-1-mobile"
            >
              {related.map(function (a) {
                return (
                  <Link
                    key={a.slug}
                    to={"/blog/" + a.slug}
                    style={{
                      textDecoration: "none",
                      padding: "1.2rem",
                      borderRadius: 10,
                      border: "1px solid " + t.ink08,
                      transition: "border-color 0.2s",
                    }}
                    onMouseEnter={function (e) {
                      e.currentTarget.style.borderColor = t.accent + "30";
                    }}
                    onMouseLeave={function (e) {
                      e.currentTarget.style.borderColor = t.ink08;
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "0.55rem",
                        color: t.accent,
                        textTransform: "uppercase",
                      }}
                    >
                      {a.category}
                    </span>
                    <div
                      style={{
                        fontFamily: "var(--serif)",
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        color: t.ink,
                        marginTop: "0.2rem",
                        lineHeight: 1.3,
                      }}
                    >
                      {a.title}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "0.6rem",
                        color: t.ink50,
                        marginTop: "0.3rem",
                      }}
                    >
                      {a.readTime}
                    </div>
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
