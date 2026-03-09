import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import "../../styles/dashboard.css";
import "../../styles/dashboard-pages.css";
import "../../styles/dashboard-modals.css";
import { supabase } from "../../lib/supabase";
import {
  X,
  Eye,
  EyeOff,
  Monitor,
  Smartphone,
  Loader2,
  ZoomIn,
  ZoomOut,
  Layers,
  AlertTriangle,
  ChevronDown,
  Circle,
  Search,
  Cloud,
  Crosshair,
  Contrast,
  MoveHorizontal,
  Volume2,
  RefreshCw,
  Scan,
} from "lucide-react";
import XsblBull from "../landing/XsblBull";

// ═══════════════════════════════════════════════════════════════
// SVG Color Blindness Matrices — Machado et al. (2009)
// These are scientifically accurate simulation matrices.
// ═══════════════════════════════════════════════════════════════

var VISION_MODES = [
  {
    id: "normal",
    name: "Normal vision",
    icon: <Eye size={14} />,
    desc: "Full color vision (trichromacy)",
    category: "baseline",
    matrix: null,
  },
  {
    id: "protanopia",
    name: "Protanopia",
    icon: <Circle size={12} fill="#ef4444" stroke="none" />,
    desc: "No red cones — 1.3% of males",
    category: "colorblind",
    matrix:
      "0.152286 0.114503 0.003642 0 0  0.587330 0.882043 -0.048116 0 0  0.260384 0.003454 1.044474 0 0  0 0 0 1 0",
  },
  {
    id: "deuteranopia",
    name: "Deuteranopia",
    icon: <Circle size={12} fill="#22c55e" stroke="none" />,
    desc: "No green cones — 1.2% of males",
    category: "colorblind",
    matrix:
      "0.367322 0.280085 -0.011820 0 0  0.860646 0.672501 0.042940 0 0  -0.227968 0.047413 0.968881 0 0  0 0 0 1 0",
  },
  {
    id: "tritanopia",
    name: "Tritanopia",
    icon: <Circle size={12} fill="#3b82f6" stroke="none" />,
    desc: "No blue cones — 0.001% of population",
    category: "colorblind",
    matrix:
      "1.255528 -0.076749 0.004698 0 0  -0.078411 0.930809 0.691367 0 0  -0.177117 0.145940 0.303935 0 0  0 0 0 1 0",
  },
  {
    id: "achromatopsia",
    name: "Achromatopsia",
    icon: <Circle size={12} fill="#374151" stroke="none" />,
    desc: "Total color blindness — 0.003%",
    category: "colorblind",
    matrix:
      "0.299 0.299 0.299 0 0  0.587 0.587 0.587 0 0  0.114 0.114 0.114 0 0  0 0 0 1 0",
  },
  {
    id: "protanomaly",
    name: "Protanomaly",
    icon: <Circle size={12} fill="#f97316" stroke="none" />,
    desc: "Reduced red sensitivity — 1.1% of males",
    category: "colorblind",
    matrix:
      "0.458064 0.092785 0.007218 0 0  0.679578 0.946820 -0.016897 0 0  -0.137642 -0.039605 1.009679 0 0  0 0 0 1 0",
  },
  {
    id: "deuteranomaly",
    name: "Deuteranomaly",
    icon: <Circle size={12} fill="#eab308" stroke="none" />,
    desc: "Reduced green — 4.6% of males (most common)",
    category: "colorblind",
    matrix:
      "0.547494 0.181692 -0.001031 0 0  0.607765 0.882094 0.023410 0 0  -0.155259 -0.063786 0.977621 0 0  0 0 0 1 0",
  },
  {
    id: "blurred",
    name: "Low vision (blur)",
    icon: <Search size={14} />,
    desc: "Simulates reduced visual acuity (~20/200)",
    category: "lowvision",
    filter: "blur(3px) brightness(0.95)",
    matrix: null,
  },
  {
    id: "lowcontrast",
    name: "Low contrast",
    icon: <Contrast size={14} />,
    desc: "Reduced contrast sensitivity",
    category: "lowvision",
    filter: "contrast(0.35) brightness(1.15) saturate(0.7)",
    matrix: null,
  },
  {
    id: "cataracts",
    name: "Cataracts",
    icon: <Cloud size={14} />,
    desc: "Yellowed, hazy vision — common in elderly",
    category: "lowvision",
    filter: null,
    matrix: null,
    special: "cataracts",
  },
  {
    id: "tunnel",
    name: "Tunnel vision",
    icon: <Crosshair size={14} />,
    desc: "Loss of peripheral vision (glaucoma)",
    category: "lowvision",
    filter: null,
    matrix: null,
    special: "tunnel",
  },
  {
    id: "macular",
    name: "Macular degeneration",
    icon: <Circle size={12} fill="#555" stroke="none" />,
    desc: "Central vision loss — leading cause of blindness in over-50s",
    category: "lowvision",
    filter: null,
    matrix: null,
    special: "macular",
  },
  {
    id: "screenreader",
    name: "Screen reader",
    icon: <Volume2 size={14} />,
    desc: "How assistive technology reads your page",
    category: "assistive",
    filter: null,
    matrix: null,
    special: "screenreader",
  },
];

var CATEGORIES = [
  { id: "baseline", name: "Baseline" },
  { id: "colorblind", name: "Color blindness" },
  { id: "lowvision", name: "Low vision" },
  { id: "assistive", name: "Assistive tech" },
];

export default function AccessibilitySimulator({ site, issues, onClose }) {
  const { t, dark } = useTheme();
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewport, setViewport] = useState(
    typeof window !== "undefined" && window.innerWidth <= 768
      ? "mobile"
      : "desktop"
  );
  const [mode, setMode] = useState("normal");
  const [showIssues, setShowIssues] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [splitView, setSplitView] = useState(false);
  const [splitPos, setSplitPos] = useState(50);
  const [expandedCat, setExpandedCat] = useState("colorblind");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [activeUrl, setActiveUrl] = useState("");
  const containerRef = useRef(null);
  const splitRef = useRef(null);
  const isDragging = useRef(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [retryCount, setRetryCount] = useState(0);
  const [screenshotError, setScreenshotError] = useState(null);
  const imgContainerRef = useRef(null);
  const [nystagmusOffset, setNystagmusOffset] = useState({ x: 0, y: 0 });

  // Detect mobile
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

  var currentMode =
    VISION_MODES.find(function (m) {
      return m.id === mode;
    }) || VISION_MODES[0];
  var baseUrl = site.domain.startsWith("http")
    ? site.domain
    : "https://" + site.domain;
  var url = activeUrl || baseUrl;

  var handleScanUrl = function () {
    var target = customUrl.trim();
    if (!target) return;
    if (!target.startsWith("http")) target = "https://" + target;
    setActiveUrl(target);
    setCustomUrl("");
  };

  // Load screenshot with retry and blank detection
  useEffect(
    function () {
      setLoading(true);
      setScreenshot(null);
      setScreenshotError(null);
      var targetUrl = activeUrl || baseUrl;
      var attempt = retryCount;

      var fetchScreenshot = function (retryAttempt) {
        supabase.auth.getSession().then(function (res) {
          var session = res.data.session;
          supabase.functions
            .invoke("screenshot-site", {
              body: {
                url: targetUrl,
                viewport: viewport,
                // On retry, request a delay to let JS render
                waitExtra: retryAttempt > 0,
              },
              headers: {
                Authorization:
                  "Bearer " + (session ? session.access_token : ""),
              },
            })
            .then(function (res) {
              if (res.data && res.data.image) {
                // Detect blank/tiny screenshots by checking base64 length
                // A blank 1440x900 PNG is typically very small (~2-5KB base64)
                // A real page screenshot is usually >20KB
                var b64 = res.data.image.replace("data:image/png;base64,", "");
                var sizeKB = (b64.length * 3) / 4 / 1024;

                if (sizeKB < 15 && retryAttempt < 2) {
                  // Likely blank — retry with longer wait
                  console.warn(
                    "[simulator] Screenshot looks blank (" +
                      Math.round(sizeKB) +
                      "KB), retrying..."
                  );
                  setTimeout(function () {
                    fetchScreenshot(retryAttempt + 1);
                  }, 2000);
                  return;
                }

                if (sizeKB < 5 && retryAttempt >= 2) {
                  // Still blank after retries
                  setScreenshotError(
                    "Screenshot appears blank. The site may be blocking automated browsers or requires interaction to load."
                  );
                  setLoading(false);
                  return;
                }

                setScreenshot(res.data);
              } else {
                if (retryAttempt < 1) {
                  setTimeout(function () {
                    fetchScreenshot(retryAttempt + 1);
                  }, 1500);
                  return;
                }
                setScreenshotError(
                  "Could not capture screenshot. The site may be unreachable."
                );
              }
              setLoading(false);
            })
            .catch(function (err) {
              if (retryAttempt < 1) {
                setTimeout(function () {
                  fetchScreenshot(retryAttempt + 1);
                }, 1500);
                return;
              }
              setScreenshotError(
                "Screenshot request failed: " + (err.message || "Unknown error")
              );
              setLoading(false);
            });
        });
      };

      fetchScreenshot(0);
    },
    [activeUrl, baseUrl, viewport, retryCount]
  );

  // Mouse tracking for tunnel vision & macular degeneration
  var handleMouseTrack = function (e) {
    var el = imgContainerRef.current;
    if (!el) return;
    var rect = el.getBoundingClientRect();
    var x = ((e.clientX - rect.left) / rect.width) * 100;
    var y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  // Nystagmus-like tremor for low vision realism
  useEffect(
    function () {
      if (mode !== "cataracts" && mode !== "blurred") return;
      var interval = setInterval(function () {
        setNystagmusOffset({
          x: (Math.random() - 0.5) * 1.5,
          y: (Math.random() - 0.5) * 1.0,
        });
      }, 150);
      return function () {
        clearInterval(interval);
      };
    },
    [mode]
  );

  // Split view drag — use the image container, not the scroll area
  var handleSplitDrag = function (e) {
    if (!isDragging.current) return;
    var el = splitRef.current || containerRef.current;
    if (!el) return;
    var rect = el.getBoundingClientRect();
    var pct = ((e.clientX - rect.left) / rect.width) * 100;
    setSplitPos(Math.max(10, Math.min(90, pct)));
  };

  // Issue markers for the current page
  var pageIssues = (issues || []).filter(function (i) {
    return i.status === "open";
  });
  var critCount = pageIssues.filter(function (i) {
    return i.impact === "critical";
  }).length;
  var seriousCount = pageIssues.filter(function (i) {
    return i.impact === "serious";
  }).length;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: dark ? "#0a0a0d" : "#f0ede8",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        userSelect: "none",
      }}
      onMouseMove={handleSplitDrag}
      onMouseUp={function () {
        isDragging.current = false;
      }}
      onMouseLeave={function () {
        isDragging.current = false;
      }}
    >
      {/* ── Top Bar ── */}
      <div
        className="xsbl-sim-topbar"
        style={{
          padding: "0 0.7rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid " + t.ink08,
          background: t.cardBg,
          flexShrink: 0,
          flexWrap: "wrap",
          gap: "0.3rem",
          minHeight: 48,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.4rem 0",
          }}
        >
          <button
            onClick={onClose}
            aria-label="Close simulator"
            style={{
              background: t.ink04,
              border: "none",
              borderRadius: 6,
              padding: "0.3rem",
              cursor: "pointer",
              color: t.ink50,
              display: "flex",
            }}
          >
            <X size={18} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <XsblBull size={22} />
            <span
              style={{
                fontFamily: "var(--mono)",
                fontWeight: 600,
                fontSize: "0.9rem",
                color: t.ink,
              }}
            >
              xsbl<span style={{ color: t.accent }}>.</span>
            </span>
          </div>
          <div
            style={{
              width: 1,
              height: 20,
              background: t.ink08,
              flexShrink: 0,
            }}
          />
          <div className="xsbl-sim-title">
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.72rem",
                fontWeight: 600,
                color: t.ink,
              }}
            >
              Simulator
            </div>
          </div>

          {/* URL input */}
          <div
            className="hide-mobile"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              flex: 1,
              maxWidth: 360,
            }}
          >
            <input
              value={customUrl}
              onChange={function (e) {
                setCustomUrl(e.target.value);
              }}
              onKeyDown={function (e) {
                if (e.key === "Enter") handleScanUrl();
              }}
              placeholder={url}
              style={{
                flex: 1,
                padding: "0.3rem 0.6rem",
                borderRadius: 5,
                border: "1.5px solid " + t.ink08,
                background: t.paper,
                color: t.ink,
                fontFamily: "var(--mono)",
                fontSize: "0.65rem",
                outline: "none",
                minWidth: 0,
              }}
            />
            <button
              onClick={handleScanUrl}
              disabled={!customUrl.trim()}
              aria-label="Scan URL"
              style={{
                background: t.accent,
                border: "none",
                borderRadius: 5,
                padding: "0.3rem 0.5rem",
                cursor: customUrl.trim() ? "pointer" : "default",
                opacity: customUrl.trim() ? 1 : 0.4,
                color: "white",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                fontFamily: "var(--mono)",
                fontSize: "0.6rem",
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              <Scan size={12} /> Go
            </button>
            {activeUrl && (
              <button
                onClick={function () {
                  setActiveUrl("");
                }}
                aria-label="Reset to site URL"
                style={{
                  background: "none",
                  border: "none",
                  padding: "0.2rem",
                  cursor: "pointer",
                  color: t.ink50,
                  display: "flex",
                }}
              >
                <RefreshCw size={13} />
              </button>
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            flexWrap: "wrap",
            padding: "0.3rem 0",
          }}
        >
          {/* Viewport toggle */}
          <div
            style={{
              display: "flex",
              background: t.ink04,
              borderRadius: 6,
              padding: "0.15rem",
            }}
          >
            <button
              onClick={function () {
                setViewport("desktop");
              }}
              aria-label="Desktop view"
              style={{
                padding: "0.25rem 0.5rem",
                borderRadius: 5,
                border: "none",
                background: viewport === "desktop" ? t.cardBg : "transparent",
                color: viewport === "desktop" ? t.ink : t.ink50,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                boxShadow:
                  viewport === "desktop"
                    ? "0 1px 3px rgba(0,0,0,0.08)"
                    : "none",
              }}
            >
              <Monitor size={14} />
            </button>
            <button
              onClick={function () {
                setViewport("mobile");
              }}
              aria-label="Mobile view"
              style={{
                padding: "0.25rem 0.5rem",
                borderRadius: 5,
                border: "none",
                background: viewport === "mobile" ? t.cardBg : "transparent",
                color: viewport === "mobile" ? t.ink : t.ink50,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                boxShadow:
                  viewport === "mobile" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
            >
              <Smartphone size={14} />
            </button>
          </div>

          {/* Zoom */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
            <button
              onClick={function () {
                setZoom(Math.max(0.25, zoom - 0.25));
              }}
              aria-label="Zoom out"
              style={{
                background: "none",
                border: "none",
                padding: "0.2rem",
                cursor: "pointer",
                color: t.ink50,
                display: "flex",
              }}
            >
              <ZoomOut size={15} />
            </button>
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.62rem",
                color: t.ink50,
                minWidth: 32,
                textAlign: "center",
              }}
            >
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={function () {
                setZoom(Math.min(3, zoom + 0.25));
              }}
              aria-label="Zoom in"
              style={{
                background: "none",
                border: "none",
                padding: "0.2rem",
                cursor: "pointer",
                color: t.ink50,
                display: "flex",
              }}
            >
              <ZoomIn size={15} />
            </button>
          </div>

          {/* Split view — hide on mobile */}
          <button
            className="hide-mobile"
            onClick={function () {
              setSplitView(!splitView);
            }}
            style={{
              padding: "0.3rem 0.6rem",
              borderRadius: 5,
              border: "1px solid " + (splitView ? t.accent : t.ink08),
              background: splitView ? t.accentBg : "none",
              color: splitView ? t.accent : t.ink50,
              fontFamily: "var(--mono)",
              fontSize: "0.6rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            <Layers size={13} /> Split
          </button>

          {/* Issue overlay toggle */}
          <button
            onClick={function () {
              setShowIssues(!showIssues);
            }}
            style={{
              padding: "0.3rem 0.6rem",
              borderRadius: 5,
              border: "1px solid " + (showIssues ? t.red + "40" : t.ink08),
              background: showIssues ? t.red + "08" : "none",
              color: showIssues ? t.red : t.ink50,
              fontFamily: "var(--mono)",
              fontSize: "0.6rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            <AlertTriangle size={13} /> {pageIssues.length}
          </button>

          {/* Vision mode toggle — mobile only */}
          <button
            className="show-mobile-only"
            onClick={function () {
              setSidebarOpen(!sidebarOpen);
            }}
            style={{
              padding: "0.3rem 0.6rem",
              borderRadius: 5,
              border: "1px solid " + (mode !== "normal" ? t.accent : t.ink08),
              background: mode !== "normal" ? t.accentBg : "none",
              color: mode !== "normal" ? t.accent : t.ink50,
              fontFamily: "var(--mono)",
              fontSize: "0.6rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "none",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            <Eye size={13} /> {mode === "normal" ? "Vision" : currentMode.name}
          </button>
        </div>
      </div>

      {/* ── Main Area ── */}
      <div
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* ── Left Sidebar — Vision Controls ── */}
        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div
            className="show-mobile-only"
            onClick={function () {
              setSidebarOpen(false);
            }}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 20,
              display: "none",
            }}
          />
        )}
        <div
          className="xsbl-sim-sidebar"
          style={{
            width: 260,
            flexShrink: 0,
            borderRight: "1px solid " + t.ink08,
            background: t.cardBg,
            overflowY: "auto",
            padding: "0.8rem 0",
            zIndex: 25,
          }}
        >
          {/* Current mode indicator */}
          <div
            style={{
              padding: "0 0.8rem 0.8rem",
              borderBottom: "1px solid " + t.ink04,
            }}
          >
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.55rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: t.ink50,
                marginBottom: "0.3rem",
              }}
            >
              Viewing as
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              <span style={{ fontSize: "1.1rem" }}>{currentMode.icon}</span>
              <div>
                <div
                  style={{ fontSize: "0.82rem", fontWeight: 600, color: t.ink }}
                >
                  {currentMode.name}
                </div>
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: t.ink50,
                    lineHeight: 1.4,
                  }}
                >
                  {currentMode.desc}
                </div>
              </div>
            </div>
          </div>

          {/* Categories */}
          {CATEGORIES.map(function (cat) {
            var catModes = VISION_MODES.filter(function (m) {
              return m.category === cat.id;
            });
            var isExpanded = expandedCat === cat.id;
            return (
              <div key={cat.id}>
                <button
                  onClick={function () {
                    setExpandedCat(isExpanded ? null : cat.id);
                  }}
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.8rem",
                    border: "none",
                    background: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    borderBottom: "1px solid " + t.ink04,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.62rem",
                      fontWeight: 600,
                      color: t.ink50,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {cat.name}
                  </span>
                  <ChevronDown
                    size={13}
                    color={t.ink50}
                    style={{
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0)",
                      transition: "transform 0.2s",
                    }}
                  />
                </button>
                {isExpanded && (
                  <div style={{ padding: "0.3rem 0" }}>
                    {catModes.map(function (m) {
                      var isActive = mode === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={function () {
                            setMode(m.id);
                            if (isMobile) setSidebarOpen(false);
                          }}
                          style={{
                            width: "100%",
                            padding: "0.5rem 0.8rem",
                            border: "none",
                            background: isActive ? t.accentBg : "transparent",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            cursor: "pointer",
                            transition: "background 0.15s",
                            borderLeft: isActive
                              ? `3px solid ${t.accent}`
                              : "3px solid transparent",
                          }}
                          onMouseEnter={function (e) {
                            if (!isActive)
                              e.currentTarget.style.background = t.ink04;
                          }}
                          onMouseLeave={function (e) {
                            if (!isActive)
                              e.currentTarget.style.background = isActive
                                ? t.accentBg
                                : "transparent";
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.9rem",
                              width: 22,
                              textAlign: "center",
                            }}
                          >
                            {m.icon}
                          </span>
                          <div style={{ textAlign: "left" }}>
                            <div
                              style={{
                                fontSize: "0.76rem",
                                fontWeight: isActive ? 600 : 400,
                                color: isActive ? t.accent : t.ink,
                              }}
                            >
                              {m.name}
                            </div>
                            <div
                              style={{
                                fontSize: "0.58rem",
                                color: t.ink50,
                                lineHeight: 1.3,
                              }}
                            >
                              {m.desc}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Issue summary */}
          {pageIssues.length > 0 && (
            <div
              style={{
                padding: "0.8rem",
                borderTop: "1px solid " + t.ink04,
                marginTop: "0.5rem",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.55rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: t.ink50,
                  marginBottom: "0.5rem",
                }}
              >
                Issues on this page
              </div>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {critCount > 0 && (
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.58rem",
                      fontWeight: 600,
                      padding: "0.15rem 0.4rem",
                      borderRadius: 3,
                      background: t.red + "15",
                      color: t.red,
                    }}
                  >
                    {critCount} critical
                  </span>
                )}
                {seriousCount > 0 && (
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.58rem",
                      fontWeight: 600,
                      padding: "0.15rem 0.4rem",
                      borderRadius: 3,
                      background: t.red + "10",
                      color: t.red,
                    }}
                  >
                    {seriousCount} serious
                  </span>
                )}
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.58rem",
                    padding: "0.15rem 0.4rem",
                    borderRadius: 3,
                    background: t.ink04,
                    color: t.ink50,
                  }}
                >
                  {pageIssues.length} total
                </span>
              </div>

              {/* Quick issue list */}
              <div
                style={{
                  marginTop: "0.5rem",
                  maxHeight: 200,
                  overflowY: "auto",
                }}
              >
                {pageIssues.slice(0, 15).map(function (iss, i) {
                  return (
                    <div
                      key={i}
                      style={{
                        padding: "0.3rem 0",
                        borderTop: i > 0 ? "1px solid " + t.ink04 : "none",
                        fontSize: "0.65rem",
                        color: t.ink50,
                        display: "flex",
                        gap: "0.3rem",
                        alignItems: "flex-start",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "0.5rem",
                          fontWeight: 700,
                          padding: "0.05rem 0.2rem",
                          borderRadius: 2,
                          flexShrink: 0,
                          marginTop: "0.1rem",
                          background:
                            iss.impact === "critical" ||
                            iss.impact === "serious"
                              ? t.red + "15"
                              : t.amber + "15",
                          color:
                            iss.impact === "critical" ||
                            iss.impact === "serious"
                              ? t.red
                              : t.amber,
                        }}
                      >
                        {iss.impact.substring(0, 4).toUpperCase()}
                      </span>
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {iss.rule_id}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Info panel */}
          <div
            style={{
              padding: "0.8rem",
              borderTop: "1px solid " + t.ink04,
              marginTop: "auto",
            }}
          >
            <div
              style={{ fontSize: "0.65rem", color: t.ink50, lineHeight: 1.5 }}
            >
              Color blindness affects ~8% of males and ~0.5% of females. These
              filters use scientifically accurate color matrices to simulate how
              your site appears to users with different vision conditions.
            </div>
          </div>
        </div>

        {/* ── Preview Area ── */}
        <div
          ref={containerRef}
          style={{
            flex: 1,
            overflow: "auto",
            position: "relative",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "1.5rem",
            background: dark ? "#0d0d10" : "#e8e4df",
          }}
        >
          {/* SVG Filter Definitions */}
          <svg width="0" height="0" style={{ position: "absolute" }}>
            <defs>
              {VISION_MODES.filter(function (m) {
                return m.matrix;
              }).map(function (m) {
                return (
                  <filter key={m.id} id={"filter-" + m.id}>
                    <feColorMatrix type="matrix" values={m.matrix} />
                  </filter>
                );
              })}
            </defs>
          </svg>

          {/* ── Screen Reader Simulation ── */}
          {currentMode.special === "screenreader" ? (
            <div
              style={{
                width: "100%",
                maxWidth: 780,
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {/* Terminal-style screen reader output */}
              <div
                style={{
                  background: "#1a1a2e",
                  borderRadius: 12,
                  border: "1px solid #2a2a4a",
                  overflow: "hidden",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                }}
              >
                {/* Terminal title bar */}
                <div
                  style={{
                    padding: "0.5rem 0.8rem",
                    background: "#12122a",
                    borderBottom: "1px solid #2a2a4a",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <div style={{ display: "flex", gap: "0.35rem" }}>
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "#ff5f57",
                      }}
                    />
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "#febc2e",
                      }}
                    />
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "#28c840",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      marginLeft: "0.5rem",
                    }}
                  >
                    <Volume2 size={13} color="#7c7cff" />
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "0.68rem",
                        color: "#8888bb",
                        fontWeight: 600,
                      }}
                    >
                      NVDA Screen Reader — {url}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.55rem",
                      color: "#555577",
                      marginLeft: "auto",
                    }}
                  >
                    Tab to navigate • Enter to activate
                  </span>
                </div>

                {/* Sequential reading output */}
                <div
                  style={{
                    padding: "1rem 1.2rem",
                    maxHeight: "calc(100vh - 220px)",
                    overflowY: "auto",
                    fontFamily: "var(--mono)",
                    fontSize: "0.72rem",
                    lineHeight: 1.8,
                  }}
                >
                  {(function () {
                    var missingAlt = pageIssues.filter(function (i) {
                      return i.rule_id === "image-alt";
                    });
                    var missingLabels = pageIssues.filter(function (i) {
                      return (
                        i.rule_id === "label" || i.rule_id === "input-image-alt"
                      );
                    });
                    var missingButtons = pageIssues.filter(function (i) {
                      return i.rule_id === "button-name";
                    });
                    var missingLinks = pageIssues.filter(function (i) {
                      return i.rule_id === "link-name";
                    });
                    var headingIssues = pageIssues.filter(function (i) {
                      return (
                        i.rule_id === "heading-order" ||
                        i.rule_id === "empty-heading"
                      );
                    });
                    var ariaIssues = pageIssues.filter(function (i) {
                      return i.rule_id && i.rule_id.indexOf("aria") === 0;
                    });
                    var contrastIssues = pageIssues.filter(function (i) {
                      return i.rule_id === "color-contrast";
                    });
                    var landmarkIssues = pageIssues.filter(function (i) {
                      return (
                        i.rule_id === "landmark-one-main" ||
                        i.rule_id === "region" ||
                        (i.rule_id && i.rule_id.indexOf("landmark") === 0)
                      );
                    });
                    var docLang = pageIssues.filter(function (i) {
                      return (
                        i.rule_id === "html-has-lang" ||
                        i.rule_id === "html-lang-valid"
                      );
                    });

                    // Build a sequential "reading" of the page
                    var lines = [];
                    var lineIdx = 0;

                    var addLine = function (icon, text, type, sub) {
                      lines.push({
                        icon: icon,
                        text: text,
                        type: type,
                        sub: sub,
                        idx: lineIdx++,
                      });
                    };

                    // Page load announcement
                    addLine(
                      "🔊",
                      (site.domain || "Page") + " — loaded",
                      "announce"
                    );

                    // Language issues
                    if (docLang.length > 0) {
                      addLine(
                        "⚠️",
                        "Warning: page language not set. Screen reader cannot determine pronunciation.",
                        "error"
                      );
                    }

                    // Landmark navigation
                    addLine("📍", "Landmarks:", "heading");
                    if (landmarkIssues.length > 0) {
                      addLine(
                        "⚠️",
                        "No main landmark found. Screen reader users cannot skip to main content.",
                        "error",
                        "Users must Tab through every element from the top of the page to find content."
                      );
                    } else {
                      addLine(
                        "✓",
                        "banner, navigation, main, contentinfo",
                        "ok"
                      );
                    }

                    // Heading structure
                    addLine("📑", "Heading navigation (H key):", "heading");
                    if (headingIssues.length > 0) {
                      headingIssues.slice(0, 3).forEach(function (iss) {
                        if (iss.rule_id === "empty-heading") {
                          addLine(
                            "⚠️",
                            '"" — empty heading (level unknown)',
                            "error",
                            'Screen reader announces: "heading level 2, blank" — user hears nothing useful'
                          );
                        } else {
                          addLine(
                            "⚠️",
                            "Heading hierarchy is broken — skipped levels detected",
                            "error",
                            "Users who navigate by headings will miss content sections" +
                              (iss.element_selector
                                ? " • " + iss.element_selector
                                : "")
                          );
                        }
                      });
                    } else {
                      addLine("✓", "Heading hierarchy appears correct", "ok");
                    }

                    // Tab order simulation
                    addLine(
                      "⌨️",
                      "Tab order (interactive elements):",
                      "heading"
                    );

                    // Simulate what user hears as they tab through
                    var tabStops = [];
                    missingButtons.slice(0, 4).forEach(function (iss) {
                      tabStops.push({
                        icon: "⚠️",
                        text: '"button" — (no label)',
                        type: "error",
                        sub:
                          'Screen reader announces: "button" • User has no idea what this does' +
                          (iss.element_selector
                            ? " • " + iss.element_selector
                            : ""),
                        announce: "button",
                      });
                    });
                    missingLinks.slice(0, 4).forEach(function (iss) {
                      tabStops.push({
                        icon: "⚠️",
                        text: '"link" — (no text)',
                        type: "error",
                        sub:
                          'Screen reader announces: "link" • Could go anywhere — user must guess' +
                          (iss.element_selector
                            ? " • " + iss.element_selector
                            : ""),
                        announce: "link",
                      });
                    });
                    missingLabels.slice(0, 4).forEach(function (iss) {
                      tabStops.push({
                        icon: "⚠️",
                        text: '"edit" — (no label)',
                        type: "error",
                        sub:
                          'Screen reader announces: "edit, blank" • User cannot tell what to type' +
                          (iss.element_selector
                            ? " • " + iss.element_selector
                            : ""),
                        announce: "edit, blank",
                      });
                    });

                    if (tabStops.length > 0) {
                      addLine("🔈", "Tab →", "dim");
                      tabStops.forEach(function (stop) {
                        addLine(stop.icon, stop.text, stop.type, stop.sub);
                      });
                    } else {
                      addLine(
                        "✓",
                        "Interactive elements appear properly labeled",
                        "ok"
                      );
                    }

                    // Images
                    if (missingAlt.length > 0) {
                      addLine("🖼", "Images:", "heading");
                      missingAlt.slice(0, 5).forEach(function (iss) {
                        addLine(
                          "⚠️",
                          '"image" — no alt text',
                          "error",
                          'Screen reader announces: "graphic" or reads the filename (e.g., "IMG_3847.jpg")' +
                            (iss.element_selector
                              ? " • " + iss.element_selector
                              : "")
                        );
                      });
                      if (missingAlt.length > 5) {
                        addLine(
                          "",
                          "...and " +
                            (missingAlt.length - 5) +
                            " more images without alt text",
                          "dim"
                        );
                      }
                    }

                    // ARIA issues
                    if (ariaIssues.length > 0) {
                      addLine("🏷", "ARIA roles and attributes:", "heading");
                      ariaIssues.slice(0, 3).forEach(function (iss) {
                        addLine(
                          "⚠️",
                          "Invalid ARIA: " + iss.rule_id,
                          "error",
                          "Incorrect ARIA causes the screen reader to misrepresent or skip elements" +
                            (iss.element_selector
                              ? " • " + iss.element_selector
                              : "")
                        );
                      });
                    }

                    // Contrast
                    if (contrastIssues.length > 0) {
                      addLine("🔆", "Visual clarity:", "heading");
                      addLine(
                        "⚠️",
                        contrastIssues.length +
                          " element" +
                          (contrastIssues.length !== 1 ? "s" : "") +
                          " with insufficient color contrast",
                        "warn",
                        "Users with low vision using screen magnifiers may not be able to read this text"
                      );
                    }

                    // Summary
                    var totalProblems =
                      missingAlt.length +
                      missingButtons.length +
                      missingLinks.length +
                      missingLabels.length +
                      headingIssues.length +
                      ariaIssues.length +
                      landmarkIssues.length +
                      docLang.length;
                    addLine("", "─".repeat(50), "divider");
                    if (totalProblems === 0) {
                      addLine(
                        "✅",
                        "This page has no detected screen reader issues.",
                        "summary-ok"
                      );
                    } else {
                      addLine(
                        "📊",
                        totalProblems +
                          " accessibility barrier" +
                          (totalProblems !== 1 ? "s" : "") +
                          " detected — this page would be " +
                          (totalProblems > 5
                            ? "very difficult"
                            : "challenging") +
                          " for a screen reader user",
                        "summary-bad"
                      );
                    }

                    return lines.map(function (line) {
                      var bg = "transparent";
                      var textColor = "#c8c8e0";
                      var borderLeft = "3px solid transparent";

                      if (line.type === "error") {
                        bg = "rgba(248,81,73,0.06)";
                        textColor = "#ff8888";
                        borderLeft = "3px solid #f85149";
                      } else if (line.type === "warn") {
                        bg = "rgba(240,136,62,0.06)";
                        textColor = "#f0a060";
                        borderLeft = "3px solid #f0883e";
                      } else if (line.type === "ok") {
                        textColor = "#58d68d";
                      } else if (line.type === "heading") {
                        textColor = "#aaaadd";
                      } else if (line.type === "announce") {
                        textColor = "#7c7cff";
                      } else if (line.type === "dim") {
                        textColor = "#555577";
                      } else if (line.type === "divider") {
                        textColor = "#333355";
                      } else if (line.type === "summary-ok") {
                        textColor = "#58d68d";
                        bg = "rgba(88,214,141,0.06)";
                      } else if (line.type === "summary-bad") {
                        textColor = "#ff8888";
                        bg = "rgba(248,81,73,0.08)";
                        borderLeft = "3px solid #f85149";
                      }

                      return (
                        <div
                          key={line.idx}
                          style={{
                            padding: "0.35rem 0.6rem",
                            borderRadius: 4,
                            background: bg,
                            borderLeft: borderLeft,
                            marginBottom: "0.15rem",
                            animation: "srFadeIn 0.3s ease forwards",
                            animationDelay: line.idx * 0.04 + "s",
                            opacity: 0,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "0.5rem",
                            }}
                          >
                            {line.icon && (
                              <span
                                style={{
                                  fontSize: "0.72rem",
                                  flexShrink: 0,
                                  width: 18,
                                  textAlign: "center",
                                }}
                              >
                                {line.icon}
                              </span>
                            )}
                            <span style={{ color: textColor }}>
                              {line.text}
                            </span>
                          </div>
                          {line.sub && (
                            <div
                              style={{
                                marginTop: "0.2rem",
                                paddingLeft: "1.6rem",
                                fontSize: "0.62rem",
                                color: "#666688",
                                lineHeight: 1.5,
                              }}
                            >
                              {line.sub}
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* What this means — explanation card */}
              <div
                style={{
                  background: t.cardBg,
                  borderRadius: 10,
                  border: "1px solid " + t.ink08,
                  padding: "1rem 1.2rem",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.68rem",
                    fontWeight: 600,
                    color: t.ink,
                    marginBottom: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <Volume2 size={13} color={t.accent} />
                  What you're seeing above
                </div>
                <div
                  style={{
                    fontSize: "0.74rem",
                    color: t.ink50,
                    lineHeight: 1.7,
                  }}
                >
                  This simulates the sequential, audio-only experience of a
                  blind or low-vision user navigating your page with NVDA or
                  VoiceOver. Screen readers read content linearly — there's no
                  visual layout, no colors, no spatial relationships. Users
                  navigate by pressing{" "}
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      padding: "0.1rem 0.3rem",
                      borderRadius: 3,
                      background: t.ink04,
                      fontSize: "0.65rem",
                    }}
                  >
                    Tab
                  </span>{" "}
                  to move between interactive elements,{" "}
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      padding: "0.1rem 0.3rem",
                      borderRadius: 3,
                      background: t.ink04,
                      fontSize: "0.65rem",
                    }}
                  >
                    H
                  </span>{" "}
                  to jump between headings, and{" "}
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      padding: "0.1rem 0.3rem",
                      borderRadius: 3,
                      background: t.ink04,
                      fontSize: "0.65rem",
                    }}
                  >
                    D
                  </span>{" "}
                  to move between landmarks. When elements lack proper labels,
                  the user hears generic words like "button" or "link" with no
                  context — imagine navigating a building where every door is
                  unlabeled.
                </div>
              </div>
            </div>
          ) : loading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
                padding: "4rem",
                color: t.ink50,
              }}
            >
              <Loader2 size={28} className="xsbl-spin" color={t.accent} />
              <div style={{ fontFamily: "var(--mono)", fontSize: "0.78rem" }}>
                Capturing screenshot...
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.62rem",
                  color: t.ink50,
                }}
              >
                Loading {viewport} view of {site.domain}
              </div>
            </div>
          ) : !screenshot ? (
            <div
              style={{
                textAlign: "center",
                padding: "4rem",
                color: t.ink50,
                maxWidth: 400,
              }}
            >
              <AlertTriangle
                size={28}
                style={{ marginBottom: "0.8rem", opacity: 0.5 }}
              />
              <div
                style={{
                  fontSize: "0.88rem",
                  marginBottom: "0.5rem",
                  color: t.ink,
                  fontWeight: 600,
                }}
              >
                {screenshotError || "Could not capture screenshot"}
              </div>
              <div
                style={{
                  fontSize: "0.74rem",
                  marginBottom: "1.2rem",
                  lineHeight: 1.6,
                }}
              >
                {!screenshotError &&
                  "Try refreshing or check that the site is accessible."}{" "}
                Some sites block automated browsers, require login, or have
                aggressive bot protection.
              </div>
              <button
                onClick={function () {
                  setRetryCount(retryCount + 1);
                }}
                style={{
                  padding: "0.5rem 1.2rem",
                  borderRadius: 6,
                  border: "none",
                  background: t.accent,
                  color: "white",
                  fontFamily: "var(--mono)",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <RefreshCw size={13} /> Retry screenshot
              </button>
            </div>
          ) : splitView ? (
            /* ── Split View ── */
            <div
              ref={splitRef}
              onMouseMove={handleMouseTrack}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: screenshot.width * zoom,
                overflow: "hidden",
                borderRadius: 8,
                boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
              }}
            >
              {/* Filtered (right) — base layer, gives container its height */}
              <img
                src={screenshot.image}
                alt="Simulated view"
                draggable={false}
                style={{
                  width: screenshot.width * zoom,
                  height: "auto",
                  display: "block",
                  filter:
                    currentMode.special === "cataracts"
                      ? "blur(1.5px) sepia(0.45) brightness(0.85) contrast(0.65) saturate(0.8)"
                      : currentMode.matrix
                      ? "url(#filter-" + mode + ")"
                      : currentMode.filter || "none",
                  pointerEvents: "none",
                }}
              />
              {/* Tunnel vision on right side */}
              {currentMode.special === "tunnel" && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    background:
                      "radial-gradient(circle 120px at " +
                      mousePos.x +
                      "% " +
                      mousePos.y +
                      "%, transparent 0%, transparent 60%, rgba(0,0,0,0.6) 75%, rgba(0,0,0,0.95) 100%)",
                    transition: "background 0.08s ease-out",
                  }}
                />
              )}
              {/* Macular degeneration on right side */}
              {currentMode.special === "macular" && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    background:
                      "radial-gradient(ellipse 140px 120px at " +
                      mousePos.x +
                      "% " +
                      mousePos.y +
                      "%, rgba(70,60,50,0.95) 0%, rgba(50,40,30,0.75) 30%, rgba(30,25,20,0.4) 55%, rgba(0,0,0,0.08) 70%, transparent 85%)",
                    transition: "background 0.08s ease-out",
                  }}
                />
              )}
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  padding: "0.2rem 0.5rem",
                  borderRadius: 4,
                  background: "rgba(0,0,0,0.6)",
                  color: "white",
                  fontFamily: "var(--mono)",
                  fontSize: "0.55rem",
                  fontWeight: 600,
                  zIndex: 1,
                }}
              >
                {currentMode.name}
              </div>

              {/* Normal (left) — clipped overlay on top */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: splitPos + "%",
                  overflow: "hidden",
                  zIndex: 2,
                }}
              >
                <img
                  src={screenshot.image}
                  alt="Normal view"
                  draggable={false}
                  style={{
                    width: screenshot.width * zoom,
                    height: "auto",
                    display: "block",
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    padding: "0.2rem 0.5rem",
                    borderRadius: 4,
                    background: "rgba(0,0,0,0.6)",
                    color: "white",
                    fontFamily: "var(--mono)",
                    fontSize: "0.55rem",
                    fontWeight: 600,
                  }}
                >
                  Normal
                </div>
              </div>

              {/* Slider handle — wider hit area for easier grabbing */}
              <div
                onMouseDown={function () {
                  isDragging.current = true;
                }}
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: "calc(" + splitPos + "% - 12px)",
                  width: 24,
                  cursor: "col-resize",
                  zIndex: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Visible line */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: "50%",
                    width: 2,
                    marginLeft: -1,
                    background: "white",
                    boxShadow: "0 0 8px rgba(0,0,0,0.3)",
                  }}
                />
                {/* Grab handle pill */}
                <div
                  style={{
                    position: "relative",
                    width: 36,
                    height: 48,
                    borderRadius: 18,
                    background: "white",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <MoveHorizontal size={16} color="#666" />
                </div>
              </div>
            </div>
          ) : (
            /* ── Single View ── */
            <div
              ref={imgContainerRef}
              onMouseMove={handleMouseTrack}
              style={{
                position: "relative",
                borderRadius: 8,
                overflow: "hidden",
                boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
                cursor:
                  currentMode.special === "tunnel" ||
                  currentMode.special === "macular"
                    ? "none"
                    : "default",
              }}
            >
              <img
                src={screenshot.image}
                alt={currentMode.name + " simulation"}
                style={{
                  width: (screenshot.width || 1440) * zoom,
                  height: "auto",
                  display: "block",
                  filter:
                    currentMode.special === "cataracts"
                      ? "blur(1.5px) sepia(0.45) brightness(0.85) contrast(0.65) saturate(0.8)"
                      : currentMode.matrix
                      ? "url(#filter-" + mode + ")"
                      : currentMode.filter || "none",
                  transition: "filter 0.4s ease",
                  transform:
                    mode === "cataracts" || mode === "blurred"
                      ? "translate(" +
                        nystagmusOffset.x +
                        "px, " +
                        nystagmusOffset.y +
                        "px)"
                      : "none",
                }}
              />

              {/* Cataracts — layered realistic overlay: halos, glare, edge darkening */}
              {currentMode.special === "cataracts" && (
                <>
                  {/* Yellowed haze layer */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      background:
                        "radial-gradient(ellipse at 60% 30%, rgba(180,155,80,0.18) 0%, rgba(140,110,50,0.12) 50%, rgba(80,60,20,0.2) 100%)",
                      mixBlendMode: "multiply",
                    }}
                  />
                  {/* Light scatter / halo effect */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      background:
                        "radial-gradient(ellipse at 50% 40%, rgba(255,240,200,0.15) 0%, transparent 60%)",
                      mixBlendMode: "screen",
                    }}
                  />
                  {/* Edge darkening (vignette) — cataracts reduce peripheral clarity */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      background:
                        "radial-gradient(ellipse at center, transparent 40%, rgba(60,40,10,0.35) 100%)",
                    }}
                  />
                  {/* Streaky glare artifacts */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      background:
                        "linear-gradient(135deg, transparent 30%, rgba(255,250,220,0.08) 45%, transparent 55%, rgba(255,250,220,0.05) 70%, transparent 80%)",
                    }}
                  />
                </>
              )}

              {/* Tunnel vision overlay — follows mouse */}
              {currentMode.special === "tunnel" && (
                <>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      background:
                        "radial-gradient(circle 120px at " +
                        mousePos.x +
                        "% " +
                        mousePos.y +
                        "%, transparent 0%, transparent 60%, rgba(0,0,0,0.6) 75%, rgba(0,0,0,0.95) 100%)",
                      transition: "background 0.08s ease-out",
                    }}
                  />
                  {/* Inner ring — slight blur at edges of visible area */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      background:
                        "radial-gradient(circle 140px at " +
                        mousePos.x +
                        "% " +
                        mousePos.y +
                        "%, transparent 55%, rgba(0,0,0,0.15) 70%, transparent 75%)",
                      transition: "background 0.08s ease-out",
                    }}
                  />
                  {/* "Move your eyes" hint */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 60,
                      left: "50%",
                      transform: "translateX(-50%)",
                      padding: "0.3rem 0.8rem",
                      borderRadius: 20,
                      background: "rgba(0,0,0,0.6)",
                      backdropFilter: "blur(4px)",
                      fontFamily: "var(--mono)",
                      fontSize: "0.6rem",
                      color: "rgba(255,255,255,0.7)",
                      whiteSpace: "nowrap",
                      pointerEvents: "none",
                    }}
                  >
                    Move your mouse to simulate eye movement
                  </div>
                </>
              )}

              {/* Macular degeneration — scotoma follows mouse (where you look, you can't see) */}
              {currentMode.special === "macular" && (
                <>
                  {/* Central scotoma — follows gaze */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      background:
                        "radial-gradient(ellipse 140px 120px at " +
                        mousePos.x +
                        "% " +
                        mousePos.y +
                        "%, rgba(70,60,50,0.95) 0%, rgba(50,40,30,0.75) 30%, rgba(30,25,20,0.4) 55%, rgba(0,0,0,0.08) 70%, transparent 85%)",
                      transition: "background 0.08s ease-out",
                    }}
                  />
                  {/* Distortion ring around scotoma */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      background:
                        "radial-gradient(ellipse 180px 160px at " +
                        mousePos.x +
                        "% " +
                        mousePos.y +
                        "%, transparent 40%, rgba(80,70,50,0.12) 55%, transparent 70%)",
                      transition: "background 0.08s ease-out",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 60,
                      left: "50%",
                      transform: "translateX(-50%)",
                      padding: "0.3rem 0.8rem",
                      borderRadius: 20,
                      background: "rgba(0,0,0,0.6)",
                      backdropFilter: "blur(4px)",
                      fontFamily: "var(--mono)",
                      fontSize: "0.6rem",
                      color: "rgba(255,255,255,0.7)",
                      whiteSpace: "nowrap",
                      pointerEvents: "none",
                    }}
                  >
                    Your central vision is lost — you see around where you look,
                    not at it
                  </div>
                </>
              )}

              {/* Issue markers overlay */}
              {showIssues && pageIssues.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                  }}
                >
                  {/* Issue count badge */}
                  <div
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      pointerEvents: "auto",
                      padding: "0.4rem 0.7rem",
                      borderRadius: 8,
                      background: "rgba(0,0,0,0.75)",
                      backdropFilter: "blur(8px)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <AlertTriangle size={13} color="#f85149" />
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "0.68rem",
                        color: "white",
                        fontWeight: 600,
                      }}
                    >
                      {pageIssues.length} issue
                      {pageIssues.length !== 1 ? "s" : ""} found
                    </span>
                  </div>

                  {/* Pulsing issue indicators scattered across the page */}
                  {pageIssues.slice(0, 8).map(function (iss, i) {
                    // Distribute markers across the page visually
                    var top = 15 + i * 10 + (i % 3) * 5;
                    var left = 10 + (i % 4) * 22;
                    var color =
                      iss.impact === "critical"
                        ? "#f85149"
                        : iss.impact === "serious"
                        ? "#f85149"
                        : "#f0883e";
                    return (
                      <div
                        key={i}
                        style={{
                          position: "absolute",
                          top: top + "%",
                          left: left + "%",
                          pointerEvents: "auto",
                        }}
                      >
                        {/* Pulse ring */}
                        <div
                          style={{
                            position: "absolute",
                            top: -8,
                            left: -8,
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            border: "2px solid " + color,
                            animation: "issuePulse 2s ease-in-out infinite",
                            animationDelay: i * 0.3 + "s",
                            opacity: 0.5,
                          }}
                        />
                        {/* Marker dot */}
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: color,
                            boxShadow: "0 0 6px " + color,
                          }}
                        />
                        {/* Label */}
                        <div
                          style={{
                            position: "absolute",
                            top: -2,
                            left: 14,
                            background: "rgba(0,0,0,0.8)",
                            padding: "0.12rem 0.35rem",
                            borderRadius: 3,
                            whiteSpace: "nowrap",
                            fontFamily: "var(--mono)",
                            fontSize: "0.5rem",
                            color: "white",
                            fontWeight: 600,
                          }}
                        >
                          {iss.rule_id}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Mode label */}
              {mode !== "normal" && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 12,
                    left: 12,
                    padding: "0.35rem 0.7rem",
                    borderRadius: 6,
                    background: "rgba(0,0,0,0.7)",
                    backdropFilter: "blur(8px)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <span style={{ fontSize: "0.85rem" }}>
                    {currentMode.icon}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.65rem",
                      color: "white",
                      fontWeight: 600,
                    }}
                  >
                    {currentMode.name}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes xsbl-spin { to { transform: rotate(360deg); } }
        .xsbl-spin { animation: xsbl-spin 0.6s linear infinite; }
        @keyframes issuePulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes srFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .show-mobile-only { display: none !important; }
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .show-mobile-only { display: flex !important; }
          .xsbl-sim-sidebar {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            bottom: 0 !important;
            width: 280px !important;
            transform: translateX(${sidebarOpen ? "0" : "-100%"});
            transition: transform 0.25s ease !important;
            box-shadow: ${
              sidebarOpen ? "4px 0 24px rgba(0,0,0,0.15)" : "none"
            } !important;
          }
        }
      `}</style>
    </div>
  );
}
