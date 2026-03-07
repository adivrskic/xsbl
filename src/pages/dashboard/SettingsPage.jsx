import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import "../../styles/dashboard.css";
import "../../styles/dashboard-pages.css";
import "../../styles/dashboard-modals.css";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { useToast } from "../../components/ui/Toast";
import { useConfirm } from "../../components/ui/ConfirmModal";
import PlanGate from "../../components/ui/PlanGate";
import {
  User,
  Users,
  Bell,
  Trash2,
  Check,
  Loader2,
  Plus,
  Mail,
  Shield,
  Crown,
  X,
  Save,
  Lock,
  CircleAlert,
  FileText,
  Calendar,
} from "lucide-react";

/* ── Editable field ── */
function EditableField({ label, value, onSave, placeholder }) {
  const { t } = useTheme();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (draft.trim() === value) {
      setEditing(false);
      return;
    }
    setSaving(true);
    await onSave(draft.trim());
    setSaving(false);
    setEditing(false);
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: "0.62rem",
          color: t.ink50,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: "0.3rem",
        }}
      >
        {label}
      </div>
      {editing ? (
        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            autoFocus
            style={{
              flex: 1,
              padding: "0.5rem 0.7rem",
              borderRadius: 6,
              border: `1.5px solid ${t.accent}`,
              background: t.cardBg,
              color: t.ink,
              fontFamily: "var(--body)",
              fontSize: "0.88rem",
              outline: "none",
              boxSizing: "border-box",
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: t.accent,
              border: "none",
              borderRadius: 6,
              padding: "0.45rem 0.6rem",
              cursor: "pointer",
              color: "white",
              display: "flex",
              alignItems: "center",
            }}
          >
            {saving ? (
              <Loader2 size={14} className="xsbl-spin" />
            ) : (
              <Check size={14} />
            )}
          </button>
          <button
            onClick={() => {
              setDraft(value);
              setEditing(false);
            }}
            style={{
              background: t.ink04,
              border: "none",
              borderRadius: 6,
              padding: "0.45rem 0.6rem",
              cursor: "pointer",
              color: t.ink50,
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.88rem", color: value ? t.ink : t.ink50 }}>
            {value || "Not set"}
          </span>
          <button
            onClick={() => setEditing(true)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              color: t.accent,
              fontSize: "0.72rem",
              fontWeight: 600,
              fontFamily: "var(--body)",
            }}
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Team member row ── */
function MemberRow({ member, isCurrentUser, isOwner, onRemove }) {
  const { t } = useTheme();
  const confirm = useConfirm();
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    const ok = await confirm({
      title: "Remove team member",
      message: `Remove ${member.email} from the workspace? They'll lose access to all sites and scans.`,
      confirmLabel: "Remove",
      danger: true,
    });
    if (!ok) return;
    setRemoving(true);
    await onRemove(member.user_id);
    setRemoving(false);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.7rem 0",
        borderBottom: `1px solid ${t.ink04}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          flex: 1,
          minWidth: 0,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: t.accentBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <User size={15} color={t.accent} strokeWidth={1.8} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: "0.84rem",
              fontWeight: 500,
              color: t.ink,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {member.full_name || member.email}
            {isCurrentUser && (
              <span style={{ color: t.ink50, fontWeight: 400 }}> (you)</span>
            )}
          </div>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.68rem",
              color: t.ink50,
            }}
          >
            {member.email}
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.6rem",
            fontWeight: 600,
            padding: "0.15rem 0.4rem",
            borderRadius: 3,
            textTransform: "uppercase",
            background: member.role === "owner" ? `${t.accent}12` : t.ink04,
            color: member.role === "owner" ? t.accent : t.ink50,
            display: "flex",
            alignItems: "center",
            gap: "0.2rem",
          }}
        >
          {member.role === "owner" && <Crown size={10} />} {member.role}
        </span>
        {isOwner && !isCurrentUser && (
          <button
            onClick={handleRemove}
            disabled={removing}
            style={{
              background: "none",
              border: "none",
              padding: "0.2rem",
              cursor: "pointer",
              color: t.ink50,
              display: "flex",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = t.red)}
            onMouseLeave={(e) => (e.currentTarget.style.color = t.ink50)}
          >
            {removing ? (
              <Loader2 size={14} className="xsbl-spin" />
            ) : (
              <Trash2 size={14} strokeWidth={1.8} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Invite form ── */
function InviteForm({ orgId, onInvited }) {
  const { t } = useTheme();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    var cleanEmail = email.trim().toLowerCase();

    // Check if they already have an account
    var { data: users } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", cleanEmail)
      .limit(1);

    if (users && users.length > 0) {
      // User exists → add them directly
      var { error: insertErr } = await supabase
        .from("org_members")
        .insert({ org_id: orgId, user_id: users[0].id, role: role });
      if (insertErr) {
        toast.error(
          insertErr.code === "23505" ? "Already a member." : insertErr.message
        );
      } else {
        toast.success(cleanEmail + " added as " + role);
        setEmail("");
        onInvited && onInvited();
      }
    } else {
      // User doesn't exist → create a pending invite
      var { error: inviteErr } = await supabase
        .from("pending_invites")
        .insert({ org_id: orgId, email: cleanEmail, role: role });
      if (inviteErr) {
        toast.error(
          inviteErr.code === "23505" ? "Already invited." : inviteErr.message
        );
      } else {
        toast.success(
          "Invite sent to " +
            cleanEmail +
            " — they'll be added when they sign up"
        );
        setEmail("");
        onInvited && onInvited();

        // Try to send invite email if Resend is configured
        try {
          var {
            data: { session: s },
          } = await supabase.auth.getSession();
          await supabase.functions.invoke("send-invite-email", {
            body: { email: cleanEmail, org_id: orgId, role: role },
            headers: { Authorization: "Bearer " + (s ? s.access_token : "") },
          });
        } catch (emailErr) {
          // Email sending is optional — invite is saved regardless
          console.log("Invite email not sent:", emailErr);
        }
      }
    }
    setLoading(false);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: "0.4rem",
          alignItems: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 180 }}>
          <input
            type="email"
            value={email}
            onChange={function (e) {
              setEmail(e.target.value);
            }}
            placeholder="colleague@company.com"
            style={{
              width: "100%",
              padding: "0.5rem 0.7rem",
              borderRadius: 6,
              border: "1.5px solid " + t.ink20,
              background: t.cardBg,
              color: t.ink,
              fontFamily: "var(--body)",
              fontSize: "0.84rem",
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={function (e) {
              e.target.style.borderColor = t.accent;
            }}
            onBlur={function (e) {
              e.target.style.borderColor = t.ink20;
            }}
            onKeyDown={function (e) {
              if (e.key === "Enter") {
                e.preventDefault();
                handleInvite(e);
              }
            }}
          />
        </div>
        <select
          value={role}
          onChange={function (e) {
            setRole(e.target.value);
          }}
          style={{
            padding: "0.5rem 0.6rem",
            borderRadius: 6,
            border: "1.5px solid " + t.ink20,
            background: t.cardBg,
            color: t.ink,
            fontFamily: "var(--mono)",
            fontSize: "0.74rem",
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
        <button
          onClick={handleInvite}
          disabled={loading || !email.trim()}
          style={{
            padding: "0.5rem 0.9rem",
            borderRadius: 6,
            border: "none",
            background: t.accent,
            color: "white",
            fontFamily: "var(--body)",
            fontSize: "0.82rem",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading || !email.trim() ? 0.5 : 1,
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
          }}
        >
          {loading ? (
            <Loader2 size={13} className="xsbl-spin" />
          ) : (
            <Plus size={13} />
          )}{" "}
          Invite
        </button>
      </div>
      <p style={{ fontSize: "0.65rem", color: t.ink50, marginTop: "0.3rem" }}>
        If they don't have an account yet, they'll be added automatically when
        they sign up.
      </p>
    </div>
  );
}

/* ── Scheduled Reports (Agency) ── */
function ScheduledReports({ org }) {
  const { t } = useTheme();
  const [schedule, setSchedule] = useState(org?.report_schedule || "");
  const [emails, setEmails] = useState((org?.report_emails || []).join(", "));
  const [whiteLabel, setWhiteLabel] = useState(
    org?.report_white_label || false
  );
  const [companyName, setCompanyName] = useState(
    org?.report_company_name || org?.name || ""
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!org) return null;

  var handleSave = async function () {
    setSaving(true);
    var emailList = emails
      .split(",")
      .map(function (e) {
        return e.trim();
      })
      .filter(function (e) {
        return e.indexOf("@") !== -1;
      });
    await supabase
      .from("organizations")
      .update({
        report_schedule: schedule || null,
        report_emails: emailList,
        report_white_label: whiteLabel,
        report_company_name: companyName.trim() || null,
      })
      .eq("id", org.id);
    setSaving(false);
    setSaved(true);
    setTimeout(function () {
      setSaved(false);
    }, 2000);
  };

  return (
    <div
      style={{
        padding: "1.5rem",
        borderRadius: 12,
        border: "1px solid " + t.ink08,
        background: t.cardBg,
        marginBottom: "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "0.6rem",
        }}
      >
        <FileText size={17} color={t.accent} strokeWidth={1.8} />
        <h3
          style={{
            fontSize: "0.95rem",
            fontWeight: 600,
            color: t.ink,
            margin: 0,
          }}
        >
          Scheduled Reports
        </h3>
      </div>
      <p
        style={{
          fontSize: "0.76rem",
          color: t.ink50,
          marginBottom: "0.8rem",
          lineHeight: 1.6,
        }}
      >
        Automatically email accessibility reports to your clients on a schedule.
        Reports include scores, issue breakdowns, and per-page results.
      </p>

      {/* Schedule */}
      <div style={{ marginBottom: "0.8rem" }}>
        <label
          style={{
            display: "block",
            fontFamily: "var(--mono)",
            fontSize: "0.62rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: t.ink50,
            marginBottom: "0.3rem",
          }}
        >
          Frequency
        </label>
        <div style={{ display: "flex", gap: "0.3rem" }}>
          {[
            { value: "", label: "Off" },
            { value: "weekly", label: "Weekly" },
            { value: "monthly", label: "Monthly" },
          ].map(function (opt) {
            var isActive = schedule === opt.value;
            return (
              <button
                key={opt.value}
                onClick={function () {
                  setSchedule(opt.value);
                }}
                style={{
                  padding: "0.35rem 0.8rem",
                  borderRadius: 6,
                  border: "1.5px solid " + (isActive ? t.accent : t.ink20),
                  background: isActive ? t.accentBg : "none",
                  color: isActive ? t.accent : t.ink50,
                  fontFamily: "var(--mono)",
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <Calendar size={11} />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recipient emails */}
      <div style={{ marginBottom: "0.8rem" }}>
        <label
          style={{
            display: "block",
            fontFamily: "var(--mono)",
            fontSize: "0.62rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: t.ink50,
            marginBottom: "0.25rem",
          }}
        >
          Recipient emails (comma-separated)
        </label>
        <input
          value={emails}
          onChange={function (e) {
            setEmails(e.target.value);
          }}
          placeholder="client@example.com, manager@example.com"
          style={{
            width: "100%",
            padding: "0.45rem 0.7rem",
            borderRadius: 6,
            border: "1.5px solid " + t.ink20,
            background: t.paper,
            color: t.ink,
            fontFamily: "var(--mono)",
            fontSize: "0.74rem",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* White-label */}
      <div style={{ marginBottom: "0.8rem" }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={whiteLabel}
            onChange={function () {
              setWhiteLabel(!whiteLabel);
            }}
            style={{ accentColor: t.accent }}
          />
          <span style={{ fontSize: "0.78rem", color: t.ink }}>
            White-label reports
          </span>
        </label>
        {whiteLabel && (
          <input
            value={companyName}
            onChange={function (e) {
              setCompanyName(e.target.value);
            }}
            placeholder="Your company name"
            style={{
              marginTop: "0.3rem",
              width: "100%",
              padding: "0.4rem 0.7rem",
              borderRadius: 6,
              border: "1.5px solid " + t.ink20,
              background: t.paper,
              color: t.ink,
              fontFamily: "var(--mono)",
              fontSize: "0.74rem",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        )}
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          padding: "0.45rem 0.9rem",
          borderRadius: 6,
          border: "none",
          background: t.accent,
          color: "white",
          fontFamily: "var(--body)",
          fontSize: "0.8rem",
          fontWeight: 600,
          cursor: saving ? "not-allowed" : "pointer",
          opacity: saving ? 0.5 : 1,
          display: "flex",
          alignItems: "center",
          gap: "0.3rem",
        }}
      >
        {saving ? (
          <Loader2 size={13} className="xsbl-spin" />
        ) : (
          <Save size={13} />
        )}
        {saved ? "Saved" : "Save report settings"}
      </button>
    </div>
  );
}

/* ── Alert Integrations (Slack + Email) ── */
function AlertIntegrations({ org }) {
  const { t } = useTheme();
  const [slackUrl, setSlackUrl] = useState(org?.slack_webhook_url || "");
  const [emails, setEmails] = useState((org?.alert_emails || []).join(", "));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!org) return null;

  var handleSave = async function () {
    setSaving(true);
    var emailList = emails
      .split(",")
      .map(function (e) {
        return e.trim();
      })
      .filter(function (e) {
        return e.indexOf("@") !== -1;
      });
    await supabase
      .from("organizations")
      .update({
        slack_webhook_url: slackUrl.trim() || null,
        alert_emails: emailList,
      })
      .eq("id", org.id);
    setSaving(false);
    setSaved(true);
    setTimeout(function () {
      setSaved(false);
    }, 2000);
  };

  var handleTestSlack = async function () {
    if (!slackUrl.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      var {
        data: { session: s },
      } = await supabase.auth.getSession();
      var { data, error } = await supabase.functions.invoke("test-slack", {
        body: { webhook_url: slackUrl.trim() },
        headers: { Authorization: "Bearer " + s?.access_token },
      });
      if (error) throw error;
      setTestResult(data?.ok ? "success" : "error");
    } catch (e) {
      setTestResult("error");
    }
    setTesting(false);
  };

  return (
    <div
      style={{
        padding: "1.5rem",
        borderRadius: 12,
        border: "1px solid " + t.ink08,
        background: t.cardBg,
        marginBottom: "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "0.6rem",
        }}
      >
        <CircleAlert size={17} color={t.accent} strokeWidth={1.8} />
        <h3
          style={{
            fontSize: "0.95rem",
            fontWeight: 600,
            color: t.ink,
            margin: 0,
          }}
        >
          Alert Integrations
        </h3>
      </div>

      {/* Slack */}
      <div style={{ marginBottom: "1rem" }}>
        <label
          style={{
            display: "block",
            fontFamily: "var(--mono)",
            fontSize: "0.62rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: t.ink50,
            marginBottom: "0.25rem",
          }}
        >
          Slack Webhook URL
        </label>
        <div style={{ display: "flex", gap: "0.4rem" }}>
          <input
            value={slackUrl}
            onChange={function (e) {
              setSlackUrl(e.target.value);
            }}
            placeholder="https://hooks.slack.com/services/..."
            style={{
              flex: 1,
              padding: "0.45rem 0.7rem",
              borderRadius: 6,
              border: "1.5px solid " + t.ink20,
              background: t.paper,
              color: t.ink,
              fontFamily: "var(--mono)",
              fontSize: "0.74rem",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <button
            onClick={handleTestSlack}
            disabled={!slackUrl.trim() || testing}
            style={{
              padding: "0.4rem 0.7rem",
              borderRadius: 6,
              border: "1.5px solid " + t.ink20,
              background: "none",
              color: t.ink,
              fontFamily: "var(--body)",
              fontSize: "0.74rem",
              fontWeight: 500,
              cursor: "pointer",
              whiteSpace: "nowrap",
              opacity: !slackUrl.trim() || testing ? 0.5 : 1,
            }}
          >
            {testing ? "Sending..." : "Test"}
          </button>
        </div>
        {testResult && (
          <div
            style={{
              marginTop: "0.3rem",
              fontSize: "0.68rem",
              color: testResult === "success" ? t.green : t.red,
            }}
          >
            {testResult === "success"
              ? "✓ Test message sent to Slack"
              : "✕ Failed — check your webhook URL"}
          </div>
        )}
        <p style={{ fontSize: "0.65rem", color: t.ink50, marginTop: "0.2rem" }}>
          <a
            href="https://api.slack.com/messaging/webhooks"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: t.accent, textDecoration: "none" }}
          >
            Create a Slack webhook →
          </a>
        </p>
      </div>

      {/* Email alerts */}
      <div style={{ marginBottom: "1rem" }}>
        <label
          style={{
            display: "block",
            fontFamily: "var(--mono)",
            fontSize: "0.62rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: t.ink50,
            marginBottom: "0.25rem",
          }}
        >
          Email Alerts (comma separated)
        </label>
        <input
          value={emails}
          onChange={function (e) {
            setEmails(e.target.value);
          }}
          placeholder="team@company.com, dev@company.com"
          style={{
            width: "100%",
            padding: "0.45rem 0.7rem",
            borderRadius: 6,
            border: "1.5px solid " + t.ink20,
            background: t.paper,
            color: t.ink,
            fontFamily: "var(--mono)",
            fontSize: "0.74rem",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <p style={{ fontSize: "0.65rem", color: t.ink50, marginTop: "0.2rem" }}>
          Leave blank to use team members' emails (based on notification
          preferences above).
        </p>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          padding: "0.45rem 0.9rem",
          borderRadius: 6,
          border: "none",
          background: t.accent,
          color: "white",
          fontFamily: "var(--body)",
          fontSize: "0.8rem",
          fontWeight: 600,
          cursor: "pointer",
          opacity: saving ? 0.5 : 1,
        }}
      >
        {saving ? "Saving..." : saved ? "✓ Saved" : "Save integrations"}
      </button>
    </div>
  );
}

/* ── Main ── */
export default function SettingsPage() {
  const { t } = useTheme();
  const { user, org, refreshOrg } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const [members, setMembers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [notifScans, setNotifScans] = useState(false);
  const [notifIssues, setNotifIssues] = useState(false);
  const [notifWeekly, setNotifWeekly] = useState(false);
  const [notifSaving, setNotifSaving] = useState(false);

  const isOwner = org?.role === "owner";
  const canInvite = ["pro", "agency"].includes(org?.plan);

  const membersLoaded = useRef(null);

  const loadMembers = async () => {
    if (!org) return;
    const { data } = await supabase
      .from("org_members")
      .select("user_id, role")
      .eq("org_id", org.id)
      .order("role", { ascending: true });
    var memberList = data || [];
    var userIds = memberList.map(function (m) {
      return m.user_id;
    });
    var profileMap = {};
    if (userIds.length > 0) {
      var { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds);
      (profiles || []).forEach(function (p) {
        profileMap[p.id] = p;
      });
    }
    setMembers(
      memberList.map(function (m) {
        var p = profileMap[m.user_id] || {};
        return {
          user_id: m.user_id,
          role: m.role,
          email: p.email || "",
          full_name: p.full_name || "",
        };
      })
    );
    setLoadingMembers(false);
    membersLoaded.current = org.id;

    // Also load pending invites
    var { data: invites } = await supabase
      .from("pending_invites")
      .select("*")
      .eq("org_id", org.id)
      .order("created_at", { ascending: false });
    setPendingInvites(invites || []);
  };

  useEffect(() => {
    if (org && membersLoaded.current !== org.id) loadMembers();
  }, [org?.id]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("notification_prefs")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setNotifScans(data.scan_complete ?? false);
          setNotifIssues(data.critical_issues ?? false);
          setNotifWeekly(data.weekly_digest ?? false);
        }
      });
  }, [user]);

  const handleOrgNameSave = async (name) => {
    await supabase.from("organizations").update({ name }).eq("id", org.id);
    await refreshOrg?.();
    toast.success("Workspace name updated");
  };

  const handleRemoveMember = async (userId) => {
    await supabase
      .from("org_members")
      .delete()
      .eq("org_id", org.id)
      .eq("user_id", userId);
    toast.success("Team member removed");
    await loadMembers();
  };

  const handleNotifSave = async () => {
    setNotifSaving(true);
    await supabase.from("notification_prefs").upsert(
      {
        user_id: user.id,
        scan_complete: notifScans,
        critical_issues: notifIssues,
        weekly_digest: notifWeekly,
      },
      { onConflict: "user_id" }
    );
    toast.success("Notification preferences saved");
    setNotifSaving(false);
  };

  const handleDeleteAccount = async () => {
    const ok = await confirm({
      title: "Delete account",
      message:
        "This will permanently delete your account, cancel your subscription (with a prorated refund), and remove all sites, scans, and issues. This cannot be undone.",
      confirmLabel: "Delete my account",
      danger: true,
    });
    if (!ok) return;

    // Double confirm
    const reallyOk = await confirm({
      title: "Are you absolutely sure?",
      message: `Type "delete" in your head and click confirm. Your ${
        org?.plan !== "free"
          ? org.plan + " subscription will be canceled and refunded, and "
          : ""
      }all data will be permanently erased.`,
      confirmLabel: "Yes, delete everything",
      danger: true,
    });
    if (!reallyOk) return;

    toast.info("Deleting account...");
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke(
        "delete-account",
        {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        }
      );
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      toast.success("Account deleted. Redirecting...");
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (err) {
      toast.error(`Failed to delete account: ${err.message}`);
    }
  };

  function Toggle({ checked, onChange, label }) {
    const { t: tt } = useTheme();
    return (
      <label
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.5rem 0",
          cursor: "pointer",
        }}
      >
        <span style={{ fontSize: "0.84rem", color: tt.ink }}>{label}</span>
        <div
          onClick={() => onChange(!checked)}
          style={{
            width: 36,
            height: 20,
            borderRadius: 10,
            padding: 2,
            cursor: "pointer",
            background: checked ? tt.accent : tt.ink20,
            transition: "background 0.2s",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "white",
              transform: checked ? "translateX(16px)" : "translateX(0)",
              transition: "transform 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
            }}
          />
        </div>
      </label>
    );
  }

  return (
    <div>
      <h1
        style={{
          fontFamily: "var(--serif)",
          fontSize: "1.6rem",
          fontWeight: 700,
          color: t.ink,
          marginBottom: "0.3rem",
        }}
      >
        Settings
      </h1>
      <p style={{ color: t.ink50, fontSize: "0.88rem", marginBottom: "2rem" }}>
        Account, team, and notification settings.
      </p>

      {/* Profile */}
      <div
        style={{
          padding: "1.5rem",
          borderRadius: 12,
          border: `1px solid ${t.ink08}`,
          background: t.cardBg,
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1.2rem",
          }}
        >
          <User size={17} color={t.accent} strokeWidth={1.8} />
          <h3
            style={{
              fontSize: "0.95rem",
              fontWeight: 600,
              color: t.ink,
              margin: 0,
            }}
          >
            Profile
          </h3>
        </div>
        <div style={{ marginBottom: "0.7rem" }}>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.62rem",
              color: t.ink50,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "0.15rem",
            }}
          >
            Name
          </div>
          <div style={{ fontSize: "0.88rem", color: t.ink }}>
            {user?.user_metadata?.full_name || "Not set"}
          </div>
        </div>
        <div style={{ marginBottom: "0.7rem" }}>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.62rem",
              color: t.ink50,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "0.15rem",
            }}
          >
            Email
          </div>
          <div
            style={{
              fontSize: "0.88rem",
              color: t.ink,
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            <Mail size={14} color={t.ink50} /> {user?.email}
          </div>
        </div>
        <div>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.62rem",
              color: t.ink50,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "0.15rem",
            }}
          >
            Auth provider
          </div>
          <div
            style={{
              fontSize: "0.88rem",
              color: t.ink,
              textTransform: "capitalize",
            }}
          >
            {user?.app_metadata?.provider || "email"}
          </div>
        </div>
      </div>

      {/* Workspace */}
      {org && (
        <div
          style={{
            padding: "1.5rem",
            borderRadius: 12,
            border: `1px solid ${t.ink08}`,
            background: t.cardBg,
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1.2rem",
            }}
          >
            <Shield size={17} color={t.accent} strokeWidth={1.8} />
            <h3
              style={{
                fontSize: "0.95rem",
                fontWeight: 600,
                color: t.ink,
                margin: 0,
              }}
            >
              Workspace
            </h3>
          </div>
          {isOwner ? (
            <EditableField
              label="Name"
              value={org.name}
              onSave={handleOrgNameSave}
              placeholder="Workspace name"
            />
          ) : (
            <div style={{ marginBottom: "1rem" }}>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.62rem",
                  color: t.ink50,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "0.15rem",
                }}
              >
                Name
              </div>
              <div style={{ fontSize: "0.88rem", color: t.ink }}>
                {org.name}
              </div>
            </div>
          )}
          <div style={{ marginBottom: "0.7rem" }}>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.62rem",
                color: t.ink50,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "0.15rem",
              }}
            >
              Plan
            </div>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.88rem",
                color: t.accent,
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            >
              {org.plan}
            </div>
          </div>
          <div>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.62rem",
                color: t.ink50,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "0.15rem",
              }}
            >
              Your role
            </div>
            <div
              style={{
                fontSize: "0.88rem",
                color: t.ink,
                textTransform: "capitalize",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              {org.role === "owner" && <Crown size={14} color={t.accent} />}{" "}
              {org.role}
            </div>
          </div>
        </div>
      )}

      {/* Team */}
      {org && (
        <div
          style={{
            padding: "1.5rem",
            borderRadius: 12,
            border: `1px solid ${t.ink08}`,
            background: t.cardBg,
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Users size={17} color={t.accent} strokeWidth={1.8} />
              <h3
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: t.ink,
                  margin: 0,
                }}
              >
                Team members
              </h3>
            </div>
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.68rem",
                color: t.ink50,
              }}
            >
              {members.length} member{members.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loadingMembers ? (
            <p style={{ color: t.ink50, fontSize: "0.82rem" }}>Loading…</p>
          ) : (
            <div style={{ marginBottom: isOwner && canInvite ? "1.2rem" : 0 }}>
              {members.map((m) => (
                <MemberRow
                  key={m.user_id}
                  member={m}
                  isCurrentUser={m.user_id === user?.id}
                  isOwner={isOwner}
                  onRemove={handleRemoveMember}
                />
              ))}

              {/* Pending invites */}
              {pendingInvites.length > 0 && (
                <div style={{ marginTop: "0.5rem" }}>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.58rem",
                      color: t.ink50,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: "0.3rem",
                      marginTop: "0.6rem",
                    }}
                  >
                    Pending invites
                  </div>
                  {pendingInvites.map(function (inv) {
                    return (
                      <div
                        key={inv.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "0.55rem 0.7rem",
                          borderRadius: 6,
                          border: "1px dashed " + t.ink08,
                          marginBottom: "0.3rem",
                          opacity: 0.7,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              background: t.ink04,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontFamily: "var(--mono)",
                              fontSize: "0.62rem",
                              color: t.ink50,
                            }}
                          >
                            ?
                          </div>
                          <div>
                            <div
                              style={{ fontSize: "0.82rem", color: t.ink50 }}
                            >
                              {inv.email}
                            </div>
                            <div
                              style={{
                                fontFamily: "var(--mono)",
                                fontSize: "0.6rem",
                                color: t.ink50,
                              }}
                            >
                              <span
                                style={{
                                  padding: "0.05rem 0.3rem",
                                  borderRadius: 3,
                                  background: t.amber + "12",
                                  color: t.amber,
                                  fontWeight: 600,
                                  fontSize: "0.55rem",
                                }}
                              >
                                PENDING
                              </span>
                              {" · "}
                              {inv.role}
                            </div>
                          </div>
                        </div>
                        {isOwner && (
                          <button
                            onClick={async function () {
                              await supabase
                                .from("pending_invites")
                                .delete()
                                .eq("id", inv.id);
                              setPendingInvites(function (prev) {
                                return prev.filter(function (p) {
                                  return p.id !== inv.id;
                                });
                              });
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: t.red,
                              cursor: "pointer",
                              fontFamily: "var(--mono)",
                              fontSize: "0.62rem",
                              fontWeight: 500,
                              padding: "0.2rem 0.4rem",
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {isOwner && canInvite && (
            <div style={{ paddingTop: "0.8rem" }}>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.62rem",
                  color: t.ink50,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "0.5rem",
                }}
              >
                Invite a team member
              </div>
              <InviteForm orgId={org.id} onInvited={loadMembers} />
            </div>
          )}

          {isOwner && !canInvite && (
            <div
              style={{
                paddingTop: "0.8rem",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                fontSize: "0.78rem",
                color: t.ink50,
                fontStyle: "italic",
              }}
            >
              <Lock size={13} color={t.ink50} /> Team invites available on Pro
              and Agency plans.
            </div>
          )}
        </div>
      )}

      {/* Notifications */}
      <div
        style={{
          padding: "1.5rem",
          borderRadius: 12,
          border: `1px solid ${t.ink08}`,
          background: t.cardBg,
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.6rem",
          }}
        >
          <Bell size={17} color={t.accent} strokeWidth={1.8} />
          <h3
            style={{
              fontSize: "0.95rem",
              fontWeight: 600,
              color: t.ink,
              margin: 0,
            }}
          >
            Notifications
          </h3>
        </div>
        <p
          style={{
            fontSize: "0.76rem",
            color: t.ink50,
            marginBottom: "0.8rem",
            lineHeight: 1.6,
          }}
        >
          Control which alerts you receive by email and Slack after scans
          complete.
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.15rem",
            marginBottom: "1rem",
          }}
        >
          <Toggle
            checked={notifScans}
            onChange={setNotifScans}
            label="Scan complete"
          />
          <Toggle
            checked={notifIssues}
            onChange={setNotifIssues}
            label="New critical issues found"
          />
          <Toggle
            checked={notifWeekly}
            onChange={setNotifWeekly}
            label="Weekly digest"
          />
        </div>
        <button
          onClick={handleNotifSave}
          disabled={notifSaving}
          style={{
            padding: "0.45rem 0.9rem",
            borderRadius: 6,
            border: "none",
            background: t.accent,
            color: "white",
            fontFamily: "var(--body)",
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: notifSaving ? "not-allowed" : "pointer",
            opacity: notifSaving ? 0.5 : 1,
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
          }}
        >
          {notifSaving ? (
            <Loader2 size={13} className="xsbl-spin" />
          ) : (
            <Save size={13} />
          )}{" "}
          Save preferences
        </button>
      </div>

      {/* Integrations — Slack + Email */}
      <PlanGate
        currentPlan={org?.plan || "free"}
        requiredPlan="pro"
        feature="Slack & email alerts"
      >
        <AlertIntegrations org={org} />
      </PlanGate>

      {/* Scheduled Reports — Agency only */}
      <PlanGate
        currentPlan={org?.plan || "free"}
        requiredPlan="agency"
        feature="Scheduled PDF reports to clients"
      >
        <ScheduledReports org={org} />
      </PlanGate>

      {/* Danger zone */}
      <div
        style={{
          padding: "1.5rem",
          borderRadius: 12,
          border: `1px solid ${t.red}20`,
          background: `${t.red}04`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.6rem",
          }}
        >
          <Trash2 size={17} color={t.red} strokeWidth={1.8} />
          <h3
            style={{
              fontSize: "0.95rem",
              fontWeight: 600,
              color: t.red,
              margin: 0,
            }}
          >
            Danger zone
          </h3>
        </div>
        <p
          style={{
            fontSize: "0.82rem",
            color: t.ink50,
            marginBottom: "0.8rem",
            lineHeight: 1.6,
          }}
        >
          Deleting your account removes all sites, scans, and issues
          permanently. This cannot be undone.
        </p>
        <button
          onClick={handleDeleteAccount}
          style={{
            padding: "0.45rem 0.9rem",
            borderRadius: 6,
            border: `1.5px solid ${t.red}`,
            background: "none",
            color: t.red,
            fontFamily: "var(--body)",
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Delete account
        </button>
      </div>

      <style>{`@keyframes xsbl-spin { to { transform: rotate(360deg); } } .xsbl-spin { animation: xsbl-spin 0.6s linear infinite; }`}</style>
    </div>
  );
}
