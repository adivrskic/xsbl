import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { Link } from "react-router-dom";
import { blogArticles } from "../../data/blogArticles";
import { ArrowRight } from "lucide-react";

function CategoryPill({ label, active, onClick }) {
  var { t } = useTheme();
  return (
    <button
      onClick={onClick}
      style={{
        padding: "0.3rem 0.8rem",
        borderRadius: 20,
        border: "none",
        background: active ? t.ink : "transparent",
        color: active ? t.paper : t.ink50,
        fontFamily: "var(--mono)",
        fontSize: "0.68rem",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s",
        letterSpacing: "0.02em",
      }}
    >
      {label}
    </button>
  );
}

function FeaturedCard({ article }) {
  var { t } = useTheme();
  var [hov, setHov] = useState(false);
  return (
    <Link
      to={"/blog/" + article.slug}
      style={{ textDecoration: "none", display: "block" }}
      onMouseEnter={function () {
        setHov(true);
      }}
      onMouseLeave={function () {
        setHov(false);
      }}
    >
      <div
        style={{
          padding: "2.5rem 2.2rem",
          borderRadius: 16,
          background: hov ? t.accentBg : t.cardBg,
          border: "1px solid " + (hov ? t.accent + "30" : t.ink08),
          transition: "all 0.3s",
          cursor: "pointer",
          transform: hov ? "translateY(-3px)" : "translateY(0)",
          boxShadow: hov ? "0 12px 40px rgba(0,0,0,0.06)" : "none",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            marginBottom: "1rem",
          }}
        >
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.58rem",
              fontWeight: 600,
              padding: "0.15rem 0.5rem",
              borderRadius: 3,
              textTransform: "uppercase",
              background: t.accent + "12",
              color: t.accent,
              letterSpacing: "0.04em",
            }}
          >
            {article.category}
          </span>
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.62rem",
              color: t.ink50,
            }}
          >
            {article.readTime}
          </span>
        </div>
        <h2
          style={{
            fontFamily: "var(--serif)",
            fontSize: "1.5rem",
            fontWeight: 700,
            color: t.ink,
            lineHeight: 1.25,
            marginBottom: "0.6rem",
            letterSpacing: "-0.01em",
          }}
        >
          {article.title}
        </h2>
        <p
          style={{
            fontSize: "0.92rem",
            color: t.ink50,
            lineHeight: 1.65,
            marginBottom: "1rem",
            maxWidth: 520,
          }}
        >
          {article.subtitle}
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            fontFamily: "var(--mono)",
            fontSize: "0.72rem",
            fontWeight: 600,
            color: t.accent,
            transition: "gap 0.2s",
          }}
        >
          Read article{" "}
          <ArrowRight
            size={14}
            style={{
              transition: "transform 0.2s",
              transform: hov ? "translateX(3px)" : "translateX(0)",
            }}
          />
        </div>
      </div>
    </Link>
  );
}

function ArticleRow({ article }) {
  var { t } = useTheme();
  var [hov, setHov] = useState(false);
  return (
    <Link
      to={"/blog/" + article.slug}
      style={{ textDecoration: "none", display: "block" }}
      onMouseEnter={function () {
        setHov(true);
      }}
      onMouseLeave={function () {
        setHov(false);
      }}
    >
      <div
        style={{
          padding: "1.4rem 1.5rem",
          borderRadius: 12,
          border: "1px solid " + (hov ? t.accent + "25" : t.ink04),
          background: hov ? t.cardBg : "transparent",
          transition: "all 0.2s",
          cursor: "pointer",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "1.5rem",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.35rem",
            }}
          >
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.55rem",
                fontWeight: 600,
                padding: "0.1rem 0.4rem",
                borderRadius: 3,
                textTransform: "uppercase",
                background: t.ink04,
                color: t.ink50,
              }}
            >
              {article.category}
            </span>
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.6rem",
                color: t.ink50,
              }}
            >
              {new Date(article.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <h3
            style={{
              fontFamily: "var(--serif)",
              fontSize: "1.1rem",
              fontWeight: 700,
              color: t.ink,
              lineHeight: 1.3,
              marginBottom: "0.25rem",
            }}
          >
            {article.title}
          </h3>
          <p
            style={{
              fontSize: "0.82rem",
              color: t.ink50,
              lineHeight: 1.55,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {article.subtitle}
          </p>
        </div>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.65rem",
            color: t.ink50,
            flexShrink: 0,
            paddingTop: "0.3rem",
          }}
        >
          {article.readTime}
        </div>
      </div>
    </Link>
  );
}

export default function BlogPage() {
  var { t } = useTheme();
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
      <div
        style={{
          maxWidth: 860,
          margin: "0 auto",
          padding: "7rem clamp(1.5rem, 3vw, 3rem) 4rem",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.68rem",
              color: t.accent,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: 600,
              marginBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <span style={{ width: 20, height: 1.5, background: t.accent }} />{" "}
            Blog
          </div>
          <h1
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(2rem, 3.5vw, 2.6rem)",
              fontWeight: 700,
              color: t.ink,
              lineHeight: 1.15,
              marginBottom: "0.6rem",
            }}
          >
            Accessibility insights
          </h1>
          <p
            style={{
              fontSize: "1rem",
              color: t.ink50,
              lineHeight: 1.7,
              maxWidth: 480,
            }}
          >
            Guides, industry news, and practical advice for building an
            accessible web.
          </p>
        </div>

        {/* Category filters */}
        <div
          style={{
            display: "flex",
            gap: "0.3rem",
            marginBottom: "2rem",
            flexWrap: "wrap",
          }}
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

        {/* Featured */}
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

        {/* Article list */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}
        >
          {(category === "All" ? nonFeatured : filtered).map(function (a) {
            return <ArticleRow key={a.slug} article={a} />;
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: "3rem", textAlign: "center", color: t.ink50 }}>
            No articles in this category yet.
          </div>
        )}
      </div>
    </div>
  );
}
