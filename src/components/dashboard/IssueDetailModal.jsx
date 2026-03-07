import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabase";
import {
  X,
  Copy,
  Check,
  Sparkles,
  Loader2,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react";
import CreatePRButton from "./CreatePRButton";
import AltTextGenerator from "./AltTextGenerator";
import PlanGate from "../ui/PlanGate";
import { useAuth } from "../../context/AuthContext";
import "../../styles/dashboard.css";
import "../../styles/dashboard-modals.css";

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "fixed", label: "Fixed" },
  { value: "ignored", label: "Ignored" },
  { value: "false_positive", label: "False positive" },
];

export default function IssueDetailModal({ issue, site, onClose, onUpdate }) {
  const { t } = useTheme();
  const { org } = useAuth();
  var plan = org?.plan || "free";
  const [copied, setCopied] = useState(false);
  const [aiFix, setAiFix] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [showHtml, setShowHtml] = useState(false);
  const [status, setStatus] = useState(issue.status);
  const [statusSaving, setStatusSaving] = useState(false);
  const dialogRef = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    previousFocus.current = document.activeElement;
    const dialog = dialogRef.current;
    if (dialog) {
      const close = dialog.querySelector("button");
      if (close) close.focus();
    }
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && dialog) {
        const focusable = dialog.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
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
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previousFocus.current) previousFocus.current.focus();
    };
  }, [onClose]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGetFix = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const {
        data: { session: fixSession },
      } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("suggest-fix", {
        headers: { Authorization: `Bearer ${fixSession?.access_token}` },
        body: {
          rule_id: issue.rule_id,
          description: issue.description,
          element_html: issue.element_html,
          element_selector: issue.element_selector,
          page_url: issue.page_url,
          wcag_tags: issue.wcag_tags,
          fix_suggestion: issue.fix_suggestion,
        },
      });
      if (res.error) throw new Error(res.error.message);
      setAiFix(res.data);
    } catch (err) {
      setAiError(err.message);
    }
    setAiLoading(false);
  };

  const handleStatusChange = async (newStatus) => {
    setStatusSaving(true);
    const { error } = await supabase
      .from("issues")
      .update({ status: newStatus })
      .eq("id", issue.id);
    if (!error) {
      setStatus(newStatus);
      onUpdate?.({ ...issue, status: newStatus });
    }
    setStatusSaving(false);
  };

  const impactColors = {
    critical: t.red,
    serious: t.red,
    moderate: t.amber,
    minor: t.accent,
  };

  return (
    <div
      className="dash-modal"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="issue-detail-title"
        className="dash-modal__dialog"
        style={{
          maxWidth: 620,
          maxHeight: "85vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          borderRadius: 16,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.2rem 1.5rem",
            borderBottom: `1px solid ${t.ink08}`,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.3rem",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  padding: "0.15rem 0.45rem",
                  borderRadius: 3,
                  textTransform: "uppercase",
                  background: `${impactColors[issue.impact]}15`,
                  color: impactColors[issue.impact],
                }}
              >
                {issue.impact}
              </span>
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.75rem",
                  color: t.accent,
                  fontWeight: 600,
                }}
              >
                {issue.rule_id}
              </span>
            </div>
            <h3
              id="issue-detail-title"
              style={{
                fontFamily: "var(--serif)",
                fontSize: "1.1rem",
                fontWeight: 700,
                color: t.ink,
                margin: 0,
                lineHeight: 1.35,
              }}
            >
              {issue.description}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              background: t.ink04,
              border: "none",
              borderRadius: 8,
              padding: "0.35rem",
              cursor: "pointer",
              color: t.ink50,
              flexShrink: 0,
              display: "flex",
            }}
          >
            <X size={18} strokeWidth={1.8} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "1.3rem 1.5rem", overflowY: "auto", flex: 1 }}>
          {/* WCAG tags */}
          {issue.wcag_tags?.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "0.3rem",
                flexWrap: "wrap",
                marginBottom: "1rem",
              }}
            >
              {issue.wcag_tags.map((tag, i) => (
                <span
                  key={i}
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.6rem",
                    color: t.ink50,
                    padding: "0.15rem 0.45rem",
                    borderRadius: 4,
                    background: t.ink04,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Page URL */}
          <div style={{ marginBottom: "1rem" }}>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.62rem",
                color: t.ink50,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "0.25rem",
              }}
            >
              Page
            </div>
            <a
              href={issue.page_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.74rem",
                color: t.accent,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              {issue.page_url} <ExternalLink size={12} />
            </a>
          </div>

          {/* Selector */}
          {issue.element_selector && (
            <div style={{ marginBottom: "1rem" }}>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.62rem",
                  color: t.ink50,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "0.25rem",
                }}
              >
                Selector
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <code
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.72rem",
                    color: t.ink,
                    padding: "0.45rem 0.7rem",
                    background: t.ink04,
                    borderRadius: 6,
                    flex: 1,
                    overflowX: "auto",
                    whiteSpace: "pre",
                  }}
                >
                  {issue.element_selector}
                </code>
                <button
                  onClick={() => handleCopy(issue.element_selector)}
                  style={{
                    background: "none",
                    border: `1px solid ${t.ink08}`,
                    borderRadius: 6,
                    padding: "0.3rem",
                    cursor: "pointer",
                    color: t.ink50,
                    flexShrink: 0,
                    display: "flex",
                  }}
                >
                  {copied ? (
                    <Check size={14} color={t.green} />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Element HTML */}
          {issue.element_html && (
            <div style={{ marginBottom: "1rem" }}>
              <button
                onClick={() => setShowHtml(!showHtml)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  fontFamily: "var(--mono)",
                  fontSize: "0.62rem",
                  color: t.ink50,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "0.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                {showHtml ? <EyeOff size={12} /> : <Eye size={12} />}
                {showHtml ? "Hide" : "Show"} element HTML
              </button>
              {showHtml && (
                <code
                  style={{
                    display: "block",
                    fontFamily: "var(--mono)",
                    fontSize: "0.68rem",
                    color: t.red,
                    padding: "0.6rem 0.8rem",
                    background: `${t.red}06`,
                    borderRadius: 8,
                    overflowX: "auto",
                    whiteSpace: "pre-wrap",
                    maxHeight: 120,
                    overflowY: "auto",
                    lineHeight: 1.6,
                  }}
                >
                  {issue.element_html}
                </code>
              )}
            </div>
          )}

          {/* axe-core fix suggestion */}
          {issue.fix_suggestion && (
            <div style={{ marginBottom: "1rem" }}>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.62rem",
                  color: t.ink50,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "0.25rem",
                }}
              >
                axe-core suggestion
              </div>
              <div
                style={{
                  fontSize: "0.82rem",
                  color: t.ink,
                  lineHeight: 1.6,
                  padding: "0.6rem 0.8rem",
                  background: t.greenBg,
                  borderRadius: 8,
                  border: `1px solid ${t.green}15`,
                }}
              >
                {issue.fix_suggestion}
              </div>
            </div>
          )}

          {/* AI fix */}
          <div
            style={{
              padding: "1rem",
              borderRadius: 10,
              background: t.accentBg,
              border: `1px solid ${t.accent}18`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                marginBottom: "0.6rem",
              }}
            >
              <Sparkles size={15} color={t.accent} />
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  color: t.accent,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                AI fix suggestion
              </span>
            </div>

            {!aiFix && !aiLoading && !aiError && (
              <button
                onClick={handleGetFix}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: 7,
                  border: `1.5px solid ${t.accent}`,
                  background: "none",
                  color: t.accent,
                  fontFamily: "var(--body)",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <Sparkles size={14} /> Generate fix
              </button>
            )}

            {aiLoading && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: t.accent,
                  fontSize: "0.82rem",
                }}
              >
                <Loader2 size={15} className="xsbl-spin" /> Generating fix...
              </div>
            )}

            {aiError && (
              <div style={{ color: t.red, fontSize: "0.82rem" }}>
                {aiError}
                <button
                  onClick={handleGetFix}
                  style={{
                    marginLeft: "0.5rem",
                    color: t.accent,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {aiFix && (
              <div>
                <p
                  style={{
                    fontSize: "0.84rem",
                    color: t.ink,
                    lineHeight: 1.6,
                    marginBottom: "0.8rem",
                  }}
                >
                  {aiFix.explanation}
                </p>
                {aiFix.code && (
                  <div style={{ position: "relative" }}>
                    <code
                      style={{
                        display: "block",
                        fontFamily: "var(--mono)",
                        fontSize: "0.72rem",
                        color: t.green,
                        padding: "0.8rem 1rem",
                        background: t.codeBg,
                        borderRadius: 8,
                        overflowX: "auto",
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.7,
                      }}
                    >
                      {aiFix.code}
                    </code>
                    <button
                      onClick={() => handleCopy(aiFix.code)}
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        background: t.ink08,
                        border: "none",
                        borderRadius: 5,
                        padding: "0.25rem 0.45rem",
                        cursor: "pointer",
                        color: t.ink50,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.2rem",
                        fontFamily: "var(--mono)",
                        fontSize: "0.58rem",
                      }}
                    >
                      {copied ? (
                        <Check size={11} color={t.green} />
                      ) : (
                        <Copy size={11} />
                      )}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                )}
                {aiFix.confidence && (
                  <div
                    style={{
                      marginTop: "0.5rem",
                      fontFamily: "var(--mono)",
                      fontSize: "0.62rem",
                      color: t.ink50,
                    }}
                  >
                    Confidence: {Math.round(aiFix.confidence * 100)}%
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI alt text for image issues */}
          <PlanGate
            currentPlan={plan}
            requiredPlan="pro"
            feature="AI alt text generation"
          >
            <AltTextGenerator issue={issue} />
          </PlanGate>

          {/* GitHub PR button — only shows when site has GitHub connected */}
          <CreatePRButton issue={issue} site={site} />

          {/* Status */}
          <div style={{ marginTop: "1.2rem" }}>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.62rem",
                color: t.ink50,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "0.4rem",
              }}
            >
              Status
            </div>
            <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
              {STATUS_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleStatusChange(value)}
                  disabled={statusSaving}
                  style={{
                    padding: "0.35rem 0.7rem",
                    borderRadius: 6,
                    fontSize: "0.76rem",
                    fontFamily: "var(--body)",
                    fontWeight: 500,
                    cursor: "pointer",
                    border: `1.5px solid ${
                      status === value ? t.accent : t.ink08
                    }`,
                    background: status === value ? t.accentBg : "transparent",
                    color: status === value ? t.accent : t.ink50,
                    opacity: statusSaving ? 0.5 : 1,
                    transition: "all 0.15s",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes xsbl-spin { to { transform: rotate(360deg); } } .xsbl-spin { animation: xsbl-spin 0.6s linear infinite; }`}</style>
    </div>
  );
}
