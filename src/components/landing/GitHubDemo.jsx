import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  Check,
  Sparkles,
  Search,
  GitPullRequest,
  AlertCircle,
  Play,
  RefreshCw,
  ShieldCheck,
  Terminal,
  GitBranch,
  ChevronRight,
  FileCode,
  ArrowRight,
} from "lucide-react";
import SegmentedControl from "./SegmentedControl";

/* ═══════════════════════════════════════════
   SHARED DATA & COMPONENTS
   ═══════════════════════════════════════════ */

var ISSUES = [
  {
    rule: "color-contrast",
    impact: "critical",
    count: 6,
    file: "Hero.tsx",
    line: 42,
    wcag: "1.4.3",
  },
  {
    rule: "button-name",
    impact: "critical",
    count: 1,
    file: "Nav.tsx",
    line: 18,
    wcag: "4.1.2",
  },
  {
    rule: "image-alt",
    impact: "serious",
    count: 3,
    file: "Gallery.tsx",
    line: 91,
    wcag: "1.1.1",
  },
  {
    rule: "heading-order",
    impact: "moderate",
    count: 2,
    file: "Blog.tsx",
    line: 7,
    wcag: "1.3.1",
  },
  {
    rule: "link-name",
    impact: "serious",
    count: 2,
    file: "Footer.tsx",
    line: 34,
    wcag: "2.4.4",
  },
];

var IMPACT_COLORS = {
  critical: { bg: "#c0392b15", text: "#c0392b", border: "#c0392b30" },
  serious: { bg: "#b4530915", text: "#b45309", border: "#b4530930" },
  moderate: { bg: "#4338f015", text: "#4338f0", border: "#4338f030" },
  minor: { bg: "#99999915", text: "#999", border: "#99999930" },
};

function ImpactDot({ impact }) {
  var c = IMPACT_COLORS[impact] || IMPACT_COLORS.minor;
  return (
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: c.text,
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  );
}

function ImpactBadge({ impact }) {
  var c = IMPACT_COLORS[impact] || IMPACT_COLORS.minor;
  return (
    <span
      style={{
        fontFamily: "var(--mono)",
        fontSize: "0.52rem",
        fontWeight: 700,
        padding: "0.08rem 0.35rem",
        borderRadius: 3,
        background: c.bg,
        color: c.text,
        textTransform: "uppercase",
        letterSpacing: "0.03em",
        flexShrink: 0,
      }}
    >
      {impact}
    </span>
  );
}

function WindowChrome({ title, children, t }) {
  return (
    <div
      style={{
        borderRadius: 10,
        border: "1px solid " + t.ink08,
        background: t.cardBg,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "0.5rem 0.75rem",
          borderBottom: "1px solid " + t.ink08,
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: t.paper,
        }}
      >
        <div style={{ display: "flex", gap: 4 }}>
          {["#ff5f57", "#ffbd2e", "#28ca41"].map(function (c) {
            return (
              <span
                key={c}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: c,
                }}
              />
            );
          })}
        </div>
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.62rem",
            color: t.ink50,
          }}
        >
          {title}
        </span>
      </div>
      <div style={{ padding: "0.8rem" }}>{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MODE 1: FIX PRS — 4-step animated flow
   ═══════════════════════════════════════════ */

var PR_STEPS = [
  { id: "scan", label: "Scan", icon: Search },
  { id: "select", label: "Select", icon: Check },
  { id: "generate", label: "AI Fix", icon: Sparkles },
  { id: "pr", label: "PR Ready", icon: GitPullRequest },
];

function FixPRsMode({ t }) {
  var [step, setStep] = useState(0);
  var [selected, setSelected] = useState({
    0: true,
    1: true,
    2: false,
    3: false,
    4: false,
  });
  var [animating, setAnimating] = useState(false);
  var timerRef = useRef(null);

  var selectedCount = Object.values(selected).filter(Boolean).length;
  var selectedIssueCount = ISSUES.reduce(function (s, issue, i) {
    return s + (selected[i] ? issue.count : 0);
  }, 0);

  var handleAutoPlay = function () {
    if (animating) return;
    setAnimating(true);
    setStep(0);
    setSelected({ 0: false, 1: false, 2: false, 3: false, 4: false });
    var sequence = [
      function () {
        setStep(1);
      },
      function () {
        setSelected({ 0: true, 1: true, 2: false, 3: false, 4: false });
      },
      function () {
        setSelected({ 0: true, 1: true, 2: true, 3: false, 4: false });
      },
      function () {
        setStep(2);
      },
      function () {
        setStep(3);
      },
    ];
    var i = 0;
    function next() {
      if (i < sequence.length) {
        sequence[i]();
        i++;
        timerRef.current = setTimeout(next, 900);
      } else {
        setAnimating(false);
      }
    }
    timerRef.current = setTimeout(next, 600);
  };

  useEffect(function () {
    return function () {
      clearTimeout(timerRef.current);
    };
  }, []);

  var toggleIssue = function (idx) {
    if (step !== 1) return;
    setSelected(function (prev) {
      var next = Object.assign({}, prev);
      next[idx] = !prev[idx];
      return next;
    });
  };

  var DIFF_LINES = [
    { type: "file", text: "Hero.tsx" },
    { type: "ctx", text: "  <h2 className={styles.heading}>" },
    { type: "del", text: '    <span style={{ color: "#aaa" }}>' },
    { type: "add", text: '    <span style={{ color: "#2d2d2d" }}>' },
    { type: "ctx", text: "      {post.title}" },
    { type: "ctx", text: "    </span>" },
    { type: "file", text: "Nav.tsx" },
    { type: "del", text: "  <button onClick={toggle}>" },
    {
      type: "add",
      text: '  <button onClick={toggle} aria-label="Toggle menu">',
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1rem",
        height: 420,
      }}
    >
      {/* Left: step progress + issue list / diff / PR */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.8rem",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {PR_STEPS.map(function (s, i) {
            var Icon = s.icon;
            var active = i === step;
            var done = i < step;
            var color = active ? t.accent : done ? t.green : t.ink20;
            return (
              <div
                key={s.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  flex: i < PR_STEPS.length - 1 ? 1 : "none",
                }}
              >
                <button
                  onClick={function () {
                    if (!animating) setStep(i);
                  }}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    border: "2px solid " + color,
                    background: done
                      ? t.green
                      : active
                      ? t.accent + "15"
                      : "transparent",
                    color: done ? "white" : active ? t.accent : t.ink50,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: animating ? "default" : "pointer",
                    transition: "all 0.3s",
                    flexShrink: 0,
                  }}
                >
                  {done ? (
                    <Check size={14} strokeWidth={2.5} />
                  ) : (
                    <Icon size={14} strokeWidth={2} />
                  )}
                </button>
                {i < PR_STEPS.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: 2,
                      margin: "0 0.3rem",
                      background: done ? t.green : t.ink08,
                      borderRadius: 1,
                      transition: "background 0.3s",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.6rem",
            color: t.ink50,
          }}
        >
          {PR_STEPS[step].label}
        </div>

        {/* Animated content */}
        <div
          key={step}
          style={{
            animation: "ghFadeIn 0.3s ease",
            flex: 1,
            overflowY: "auto",
            minHeight: 0,
          }}
        >
          {step === 0 && (
            <WindowChrome title="xsbl — scan complete" t={t}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.6rem",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: t.red + "15",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AlertCircle size={16} color={t.red} strokeWidth={2} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.86rem",
                      fontWeight: 600,
                      color: t.ink,
                    }}
                  >
                    14 violations found
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.58rem",
                      color: t.ink50,
                    }}
                  >
                    across 5 pages · 4 files affected
                  </div>
                </div>
              </div>
              {ISSUES.map(function (issue, i) {
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      padding: "0.35rem 0.5rem",
                      borderRadius: 5,
                      background: i % 2 === 0 ? t.ink04 : "transparent",
                      fontSize: "0.74rem",
                    }}
                  >
                    <ImpactDot impact={issue.impact} />
                    <span style={{ color: t.ink, fontWeight: 500, flex: 1 }}>
                      {issue.rule}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "0.58rem",
                        color: t.ink50,
                      }}
                    >
                      ×{issue.count}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "0.55rem",
                        color: t.ink50,
                      }}
                    >
                      {issue.file}:{issue.line}
                    </span>
                  </div>
                );
              })}
            </WindowChrome>
          )}

          {step === 1 && (
            <WindowChrome title="xsbl — select issues to fix" t={t}>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.55rem",
                  color: t.ink50,
                  marginBottom: "0.5rem",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>
                  {selectedCount} selected ({selectedIssueCount} instances)
                </span>
                <button
                  onClick={function () {
                    setSelected({
                      0: true,
                      1: true,
                      2: true,
                      3: true,
                      4: true,
                    });
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: t.accent,
                    cursor: "pointer",
                    fontFamily: "var(--mono)",
                    fontSize: "0.55rem",
                    fontWeight: 600,
                  }}
                >
                  Select all
                </button>
              </div>
              {ISSUES.map(function (issue, i) {
                var on = selected[i];
                return (
                  <div
                    key={i}
                    onClick={function () {
                      toggleIssue(i);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.4rem 0.5rem",
                      borderRadius: 6,
                      marginBottom: "0.2rem",
                      border:
                        "1px solid " + (on ? t.accent + "30" : "transparent"),
                      background: on ? t.accent + "06" : "transparent",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        border: "1.5px solid " + (on ? t.accent : t.ink20),
                        background: on ? t.accent : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                        flexShrink: 0,
                      }}
                    >
                      {on && <Check size={10} color="white" strokeWidth={3} />}
                    </span>
                    <ImpactBadge impact={issue.impact} />
                    <span
                      style={{
                        fontSize: "0.76rem",
                        color: t.ink,
                        fontWeight: 500,
                        flex: 1,
                      }}
                    >
                      {issue.rule}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "0.55rem",
                        color: t.ink50,
                      }}
                    >
                      ×{issue.count}
                    </span>
                  </div>
                );
              })}
              {selectedCount > 0 && (
                <button
                  onClick={function () {
                    if (!animating) setStep(2);
                  }}
                  style={{
                    marginTop: "0.6rem",
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: 7,
                    border: "none",
                    background: t.accent,
                    color: "white",
                    fontFamily: "var(--body)",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.3rem",
                  }}
                >
                  <Sparkles size={14} /> Generate fixes for {selectedCount}{" "}
                  issues
                </button>
              )}
            </WindowChrome>
          )}

          {step === 2 && (
            <WindowChrome title="xsbl — generating fix" t={t}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  marginBottom: "0.6rem",
                }}
              >
                <Sparkles
                  size={15}
                  color={t.accent}
                  style={{ animation: "ghPulse 1.5s ease infinite" }}
                />
                <span
                  style={{ fontSize: "0.82rem", fontWeight: 600, color: t.ink }}
                >
                  AI writing fixes…
                </span>
              </div>
              <div
                style={{
                  borderRadius: 6,
                  overflow: "hidden",
                  border: "1px solid " + t.ink08,
                }}
              >
                {DIFF_LINES.map(function (l, i) {
                  var bg =
                    l.type === "del"
                      ? t.red + "08"
                      : l.type === "add"
                      ? t.green + "08"
                      : l.type === "file"
                      ? t.ink04
                      : "transparent";
                  var color =
                    l.type === "del"
                      ? t.red
                      : l.type === "add"
                      ? t.green
                      : l.type === "file"
                      ? t.accent
                      : t.ink;
                  var prefix =
                    l.type === "del"
                      ? "−"
                      : l.type === "add"
                      ? "+"
                      : l.type === "file"
                      ? ""
                      : " ";
                  return (
                    <div
                      key={i}
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "0.62rem",
                        lineHeight: 1.8,
                        padding: "0 0.6rem",
                        background: bg,
                        color: color,
                        display: "flex",
                        gap: "0.5rem",
                        whiteSpace: "pre",
                        animation: "ghLineIn 0.3s ease " + i * 0.08 + "s both",
                      }}
                    >
                      {l.type === "file" ? (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3rem",
                          }}
                        >
                          <FileCode size={10} />
                          {l.text}
                        </span>
                      ) : (
                        <>
                          <span
                            style={{
                              width: 12,
                              textAlign: "center",
                              opacity: 0.6,
                              flexShrink: 0,
                            }}
                          >
                            {prefix}
                          </span>
                          <span>{l.text}</span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.58rem",
                  color: t.ink50,
                  marginTop: "0.5rem",
                }}
              >
                Fixing {selectedIssueCount} instances across {selectedCount}{" "}
                rules…
              </div>
            </WindowChrome>
          )}

          {step === 3 && (
            <WindowChrome title="github.com — pull request" t={t}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                <span
                  style={{
                    padding: "0.15rem 0.5rem",
                    borderRadius: 12,
                    background: "#1a875420",
                    color: "#1a8754",
                    fontFamily: "var(--mono)",
                    fontSize: "0.58rem",
                    fontWeight: 700,
                  }}
                >
                  Open
                </span>
                <span
                  style={{ fontSize: "0.88rem", fontWeight: 600, color: t.ink }}
                >
                  fix(a11y): resolve {selectedIssueCount} accessibility issues
                </span>
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.56rem",
                  color: t.ink50,
                  marginBottom: "0.6rem",
                }}
              >
                xsbl-bot wants to merge into{" "}
                <span
                  style={{
                    padding: "0.08rem 0.35rem",
                    borderRadius: 3,
                    background: t.accent + "12",
                    color: t.accent,
                  }}
                >
                  main
                </span>{" "}
                from{" "}
                <span
                  style={{
                    padding: "0.08rem 0.35rem",
                    borderRadius: 3,
                    background: t.accent + "12",
                    color: t.accent,
                  }}
                >
                  xsbl/fix-a11y
                </span>
              </div>
              {ISSUES.filter(function (_, i) {
                return selected[i];
              }).map(function (issue, i) {
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      padding: "0.3rem 0",
                      fontSize: "0.74rem",
                    }}
                  >
                    <Check size={13} color={t.green} strokeWidth={2.5} />
                    <ImpactBadge impact={issue.impact} />
                    <span style={{ color: t.ink }}>
                      {issue.rule}{" "}
                      <span style={{ color: t.ink50 }}>×{issue.count}</span>
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "0.52rem",
                        color: t.ink50,
                        marginLeft: "auto",
                      }}
                    >
                      WCAG {issue.wcag}
                    </span>
                  </div>
                );
              })}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "0.6rem",
                  paddingTop: "0.5rem",
                  borderTop: "1px solid " + t.ink08,
                }}
              >
                <span
                  style={{ fontFamily: "var(--mono)", fontSize: "0.58rem" }}
                >
                  <span style={{ color: t.green, fontWeight: 600 }}>+47</span>{" "}
                  <span style={{ color: t.red, fontWeight: 600 }}>-12</span>{" "}
                  <span style={{ color: t.ink50 }}>
                    across {selectedCount} files
                  </span>
                </span>
                <span
                  style={{
                    padding: "0.35rem 0.8rem",
                    borderRadius: 6,
                    background: "#1a8754",
                    color: "white",
                    fontFamily: "var(--body)",
                    fontSize: "0.76rem",
                    fontWeight: 600,
                  }}
                >
                  Merge pull request
                </span>
              </div>
            </WindowChrome>
          )}
        </div>
      </div>

      {/* Right: feature bullets + play button */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "0.8rem",
        }}
      >
        <div
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            color: t.ink,
            fontFamily: "var(--serif)",
            lineHeight: 1.3,
          }}
        >
          Scan. Select. Ship.
        </div>
        <p
          style={{
            fontSize: "0.82rem",
            color: t.ink50,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          xsbl reads your source code, generates contextual fixes with AI, and
          opens a pull request — ready to review and merge.
        </p>

        {[
          { icon: Search, text: "Scans rendered DOM in a real browser" },
          {
            icon: Check,
            text: "Select individual issues or bulk-fix all critical",
          },
          {
            icon: Sparkles,
            text: "AI writes fixes that match your actual codebase",
          },
          {
            icon: GitPullRequest,
            text: "Clean PRs with WCAG citations and commit messages",
          },
          {
            icon: GitBranch,
            text: "Up to 20 issues per PR — one branch, one review",
          },
        ].map(function (item, i) {
          var Icon = item.icon;
          var isActiveStep = i <= 3 && i === step;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.5rem",
                padding: "0.4rem 0.5rem",
                borderRadius: 6,
                background: isActiveStep ? t.accent + "08" : "transparent",
                transition: "background 0.2s",
              }}
            >
              <Icon
                size={14}
                color={isActiveStep ? t.accent : t.ink50}
                strokeWidth={1.8}
                style={{ marginTop: 2, flexShrink: 0 }}
              />
              <span
                style={{
                  fontSize: "0.78rem",
                  color: isActiveStep ? t.ink : t.ink50,
                  lineHeight: 1.5,
                }}
              >
                {item.text}
              </span>
            </div>
          );
        })}

        <button
          onClick={handleAutoPlay}
          disabled={animating}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.4rem",
            padding: "0.6rem 1.2rem",
            borderRadius: 8,
            border: "none",
            background: animating ? t.ink08 : t.accent,
            color: animating ? t.ink50 : "white",
            fontFamily: "var(--body)",
            fontSize: "0.84rem",
            fontWeight: 600,
            cursor: animating ? "default" : "pointer",
            transition: "all 0.2s",
            marginTop: "0.3rem",
          }}
        >
          <Play size={14} fill={animating ? t.ink50 : "white"} />
          {animating ? "Running…" : "Watch the full flow"}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MODE 2: GITHUB ISSUES
   ═══════════════════════════════════════════ */

function GitHubIssuesMode({ t }) {
  var [created, setCreated] = useState({});
  var createdCount = Object.values(created).filter(Boolean).length;

  var handleCreate = function (i) {
    setCreated(function (prev) {
      var next = Object.assign({}, prev);
      next[i] = true;
      return next;
    });
  };

  var handleBulk = function () {
    var all = {};
    ISSUES.forEach(function (_, i) {
      all[i] = true;
    });
    setCreated(all);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1rem",
        height: 420,
      }}
    >
      {/* Left: issue list with create buttons */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "0.6rem",
          }}
        >
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.58rem",
              color: t.ink50,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Accessibility issues
          </div>
          {createdCount < ISSUES.length && (
            <button
              onClick={handleBulk}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                padding: "0.25rem 0.6rem",
                borderRadius: 5,
                border: "1px solid " + t.accent + "40",
                background: t.accent + "08",
                color: t.accent,
                fontFamily: "var(--mono)",
                fontSize: "0.55rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <AlertCircle size={10} /> Create all as issues
            </button>
          )}
        </div>

        {ISSUES.map(function (issue, i) {
          var done = created[i];
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 0.6rem",
                borderRadius: 7,
                marginBottom: "0.3rem",
                border: "1px solid " + (done ? t.green + "25" : t.ink08),
                background: done ? t.green + "04" : t.cardBg,
                transition: "all 0.25s",
              }}
            >
              <ImpactDot impact={issue.impact} />
              <div style={{ flex: 1 }}>
                <div
                  style={{ fontSize: "0.78rem", fontWeight: 500, color: t.ink }}
                >
                  {issue.rule}
                </div>
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.55rem",
                    color: t.ink50,
                  }}
                >
                  {issue.file}:{issue.line} · ×{issue.count} · WCAG {issue.wcag}
                </div>
              </div>
              {done ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.2rem",
                    fontFamily: "var(--mono)",
                    fontSize: "0.55rem",
                    color: t.green,
                    fontWeight: 600,
                  }}
                >
                  <Check size={11} strokeWidth={2.5} /> Created
                </span>
              ) : (
                <button
                  onClick={function () {
                    handleCreate(i);
                  }}
                  style={{
                    padding: "0.2rem 0.5rem",
                    borderRadius: 5,
                    border: "1px solid " + t.ink08,
                    background: "none",
                    color: t.ink50,
                    fontFamily: "var(--mono)",
                    fontSize: "0.55rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.2rem",
                  }}
                >
                  <AlertCircle size={10} /> Create
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Right: preview of created issue */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
        <div
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            color: t.ink,
            fontFamily: "var(--serif)",
            lineHeight: 1.3,
          }}
        >
          Track issues where your team works
        </div>
        <p
          style={{
            fontSize: "0.82rem",
            color: t.ink50,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          Create GitHub Issues directly from scan results — individually or in
          bulk. Each issue includes the WCAG criterion, code location, severity,
          and a direct link back to xsbl.
        </p>

        {/* Preview card */}
        <WindowChrome
          title={
            "github.com — " +
            (createdCount > 0 ? "issue created" : "issue preview")
          }
          t={t}
        >
          {createdCount > 0 ? (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  marginBottom: "0.4rem",
                }}
              >
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: "#1a8754",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AlertCircle size={9} color="white" strokeWidth={2.5} />
                </span>
                <span
                  style={{ fontSize: "0.84rem", fontWeight: 600, color: t.ink }}
                >
                  a11y:{" "}
                  {
                    ISSUES[
                      Object.keys(created).find(function (k) {
                        return created[k];
                      }) || 0
                    ].rule
                  }
                </span>
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.58rem",
                  color: t.ink50,
                  marginBottom: "0.5rem",
                }}
              >
                xsbl-bot opened this issue · just now
              </div>
              <div
                style={{
                  padding: "0.5rem",
                  borderRadius: 6,
                  background: t.ink04,
                  fontSize: "0.72rem",
                  color: t.ink50,
                  lineHeight: 1.6,
                }}
              >
                <strong style={{ color: t.ink }}>WCAG {ISSUES[0].wcag}</strong>{" "}
                violation found in{" "}
                <code
                  style={{
                    fontSize: "0.66rem",
                    padding: "0.1rem 0.3rem",
                    borderRadius: 3,
                    background: t.ink08,
                  }}
                >
                  {ISSUES[0].file}:{ISSUES[0].line}
                </code>
                <br />
                <br />
                Impact: <ImpactBadge impact={ISSUES[0].impact} /> ·{" "}
                {ISSUES[0].count} instances
                <br />
                <br />
                <span style={{ color: t.accent }}>View in xsbl →</span>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "0.3rem",
                  marginTop: "0.5rem",
                  flexWrap: "wrap",
                }}
              >
                {[
                  "accessibility",
                  "wcag-" + ISSUES[0].wcag,
                  ISSUES[0].impact,
                ].map(function (label) {
                  return (
                    <span
                      key={label}
                      style={{
                        padding: "0.1rem 0.4rem",
                        borderRadius: 10,
                        border: "1px solid " + t.ink08,
                        fontFamily: "var(--mono)",
                        fontSize: "0.52rem",
                        color: t.ink50,
                      }}
                    >
                      {label}
                    </span>
                  );
                })}
              </div>
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "1.5rem 0",
                color: t.ink50,
                fontSize: "0.78rem",
              }}
            >
              <AlertCircle
                size={20}
                color={t.ink20}
                style={{ marginBottom: "0.3rem" }}
              />
              <br />
              Click "Create" on any issue to see the GitHub Issue preview
            </div>
          )}
        </WindowChrome>

        {createdCount > 0 && (
          <div
            style={{
              padding: "0.5rem 0.7rem",
              borderRadius: 7,
              background: t.green + "08",
              border: "1px solid " + t.green + "20",
              fontFamily: "var(--mono)",
              fontSize: "0.62rem",
              color: t.green,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              animation: "ghFadeIn 0.3s ease",
            }}
          >
            <Check size={12} strokeWidth={2.5} />
            {createdCount} issue{createdCount !== 1 ? "s" : ""} created in
            your-org/your-repo
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MODE 3: CI/CD — automated scanning
   ═══════════════════════════════════════════ */

function CICDMode({ t }) {
  var [running, setRunning] = useState(false);
  var [done, setDone] = useState(false);
  var [logLines, setLogLines] = useState([]);
  var timerRef = useRef(null);

  var ALL_LINES = [
    { text: "$ git push origin main", type: "cmd" },
    { text: "→ Triggering xsbl accessibility scan…", type: "info" },
    { text: "  Scanning 6 pages in Chromium…", type: "info" },
    { text: "  Page 1/6: / ..................... ✓", type: "ok" },
    { text: "  Page 2/6: /pricing .............. ✓", type: "ok" },
    { text: "  Page 3/6: /blog ................. ✓", type: "ok" },
    { text: "  Page 4/6: /docs ................. ✓", type: "ok" },
    { text: "  Page 5/6: /contact .............. ✓", type: "ok" },
    { text: "  Page 6/6: /signup ............... ✓", type: "ok" },
    { text: "", type: "blank" },
    { text: "  ♿ Accessibility Scan Results", type: "header" },
    { text: "  ┌────────────┬────────┐", type: "dim" },
    { text: "  │ Score      │  94    │", type: "val" },
    { text: "  │ Issues     │   3    │", type: "val" },
    { text: "  │ Pages      │   6    │", type: "val" },
    { text: "  │ Threshold  │  70    │", type: "val" },
    { text: "  └────────────┴────────┘", type: "dim" },
    { text: "", type: "blank" },
    {
      text: "  ✅ Score 94 meets threshold 70 — pipeline passed",
      type: "success",
    },
  ];

  var handleRun = function () {
    setRunning(true);
    setDone(false);
    setLogLines([]);
    var i = 0;
    function addLine() {
      if (i < ALL_LINES.length) {
        var current = i;
        var line = ALL_LINES[current];
        setLogLines(function (prev) {
          return prev.concat([line]);
        });
        i++;
        var delay =
          line.type === "blank" ? 300 : line.type === "cmd" ? 600 : 180;
        timerRef.current = setTimeout(addLine, delay);
      } else {
        setRunning(false);
        setDone(true);
      }
    }
    timerRef.current = setTimeout(addLine, 400);
  };

  useEffect(function () {
    return function () {
      clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1rem",
        height: 420,
      }}
    >
      {/* Left: terminal */}
      <div
        style={{
          borderRadius: 10,
          overflow: "hidden",
          border: "1px solid " + t.ink08,
          background: "#1a1a2e",
          color: "#e0e0e0",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "0.5rem 0.75rem",
            borderBottom: "1px solid #2a2a4a",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <div style={{ display: "flex", gap: 4 }}>
            {["#ff5f57", "#ffbd2e", "#28ca41"].map(function (c) {
              return (
                <span
                  key={c}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: c,
                    opacity: 0.8,
                  }}
                />
              );
            })}
          </div>
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.58rem",
              color: "#888",
            }}
          >
            <Terminal
              size={10}
              style={{ verticalAlign: "middle", marginRight: 3 }}
            />
            GitHub Actions — Accessibility Scan
          </span>
          {running && (
            <span
              style={{
                marginLeft: "auto",
                fontFamily: "var(--mono)",
                fontSize: "0.52rem",
                color: "#ffbd2e",
              }}
            >
              Running…
            </span>
          )}
          {done && (
            <span
              style={{
                marginLeft: "auto",
                fontFamily: "var(--mono)",
                fontSize: "0.52rem",
                color: "#28ca41",
              }}
            >
              Passed ✓
            </span>
          )}
        </div>
        <div
          style={{
            padding: "0.6rem 0.8rem",
            flex: 1,
            fontFamily: "var(--mono)",
            fontSize: "0.6rem",
            lineHeight: 1.7,
            overflowY: "auto",
          }}
        >
          {logLines.length === 0 && !running && (
            <div
              style={{ color: "#555", textAlign: "center", paddingTop: "4rem" }}
            >
              Press "Run pipeline" to simulate a CI scan
            </div>
          )}
          {logLines.map(function (l, i) {
            var color = "#e0e0e0";
            if (l.type === "cmd") color = "#8be9fd";
            if (l.type === "ok") color = "#50fa7b";
            if (l.type === "dim") color = "#555";
            if (l.type === "header") color = "#ffbd2e";
            if (l.type === "success") color = "#50fa7b";
            if (l.type === "info") color = "#999";
            if (l.type === "blank")
              return <div key={i} style={{ height: 8 }} />;
            return (
              <div
                key={i}
                style={{
                  color: color,
                  whiteSpace: "pre",
                  animation: "ghLineIn 0.2s ease",
                }}
              >
                {l.text}
              </div>
            );
          })}
          {running && (
            <span
              style={{
                display: "inline-block",
                animation: "ghBlink 0.8s step-end infinite",
                color: "#8be9fd",
              }}
            >
              ▋
            </span>
          )}
        </div>
      </div>

      {/* Right: features */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "0.8rem",
        }}
      >
        <div
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            color: t.ink,
            fontFamily: "var(--serif)",
            lineHeight: 1.3,
          }}
        >
          Scan on every deploy. Automatically.
        </div>
        <p
          style={{
            fontSize: "0.82rem",
            color: t.ink50,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          Add a GitHub Actions workflow with one click — no YAML to write, no
          secrets to configure. Every push triggers an accessibility scan.
        </p>

        {[
          {
            icon: RefreshCw,
            text: "One-click workflow install — xsbl commits the YAML and sets secrets",
          },
          {
            icon: ShieldCheck,
            text: "Score threshold gate — builds fail if accessibility drops below your minimum",
          },
          {
            icon: Terminal,
            text: "Results in GitHub Actions summary — no context switching needed",
          },
          {
            icon: AlertCircle,
            text: "Auto-create issues when new violations appear in CI",
          },
        ].map(function (item, i) {
          var Icon = item.icon;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.5rem",
                padding: "0.4rem 0.5rem",
                borderRadius: 6,
              }}
            >
              <Icon
                size={14}
                color={t.accent}
                strokeWidth={1.8}
                style={{ marginTop: 2, flexShrink: 0 }}
              />
              <span
                style={{ fontSize: "0.78rem", color: t.ink50, lineHeight: 1.5 }}
              >
                {item.text}
              </span>
            </div>
          );
        })}

        <button
          onClick={handleRun}
          disabled={running}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.4rem",
            padding: "0.6rem 1.2rem",
            borderRadius: 8,
            border: "none",
            background: running ? t.ink08 : t.accent,
            color: running ? t.ink50 : "white",
            fontFamily: "var(--body)",
            fontSize: "0.84rem",
            fontWeight: 600,
            cursor: running ? "default" : "pointer",
            transition: "all 0.2s",
            marginTop: "0.3rem",
          }}
        >
          <Play size={14} fill={running ? t.ink50 : "white"} />
          {running ? "Running…" : done ? "Run again" : "Run pipeline"}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN EXPORT — 3 mode tabs
   ═══════════════════════════════════════════ */

var MODES = [
  { id: "prs", label: "Fix PRs", icon: GitPullRequest },
  { id: "issues", label: "GitHub Issues", icon: AlertCircle },
  { id: "cicd", label: "CI / CD", icon: Terminal },
];

export default function GitHubDemo() {
  var { t } = useTheme();
  var [mode, setMode] = useState("prs");

  return (
    <div className="ghd-root">
      {/* Sub-tabs */}
      <div style={{ marginBottom: "1rem" }}>
        <SegmentedControl
          items={MODES}
          value={mode}
          onChange={setMode}
          size="sm"
        />
      </div>

      {/* Content */}
      <div key={mode} style={{ animation: "ghFadeIn 0.3s ease" }}>
        {mode === "prs" && <FixPRsMode t={t} />}
        {mode === "issues" && <GitHubIssuesMode t={t} />}
        {mode === "cicd" && <CICDMode t={t} />}
      </div>

      <style>{`
        .ghd-root { padding: 0.5rem 0; }
        .ghd-root div[style*="height: 420"] > div {
          overflow: hidden;
          min-height: 0;
        }
        @keyframes ghFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ghPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes ghLineIn { from { opacity: 0; transform: translateX(-4px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes ghBlink { 50% { opacity: 0; } }
        @media (max-width: 700px) {
          .ghd-root div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
            height: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
