import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { Filter, ChevronDown } from "lucide-react";

export default function IssueFilters({ filters, setFilters, issues, userId }) {
  const { t } = useTheme();
  const [open, setOpen] = useState(false);

  const impacts = ["critical", "serious", "moderate", "minor"];
  const statuses = ["open", "fixed", "ignored", "removed", "false_positive"];

  // Collect unique WCAG tags
  const allTags = [...new Set(issues.flatMap((i) => i.wcag_tags || []))].sort();

  // Check if any issues have assignees
  const hasAssignees = issues.some((i) => i.assigned_to);
  const assignedToMeCount = userId
    ? issues.filter((i) => i.assigned_to === userId).length
    : 0;

  const impactCounts = {};
  impacts.forEach((imp) => {
    impactCounts[imp] = issues.filter((i) => i.impact === imp).length;
  });

  const statusCounts = {};
  statuses.forEach((s) => {
    statusCounts[s] = issues.filter((i) => i.status === s).length;
  });

  const toggleFilter = (key, value) => {
    setFilters((prev) => {
      const arr = prev[key] || [];
      return {
        ...prev,
        [key]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  };

  const activeCount =
    (filters.impact?.length || 0) +
    (filters.status?.length || 0) +
    (filters.wcag?.length || 0) +
    (filters.page?.length || 0) +
    (filters.assigned_to_me ? 1 : 0);

  return (
    <div style={{ marginBottom: "1rem" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          background: activeCount > 0 ? t.accentBg : t.ink04,
          border: `1px solid ${activeCount > 0 ? t.accent : t.ink08}`,
          borderRadius: 7,
          padding: "0.4rem 0.8rem",
          cursor: "pointer",
          fontFamily: "var(--body)",
          fontSize: "0.78rem",
          fontWeight: 500,
          color: activeCount > 0 ? t.accent : t.ink50,
        }}
      >
        <Filter size={13} strokeWidth={2} />
        Filters {activeCount > 0 && `(${activeCount})`}
        <ChevronDown
          size={13}
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {open && (
        <div
          style={{
            marginTop: "0.6rem",
            padding: "1rem",
            borderRadius: 10,
            border: `1px solid ${t.ink08}`,
            background: t.cardBg,
          }}
        >
          {/* Impact */}
          <div style={{ marginBottom: "0.8rem" }}>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.6rem",
                color: t.ink50,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "0.35rem",
              }}
            >
              Impact
            </div>
            <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
              {impacts.map((imp) => {
                const active = filters.impact?.includes(imp);
                return (
                  <button
                    key={imp}
                    onClick={() => toggleFilter("impact", imp)}
                    style={{
                      padding: "0.25rem 0.55rem",
                      borderRadius: 5,
                      fontSize: "0.7rem",
                      fontFamily: "var(--mono)",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: `1px solid ${active ? t.accent : t.ink08}`,
                      background: active ? t.accentBg : "transparent",
                      color: active ? t.accent : t.ink50,
                      textTransform: "uppercase",
                    }}
                  >
                    {imp} ({impactCounts[imp]})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div style={{ marginBottom: "0.8rem" }}>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.6rem",
                color: t.ink50,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "0.35rem",
              }}
            >
              Status
            </div>
            <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
              {statuses.map((s) => {
                const active = filters.status?.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleFilter("status", s)}
                    style={{
                      padding: "0.25rem 0.55rem",
                      borderRadius: 5,
                      fontSize: "0.7rem",
                      fontFamily: "var(--mono)",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: `1px solid ${active ? t.accent : t.ink08}`,
                      background: active ? t.accentBg : "transparent",
                      color: active ? t.accent : t.ink50,
                    }}
                  >
                    {s.replace("_", " ")} ({statusCounts[s]})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assigned to me */}
          {(hasAssignees || assignedToMeCount > 0) && userId && (
            <div style={{ marginBottom: "0.8rem" }}>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.6rem",
                  color: t.ink50,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "0.35rem",
                }}
              >
                Assignment
              </div>
              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    assigned_to_me: !prev.assigned_to_me,
                  }))
                }
                style={{
                  padding: "0.25rem 0.55rem",
                  borderRadius: 5,
                  fontSize: "0.7rem",
                  fontFamily: "var(--mono)",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: `1px solid ${
                    filters.assigned_to_me ? t.accent : t.ink08
                  }`,
                  background: filters.assigned_to_me
                    ? t.accentBg
                    : "transparent",
                  color: filters.assigned_to_me ? t.accent : t.ink50,
                }}
              >
                Assigned to me ({assignedToMeCount})
              </button>
            </div>
          )}

          {/* WCAG tags */}
          {allTags.length > 0 && (
            <div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.6rem",
                  color: t.ink50,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "0.35rem",
                }}
              >
                WCAG criterion
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "0.25rem",
                  flexWrap: "wrap",
                  maxHeight: 80,
                  overflowY: "auto",
                }}
              >
                {allTags.map((tag) => {
                  const active = filters.wcag?.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleFilter("wcag", tag)}
                      style={{
                        padding: "0.2rem 0.45rem",
                        borderRadius: 4,
                        fontSize: "0.62rem",
                        fontFamily: "var(--mono)",
                        cursor: "pointer",
                        border: `1px solid ${active ? t.accent : t.ink08}`,
                        background: active ? t.accentBg : "transparent",
                        color: active ? t.accent : t.ink50,
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeCount > 0 && (
            <button
              onClick={() => setFilters({})}
              style={{
                marginTop: "0.6rem",
                background: "none",
                border: "none",
                padding: 0,
                color: t.red,
                fontSize: "0.72rem",
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "var(--body)",
              }}
            >
              Clear all filters
            </button>
          )}

          {/* Page URL filter */}
          {(() => {
            const allPages = [
              ...new Set(issues.map((i) => i.page_url).filter(Boolean)),
            ];
            if (allPages.length <= 1) return null;
            return (
              <div style={{ marginTop: "0.8rem" }}>
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.6rem",
                    color: t.ink50,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "0.35rem",
                  }}
                >
                  Page
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "0.25rem",
                    flexWrap: "wrap",
                    maxHeight: 80,
                    overflowY: "auto",
                  }}
                >
                  {allPages.map((pageUrl) => {
                    const active = filters.page?.includes(pageUrl);
                    let label;
                    try {
                      label = new URL(pageUrl).pathname;
                    } catch {
                      label = pageUrl;
                    }
                    const count = issues.filter(
                      (i) => i.page_url === pageUrl
                    ).length;
                    return (
                      <button
                        key={pageUrl}
                        onClick={() => toggleFilter("page", pageUrl)}
                        style={{
                          padding: "0.2rem 0.45rem",
                          borderRadius: 4,
                          fontSize: "0.62rem",
                          fontFamily: "var(--mono)",
                          cursor: "pointer",
                          border: `1px solid ${active ? t.accent : t.ink08}`,
                          background: active ? t.accentBg : "transparent",
                          color: active ? t.accent : t.ink50,
                          maxWidth: 180,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {label} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
