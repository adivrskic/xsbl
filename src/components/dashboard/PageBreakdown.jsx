import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  ExternalLink,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import "../../styles/dashboard.css";

export default function PageBreakdown({ scan, issues, onFilterByPage }) {
  const { t } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const pages = scan?.summary_json?.pages || [];
  if (pages.length <= 1) return null;

  const sortedPages = [...pages].sort(
    (a, b) => (a.score ?? 100) - (b.score ?? 100)
  );

  return (
    <div className="page-breakdown">
      <button
        onClick={() => setExpanded(!expanded)}
        className="page-breakdown__toggle"
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span className="page-breakdown__title">Per-page breakdown</span>
          <span className="page-breakdown__count">{pages.length} pages</span>
        </div>
        <span className="page-breakdown__method">
          {scan.summary_json?.crawl_method === "sitemap"
            ? "via sitemap"
            : "via link discovery"}
        </span>
      </button>

      {expanded && (
        <div style={{ borderTop: "1px solid var(--ink08)" }}>
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
                className="page-breakdown__row"
              >
                <div style={{ flex: 1, minWidth: 0, marginRight: "0.8rem" }}>
                  <div className="page-breakdown__page-title">
                    {page.title || page.url}
                  </div>
                  <div className="page-breakdown__page-path">
                    {new URL(page.url).pathname}
                    <a
                      href={page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ color: "var(--ink50)", display: "flex" }}
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
                        color: "var(--red)",
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
                        color: "var(--red)",
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
