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
  MessageSquare,
  Send,
  Trash2,
  UserPlus,
  ChevronDown,
} from "lucide-react";
import CreatePRButton from "./CreatePRButton";
import AltTextGenerator from "./AltTextGenerator";
import PlanGate from "../ui/PlanGate";
import { useAuth } from "../../context/AuthContext";
import { logAudit } from "../../lib/audit";
import { timeAgo } from "../../lib/timeAgo";
import "../../styles/dashboard.css";
import "../../styles/dashboard-modals.css";

function GitHubIcon({ size, fill }) {
  return (
    <svg
      width={size || 16}
      height={size || 16}
      viewBox="0 0 24 24"
      fill={fill || "currentColor"}
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

/**
 * CreateGitHubIssueButton — one-click GitHub issue creation via edge function.
 */
function CreateGitHubIssueButton({ issue, site }) {
  var { t } = useTheme();
  var [loading, setLoading] = useState(false);
  var [result, setResult] = useState(
    issue.github_issue_url
      ? { url: issue.github_issue_url, existing: true }
      : null
  );
  var [error, setError] = useState(null);

  var handleCreate = async function () {
    setLoading(true);
    setError(null);
    try {
      var {
        data: { session },
      } = await supabase.auth.getSession();
      var { data, error: fnErr } = await supabase.functions.invoke(
        "create-github-issues",
        {
          body: { site_id: site.id, issue_ids: [issue.id] },
          headers: { Authorization: "Bearer " + (session?.access_token || "") },
        }
      );
      if (fnErr) throw new Error(fnErr.message);
      if (data?.error) throw new Error(data.error);
      if (data?.errors?.length > 0) throw new Error(data.errors[0].error);
      if (data?.results?.length > 0) {
        setResult({
          url: data.results[0].github_issue_url,
          number: data.results[0].github_issue_number,
        });
      }
    } catch (err) {
      setError(String(err).substring(0, 200));
    }
    setLoading(false);
  };

  if (result) {
    return (
      <a
        href={result.url}
        target="_blank"
        rel="noopener noreferrer"
        className="gh-actions-result"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
          padding: "0.35rem 0.7rem",
          borderRadius: 6,
          background: t.greenBg,
          fontFamily: "var(--mono)",
          fontSize: "0.68rem",
          fontWeight: 600,
          color: t.green,
          textDecoration: "none",
        }}
      >
        <Check size={11} strokeWidth={3} />
        {result.number ? "Issue #" + result.number : "View Issue"}
        <ExternalLink size={10} strokeWidth={2} />
      </a>
    );
  }

  return (
    <>
      <button
        onClick={handleCreate}
        disabled={loading}
        className="gh-actions-btn"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.3rem",
          padding: "0.35rem 0.7rem",
          height: 30,
          borderRadius: 6,
          border: "none",
          background: "transparent",
          color: t.ink50,
          fontFamily: "var(--body)",
          fontSize: "0.74rem",
          fontWeight: 500,
          cursor: loading ? "not-allowed" : "pointer",
          transition: "color 0.15s, background 0.15s",
          whiteSpace: "nowrap",
          opacity: loading ? 0.6 : 1,
        }}
        onMouseEnter={function (e) {
          if (!loading) {
            e.currentTarget.style.background = t.cardBg;
            e.currentTarget.style.color = t.ink;
            e.currentTarget.style.boxShadow = "0 1px 3px " + t.ink08;
          }
        }}
        onMouseLeave={function (e) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = t.ink50;
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {loading ? (
          <Loader2 size={12} className="xsbl-spin" />
        ) : (
          <GitHubIcon size={12} fill={t.ink50} />
        )}
        {loading ? "Creating…" : "Create Issue"}
      </button>
      {error && (
        <div style={{ fontSize: "0.68rem", color: t.red, marginTop: "0.2rem" }}>
          {error}
        </div>
      )}
    </>
  );
}

/**
 * GitHubActionsBar — wraps Create PR and Create Issue in a segmented pill bar.
 */
function GitHubActionsBar({ issue, site }) {
  var { t } = useTheme();

  return (
    <div style={{ marginTop: "1rem" }}>
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
        GitHub actions
      </div>
      <div
        style={{
          display: "inline-flex",
          flexWrap: "wrap",
          borderRadius: 8,
          background: t.ink04,
          border: "1px solid " + t.ink08,
          padding: 3,
          gap: 2,
          alignItems: "center",
        }}
      >
        <CreatePRButton issue={issue} site={site} segmented />
        <CreateGitHubIssueButton issue={issue} site={site} />
      </div>
    </div>
  );
}

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "fixed", label: "Fixed" },
  { value: "ignored", label: "Ignored" },
  { value: "false_positive", label: "False positive" },
];

export default function IssueDetailModal({
  issue,
  site,
  onClose,
  onUpdate,
  readOnly,
  onIgnoreRule,
}) {
  const { t } = useTheme();
  const { org, session, user } = useAuth();
  var plan = org?.plan || "free";
  const [copied, setCopied] = useState(false);
  const [aiFix, setAiFix] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [showHtml, setShowHtml] = useState(false);
  const [status, setStatus] = useState(issue.status);
  const [statusSaving, setStatusSaving] = useState(false);
  const [notes, setNotes] = useState(issue.auditor_notes || "");
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const notesTimeout = useRef(null);
  const dialogRef = useRef(null);
  const previousFocus = useRef(null);

  // Comments
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [commentSending, setCommentSending] = useState(false);
  const [deletingComment, setDeletingComment] = useState(null);

  // Assignee
  const [assignedTo, setAssignedTo] = useState(issue.assigned_to || null);
  const [assigneeSaving, setAssigneeSaving] = useState(false);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const assigneeRef = useRef(null);

  // Fetch org members for assignee dropdown
  useEffect(
    function () {
      if (!org?.id) {
        setMembersLoading(false);
        return;
      }
      // Two-step fetch: org_members doesn't have a direct FK to profiles,
      // so we fetch members first, then profiles separately by user_id.
      supabase
        .from("org_members")
        .select("user_id, role")
        .eq("org_id", org.id)
        .then(function (res) {
          var rows = res.data || [];
          if (rows.length === 0) {
            setMembersLoading(false);
            return;
          }
          var userIds = rows.map(function (r) {
            return r.user_id;
          });
          var roleMap = {};
          rows.forEach(function (r) {
            roleMap[r.user_id] = r.role;
          });
          supabase
            .from("profiles")
            .select("id, email, full_name")
            .in("id", userIds)
            .then(function (pRes) {
              var profiles = pRes.data || [];
              var list = profiles.map(function (p) {
                return {
                  id: p.id,
                  name:
                    p.full_name ||
                    (p.email ? p.email.split("@")[0] : "Team member"),
                  email: p.email || "",
                  role: roleMap[p.id] || "member",
                  isYou: user && p.id === user.id,
                };
              });
              // Sort: current user first, then alphabetical
              list.sort(function (a, b) {
                if (a.isYou && !b.isYou) return -1;
                if (!a.isYou && b.isYou) return 1;
                return a.name.localeCompare(b.name);
              });
              setMembers(list);
              setMembersLoading(false);
            });
        });
    },
    [org?.id, user?.id]
  );

  // Close assignee dropdown on outside click
  useEffect(
    function () {
      if (!assigneeOpen) return;
      var handleClick = function (e) {
        if (assigneeRef.current && !assigneeRef.current.contains(e.target)) {
          setAssigneeOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClick);
      return function () {
        document.removeEventListener("mousedown", handleClick);
      };
    },
    [assigneeOpen]
  );

  var handleAssigneeChange = async function (userId) {
    setAssigneeSaving(true);
    setAssigneeOpen(false);
    var { error } = await supabase
      .from("issues")
      .update({ assigned_to: userId || null })
      .eq("id", issue.id);
    if (!error) {
      setAssignedTo(userId || null);
      onUpdate?.({ ...issue, assigned_to: userId || null });
      logAudit({
        action: "issue.assigned",
        resourceType: "issue",
        resourceId: issue.id,
        description: userId
          ? "Assigned " +
            issue.rule_id +
            " to " +
            (members.find(function (m) {
              return m.id === userId;
            })?.name || userId)
          : "Unassigned " + issue.rule_id,
        metadata: {
          rule_id: issue.rule_id,
          assigned_to: userId || null,
          site_id: issue.site_id,
        },
      });
    }
    setAssigneeSaving(false);
  };

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

  // Load comments
  useEffect(
    function () {
      if (!issue.id) return;
      setCommentsLoading(true);
      supabase
        .from("issue_comments")
        .select("id, body, created_at, user_id, profiles(email, full_name)")
        .eq("issue_id", issue.id)
        .order("created_at", { ascending: true })
        .then(function (res) {
          setComments(res.data || []);
          setCommentsLoading(false);
        });
    },
    [issue.id]
  );

  var handlePostComment = async function () {
    var text = newComment.trim();
    if (!text || commentSending) return;
    setCommentSending(true);
    var { data, error } = await supabase
      .from("issue_comments")
      .insert({
        issue_id: issue.id,
        user_id: user.id,
        body: text,
      })
      .select("id, body, created_at, user_id, profiles(email, full_name)")
      .single();
    if (data) {
      setComments(function (prev) {
        return prev.concat([data]);
      });
      setNewComment("");
    }
    setCommentSending(false);
  };

  var handleDeleteComment = async function (commentId) {
    setDeletingComment(commentId);
    await supabase.from("issue_comments").delete().eq("id", commentId);
    setComments(function (prev) {
      return prev.filter(function (c) {
        return c.id !== commentId;
      });
    });
    setDeletingComment(null);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGetFix = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await supabase.functions.invoke("suggest-fix", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
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
      logAudit({
        action: "issue.status_changed",
        resourceType: "issue",
        resourceId: issue.id,
        description: issue.rule_id + " changed to " + newStatus,
        metadata: {
          rule_id: issue.rule_id,
          impact: issue.impact,
          from: issue.status,
          to: newStatus,
          site_id: issue.site_id,
        },
      });
    }
    setStatusSaving(false);
  };

  var handleNotesSave = async function () {
    setNotesSaving(true);
    await supabase
      .from("issues")
      .update({ auditor_notes: notes.trim() || null })
      .eq("id", issue.id);
    logAudit({
      action: "issue.notes_updated",
      resourceType: "issue",
      resourceId: issue.id,
      description: "Auditor notes updated on " + issue.rule_id,
      metadata: { rule_id: issue.rule_id, has_notes: !!notes.trim() },
    });
    setNotesSaving(false);
    setNotesSaved(true);
    onUpdate?.({ ...issue, auditor_notes: notes.trim() || null });
    clearTimeout(notesTimeout.current);
    notesTimeout.current = setTimeout(function () {
      setNotesSaved(false);
    }, 2000);
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
          {!readOnly && (
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
          )}

          {/* AI alt text for image issues */}
          {!readOnly && (
            <PlanGate
              currentPlan={plan}
              requiredPlan="pro"
              feature="AI alt text generation"
            >
              <AltTextGenerator issue={issue} />
            </PlanGate>
          )}

          {/* GitHub actions — segmented bar */}
          {!readOnly && site.github_repo && site.github_token && (
            <GitHubActionsBar issue={issue} site={site} />
          )}

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
            {readOnly ? (
              <span
                style={{
                  padding: "0.35rem 0.7rem",
                  borderRadius: 6,
                  fontSize: "0.76rem",
                  fontWeight: 600,
                  background:
                    status === "open"
                      ? t.red + "12"
                      : status === "fixed"
                      ? t.greenBg || t.ink04
                      : status === "removed"
                      ? t.accent + "12"
                      : t.ink04,
                  color:
                    status === "open"
                      ? t.red
                      : status === "fixed"
                      ? t.green
                      : status === "removed"
                      ? t.accent
                      : t.ink50,
                  textTransform: "capitalize",
                }}
              >
                {status}
              </span>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                }}
              >
                {status === "removed" && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      fontSize: "0.72rem",
                      color: t.accent,
                      fontWeight: 600,
                      marginBottom: "0.1rem",
                    }}
                  >
                    <Check size={13} /> Auto-removed — not found in latest scan
                  </div>
                )}
                <div
                  style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}
                >
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
                        background:
                          status === value ? t.accentBg : "transparent",
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
            )}
          </div>

          {/* Assignee */}
          {!readOnly && (
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
                Assignee
              </div>
              <div
                ref={assigneeRef}
                style={{
                  position: "relative",
                  display: "inline-block",
                  minWidth: 200,
                }}
              >
                <button
                  onClick={function () {
                    setAssigneeOpen(!assigneeOpen);
                  }}
                  disabled={membersLoading || assigneeSaving}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.4rem 0.65rem",
                    borderRadius: 7,
                    border:
                      "1.5px solid " +
                      (assigneeOpen ? t.accent + "60" : t.ink08),
                    background: assigneeOpen ? t.accentBg : "transparent",
                    color: assignedTo ? t.ink : t.ink50,
                    fontFamily: "var(--body)",
                    fontSize: "0.78rem",
                    fontWeight: 500,
                    cursor:
                      membersLoading || assigneeSaving
                        ? "not-allowed"
                        : "pointer",
                    transition: "all 0.15s",
                    width: "100%",
                    textAlign: "left",
                    opacity: assigneeSaving ? 0.5 : 1,
                  }}
                >
                  {assigneeSaving ? (
                    <Loader2 size={13} className="xsbl-spin" />
                  ) : (
                    <UserPlus
                      size={13}
                      strokeWidth={2}
                      style={{ flexShrink: 0 }}
                    />
                  )}
                  <span style={{ flex: 1 }}>
                    {assignedTo
                      ? (function () {
                          var m = members.find(function (m) {
                            return m.id === assignedTo;
                          });
                          return m
                            ? m.name + (m.isYou ? " (you)" : "")
                            : "Assigned";
                        })()
                      : "Unassigned"}
                  </span>
                  <ChevronDown
                    size={13}
                    strokeWidth={2}
                    style={{
                      flexShrink: 0,
                      transform: assigneeOpen ? "rotate(180deg)" : "none",
                      transition: "transform 0.15s",
                    }}
                  />
                </button>

                {assigneeOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 4px)",
                      left: 0,
                      right: 0,
                      background: t.cardBg,
                      border: "1px solid " + t.ink08,
                      borderRadius: 8,
                      boxShadow: "0 6px 20px " + t.ink08,
                      zIndex: 50,
                      maxHeight: 200,
                      overflowY: "auto",
                      padding: "0.2rem",
                    }}
                  >
                    {/* Unassign option */}
                    <button
                      onClick={function () {
                        handleAssigneeChange(null);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        width: "100%",
                        padding: "0.4rem 0.55rem",
                        borderRadius: 5,
                        border: "none",
                        background: !assignedTo ? t.ink04 : "transparent",
                        color: t.ink50,
                        fontFamily: "var(--body)",
                        fontSize: "0.74rem",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "background 0.1s",
                        fontStyle: "italic",
                      }}
                      onMouseEnter={function (e) {
                        e.currentTarget.style.background = t.ink04;
                      }}
                      onMouseLeave={function (e) {
                        e.currentTarget.style.background = !assignedTo
                          ? t.ink04
                          : "transparent";
                      }}
                    >
                      Unassigned
                    </button>

                    {members.map(function (member) {
                      var isSelected = assignedTo === member.id;
                      return (
                        <button
                          key={member.id}
                          onClick={function () {
                            handleAssigneeChange(member.id);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            width: "100%",
                            padding: "0.4rem 0.55rem",
                            borderRadius: 5,
                            border: "none",
                            background: isSelected ? t.accentBg : "transparent",
                            color: isSelected ? t.accent : t.ink,
                            fontFamily: "var(--body)",
                            fontSize: "0.74rem",
                            fontWeight: isSelected ? 600 : 400,
                            cursor: "pointer",
                            textAlign: "left",
                            transition: "background 0.1s",
                          }}
                          onMouseEnter={function (e) {
                            e.currentTarget.style.background = isSelected
                              ? t.accentBg
                              : t.ink04;
                          }}
                          onMouseLeave={function (e) {
                            e.currentTarget.style.background = isSelected
                              ? t.accentBg
                              : "transparent";
                          }}
                        >
                          <div
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              background: isSelected
                                ? t.accent + "20"
                                : t.ink08,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontFamily: "var(--mono)",
                              fontSize: "0.52rem",
                              fontWeight: 700,
                              color: isSelected ? t.accent : t.ink50,
                              flexShrink: 0,
                            }}
                          >
                            {(member.name[0] || "?").toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                lineHeight: 1.3,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {member.name}
                              {member.isYou && (
                                <span
                                  style={{
                                    fontFamily: "var(--mono)",
                                    fontSize: "0.58rem",
                                    fontWeight: 500,
                                    color: t.ink50,
                                    marginLeft: "0.3rem",
                                  }}
                                >
                                  (you)
                                </span>
                              )}
                            </div>
                            {member.email && (
                              <div
                                style={{
                                  fontFamily: "var(--mono)",
                                  fontSize: "0.55rem",
                                  color: t.ink50,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {member.email}
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <Check
                              size={13}
                              strokeWidth={2.5}
                              style={{ flexShrink: 0 }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
          {readOnly && assignedTo && (
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
                Assignee
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.35rem 0.65rem",
                  borderRadius: 7,
                  background: t.ink04,
                  fontSize: "0.78rem",
                  color: t.ink,
                  fontWeight: 500,
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: t.accent + "20",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--mono)",
                    fontSize: "0.52rem",
                    fontWeight: 700,
                    color: t.accent,
                    flexShrink: 0,
                  }}
                >
                  {(
                    (members.find(function (m) {
                      return m.id === assignedTo;
                    })?.name || "?")[0] || "?"
                  ).toUpperCase()}
                </div>
                {(function () {
                  var m = members.find(function (m) {
                    return m.id === assignedTo;
                  });
                  return m ? m.name + (m.isYou ? " (you)" : "") : "Assigned";
                })()}
              </div>
            </div>
          )}

          {/* Ignore rule — creates a site-wide ignore pattern for this rule */}
          {!readOnly && onIgnoreRule && issue.rule_id && (
            <div style={{ marginTop: "0.8rem" }}>
              <button
                onClick={function () {
                  onIgnoreRule({
                    rule_id: issue.rule_id,
                    description: issue.description || issue.rule_id,
                    selector: null,
                    reason: "",
                  });
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.35rem 0.7rem",
                  borderRadius: 6,
                  border: "1.5px dashed " + t.ink08,
                  background: "none",
                  color: t.ink50,
                  fontFamily: "var(--body)",
                  fontSize: "0.72rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={function (e) {
                  e.currentTarget.style.borderColor = t.amber;
                  e.currentTarget.style.color = t.amber;
                }}
                onMouseLeave={function (e) {
                  e.currentTarget.style.borderColor = t.ink08;
                  e.currentTarget.style.color = t.ink50;
                }}
              >
                <EyeOff size={12} strokeWidth={2} />
                Ignore all "{issue.rule_id}" issues on this site
              </button>
            </div>
          )}

          {/* Auditor notes */}
          {!readOnly && (
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
                Auditor notes
              </div>
              <textarea
                value={notes}
                onChange={function (e) {
                  setNotes(e.target.value);
                  setNotesSaved(false);
                }}
                placeholder="Add WCAG compliance notes, remediation guidance, or audit observations..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.6rem",
                  borderRadius: 6,
                  border: "1.5px solid " + t.ink08,
                  background: t.paper,
                  color: t.ink,
                  fontFamily: "var(--body)",
                  fontSize: "0.78rem",
                  lineHeight: 1.6,
                  resize: "vertical",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={function (e) {
                  e.target.style.borderColor = t.accent + "40";
                }}
                onBlur={function (e) {
                  e.target.style.borderColor = t.ink08;
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  marginTop: "0.3rem",
                }}
              >
                <button
                  onClick={handleNotesSave}
                  disabled={
                    notesSaving || notes === (issue.auditor_notes || "")
                  }
                  style={{
                    padding: "0.3rem 0.6rem",
                    borderRadius: 5,
                    border: "none",
                    background: notesSaved ? t.green : t.accent,
                    color: "white",
                    fontFamily: "var(--mono)",
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    cursor:
                      notesSaving || notes === (issue.auditor_notes || "")
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      notesSaving || notes === (issue.auditor_notes || "")
                        ? 0.4
                        : 1,
                  }}
                >
                  {notesSaving
                    ? "Saving..."
                    : notesSaved
                    ? "Saved"
                    : "Save notes"}
                </button>
                {issue.auditor_notes && (
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.55rem",
                      color: t.ink50,
                    }}
                  >
                    Notes attached
                  </span>
                )}
              </div>
            </div>
          )}
          {readOnly && issue.auditor_notes && (
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
                Auditor notes
              </div>
              <div
                style={{
                  padding: "0.5rem 0.6rem",
                  borderRadius: 6,
                  background: t.ink04,
                  fontSize: "0.78rem",
                  color: t.ink,
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                }}
              >
                {issue.auditor_notes}
              </div>
            </div>
          )}

          {/* Team comments */}
          <div style={{ marginTop: "1.4rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                marginBottom: "0.5rem",
              }}
            >
              <MessageSquare size={13} color={t.ink50} strokeWidth={2} />
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.62rem",
                  color: t.ink50,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Team comments
              </div>
              {comments.length > 0 && (
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.55rem",
                    fontWeight: 700,
                    padding: "0.05rem 0.3rem",
                    borderRadius: 4,
                    background: t.accent + "12",
                    color: t.accent,
                  }}
                >
                  {comments.length}
                </span>
              )}
            </div>

            {/* Comments list */}
            {commentsLoading ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                }}
              >
                {[1, 2].map(function (i) {
                  return (
                    <div
                      key={i}
                      style={{
                        padding: "0.5rem 0.7rem",
                        borderRadius: 7,
                        border: "1px solid " + t.ink08,
                      }}
                    >
                      <div
                        className="skeleton"
                        style={{
                          width: "30%",
                          height: 8,
                          marginBottom: "0.3rem",
                        }}
                      />
                      <div
                        className="skeleton"
                        style={{ width: "70%", height: 10 }}
                      />
                    </div>
                  );
                })}
              </div>
            ) : comments.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.3rem",
                  marginBottom: "0.6rem",
                }}
              >
                {comments.map(function (comment) {
                  var profile = comment.profiles || {};
                  var displayName =
                    profile.full_name ||
                    (profile.email
                      ? profile.email.split("@")[0]
                      : "Team member");
                  var isOwn = user && comment.user_id === user.id;

                  return (
                    <div
                      key={comment.id}
                      style={{
                        padding: "0.5rem 0.7rem",
                        borderRadius: 7,
                        border: "1px solid " + t.ink08,
                        background: isOwn ? t.accentBg : t.paper,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          marginBottom: "0.25rem",
                        }}
                      >
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            background: isOwn ? t.accent + "20" : t.ink08,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: "var(--mono)",
                            fontSize: "0.5rem",
                            fontWeight: 700,
                            color: isOwn ? t.accent : t.ink50,
                            flexShrink: 0,
                          }}
                        >
                          {(displayName[0] || "?").toUpperCase()}
                        </div>
                        <span
                          style={{
                            fontFamily: "var(--body)",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            color: t.ink,
                          }}
                        >
                          {displayName}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "0.55rem",
                            color: t.ink50,
                            marginLeft: "auto",
                          }}
                        >
                          {timeAgo(comment.created_at)}
                        </span>
                        {isOwn && (
                          <button
                            onClick={function () {
                              handleDeleteComment(comment.id);
                            }}
                            disabled={deletingComment === comment.id}
                            aria-label="Delete comment"
                            style={{
                              padding: "0.15rem",
                              borderRadius: 3,
                              border: "none",
                              background: "none",
                              color: t.ink50,
                              cursor: "pointer",
                              display: "flex",
                              opacity:
                                deletingComment === comment.id ? 0.3 : 0.5,
                              transition: "opacity 0.15s",
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
                      <div
                        style={{
                          fontSize: "0.78rem",
                          color: t.ink,
                          lineHeight: 1.6,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {comment.body}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p
                style={{
                  fontSize: "0.72rem",
                  color: t.ink50,
                  margin: "0 0 0.6rem",
                  fontStyle: "italic",
                }}
              >
                No comments yet. Add context for your team.
              </p>
            )}

            {/* New comment input */}
            {!readOnly && (
              <div
                style={{
                  display: "flex",
                  gap: "0.35rem",
                  alignItems: "flex-end",
                }}
              >
                <textarea
                  value={newComment}
                  onChange={function (e) {
                    setNewComment(e.target.value);
                  }}
                  placeholder="Leave a comment for your team..."
                  rows={2}
                  style={{
                    flex: 1,
                    padding: "0.45rem 0.6rem",
                    borderRadius: 6,
                    border: "1.5px solid " + t.ink08,
                    background: t.paper,
                    color: t.ink,
                    fontFamily: "var(--body)",
                    fontSize: "0.78rem",
                    lineHeight: 1.5,
                    resize: "vertical",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={function (e) {
                    e.target.style.borderColor = t.accent + "40";
                  }}
                  onBlur={function (e) {
                    e.target.style.borderColor = t.ink08;
                  }}
                  onKeyDown={function (e) {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handlePostComment();
                    }
                  }}
                />
                <button
                  onClick={handlePostComment}
                  disabled={commentSending || !newComment.trim()}
                  title="Post comment (⌘+Enter)"
                  style={{
                    padding: "0.5rem",
                    borderRadius: 6,
                    border: "none",
                    background: !newComment.trim() ? t.ink08 : t.accent,
                    color: !newComment.trim() ? t.ink50 : "white",
                    cursor:
                      commentSending || !newComment.trim()
                        ? "not-allowed"
                        : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    opacity: commentSending ? 0.5 : 1,
                    transition: "all 0.15s",
                  }}
                >
                  {commentSending ? (
                    <Loader2 size={14} className="xsbl-spin" />
                  ) : (
                    <Send size={14} strokeWidth={2} />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes xsbl-spin { to { transform: rotate(360deg); } } .xsbl-spin { animation: xsbl-spin 0.6s linear infinite; }`}</style>
    </div>
  );
}
