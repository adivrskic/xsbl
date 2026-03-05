import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  ExternalLink,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export default function PageBreakdown({ scan, issues, onFilterByPage }) {
  const { t } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const pages = scan?.summary_json?.pages || [];
  if (pages.length <= 1) return null;

  const sortedPages = [...pages].sort(
    (a, b) => (a.score ?? 100) - (b.score ?? 100)
  );

  return (
    <div
      style={{
        borderRadius: 10,
        border: `1px solid ${t.ink08}`,
        background: t.cardBg,
        overflow: "hidden",
        marginBottom: "1.5rem",
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%",
          padding: "0.9rem 1.1rem",
          background: "none",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          color: t.ink,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>
            Per-page breakdown
          </span>
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.62rem",
              color: t.ink50,
              background: t.ink04,
              padding: "0.12rem 0.4rem",
              borderRadius: 3,
            }}
          >
            {pages.length} pages
          </span>
        </div>
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.68rem",
            color: t.ink50,
          }}
        >
          {scan.summary_json?.crawl_method === "sitemap"
            ? "via sitemap"
            : "via link discovery"}
        </span>
      </button>

      {expanded && (
        <div style={{ borderTop: `1px solid ${t.ink08}` }}>
          {sortedPages.map((page, i) => {
            const pageIssueCount = issues.filter(
              (iss) => iss.page_url === page.url
            ).length;
            const scoreColor =
              page.score != null
                ? page.score >= 80
                  ? t.green
                  : page.score >= 50
                  ? t.amber
                  : t.red
                : t.ink50;

            return (
              <div
                key={i}
                onClick={() => onFilterByPage?.(page.url)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.65rem 1.1rem",
                  borderBottom: `1px solid ${t.ink04}`,
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = t.ink04)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <div style={{ flex: 1, minWidth: 0, marginRight: "0.8rem" }}>
                  <div
                    style={{
                      fontSize: "0.82rem",
                      color: t.ink,
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {page.title || page.url}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.65rem",
                      color: t.ink50,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    {new URL(page.url).pathname}
                    <a
                      href={page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ color: t.ink50, display: "flex" }}
                    >
                      <ExternalLink size={10} />
                    </a>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.8rem",
                    flexShrink: 0,
                  }}
                >
                  {pageIssueCount > 0 && (
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "0.62rem",
                        color: t.red,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.2rem",
                      }}
                    >
                      <AlertTriangle size={11} /> {pageIssueCount}
                    </span>
                  )}
                  {page.score != null ? (
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        color: scoreColor,
                        minWidth: 28,
                        textAlign: "right",
                      }}
                    >
                      {Math.round(page.score)}
                    </span>
                  ) : (
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "0.68rem",
                        color: t.red,
                      }}
                    >
                      {page.error ? "Failed" : "\u2014"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
