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
    desc: "Simulates reduced visual acuity",
    category: "lowvision",
    filter: "blur(2.5px)",
    matrix: null,
  },
  {
    id: "lowcontrast",
    name: "Low contrast",
    icon: <Contrast size={14} />,
    desc: "Reduced contrast sensitivity",
    category: "lowvision",
    filter: "contrast(0.4) brightness(1.1)",
    matrix: null,
  },
  {
    id: "cataracts",
    name: "Cataracts",
    icon: <Cloud size={14} />,
    desc: "Yellowed, hazy vision — common in elderly",
    category: "lowvision",
    filter: "blur(1px) sepia(0.5) brightness(0.9) contrast(0.7)",
    matrix: null,
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
  const [viewport, setViewport] = useState("desktop");
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

  // Load screenshot
  useEffect(
    function () {
      setLoading(true);
      setScreenshot(null);
      var targetUrl = activeUrl || baseUrl;
      supabase.auth.getSession().then(function (res) {
        var session = res.data.session;
        supabase.functions
          .invoke("screenshot-site", {
            body: { url: targetUrl, viewport: viewport },
            headers: {
              Authorization: "Bearer " + (session ? session.access_token : ""),
            },
          })
          .then(function (res) {
            if (res.data && res.data.image) setScreenshot(res.data);
            setLoading(false);
          })
          .catch(function () {
            setLoading(false);
          });
      });
    },
    [activeUrl, baseUrl, viewport]
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
                maxWidth: 700,
                background: t.cardBg,
                borderRadius: 12,
                border: "1px solid " + t.ink08,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "1rem 1.2rem",
                  background: t.ink04,
                  borderBottom: "1px solid " + t.ink08,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Volume2 size={16} color={t.accent} />
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color: t.ink,
                  }}
                >
                  Screen reader output
                </span>
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.6rem",
                    color: t.ink50,
                    marginLeft: "auto",
                  }}
                >
                  Based on {pageIssues.length} open issue
                  {pageIssues.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div
                style={{
                  padding: "1.2rem",
                  maxHeight: "calc(100vh - 200px)",
                  overflowY: "auto",
                }}
              >
                {/* What a blind user would miss */}
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

                  var sections = [
                    {
                      title: "Images without alt text",
                      icon: <EyeOff size={14} />,
                      items: missingAlt,
                      color: "#c0392b",
                      note: "Screen readers announce these as 'image' with no description — the user has no idea what's shown.",
                    },
                    {
                      title: "Buttons without labels",
                      icon: <AlertTriangle size={14} />,
                      items: missingButtons,
                      color: "#c0392b",
                      note: "Announced as 'button' — the user can't tell what it does.",
                    },
                    {
                      title: "Links without text",
                      icon: <AlertTriangle size={14} />,
                      items: missingLinks,
                      color: "#e67e22",
                      note: "Read as 'link' with no destination — unusable for navigation.",
                    },
                    {
                      title: "Form inputs without labels",
                      icon: <AlertTriangle size={14} />,
                      items: missingLabels,
                      color: "#e67e22",
                      note: "Announced as 'edit text' with no context — users can't fill in forms.",
                    },
                    {
                      title: "Heading hierarchy issues",
                      icon: <AlertTriangle size={14} />,
                      items: headingIssues,
                      color: "#b45309",
                      note: "Screen reader users navigate by headings — broken hierarchy means broken navigation.",
                    },
                    {
                      title: "ARIA issues",
                      icon: <AlertTriangle size={14} />,
                      items: ariaIssues,
                      color: "#b45309",
                      note: "Incorrect ARIA attributes cause screen readers to misrepresent elements.",
                    },
                    {
                      title: "Color contrast (low vision)",
                      icon: <Contrast size={14} />,
                      items: contrastIssues,
                      color: "#b45309",
                      note: "Users with partial vision and screen magnifiers rely on sufficient contrast.",
                    },
                  ].filter(function (s) {
                    return s.items.length > 0;
                  });

                  if (sections.length === 0) {
                    return (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "3rem 1rem",
                          color: t.ink50,
                        }}
                      >
                        <Eye
                          size={32}
                          style={{ marginBottom: "0.5rem", opacity: 0.4 }}
                        />
                        <div
                          style={{
                            fontSize: "0.92rem",
                            fontWeight: 600,
                            color: t.ink,
                            marginBottom: "0.3rem",
                          }}
                        >
                          No screen reader issues detected
                        </div>
                        <div style={{ fontSize: "0.78rem" }}>
                          This page looks good for assistive technology users.
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div>
                      <p
                        style={{
                          fontSize: "0.82rem",
                          color: t.ink50,
                          lineHeight: 1.7,
                          marginBottom: "1.2rem",
                        }}
                      >
                        This shows how a screen reader user experiences your
                        page. Each section below represents content that is
                        broken, missing, or confusing for assistive technology.
                      </p>

                      {sections.map(function (sec, si) {
                        return (
                          <div key={si} style={{ marginBottom: "1rem" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.4rem",
                                marginBottom: "0.5rem",
                              }}
                            >
                              <span style={{ color: sec.color }}>
                                {sec.icon}
                              </span>
                              <span
                                style={{
                                  fontSize: "0.82rem",
                                  fontWeight: 700,
                                  color: t.ink,
                                }}
                              >
                                {sec.title}
                              </span>
                              <span
                                style={{
                                  fontFamily: "var(--mono)",
                                  fontSize: "0.62rem",
                                  fontWeight: 600,
                                  padding: "0.08rem 0.35rem",
                                  borderRadius: 3,
                                  background: sec.color + "15",
                                  color: sec.color,
                                }}
                              >
                                {sec.items.length}
                              </span>
                            </div>
                            <p
                              style={{
                                fontSize: "0.74rem",
                                color: t.ink50,
                                lineHeight: 1.5,
                                margin: "0 0 0.5rem",
                                fontStyle: "italic",
                              }}
                            >
                              {sec.note}
                            </p>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.3rem",
                              }}
                            >
                              {sec.items.slice(0, 5).map(function (iss, ii) {
                                return (
                                  <div
                                    key={ii}
                                    style={{
                                      padding: "0.5rem 0.7rem",
                                      borderRadius: 6,
                                      background: t.ink04,
                                      border: "1px solid " + t.ink08,
                                      fontFamily: "var(--mono)",
                                      fontSize: "0.7rem",
                                    }}
                                  >
                                    {/* What the screen reader says */}
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: "0.5rem",
                                        marginBottom: iss.element_selector
                                          ? "0.3rem"
                                          : 0,
                                      }}
                                    >
                                      <Volume2
                                        size={12}
                                        color={t.accent}
                                        style={{ marginTop: 2, flexShrink: 0 }}
                                      />
                                      <span style={{ color: t.ink }}>
                                        {iss.rule_id === "image-alt"
                                          ? '"image"'
                                          : iss.rule_id === "button-name"
                                          ? '"button"'
                                          : iss.rule_id === "link-name"
                                          ? '"link"'
                                          : iss.rule_id === "label"
                                          ? '"edit text"'
                                          : '"' +
                                            (iss.description || iss.rule_id) +
                                            '"'}
                                        <span style={{ color: t.ink50 }}>
                                          {" "}
                                          — no context provided
                                        </span>
                                      </span>
                                    </div>
                                    {iss.element_selector && (
                                      <div
                                        style={{
                                          fontSize: "0.6rem",
                                          color: t.ink50,
                                          paddingLeft: "1.25rem",
                                          wordBreak: "break-all",
                                        }}
                                      >
                                        {iss.element_selector}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                              {sec.items.length > 5 && (
                                <div
                                  style={{
                                    fontSize: "0.68rem",
                                    color: t.ink50,
                                    paddingLeft: "0.5rem",
                                  }}
                                >
                                  + {sec.items.length - 5} more
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
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
              style={{ textAlign: "center", padding: "4rem", color: t.ink50 }}
            >
              <div style={{ fontSize: "0.88rem", marginBottom: "0.5rem" }}>
                Could not capture screenshot
              </div>
              <div style={{ fontSize: "0.74rem" }}>
                Try refreshing or check that the site is accessible
              </div>
            </div>
          ) : splitView ? (
            /* ── Split View ── */
            <div
              ref={splitRef}
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
                  filter: currentMode.matrix
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
                      "radial-gradient(circle at center, transparent 20%, rgba(0,0,0,0.85) 50%)",
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
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: 280,
                      height: 280,
                      borderRadius: "50%",
                      background:
                        "radial-gradient(ellipse at center, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.2) 60%, transparent 80%)",
                      boxShadow: "0 0 100px 60px rgba(0,0,0,0.12)",
                      flexShrink: 0,
                    }}
                  />
                </div>
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
                    position: "fixed",
                    top: "50%",
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
              style={{
                position: "relative",
                borderRadius: 8,
                overflow: "hidden",
                boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
              }}
            >
              <img
                src={screenshot.image}
                alt={currentMode.name + " simulation"}
                style={{
                  width: (screenshot.width || 1440) * zoom,
                  height: "auto",
                  display: "block",
                  filter: currentMode.matrix
                    ? "url(#filter-" + mode + ")"
                    : currentMode.filter || "none",
                  transition: "filter 0.4s ease",
                }}
              />

              {/* Tunnel vision overlay */}
              {currentMode.special === "tunnel" && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    background:
                      "radial-gradient(circle at center, transparent 20%, rgba(0,0,0,0.85) 50%)",
                  }}
                />
              )}

              {/* Macular degeneration overlay — central scotoma, fixed to viewport center */}
              {currentMode.special === "macular" && (
                <div
                  style={{
                    position: "fixed",
                    top: "50%",
                    inset: 0,
                    pointerEvents: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      position: "sticky",
                      top: "30%",
                      width: 320,
                      height: 320,
                      borderRadius: "50%",
                      background:
                        "radial-gradient(ellipse at center, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.2) 60%, transparent 80%)",
                      boxShadow: "0 0 120px 80px rgba(0,0,0,0.15)",
                      flexShrink: 0,
                    }}
                  />
                </div>
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
