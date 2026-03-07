import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabase";
import {
  Image,
  Sparkles,
  Copy,
  Check,
  Loader2,
  Eye,
  AlertTriangle,
} from "lucide-react";
import "../../styles/dashboard.css";
import "../../styles/dashboard-modals.css";

/*
  AltTextGenerator — shown in the IssueDetailModal when the issue is
  about missing alt text (rule_id contains "image-alt" or similar).
  
  Takes the image URL from the issue context, calls the generate-alt-text
  edge function, and displays the suggestion with a copy button.
*/

function extractImageUrl(html, pageUrl) {
  // Try to find src attribute in the element HTML
  const srcMatch = html?.match(/src=["']([^"']+)["']/);
  if (!srcMatch) return null;

  let src = srcMatch[1];

  // Resolve relative URLs
  if (src && !src.startsWith("http")) {
    try {
      src = new URL(src, pageUrl).href;
    } catch {
      return null;
    }
  }

  return src;
}

export default function AltTextGenerator({ issue }) {
  const { t } = useTheme();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const imageUrl = extractImageUrl(issue.element_html, issue.page_url);
  const isAltTextIssue = /image-alt|img-alt|image-redundant|input-image/.test(
    issue.rule_id || ""
  );

  // Don't render if not an image-related issue or no image URL found
  if (!isAltTextIssue || !imageUrl) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const {
        data: { session: altSession },
      } = await supabase.auth.getSession();
      const { data, error: fnError } = await supabase.functions.invoke(
        "generate-alt-text",
        {
          headers: { Authorization: `Bearer ${altSession?.access_token}` },
          body: {
            image_url: imageUrl,
            page_url: issue.page_url,
            page_title: "",
            element_html: issue.element_html?.slice(0, 500),
            surrounding_text: issue.description,
          },
        }
      );

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      setResult(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        marginTop: "0.8rem",
        padding: "0.9rem",
        borderRadius: 8,
        border: `1px solid ${t.accent}20`,
        background: t.accentBg,
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
        <Image size={14} color={t.accent} strokeWidth={2} />
        <span style={{ fontSize: "0.78rem", fontWeight: 600, color: t.accent }}>
          AI alt text
        </span>
      </div>

      {/* Image preview toggle */}
      <div style={{ marginBottom: "0.6rem" }}>
        <button
          onClick={() => setShowPreview(!showPreview)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            color: t.ink50,
            fontSize: "0.7rem",
            fontFamily: "var(--body)",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
          }}
        >
          <Eye size={12} /> {showPreview ? "Hide" : "Show"} image
        </button>
        {showPreview && (
          <div
            style={{
              marginTop: "0.4rem",
              borderRadius: 6,
              overflow: "hidden",
              border: `1px solid ${t.ink08}`,
              maxWidth: 280,
            }}
          >
            <img
              src={imageUrl}
              alt="Preview of the image missing alt text"
              style={{
                display: "block",
                width: "100%",
                maxHeight: 180,
                objectFit: "contain",
                background: t.paper,
              }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <div
              style={{
                padding: "0.3rem 0.5rem",
                fontFamily: "var(--mono)",
                fontSize: "0.55rem",
                color: t.ink50,
                background: t.ink04,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {imageUrl}
            </div>
          </div>
        )}
      </div>

      {/* Generate button or result */}
      {!result && !loading && (
        <button
          onClick={handleGenerate}
          style={{
            padding: "0.45rem 0.85rem",
            borderRadius: 6,
            border: "none",
            background: t.accent,
            color: "white",
            fontFamily: "var(--body)",
            fontSize: "0.78rem",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
          }}
        >
          <Sparkles size={13} /> Generate alt text
        </button>
      )}

      {loading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            color: t.accent,
            fontSize: "0.78rem",
          }}
        >
          <Loader2 size={14} className="xsbl-spin" /> Analyzing image…
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "0.5rem 0.7rem",
            borderRadius: 6,
            background: `${t.red}08`,
            border: `1px solid ${t.red}20`,
            color: t.red,
            fontSize: "0.76rem",
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
          }}
        >
          <AlertTriangle size={13} /> {error}
        </div>
      )}

      {result && (
        <div>
          {/* Decorative notice */}
          {result.is_decorative && (
            <div
              style={{
                padding: "0.4rem 0.6rem",
                borderRadius: 5,
                marginBottom: "0.5rem",
                background: t.ink04,
                fontSize: "0.74rem",
                color: t.ink50,
              }}
            >
              This image appears to be decorative. Use{" "}
              <code
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.68rem",
                  color: t.accent,
                }}
              >
                alt=""
              </code>{" "}
              to hide it from screen readers.
            </div>
          )}

          {/* Alt text result */}
          {!result.is_decorative && (
            <div
              style={{
                padding: "0.6rem 0.8rem",
                borderRadius: 6,
                background: t.cardBg,
                border: `1px solid ${t.ink08}`,
                marginBottom: "0.5rem",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.6rem",
                  color: t.ink50,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "0.25rem",
                }}
              >
                Suggested alt text
              </div>
              <div
                style={{
                  fontSize: "0.84rem",
                  color: t.ink,
                  lineHeight: 1.55,
                  marginBottom: "0.5rem",
                }}
              >
                "{result.alt_text}"
              </div>

              {/* Copy buttons */}
              <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                <button
                  onClick={() => handleCopy(result.alt_text)}
                  style={{
                    padding: "0.25rem 0.55rem",
                    borderRadius: 4,
                    border: `1px solid ${t.ink20}`,
                    background: "none",
                    color: t.ink,
                    fontFamily: "var(--mono)",
                    fontSize: "0.65rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.2rem",
                  }}
                >
                  {copied ? (
                    <Check size={11} color={t.green} />
                  ) : (
                    <Copy size={11} />
                  )}
                  {copied ? "Copied" : "Copy text"}
                </button>
                <button
                  onClick={() => handleCopy(`alt="${result.alt_text}"`)}
                  style={{
                    padding: "0.25rem 0.55rem",
                    borderRadius: 4,
                    border: `1px solid ${t.ink20}`,
                    background: "none",
                    color: t.ink,
                    fontFamily: "var(--mono)",
                    fontSize: "0.65rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.2rem",
                  }}
                >
                  <Copy size={11} /> Copy as attribute
                </button>
              </div>
            </div>
          )}

          {/* Confidence + reasoning */}
          <div
            style={{
              display: "flex",
              gap: "0.6rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {result.confidence && (
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.6rem",
                  color:
                    result.confidence >= 0.8
                      ? t.green
                      : result.confidence >= 0.6
                      ? t.amber
                      : t.red,
                }}
              >
                {Math.round(result.confidence * 100)}% confidence
              </span>
            )}
            {result.reasoning && (
              <span style={{ fontSize: "0.68rem", color: t.ink50 }}>
                {result.reasoning}
              </span>
            )}
          </div>

          {/* Regenerate */}
          <button
            onClick={handleGenerate}
            style={{
              marginTop: "0.5rem",
              background: "none",
              border: "none",
              padding: 0,
              color: t.accent,
              fontSize: "0.72rem",
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "var(--body)",
            }}
          >
            Regenerate
          </button>
        </div>
      )}

      <style>{`@keyframes xsbl-spin { to { transform: rotate(360deg); } } .xsbl-spin { animation: xsbl-spin 0.6s linear infinite; }`}</style>
    </div>
  );
}
