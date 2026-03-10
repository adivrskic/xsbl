import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabase";
import { ThumbsUp, ThumbsDown, Send, Check } from "lucide-react";

export default function PRFeedback({ prNumber, siteId }) {
  const { t } = useTheme();
  const [rating, setRating] = useState(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showComment, setShowComment] = useState(false);

  var handleRate = async function (value) {
    setRating(value);
    setShowComment(true);
  };

  var handleSubmit = async function () {
    try {
      await supabase.from("pr_feedback").insert({
        pr_number: prNumber,
        site_id: siteId,
        rating: rating,
        comment: comment.trim() || null,
      });
    } catch (_e) {
      // silently fail — feedback is non-critical
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.3rem",
          marginTop: "0.5rem",
          fontSize: "0.68rem",
          color: t.ink50,
        }}
      >
        <Check size={12} color={t.green} />
        Thanks for the feedback
      </div>
    );
  }

  return (
    <div style={{ marginTop: "0.5rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.58rem",
            color: t.ink50,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          How was this fix?
        </span>
        <button
          onClick={function () {
            handleRate(1);
          }}
          style={{
            background: rating === 1 ? t.green + "15" : "none",
            border: "1px solid " + (rating === 1 ? t.green + "40" : t.ink08),
            borderRadius: 5,
            padding: "0.2rem 0.35rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            color: rating === 1 ? t.green : t.ink50,
            transition: "all 0.15s",
          }}
        >
          <ThumbsUp size={12} />
        </button>
        <button
          onClick={function () {
            handleRate(-1);
          }}
          style={{
            background: rating === -1 ? t.red + "15" : "none",
            border: "1px solid " + (rating === -1 ? t.red + "40" : t.ink08),
            borderRadius: 5,
            padding: "0.2rem 0.35rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            color: rating === -1 ? t.red : t.ink50,
            transition: "all 0.15s",
          }}
        >
          <ThumbsDown size={12} />
        </button>
      </div>

      {showComment && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            marginTop: "0.35rem",
          }}
        >
          <input
            type="text"
            value={comment}
            onChange={function (e) {
              setComment(e.target.value);
            }}
            placeholder={
              rating === 1
                ? "What went well? (optional)"
                : "What went wrong? (optional)"
            }
            style={{
              flex: 1,
              padding: "0.3rem 0.5rem",
              borderRadius: 5,
              border: "1px solid " + t.ink08,
              background: t.paper,
              color: t.ink,
              fontFamily: "var(--body)",
              fontSize: "0.7rem",
              outline: "none",
            }}
            onKeyDown={function (e) {
              if (e.key === "Enter") handleSubmit();
            }}
            onFocus={function (e) {
              e.target.style.borderColor = t.accent + "40";
            }}
            onBlur={function (e) {
              e.target.style.borderColor = t.ink08;
            }}
          />
          <button
            onClick={handleSubmit}
            style={{
              background: t.accent,
              border: "none",
              borderRadius: 5,
              padding: "0.3rem 0.5rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              color: "white",
            }}
          >
            <Send size={11} />
          </button>
        </div>
      )}
    </div>
  );
}
