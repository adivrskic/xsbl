import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  X,
  Play,
  Globe,
  FileText,
  List,
  Loader2,
  Upload,
  Link2,
  Clipboard,
  Trash2,
  Check,
  AlertTriangle,
  Lock,
  ChevronDown,
  Plus,
} from "lucide-react";
import "../../styles/dashboard.css";
import "../../styles/dashboard-modals.css";

// ── URL helpers ──
function isValidUrl(str) {
  try {
    var u = new URL(str);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch (e) {
    return false;
  }
}

function extractUrlsFromText(text) {
  // Extract anything that looks like an http(s) URL
  var matches = text.match(/https?:\/\/[^\s,;"'<>\)]+/gi);
  return matches || [];
}

function dedupeUrls(urls) {
  var seen = new Set();
  var result = [];
  for (var i = 0; i < urls.length; i++) {
    var clean = urls[i].replace(/\/+$/, "").trim();
    if (!clean || seen.has(clean)) continue;
    seen.add(clean);
    result.push(clean);
  }
  return result;
}

function parseSitemapXml(xml) {
  var urls = [];
  var idx = 0;
  while (true) {
    var ls = xml.indexOf("<loc>", idx);
    if (ls === -1) break;
    var s = ls + 5;
    var e = xml.indexOf("</loc>", s);
    if (e === -1) break;
    var url = xml.substring(s, e).trim();
    if (isValidUrl(url)) urls.push(url);
    idx = e + 6;
  }
  return urls;
}

function parseCsv(text) {
  var urls = [];
  var lines = text.split(/\r?\n/);
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line) continue;
    // Try to find URLs in each line (handles comma, tab, pipe delimiters)
    var cells = line.split(/[,\t|]/);
    for (var j = 0; j < cells.length; j++) {
      var cell = cells[j].trim().replace(/^["']|["']$/g, "");
      if (isValidUrl(cell)) {
        urls.push(cell);
      }
    }
  }
  return urls;
}

export default function ScanConfigModal({
  site,
  plan,
  onScan,
  onClose,
  scanning,
}) {
  var { t } = useTheme();
  var [mode, setMode] = useState("auto");
  var [manualUrls, setManualUrls] = useState("");
  var dialogRef = useRef(null);
  var previousFocus = useRef(null);
  var fileRef = useRef(null);

  // Bulk import state
  var [bulkSource, setBulkSource] = useState(null); // "csv", "sitemap", "paste"
  var [bulkUrls, setBulkUrls] = useState([]);
  var [bulkLoading, setBulkLoading] = useState(false);
  var [bulkError, setBulkError] = useState(null);
  var [sitemapInput, setSitemapInput] = useState(
    (site.domain.startsWith("http") ? site.domain : "https://" + site.domain) +
      "/sitemap.xml"
  );
  var [pasteInput, setPasteInput] = useState("");
  var [bulkFileName, setBulkFileName] = useState(null);

  // Auth state
  var [showAuth, setShowAuth] = useState(false);
  var [authType, setAuthType] = useState("none"); // "none", "basic", "header", "cookie"
  var [basicUser, setBasicUser] = useState("");
  var [basicPass, setBasicPass] = useState("");
  var [customHeaders, setCustomHeaders] = useState([{ key: "", value: "" }]);
  var [customCookies, setCustomCookies] = useState([{ name: "", value: "" }]);

  useEffect(
    function () {
      previousFocus.current = document.activeElement;
      var dialog = dialogRef.current;
      if (dialog) {
        var close = dialog.querySelector("button");
        if (close) close.focus();
      }
      var handleKeyDown = function (e) {
        if (e.key === "Escape") {
          onClose();
          return;
        }
        if (e.key === "Tab" && dialog) {
          var focusable = dialog.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length === 0) return;
          var first = focusable[0];
          var last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return function () {
        document.removeEventListener("keydown", handleKeyDown);
        if (previousFocus.current) previousFocus.current.focus();
      };
    },
    [onClose]
  );

  var PAGE_LIMITS = { free: 5, starter: 10, pro: 25, agency: 50 };
  var maxPages = PAGE_LIMITS[plan] || PAGE_LIMITS.free;

  var handleScan = function () {
    var config = {};
    if (mode === "manual") {
      var urls = manualUrls
        .split("\n")
        .map(function (u) {
          return u.trim();
        })
        .filter(function (u) {
          return u.length > 0;
        })
        .slice(0, maxPages);
      config.urls = urls;
    } else if (mode === "bulk") {
      config.urls = bulkUrls.slice(0, maxPages);
    }

    // Build auth config
    if (authType === "basic" && basicUser.trim()) {
      config.scan_auth = {
        basic_auth: { username: basicUser.trim(), password: basicPass },
      };
    } else if (authType === "header") {
      var validHeaders = customHeaders.filter(function (h) {
        return h.key.trim() && h.value.trim();
      });
      if (validHeaders.length > 0) {
        config.scan_auth = { headers: validHeaders };
      }
    } else if (authType === "cookie") {
      var validCookies = customCookies.filter(function (c) {
        return c.name.trim() && c.value.trim();
      });
      if (validCookies.length > 0) {
        config.scan_auth = { cookies: validCookies };
      }
    }

    onScan(config);
  };

  // ── CSV file handler ──
  var handleFileUpload = function (e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    setBulkLoading(true);
    setBulkError(null);
    setBulkFileName(file.name);

    var reader = new FileReader();
    reader.onload = function (ev) {
      var text = ev.target.result;
      var urls = [];

      if (file.name.endsWith(".xml")) {
        urls = parseSitemapXml(text);
      } else {
        // CSV, TSV, or plain text
        urls = parseCsv(text);
        // Fallback: extract URLs from raw text if CSV parse found nothing
        if (urls.length === 0) {
          urls = extractUrlsFromText(text);
        }
      }

      urls = dedupeUrls(urls);

      if (urls.length === 0) {
        setBulkError(
          "No valid URLs found in " +
            file.name +
            ". Expected http/https URLs in a CSV, XML sitemap, or plain text file."
        );
      } else {
        setBulkError(null);
      }
      setBulkUrls(urls);
      setBulkLoading(false);
      setBulkSource("csv");
    };
    reader.onerror = function () {
      setBulkError("Failed to read file");
      setBulkLoading(false);
    };
    reader.readAsText(file);

    // Reset file input so same file can be re-uploaded
    e.target.value = "";
  };

  // ── Sitemap fetch handler ──
  var handleFetchSitemap = async function () {
    var url = sitemapInput.trim();
    if (!url) return;
    setBulkLoading(true);
    setBulkError(null);
    setBulkFileName(null);

    try {
      var res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error("HTTP " + res.status);
      var text = await res.text();
      var urls = parseSitemapXml(text);

      // If it looks like a sitemap index, try to parse nested sitemaps
      if (urls.length === 0 && text.indexOf("<sitemap>") !== -1) {
        // It's a sitemap index — extract child sitemap URLs
        var childUrls = parseSitemapXml(
          text.replace(/<sitemap>/g, "<url>").replace(/<\/sitemap>/g, "</url>")
        );
        if (childUrls.length > 0) {
          setBulkError(
            "This is a sitemap index with " +
              childUrls.length +
              " child sitemaps. Try one of the individual sitemap URLs directly."
          );
          setBulkUrls([]);
          setBulkLoading(false);
          setBulkSource("sitemap");
          return;
        }
      }

      urls = dedupeUrls(urls);
      if (urls.length === 0) {
        setBulkError(
          "No URLs found in the sitemap. Make sure it's a valid XML sitemap with <loc> entries."
        );
      }
      setBulkUrls(urls);
      setBulkSource("sitemap");
    } catch (err) {
      var msg = "Failed to fetch sitemap";
      if (err.name === "AbortError" || err.name === "TimeoutError")
        msg = "Sitemap request timed out";
      else if (err.message) msg = "Sitemap fetch failed: " + err.message;
      setBulkError(
        msg +
          ". This might be blocked by CORS — try uploading the file instead."
      );
      setBulkUrls([]);
    }
    setBulkLoading(false);
  };

  // ── Paste handler ──
  var handleParsePaste = function () {
    var urls = extractUrlsFromText(pasteInput);
    urls = dedupeUrls(urls);
    if (urls.length === 0) {
      setBulkError(
        "No valid URLs found. Paste one URL per line or a list of http/https URLs."
      );
    } else {
      setBulkError(null);
    }
    setBulkUrls(urls);
    setBulkSource("paste");
  };

  var handleRemoveBulkUrl = function (index) {
    setBulkUrls(function (prev) {
      return prev.filter(function (_, i) {
        return i !== index;
      });
    });
  };

  var modes = [
    {
      id: "auto",
      label: "Auto-crawl",
      desc: "Discovers pages from sitemap.xml or by following links",
      icon: Globe,
    },
    {
      id: "manual",
      label: "Specific URLs",
      desc: "Type or paste individual page URLs",
      icon: List,
    },
    {
      id: "bulk",
      label: "Bulk import",
      desc: "Upload CSV, fetch sitemap, or paste a list",
      icon: Upload,
    },
  ];

  var scanDisabled =
    scanning ||
    (mode === "manual" && !manualUrls.trim()) ||
    (mode === "bulk" && bulkUrls.length === 0);

  var scanCount =
    mode === "auto"
      ? maxPages
      : mode === "manual"
      ? Math.min(
          manualUrls.split("\n").filter(function (u) {
            return u.trim();
          }).length,
          maxPages
        )
      : Math.min(bulkUrls.length, maxPages);

  return (
    <div
      className="dash-modal"
      onClick={function (e) {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="scan-config-title"
        className="dash-modal__dialog"
        style={{ maxWidth: 520 }}
      >
        <div className="dash-modal__header">
          <h3 id="scan-config-title" className="dash-modal__title">
            Configure scan
          </h3>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="dash-modal__close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="dash-modal__body">
          <p className="dash-modal__desc">
            Scanning{" "}
            <strong style={{ color: "var(--ink)" }}>{site.domain}</strong> — up
            to {maxPages} pages on your{" "}
            <span
              style={{
                color: "var(--accent)",
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            >
              {plan}
            </span>{" "}
            plan.
          </p>

          {/* Mode selection */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem",
              marginBottom: "1.2rem",
            }}
          >
            {modes.map(function (m) {
              var Icon = m.icon;
              var active = mode === m.id;
              return (
                <div
                  key={m.id}
                  onClick={function () {
                    setMode(m.id);
                    setBulkError(null);
                  }}
                  className={
                    "dash-option" + (active ? " dash-option--active" : "")
                  }
                >
                  <div className="dash-option__label">
                    <Icon
                      size={15}
                      color={active ? t.accent : t.ink50}
                      strokeWidth={1.8}
                    />
                    {m.label}
                  </div>
                  <p className="dash-option__desc">{m.desc}</p>
                </div>
              );
            })}
          </div>

          {/* ── Manual URLs ── */}
          {mode === "manual" && (
            <div style={{ marginBottom: "1rem" }}>
              <label className="dash-config-label">
                URLs to scan (one per line, max {maxPages})
              </label>
              <textarea
                value={manualUrls}
                onChange={function (e) {
                  setManualUrls(e.target.value);
                }}
                placeholder={
                  "https://" +
                  site.domain +
                  "/\nhttps://" +
                  site.domain +
                  "/about\nhttps://" +
                  site.domain +
                  "/contact"
                }
                rows={5}
                className="dash-config-textarea"
              />
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.6rem",
                  color: "var(--ink50)",
                  marginTop: "0.2rem",
                }}
              >
                {
                  manualUrls.split("\n").filter(function (u) {
                    return u.trim();
                  }).length
                }{" "}
                / {maxPages} URLs
              </div>
            </div>
          )}

          {/* ── Bulk import ── */}
          {mode === "bulk" && (
            <div style={{ marginBottom: "1rem" }}>
              {/* Source tabs */}
              <div
                style={{
                  display: "flex",
                  gap: "0.3rem",
                  marginBottom: "0.8rem",
                }}
              >
                {[
                  { id: "csv", label: "Upload file", icon: Upload },
                  { id: "sitemap", label: "Sitemap URL", icon: Link2 },
                  { id: "paste", label: "Paste list", icon: Clipboard },
                ].map(function (tab) {
                  var TabIcon = tab.icon;
                  var active = bulkSource === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={function () {
                        setBulkSource(tab.id);
                        setBulkError(null);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        padding: "0.35rem 0.65rem",
                        borderRadius: 6,
                        border: "1.5px solid " + (active ? t.accent : t.ink08),
                        background: active ? t.accentBg : "none",
                        color: active ? t.accent : t.ink50,
                        fontFamily: "var(--body)",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      <TabIcon size={12} strokeWidth={2} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* CSV upload */}
              {bulkSource === "csv" && (
                <div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv,.tsv,.txt,.xml"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
                  <button
                    onClick={function () {
                      fileRef.current && fileRef.current.click();
                    }}
                    disabled={bulkLoading}
                    style={{
                      width: "100%",
                      padding: "1.2rem",
                      borderRadius: 8,
                      border: "2px dashed " + t.ink08,
                      background: "none",
                      color: t.ink50,
                      fontFamily: "var(--body)",
                      fontSize: "0.82rem",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.3rem",
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
                    {bulkLoading ? (
                      <Loader2 size={20} className="xsbl-spin" />
                    ) : (
                      <Upload size={20} strokeWidth={1.5} />
                    )}
                    {bulkLoading
                      ? "Parsing..."
                      : bulkFileName
                      ? "Replace " + bulkFileName
                      : "Drop a CSV, TSV, XML sitemap, or text file"}
                  </button>
                  <p
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.58rem",
                      color: t.ink50,
                      marginTop: "0.3rem",
                    }}
                  >
                    Accepts .csv, .tsv, .txt with URLs, or .xml sitemaps. URLs
                    are auto-extracted from any column.
                  </p>
                </div>
              )}

              {/* Sitemap URL */}
              {bulkSource === "sitemap" && (
                <div>
                  <label className="dash-config-label">Sitemap URL</label>
                  <div style={{ display: "flex", gap: "0.3rem" }}>
                    <input
                      value={sitemapInput}
                      onChange={function (e) {
                        setSitemapInput(e.target.value);
                      }}
                      placeholder="https://example.com/sitemap.xml"
                      style={{
                        flex: 1,
                        padding: "0.5rem 0.7rem",
                        borderRadius: 6,
                        border: "1.5px solid " + t.ink08,
                        background: t.paper,
                        color: t.ink,
                        fontFamily: "var(--mono)",
                        fontSize: "0.78rem",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                      onKeyDown={function (e) {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleFetchSitemap();
                        }
                      }}
                    />
                    <button
                      onClick={handleFetchSitemap}
                      disabled={bulkLoading || !sitemapInput.trim()}
                      style={{
                        padding: "0.5rem 0.8rem",
                        borderRadius: 6,
                        border: "none",
                        background: t.accent,
                        color: "white",
                        fontFamily: "var(--body)",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        cursor: bulkLoading ? "not-allowed" : "pointer",
                        opacity: bulkLoading ? 0.5 : 1,
                        whiteSpace: "nowrap",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                      }}
                    >
                      {bulkLoading ? (
                        <Loader2 size={13} className="xsbl-spin" />
                      ) : (
                        <Globe size={13} />
                      )}
                      Fetch
                    </button>
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.58rem",
                      color: t.ink50,
                      marginTop: "0.3rem",
                    }}
                  >
                    We'll download and parse the sitemap for &lt;loc&gt;
                    entries. If CORS blocks it, try uploading the file instead.
                  </p>
                </div>
              )}

              {/* Paste */}
              {bulkSource === "paste" && (
                <div>
                  <label className="dash-config-label">
                    Paste URLs (any format)
                  </label>
                  <textarea
                    value={pasteInput}
                    onChange={function (e) {
                      setPasteInput(e.target.value);
                    }}
                    placeholder={
                      "https://" +
                      site.domain +
                      "/page-1\nhttps://" +
                      site.domain +
                      "/page-2\nhttps://" +
                      site.domain +
                      "/page-3\n\nOr paste a spreadsheet column, comma-separated list, or any text containing URLs."
                    }
                    rows={5}
                    className="dash-config-textarea"
                  />
                  <button
                    onClick={handleParsePaste}
                    disabled={!pasteInput.trim()}
                    style={{
                      marginTop: "0.4rem",
                      padding: "0.4rem 0.8rem",
                      borderRadius: 6,
                      border: "none",
                      background: !pasteInput.trim() ? t.ink08 : t.accent,
                      color: !pasteInput.trim() ? t.ink50 : "white",
                      fontFamily: "var(--body)",
                      fontSize: "0.76rem",
                      fontWeight: 600,
                      cursor: !pasteInput.trim() ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    <Check size={12} /> Extract URLs
                  </button>
                </div>
              )}

              {/* No source selected yet */}
              {bulkSource === null && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "1.5rem",
                    color: t.ink50,
                    fontSize: "0.82rem",
                  }}
                >
                  Choose an import source above
                </div>
              )}

              {/* Error */}
              {bulkError && (
                <div
                  style={{
                    marginTop: "0.6rem",
                    padding: "0.5rem 0.8rem",
                    borderRadius: 6,
                    background: t.red + "08",
                    border: "1px solid " + t.red + "20",
                    fontSize: "0.76rem",
                    color: t.red,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.4rem",
                    lineHeight: 1.5,
                  }}
                >
                  <AlertTriangle
                    size={13}
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                  {bulkError}
                </div>
              )}

              {/* URL preview list */}
              {bulkUrls.length > 0 && (
                <div style={{ marginTop: "0.8rem" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "0.3rem",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "0.62rem",
                        fontWeight: 600,
                        color: t.green,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                      }}
                    >
                      <Check size={11} strokeWidth={2.5} />
                      {bulkUrls.length} URL{bulkUrls.length !== 1 ? "s" : ""}{" "}
                      found
                      {bulkUrls.length > maxPages && (
                        <span style={{ color: t.amber }}>
                          {" "}
                          (first {maxPages} will be scanned)
                        </span>
                      )}
                    </span>
                    <button
                      onClick={function () {
                        setBulkUrls([]);
                        setBulkError(null);
                        setBulkFileName(null);
                      }}
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "0.58rem",
                        color: t.ink50,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      Clear all
                    </button>
                  </div>
                  <div
                    style={{
                      maxHeight: 160,
                      overflowY: "auto",
                      borderRadius: 6,
                      border: "1px solid " + t.ink08,
                      background: t.paper,
                    }}
                  >
                    {bulkUrls.slice(0, maxPages + 5).map(function (url, i) {
                      var overLimit = i >= maxPages;
                      return (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            padding: "0.35rem 0.6rem",
                            borderBottom: "1px solid " + t.ink04,
                            opacity: overLimit ? 0.35 : 1,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "var(--mono)",
                              fontSize: "0.5rem",
                              fontWeight: 700,
                              color: overLimit ? t.ink50 : t.accent,
                              width: 18,
                              flexShrink: 0,
                              textAlign: "right",
                            }}
                          >
                            {i + 1}
                          </span>
                          <span
                            style={{
                              flex: 1,
                              fontFamily: "var(--mono)",
                              fontSize: "0.66rem",
                              color: t.ink,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {url}
                          </span>
                          {!overLimit && (
                            <button
                              onClick={function () {
                                handleRemoveBulkUrl(i);
                              }}
                              aria-label={"Remove " + url}
                              style={{
                                padding: "0.1rem",
                                borderRadius: 3,
                                border: "none",
                                background: "none",
                                color: t.ink50,
                                cursor: "pointer",
                                display: "flex",
                                opacity: 0.5,
                              }}
                              onMouseEnter={function (e) {
                                e.currentTarget.style.opacity = "1";
                                e.currentTarget.style.color = t.red;
                              }}
                              onMouseLeave={function (e) {
                                e.currentTarget.style.opacity = "0.5";
                                e.currentTarget.style.color = t.ink50;
                              }}
                            >
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {bulkUrls.length > maxPages + 5 && (
                      <div
                        style={{
                          padding: "0.35rem 0.6rem",
                          fontFamily: "var(--mono)",
                          fontSize: "0.58rem",
                          color: t.ink50,
                          textAlign: "center",
                        }}
                      >
                        +{bulkUrls.length - maxPages - 5} more (won't be
                        scanned)
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info box */}
          <div className="dash-info-box">
            <FileText
              size={14}
              style={{ flexShrink: 0, marginTop: 2, color: "var(--ink50)" }}
            />
            <span>
              {mode === "auto"
                ? "We'll try your sitemap.xml first. If not found, we'll follow internal links from your homepage."
                : mode === "manual"
                ? "Each URL will be loaded in a real browser and scanned with axe-core against WCAG 2.2."
                : "Imported URLs will be loaded one-by-one in a real browser and scanned against WCAG 2.2 criteria."}
            </span>
          </div>

          {/* Authentication (collapsible) */}
          <div
            style={{
              borderRadius: 8,
              border: "1px solid " + t.ink08,
              marginBottom: "1rem",
              overflow: "hidden",
            }}
          >
            <button
              onClick={function () {
                setShowAuth(!showAuth);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                padding: "0.6rem 0.8rem",
                border: "none",
                background: showAuth ? t.ink04 : "transparent",
                color: t.ink50,
                cursor: "pointer",
                fontFamily: "var(--body)",
                fontSize: "0.78rem",
                fontWeight: 500,
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                }}
              >
                <Lock size={13} strokeWidth={1.8} />
                Authentication
                {authType !== "none" && (
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.5rem",
                      fontWeight: 700,
                      padding: "0.06rem 0.3rem",
                      borderRadius: 3,
                      background: t.green + "15",
                      color: t.green,
                      textTransform: "uppercase",
                    }}
                  >
                    {authType}
                  </span>
                )}
              </span>
              <ChevronDown
                size={14}
                style={{
                  transform: showAuth ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s",
                }}
              />
            </button>

            {showAuth && (
              <div
                style={{ padding: "0.8rem", borderTop: "1px solid " + t.ink08 }}
              >
                <p
                  style={{
                    fontSize: "0.72rem",
                    color: t.ink50,
                    lineHeight: 1.5,
                    margin: "0 0 0.6rem",
                  }}
                >
                  For sites behind login, staging environments, or intranets.
                  Credentials are sent directly to the browser and never stored.
                </p>

                {/* Auth type selector */}
                <div
                  style={{
                    display: "inline-flex",
                    borderRadius: 7,
                    background: t.ink04,
                    border: "1px solid " + t.ink08,
                    padding: 2,
                    gap: 2,
                    marginBottom: "0.8rem",
                  }}
                >
                  {[
                    { id: "none", label: "None" },
                    { id: "basic", label: "Basic auth" },
                    { id: "header", label: "Header" },
                    { id: "cookie", label: "Cookie" },
                  ].map(function (opt) {
                    var active = authType === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={function () {
                          setAuthType(opt.id);
                        }}
                        style={{
                          padding: "0.28rem 0.6rem",
                          borderRadius: 5,
                          border: "none",
                          background: active ? t.cardBg : "transparent",
                          boxShadow: active ? "0 1px 3px " + t.ink08 : "none",
                          color: active ? t.ink : t.ink50,
                          fontFamily: "var(--body)",
                          fontSize: "0.7rem",
                          fontWeight: active ? 600 : 400,
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {/* Basic auth fields */}
                {authType === "basic" && (
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <div style={{ flex: 1 }}>
                      <label className="dash-config-label">Username</label>
                      <input
                        value={basicUser}
                        onChange={function (e) {
                          setBasicUser(e.target.value);
                        }}
                        placeholder="admin"
                        style={{
                          width: "100%",
                          padding: "0.4rem 0.6rem",
                          borderRadius: 6,
                          border: "1.5px solid " + t.ink08,
                          background: t.paper,
                          color: t.ink,
                          fontFamily: "var(--mono)",
                          fontSize: "0.72rem",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="dash-config-label">Password</label>
                      <input
                        type="password"
                        value={basicPass}
                        onChange={function (e) {
                          setBasicPass(e.target.value);
                        }}
                        placeholder="••••••"
                        style={{
                          width: "100%",
                          padding: "0.4rem 0.6rem",
                          borderRadius: 6,
                          border: "1.5px solid " + t.ink08,
                          background: t.paper,
                          color: t.ink,
                          fontFamily: "var(--mono)",
                          fontSize: "0.72rem",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Custom headers */}
                {authType === "header" && (
                  <div>
                    <label className="dash-config-label">Custom headers</label>
                    {customHeaders.map(function (h, i) {
                      return (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            gap: "0.3rem",
                            marginBottom: "0.3rem",
                          }}
                        >
                          <input
                            value={h.key}
                            onChange={function (e) {
                              var next = customHeaders.slice();
                              next[i] = Object.assign({}, next[i], {
                                key: e.target.value,
                              });
                              setCustomHeaders(next);
                            }}
                            placeholder="Authorization"
                            style={{
                              flex: 1,
                              padding: "0.35rem 0.5rem",
                              borderRadius: 5,
                              border: "1.5px solid " + t.ink08,
                              background: t.paper,
                              color: t.ink,
                              fontFamily: "var(--mono)",
                              fontSize: "0.68rem",
                              outline: "none",
                            }}
                          />
                          <input
                            value={h.value}
                            onChange={function (e) {
                              var next = customHeaders.slice();
                              next[i] = Object.assign({}, next[i], {
                                value: e.target.value,
                              });
                              setCustomHeaders(next);
                            }}
                            placeholder="Bearer eyJ..."
                            style={{
                              flex: 2,
                              padding: "0.35rem 0.5rem",
                              borderRadius: 5,
                              border: "1.5px solid " + t.ink08,
                              background: t.paper,
                              color: t.ink,
                              fontFamily: "var(--mono)",
                              fontSize: "0.68rem",
                              outline: "none",
                            }}
                          />
                          {customHeaders.length > 1 && (
                            <button
                              onClick={function () {
                                setCustomHeaders(
                                  customHeaders.filter(function (_, j) {
                                    return j !== i;
                                  })
                                );
                              }}
                              style={{
                                background: "none",
                                border: "none",
                                color: t.ink50,
                                cursor: "pointer",
                                padding: "0 0.2rem",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                    <button
                      onClick={function () {
                        setCustomHeaders(
                          customHeaders.concat([{ key: "", value: "" }])
                        );
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.2rem",
                        padding: "0.2rem 0.5rem",
                        borderRadius: 4,
                        border: "1px solid " + t.ink08,
                        background: "none",
                        color: t.ink50,
                        fontFamily: "var(--mono)",
                        fontSize: "0.58rem",
                        cursor: "pointer",
                        marginTop: "0.15rem",
                      }}
                    >
                      <Plus size={10} /> Add header
                    </button>
                  </div>
                )}

                {/* Cookies */}
                {authType === "cookie" && (
                  <div>
                    <label className="dash-config-label">Cookies</label>
                    {customCookies.map(function (c, i) {
                      return (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            gap: "0.3rem",
                            marginBottom: "0.3rem",
                          }}
                        >
                          <input
                            value={c.name}
                            onChange={function (e) {
                              var next = customCookies.slice();
                              next[i] = Object.assign({}, next[i], {
                                name: e.target.value,
                              });
                              setCustomCookies(next);
                            }}
                            placeholder="session_id"
                            style={{
                              flex: 1,
                              padding: "0.35rem 0.5rem",
                              borderRadius: 5,
                              border: "1.5px solid " + t.ink08,
                              background: t.paper,
                              color: t.ink,
                              fontFamily: "var(--mono)",
                              fontSize: "0.68rem",
                              outline: "none",
                            }}
                          />
                          <input
                            value={c.value}
                            onChange={function (e) {
                              var next = customCookies.slice();
                              next[i] = Object.assign({}, next[i], {
                                value: e.target.value,
                              });
                              setCustomCookies(next);
                            }}
                            placeholder="abc123..."
                            style={{
                              flex: 2,
                              padding: "0.35rem 0.5rem",
                              borderRadius: 5,
                              border: "1.5px solid " + t.ink08,
                              background: t.paper,
                              color: t.ink,
                              fontFamily: "var(--mono)",
                              fontSize: "0.68rem",
                              outline: "none",
                            }}
                          />
                          {customCookies.length > 1 && (
                            <button
                              onClick={function () {
                                setCustomCookies(
                                  customCookies.filter(function (_, j) {
                                    return j !== i;
                                  })
                                );
                              }}
                              style={{
                                background: "none",
                                border: "none",
                                color: t.ink50,
                                cursor: "pointer",
                                padding: "0 0.2rem",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                    <button
                      onClick={function () {
                        setCustomCookies(
                          customCookies.concat([{ name: "", value: "" }])
                        );
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.2rem",
                        padding: "0.2rem 0.5rem",
                        borderRadius: 4,
                        border: "1px solid " + t.ink08,
                        background: "none",
                        color: t.ink50,
                        fontFamily: "var(--mono)",
                        fontSize: "0.58rem",
                        cursor: "pointer",
                        marginTop: "0.15rem",
                      }}
                    >
                      <Plus size={10} /> Add cookie
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Scan button */}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={handleScan}
              disabled={scanDisabled}
              className="auth-submit"
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                fontSize: "0.88rem",
              }}
            >
              {scanning ? (
                <Loader2 size={16} className="xsbl-spin" />
              ) : (
                <Play size={16} fill="white" />
              )}
              {scanning
                ? "Scanning…"
                : "Scan " +
                  (mode === "auto" ? "up to " : "") +
                  scanCount +
                  " page" +
                  (scanCount !== 1 ? "s" : "")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
