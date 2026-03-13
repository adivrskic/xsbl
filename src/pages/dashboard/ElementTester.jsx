import { useState, useRef, useCallback } from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  Play,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Copy,
  Check,
  Code,
  Trash2,
} from "lucide-react";
import "../../styles/dashboard.css";
import "../../styles/dashboard-pages.css";

var AXE_CDN =
  "https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js";

var EXAMPLES = [
  {
    label: "Missing alt text",
    html: '<img src="https://placehold.co/300x200" width="300" height="200">',
  },
  {
    label: "Button without label",
    html: '<button style="padding:8px 12px;border:1px solid #ccc;border-radius:4px"><svg width="16" height="16" viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg></button>',
  },
  {
    label: "Empty link",
    html: '<a href="/about"></a>',
  },
  {
    label: "Input without label",
    html: '<input type="email" placeholder="Enter email">',
  },
  {
    label: "Good form",
    html: '<label for="name">Full name</label>\n<input type="text" id="name" autocomplete="name">',
  },
];

function impactColor(impact) {
  if (impact === "critical") return "#c0392b";
  if (impact === "serious") return "#e67e22";
  if (impact === "moderate") return "#b45309";
  return "#888";
}

export default function ElementTester() {
  var { t } = useTheme();
  var [html, setHtml] = useState("");
  var [running, setRunning] = useState(false);
  var [results, setResults] = useState(null);
  var [copied, setCopied] = useState(null);
  var [iframeSrc, setIframeSrc] = useState("");
  var runCountRef = useRef(0);
  var listenerRef = useRef(null);
  var timeoutRef = useRef(null);

  var cleanup = function () {
    if (listenerRef.current) {
      window.removeEventListener("message", listenerRef.current);
      listenerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  var handleTest = useCallback(
    function () {
      if (!html.trim()) return;

      // Validate that input contains actual HTML elements
      // Matches opening tags like <div, <img, <a, <br, <input etc.
      // Also accepts self-closing <br/>, <img />, and void elements
      var hasHtmlTags = /<[a-zA-Z][a-zA-Z0-9]*[\s>/]/.test(html);

      if (!hasHtmlTags) {
        setResults({
          htmlWarning: true,
          message:
            "No HTML elements detected. Paste an HTML snippet containing elements like <img>, <button>, <input>, <a>, <div>, etc.",
        });
        return;
      }

      cleanup();
      setRunning(true);
      setResults(null);

      // Build a complete HTML document with axe-core injected
      var doc =
        '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"></head><body>' +
        html +
        '<script src="' +
        AXE_CDN +
        '"></script>' +
        "<script>" +
        "window.addEventListener('load', function() {" +
        "  setTimeout(function() {" +
        "    if (!window.axe) { window.parent.postMessage({ type: 'axe-error', error: 'axe-core failed to load' }, '*'); return; }" +
        "    axe.run(document.body, {" +
        '      runOnly: { type: "tag", values: ["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22aa","best-practice"] },' +
        '      resultTypes: ["violations","passes","incomplete"]' +
        "    }).then(function(r) {" +
        "      window.parent.postMessage({" +
        "        type: 'axe-results'," +
        "        violations: r.violations," +
        "        passes: r.passes ? r.passes.length : 0," +
        "        incomplete: r.incomplete" +
        "      }, '*');" +
        "    }).catch(function(e) {" +
        "      window.parent.postMessage({ type: 'axe-error', error: String(e) }, '*');" +
        "    });" +
        "  }, 600);" +
        "});" +
        "</script></body></html>";

      // Listen for results from the iframe
      listenerRef.current = function (e) {
        if (!e.data || !e.data.type) return;
        if (e.data.type === "axe-results") {
          cleanup();
          setResults({
            violations: e.data.violations || [],
            passes: e.data.passes || 0,
            incomplete: e.data.incomplete || [],
          });
          setRunning(false);
        }
        if (e.data.type === "axe-error") {
          cleanup();
          setResults({ error: e.data.error });
          setRunning(false);
        }
      };
      window.addEventListener("message", listenerRef.current);

      // Load via srcdoc — avoids cross-origin errors with sandboxed iframes
      runCountRef.current++;
      setIframeSrc(doc);

      // Timeout fallback
      timeoutRef.current = setTimeout(function () {
        cleanup();
        setResults({
          error: "Timed out — axe-core did not respond within 15 seconds",
        });
        setRunning(false);
      }, 15000);
    },
    [html]
  );

  var handleCopy = function (text, id) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(function () {
      setCopied(null);
    }, 1500);
  };

  var totalIssues =
    results && results.violations
      ? results.violations.reduce(function (s, v) {
          return s + (v.nodes ? v.nodes.length : 1);
        }, 0)
      : 0;

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "0.3rem",
        }}
      >
        <Code size={20} color={t.accent} strokeWidth={2} />
        <h1
          style={{
            fontFamily: "var(--serif)",
            fontSize: "1.4rem",
            fontWeight: 700,
            color: t.ink,
            margin: 0,
          }}
        >
          Element Tester
        </h1>
      </div>
      <p
        style={{
          color: t.ink50,
          fontSize: "0.88rem",
          marginBottom: "1.5rem",
        }}
      >
        Paste any HTML snippet and get instant accessibility results powered by
        axe-core — no scan needed.
      </p>

      {/* Example pills */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.25rem",
          marginBottom: "0.8rem",
        }}
      >
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.58rem",
            color: t.ink50,
            padding: "0.25rem 0",
            marginRight: "0.2rem",
          }}
        >
          Try:
        </span>
        {EXAMPLES.map(function (ex) {
          return (
            <button
              key={ex.label}
              onClick={function () {
                setHtml(ex.html);
                setResults(null);
              }}
              style={{
                padding: "0.2rem 0.5rem",
                borderRadius: 5,
                border: "1px solid " + t.ink08,
                background: "none",
                color: t.ink50,
                fontFamily: "var(--mono)",
                fontSize: "0.58rem",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={function (e) {
                e.currentTarget.style.borderColor = t.accent;
                e.currentTarget.style.color = t.accent;
              }}
              onMouseLeave={function (e) {
                e.currentTarget.style.borderColor = t.ink08;
                e.currentTarget.style.color = t.ink50;
              }}
            >
              {ex.label}
            </button>
          );
        })}
      </div>

      {/* Input */}
      <div style={{ marginBottom: "1rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "0.3rem",
          }}
        >
          <label
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.62rem",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: t.ink50,
            }}
          >
            HTML to test
          </label>
          {html && (
            <button
              onClick={function () {
                setHtml("");
                setResults(null);
                setIframeSrc("");
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: t.ink50,
                display: "flex",
                alignItems: "center",
                gap: "0.2rem",
                fontFamily: "var(--mono)",
                fontSize: "0.58rem",
              }}
            >
              <Trash2 size={11} /> Clear
            </button>
          )}
        </div>
        <textarea
          value={html}
          onChange={function (e) {
            setHtml(e.target.value);
          }}
          onKeyDown={function (e) {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleTest();
          }}
          placeholder={
            '<img src="photo.jpg">\n<button><svg>...</svg></button>\n<a href="/page"></a>\n<input type="text">'
          }
          rows={7}
          style={{
            width: "100%",
            padding: "0.7rem",
            borderRadius: 8,
            border: "1.5px solid " + t.ink08,
            background: t.paper,
            color: t.ink,
            fontFamily: "var(--mono)",
            fontSize: "0.78rem",
            lineHeight: 1.7,
            outline: "none",
            resize: "vertical",
            boxSizing: "border-box",
          }}
          onFocus={function (e) {
            e.target.style.borderColor = t.accent + "40";
          }}
          onBlur={function (e) {
            e.target.style.borderColor = t.ink08;
          }}
        />
      </div>

      {/* Run button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <button
          onClick={handleTest}
          disabled={!html.trim() || running}
          style={{
            padding: "0.55rem 1.2rem",
            borderRadius: 8,
            border: "none",
            background: t.accent,
            color: "white",
            fontSize: "0.88rem",
            fontWeight: 600,
            cursor: !html.trim() || running ? "not-allowed" : "pointer",
            opacity: !html.trim() || running ? 0.5 : 1,
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          {running ? (
            <Loader2 size={16} className="xsbl-spin" />
          ) : (
            <Play size={16} fill="white" />
          )}
          {running ? "Testing..." : "Test element"}
        </button>
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.62rem",
            color: t.ink50,
          }}
        >
          {"\u2318"}+Enter · axe-core 4.10.2 · WCAG 2.2 AA
        </span>
      </div>

      {/* Hidden iframe for axe execution — uses srcdoc to avoid cross-origin issues */}
      {iframeSrc && (
        <iframe
          key={"axe-run-" + runCountRef.current}
          srcDoc={iframeSrc}
          sandbox="allow-scripts"
          style={{ display: "none" }}
          title="axe-core test frame"
        />
      )}

      {/* Results */}
      {results && results.htmlWarning && (
        <div
          style={{
            borderRadius: 12,
            border: "1px solid " + t.amber + "30",
            background: t.amber + "06",
            padding: "1.2rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.6rem",
          }}
        >
          <AlertTriangle
            size={18}
            color={t.amber}
            strokeWidth={2}
            style={{ flexShrink: 0, marginTop: 2 }}
          />
          <div>
            <div
              style={{
                fontSize: "0.88rem",
                fontWeight: 600,
                color: t.ink,
                marginBottom: "0.25rem",
              }}
            >
              Not valid HTML
            </div>
            <div
              style={{
                fontSize: "0.78rem",
                color: t.ink50,
                lineHeight: 1.6,
                marginBottom: "0.5rem",
              }}
            >
              {results.message}
            </div>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.68rem",
                color: t.ink50,
                padding: "0.5rem 0.6rem",
                borderRadius: 6,
                background: t.ink04,
                lineHeight: 1.7,
              }}
            >
              {'<img src="photo.jpg">'}
              <br />
              {"<button>Click me</button>"}
              <br />
              {'<input type="email" placeholder="Email">'}
            </div>
          </div>
        </div>
      )}

      {results && !results.htmlWarning && (
        <div
          style={{
            borderRadius: 12,
            border: "1px solid " + t.ink08,
            background: t.cardBg,
            overflow: "hidden",
          }}
        >
          {/* Summary header */}
          <div
            style={{
              padding: "1rem 1.2rem",
              borderBottom: "1px solid " + t.ink08,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: results.error
                ? t.red + "08"
                : totalIssues === 0
                ? t.greenBg || t.ink04
                : t.ink04,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              {results.error ? (
                <AlertTriangle size={16} color={t.red} />
              ) : totalIssues === 0 ? (
                <CheckCircle size={16} color={t.green} />
              ) : (
                <AlertTriangle size={16} color={t.red} />
              )}
              <span
                style={{
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  color: t.ink,
                }}
              >
                {results.error
                  ? "Test failed"
                  : totalIssues === 0
                  ? "No violations found"
                  : totalIssues +
                    " violation" +
                    (totalIssues !== 1 ? "s" : "") +
                    " across " +
                    results.violations.length +
                    " rule" +
                    (results.violations.length !== 1 ? "s" : "")}
              </span>
            </div>
            {results.passes > 0 && (
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.62rem",
                  color: t.green,
                  fontWeight: 600,
                }}
              >
                {results.passes} rules passed
              </span>
            )}
          </div>

          {results.error ? (
            <div
              style={{
                padding: "1rem 1.2rem",
                fontSize: "0.82rem",
                color: t.red,
              }}
            >
              {results.error}
            </div>
          ) : results.violations.length > 0 ? (
            <div>
              {results.violations.map(function (v, vi) {
                return (
                  <div
                    key={vi}
                    style={{
                      borderTop: vi > 0 ? "1px solid " + t.ink04 : "none",
                    }}
                  >
                    <div
                      style={{
                        padding: "0.8rem 1.2rem",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.6rem",
                      }}
                    >
                      {/* Impact badge */}
                      <span
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "0.52rem",
                          fontWeight: 600,
                          padding: "0.1rem 0.35rem",
                          borderRadius: 3,
                          flexShrink: 0,
                          marginTop: 2,
                          background: impactColor(v.impact) + "15",
                          color: impactColor(v.impact),
                          textTransform: "uppercase",
                        }}
                      >
                        {v.impact}
                      </span>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Rule ID */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            marginBottom: "0.2rem",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "var(--mono)",
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              color: t.accent,
                            }}
                          >
                            {v.id}
                          </span>
                        </div>

                        {/* Description */}
                        <div
                          style={{
                            fontSize: "0.78rem",
                            color: t.ink50,
                            lineHeight: 1.5,
                            marginBottom: "0.4rem",
                          }}
                        >
                          {v.description || v.help}
                        </div>

                        {/* WCAG tags */}
                        {v.tags && (
                          <div
                            style={{
                              display: "flex",
                              gap: "0.2rem",
                              flexWrap: "wrap",
                              marginBottom: "0.4rem",
                            }}
                          >
                            {v.tags
                              .filter(function (tag) {
                                return (
                                  tag.indexOf("wcag") === 0 ||
                                  tag === "best-practice"
                                );
                              })
                              .map(function (tag) {
                                return (
                                  <span
                                    key={tag}
                                    style={{
                                      fontFamily: "var(--mono)",
                                      fontSize: "0.48rem",
                                      fontWeight: 600,
                                      padding: "0.05rem 0.25rem",
                                      borderRadius: 3,
                                      background: t.accent + "12",
                                      color: t.accent,
                                    }}
                                  >
                                    {tag}
                                  </span>
                                );
                              })}
                          </div>
                        )}

                        {/* Affected nodes */}
                        {v.nodes &&
                          v.nodes.map(function (node, ni) {
                            return (
                              <div
                                key={ni}
                                style={{
                                  padding: "0.5rem 0.7rem",
                                  borderRadius: 6,
                                  background: t.ink04,
                                  marginBottom: "0.3rem",
                                  border: "1px solid " + t.ink08,
                                }}
                              >
                                {/* HTML snippet */}
                                {node.html && (
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "flex-start",
                                      justifyContent: "space-between",
                                      gap: "0.5rem",
                                      marginBottom: node.failureSummary
                                        ? "0.4rem"
                                        : 0,
                                    }}
                                  >
                                    <code
                                      style={{
                                        fontFamily: "var(--mono)",
                                        fontSize: "0.68rem",
                                        color: t.ink50,
                                        wordBreak: "break-all",
                                        lineHeight: 1.5,
                                      }}
                                    >
                                      {node.html.length > 200
                                        ? node.html.substring(0, 200) + "..."
                                        : node.html}
                                    </code>
                                    <button
                                      onClick={function () {
                                        handleCopy(node.html, vi + "-" + ni);
                                      }}
                                      style={{
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        color: t.ink50,
                                        padding: "0.1rem",
                                        display: "flex",
                                        flexShrink: 0,
                                      }}
                                      title="Copy HTML"
                                    >
                                      {copied === vi + "-" + ni ? (
                                        <Check size={12} color={t.green} />
                                      ) : (
                                        <Copy size={12} />
                                      )}
                                    </button>
                                  </div>
                                )}

                                {/* Fix suggestion */}
                                {node.failureSummary && (
                                  <div
                                    style={{
                                      fontSize: "0.68rem",
                                      color: t.green,
                                      lineHeight: 1.5,
                                      padding: "0.3rem 0.5rem",
                                      borderRadius: 4,
                                      background: (t.greenBg || t.ink04) + "",
                                    }}
                                  >
                                    <strong>Fix:</strong>{" "}
                                    {node.failureSummary
                                      .replace(
                                        /^Fix any of the following:\n?/i,
                                        ""
                                      )
                                      .replace(
                                        /^Fix all of the following:\n?/i,
                                        ""
                                      )
                                      .trim()}
                                  </div>
                                )}
                              </div>
                            );
                          })}

                        {/* Help link */}
                        {v.helpUrl && (
                          <a
                            href={v.helpUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontFamily: "var(--mono)",
                              fontSize: "0.6rem",
                              color: t.accent,
                              textDecoration: "none",
                            }}
                          >
                            Learn more →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                padding: "2rem 1.2rem",
                textAlign: "center",
              }}
            >
              <CheckCircle
                size={28}
                color={t.green}
                style={{ marginBottom: "0.5rem", opacity: 0.5 }}
              />
              <div
                style={{
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  color: t.ink,
                  marginBottom: "0.3rem",
                }}
              >
                All clear
              </div>
              <div style={{ fontSize: "0.76rem", color: t.ink50 }}>
                This HTML passes all WCAG 2.2 AA automated checks.
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes xsbl-spin { to { transform: rotate(360deg); } }
        .xsbl-spin { animation: xsbl-spin 0.6s linear infinite; }
      `}</style>
    </div>
  );
}
