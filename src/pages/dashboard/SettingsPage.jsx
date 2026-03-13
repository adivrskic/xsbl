import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import "../../styles/dashboard.css";
import "../../styles/dashboard-pages.css";
import "../../styles/dashboard-modals.css";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { logAudit } from "../../lib/audit";
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
  Key,
  Copy,
  Globe,
  Eye,
} from "lucide-react";
import { timeAgo, fullDate } from "../../lib/timeAgo";

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
            aria-label={placeholder || "Edit value"}
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
function MemberRow({ member, isCurrentUser, canManage, onRemove }) {
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
        {canManage && !isCurrentUser && member.role !== "owner" && (
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
  const { session } = useAuth();
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
        logAudit({
          action: "user.added",
          resourceType: "user",
          resourceId: users[0].id,
          description: "Added " + cleanEmail + " as " + role,
          metadata: { email: cleanEmail, role: role },
        });
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
        logAudit({
          action: "user.invited",
          resourceType: "user",
          description: "Invited " + cleanEmail + " as " + role,
          metadata: { email: cleanEmail, role: role },
        });
        setEmail("");
        onInvited && onInvited();

        // Try to send invite email if Resend is configured
        try {
          await supabase.functions.invoke("send-invite-email", {
            body: { email: cleanEmail, org_id: orgId, role: role },
            headers: {
              Authorization: "Bearer " + (session ? session.access_token : ""),
            },
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
            aria-label="Email address to invite"
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

/* ── Client Access (Agency) ── */
function ClientAccessPanel({ org }) {
  const { t } = useTheme();
  const { session } = useAuth();
  const [clients, setClients] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [sites, setSites] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteSiteIds, setInviteSiteIds] = useState([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!org) return null;

  var loadClients = async function () {
    var { data } = await supabase.functions.invoke(
      "client-access?action=list",
      {
        headers: { Authorization: "Bearer " + (session?.access_token || "") },
      }
    );
    if (data) {
      setClients(data.clients || []);
      setPendingInvites(data.pending_invites || []);
    }
    setLoadingClients(false);
  };

  var loadSites = async function () {
    var { data } = await supabase
      .from("sites")
      .select("id, domain, display_name")
      .eq("org_id", org.id);
    setSites(data || []);
  };

  useEffect(function () {
    loadClients();
    loadSites();
  }, []);

  var toggleSite = function (siteId) {
    setInviteSiteIds(function (p) {
      return p.indexOf(siteId) !== -1
        ? p.filter(function (id) {
            return id !== siteId;
          })
        : p.concat([siteId]);
    });
  };

  var handleInvite = async function () {
    if (!inviteEmail.trim() || inviteSiteIds.length === 0) return;
    setSending(true);
    var { data, error } = await supabase.functions.invoke(
      "client-access?action=invite",
      {
        body: { email: inviteEmail.trim(), site_ids: inviteSiteIds },
        headers: { Authorization: "Bearer " + (session?.access_token || "") },
      }
    );
    setSending(false);
    if (data && (data.ok || data.updated)) {
      setSent(true);
      setInviteEmail("");
      setInviteSiteIds([]);
      setTimeout(function () {
        setSent(false);
      }, 3000);
      loadClients();
    }
  };

  var handleRemove = async function (userId) {
    await supabase.functions.invoke("client-access?action=remove", {
      body: { user_id: userId },
      headers: { Authorization: "Bearer " + (session?.access_token || "") },
    });
    loadClients();
  };

  var handleRevokeInvite = async function (inviteId) {
    await supabase
      .from("client_invites")
      .update({ revoked: true })
      .eq("id", inviteId);
    logAudit({
      action: "user.client_invite_revoked",
      resourceType: "user",
      description: "Client invite revoked",
      metadata: { invite_id: inviteId },
    });
    loadClients();
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
        <Users size={17} color={t.accent} strokeWidth={1.8} />
        <h3
          style={{
            fontSize: "0.95rem",
            fontWeight: 600,
            color: t.ink,
            margin: 0,
          }}
        >
          Client Access
        </h3>
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.52rem",
            fontWeight: 600,
            padding: "0.08rem 0.3rem",
            borderRadius: 3,
            background: t.ink04,
            color: t.ink50,
          }}
        >
          {clients.length} client{clients.length !== 1 ? "s" : ""}
        </span>
      </div>
      <p
        style={{
          fontSize: "0.76rem",
          color: t.ink50,
          marginBottom: "1rem",
          lineHeight: 1.6,
        }}
      >
        Invite clients to view read-only dashboards for specific sites. They can
        see scores, issues, and reports but cannot modify anything.
      </p>

      {/* Invite form */}
      <div
        style={{
          padding: "1rem",
          borderRadius: 8,
          background: t.ink04,
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.58rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: t.ink50,
            marginBottom: "0.4rem",
          }}
        >
          Invite a client
        </div>
        <input
          aria-label="Client email to invite"
          value={inviteEmail}
          onChange={function (e) {
            setInviteEmail(e.target.value);
          }}
          placeholder="client@example.com"
          style={{
            width: "100%",
            padding: "0.45rem 0.7rem",
            borderRadius: 6,
            border: "1.5px solid " + t.ink08,
            background: t.paper,
            color: t.ink,
            fontFamily: "var(--mono)",
            fontSize: "0.74rem",
            outline: "none",
            boxSizing: "border-box",
            marginBottom: "0.5rem",
          }}
        />
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.55rem",
            color: t.ink50,
            marginBottom: "0.3rem",
          }}
        >
          Sites to share:
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.25rem",
            marginBottom: "0.6rem",
          }}
        >
          {sites.map(function (s) {
            var selected = inviteSiteIds.indexOf(s.id) !== -1;
            return (
              <button
                key={s.id}
                onClick={function () {
                  toggleSite(s.id);
                }}
                style={{
                  padding: "0.25rem 0.5rem",
                  borderRadius: 5,
                  fontSize: "0.68rem",
                  fontFamily: "var(--mono)",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "1.5px solid " + (selected ? t.accent : t.ink08),
                  background: selected ? t.accentBg : "transparent",
                  color: selected ? t.accent : t.ink50,
                }}
              >
                {s.display_name || s.domain}
              </button>
            );
          })}
        </div>
        <button
          onClick={handleInvite}
          disabled={
            !inviteEmail.trim() || inviteSiteIds.length === 0 || sending
          }
          style={{
            padding: "0.4rem 0.8rem",
            borderRadius: 6,
            border: "none",
            background: t.accent,
            color: "white",
            fontFamily: "var(--mono)",
            fontSize: "0.72rem",
            fontWeight: 600,
            cursor:
              !inviteEmail.trim() || inviteSiteIds.length === 0 || sending
                ? "not-allowed"
                : "pointer",
            opacity:
              !inviteEmail.trim() || inviteSiteIds.length === 0 || sending
                ? 0.5
                : 1,
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
          }}
        >
          {sending ? (
            <Loader2 size={12} className="xsbl-spin" />
          ) : (
            <Mail size={12} />
          )}
          {sent ? "Invite sent" : "Send invite"}
        </button>
      </div>

      {/* Active clients */}
      {loadingClients ? (
        <div style={{ textAlign: "center", padding: "1rem" }}>
          <Loader2 size={18} className="xsbl-spin" color={t.accent} />
        </div>
      ) : clients.length === 0 && pendingInvites.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "1rem",
            fontSize: "0.78rem",
            color: t.ink50,
          }}
        >
          No clients invited yet.
        </div>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}
        >
          {clients.map(function (c) {
            return (
              <div
                key={c.user_id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.6rem 0.7rem",
                  borderRadius: 7,
                  border: "1px solid " + t.ink08,
                  background: t.paper,
                }}
              >
                <Users size={14} color={t.ink50} />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: t.ink,
                    }}
                  >
                    {c.display_name || c.email}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.6rem",
                      color: t.ink50,
                    }}
                  >
                    {c.sites.length} site{c.sites.length !== 1 ? "s" : ""}:{" "}
                    {c.sites
                      .map(function (s) {
                        return s.domain || s.display_name;
                      })
                      .join(", ")}
                  </div>
                </div>
                <button
                  onClick={function () {
                    handleRemove(c.user_id);
                  }}
                  style={{
                    padding: "0.2rem 0.5rem",
                    borderRadius: 4,
                    border: "1px solid " + t.red + "30",
                    background: "none",
                    color: t.red,
                    fontFamily: "var(--mono)",
                    fontSize: "0.6rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              </div>
            );
          })}
          {pendingInvites.map(function (inv) {
            var viewed = inv.accepted;
            return (
              <div
                key={inv.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 0.7rem",
                  borderRadius: 7,
                  border:
                    "1px " + (viewed ? "solid" : "dashed") + " " + t.ink08,
                  opacity: viewed ? 1 : 0.6,
                }}
              >
                <Mail size={14} color={viewed ? t.green : t.ink50} />
                <span
                  style={{
                    fontSize: "0.76rem",
                    color: viewed ? t.ink : t.ink50,
                    flex: 1,
                  }}
                >
                  {inv.email}
                </span>
                {viewed ? (
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.52rem",
                      padding: "0.05rem 0.25rem",
                      borderRadius: 3,
                      background: t.green + "15",
                      color: t.green,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.15rem",
                    }}
                  >
                    <Check size={9} /> VIEWED
                  </span>
                ) : (
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.52rem",
                      padding: "0.05rem 0.25rem",
                      borderRadius: 3,
                      background: t.amber + "15",
                      color: t.amber,
                      fontWeight: 600,
                    }}
                  >
                    PENDING
                  </span>
                )}
                <button
                  onClick={function () {
                    handleRevokeInvite(inv.id);
                  }}
                  aria-label={"Revoke invite for " + inv.email}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: t.ink50,
                    padding: "0.15rem",
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── API Keys Panel (Pro+) ── */
function ApiKeysPanel({ org }) {
  const { t } = useTheme();
  const { session } = useAuth();
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [revealedKey, setRevealedKey] = useState(null);
  const [copied, setCopied] = useState(false);
  const [revoking, setRevoking] = useState(null);

  if (!org) return null;

  var loadKeys = async function () {
    var { data, error } = await supabase.functions.invoke(
      "api-keys?action=list",
      {
        headers: { Authorization: "Bearer " + (session?.access_token || "") },
      }
    );
    if (data && data.keys) setKeys(data.keys);
    setLoading(false);
  };

  useEffect(function () {
    loadKeys();
  }, []);

  var handleCreate = async function () {
    if (!newKeyName.trim()) return;
    setCreating(true);
    var { data, error } = await supabase.functions.invoke(
      "api-keys?action=create",
      {
        body: { name: newKeyName.trim() },
        headers: { Authorization: "Bearer " + (session?.access_token || "") },
      }
    );
    if (data && data.key) {
      setRevealedKey(data);
      setNewKeyName("");
      logAudit({
        action: "settings.api_key_created",
        resourceType: "settings",
        resourceId: data.id,
        description: "API key created: " + data.name,
      });
      loadKeys();
    }
    setCreating(false);
  };

  var handleRevoke = async function (keyId, keyName) {
    setRevoking(keyId);
    await supabase.functions.invoke("api-keys?action=revoke", {
      body: { id: keyId },
      headers: { Authorization: "Bearer " + (session?.access_token || "") },
    });
    logAudit({
      action: "settings.api_key_revoked",
      resourceType: "settings",
      resourceId: keyId,
      description: "API key revoked: " + keyName,
    });
    setRevoking(null);
    loadKeys();
  };

  var handleCopy = function () {
    if (!revealedKey) return;
    navigator.clipboard.writeText(revealedKey.key);
    setCopied(true);
    setTimeout(function () {
      setCopied(false);
    }, 2000);
  };

  var activeKeys = keys.filter(function (k) {
    return !k.revoked_at;
  });
  var revokedKeys = keys.filter(function (k) {
    return !!k.revoked_at;
  });

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
        <Key size={17} color={t.accent} strokeWidth={1.8} />
        <h3
          style={{
            fontSize: "0.95rem",
            fontWeight: 600,
            color: t.ink,
            margin: 0,
          }}
        >
          API Keys
        </h3>
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.52rem",
            fontWeight: 600,
            padding: "0.08rem 0.3rem",
            borderRadius: 3,
            background: t.ink04,
            color: t.ink50,
          }}
        >
          {activeKeys.length}/5
        </span>
      </div>
      <p
        style={{
          fontSize: "0.76rem",
          color: t.ink50,
          marginBottom: "1rem",
          lineHeight: 1.6,
        }}
      >
        API keys let you authenticate programmatically. Keys are shown once on
        creation — store them securely.
      </p>

      {/* Revealed key banner */}
      {revealedKey && (
        <div
          style={{
            padding: "0.8rem 1rem",
            borderRadius: 8,
            background: t.greenBg || "#f0fdf4",
            border: "1px solid " + (t.green + "30"),
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              fontSize: "0.72rem",
              fontWeight: 600,
              color: t.green,
              marginBottom: "0.3rem",
            }}
          >
            Key created — copy it now, it won't be shown again
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <input
              aria-label="API key value"
              value={revealedKey.key}
              readOnly
              style={{
                flex: 1,
                padding: "0.4rem 0.6rem",
                borderRadius: 5,
                border: "1.5px solid " + t.ink08,
                background: t.paper,
                color: t.ink,
                fontFamily: "var(--mono)",
                fontSize: "0.72rem",
                outline: "none",
              }}
            />
            <button
              onClick={handleCopy}
              style={{
                padding: "0.4rem 0.7rem",
                borderRadius: 5,
                border: "none",
                background: t.accent,
                color: "white",
                fontFamily: "var(--mono)",
                fontSize: "0.68rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}

      {/* Create form */}
      {activeKeys.length < 5 && (
        <div
          style={{
            display: "flex",
            gap: "0.3rem",
            marginBottom: "1rem",
            flexWrap: "wrap",
          }}
        >
          <input
            aria-label="API key name"
            value={newKeyName}
            onChange={function (e) {
              setNewKeyName(e.target.value);
            }}
            onKeyDown={function (e) {
              if (e.key === "Enter") handleCreate();
            }}
            placeholder="Key name (e.g. CI/CD, Staging)"
            style={{
              flex: 1,
              minWidth: 150,
              padding: "0.4rem 0.6rem",
              borderRadius: 5,
              border: "1.5px solid " + t.ink08,
              background: t.paper,
              color: t.ink,
              fontFamily: "var(--mono)",
              fontSize: "0.72rem",
              outline: "none",
            }}
          />
          <button
            onClick={handleCreate}
            disabled={!newKeyName.trim() || creating}
            style={{
              padding: "0.4rem 0.8rem",
              borderRadius: 5,
              border: "none",
              background: t.accent,
              color: "white",
              fontFamily: "var(--mono)",
              fontSize: "0.72rem",
              fontWeight: 600,
              cursor:
                !newKeyName.trim() || creating ? "not-allowed" : "pointer",
              opacity: !newKeyName.trim() || creating ? 0.5 : 1,
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              whiteSpace: "nowrap",
            }}
          >
            {creating ? (
              <Loader2 size={12} className="xsbl-spin" />
            ) : (
              <Plus size={12} />
            )}
            Create key
          </button>
        </div>
      )}

      {/* Active keys */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "1rem", color: t.ink50 }}>
          <Loader2 size={18} className="xsbl-spin" color={t.accent} />
        </div>
      ) : activeKeys.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "1.5rem",
            color: t.ink50,
            fontSize: "0.78rem",
          }}
        >
          No API keys created yet.
        </div>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}
        >
          {activeKeys.map(function (k) {
            return (
              <div
                key={k.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.6rem 0.7rem",
                  borderRadius: 7,
                  border: "1px solid " + t.ink08,
                  background: t.paper,
                }}
              >
                <Key size={14} color={t.ink50} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: t.ink,
                      }}
                    >
                      {k.name}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.6rem",
                      fontFamily: "var(--mono)",
                      fontSize: "0.6rem",
                      color: t.ink50,
                      marginTop: "0.1rem",
                    }}
                  >
                    <span>{k.key_prefix}</span>
                    <span title={fullDate(k.created_at)}>
                      Created {timeAgo(k.created_at)}
                    </span>
                    {k.last_used_at && (
                      <span title={fullDate(k.last_used_at)}>
                        Last used {timeAgo(k.last_used_at)}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={function () {
                    handleRevoke(k.id, k.name);
                  }}
                  disabled={revoking === k.id}
                  style={{
                    padding: "0.25rem 0.5rem",
                    borderRadius: 4,
                    border: "1px solid " + t.red + "30",
                    background: "none",
                    color: t.red,
                    fontFamily: "var(--mono)",
                    fontSize: "0.6rem",
                    fontWeight: 600,
                    cursor: revoking === k.id ? "not-allowed" : "pointer",
                    opacity: revoking === k.id ? 0.5 : 1,
                  }}
                >
                  {revoking === k.id ? "Revoking..." : "Revoke"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Revoked keys (collapsed) */}
      {revokedKeys.length > 0 && (
        <details style={{ marginTop: "0.8rem" }}>
          <summary
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.6rem",
              color: t.ink50,
              cursor: "pointer",
              padding: "0.3rem 0",
            }}
          >
            {revokedKeys.length} revoked key
            {revokedKeys.length !== 1 ? "s" : ""}
          </summary>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.2rem",
              marginTop: "0.3rem",
            }}
          >
            {revokedKeys.map(function (k) {
              return (
                <div
                  key={k.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.4rem 0.7rem",
                    borderRadius: 6,
                    opacity: 0.5,
                    fontFamily: "var(--mono)",
                    fontSize: "0.6rem",
                    color: t.ink50,
                  }}
                >
                  <Key size={12} />
                  <span style={{ textDecoration: "line-through" }}>
                    {k.name}
                  </span>
                  <span>{k.key_prefix}</span>
                  <span style={{ marginLeft: "auto" }}>Revoked</span>
                </div>
              );
            })}
          </div>
        </details>
      )}
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
    logAudit({
      action: "settings.updated",
      resourceType: "settings",
      description: "Report schedule updated to " + (schedule || "off"),
      metadata: {
        schedule: schedule || "off",
        recipients: emailList.length,
        white_label: whiteLabel,
      },
    });
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
          aria-label="Report recipient email addresses"
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
            aria-label="Enable white-label branding"
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
            aria-label="Company name for white-label reports"
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
    logAudit({
      action: "settings.alerts_updated",
      resourceType: "settings",
      description: "Alert integrations updated",
      metadata: {
        has_slack: !!slackUrl.trim(),
        alert_emails: emailList.length,
      },
    });
    setTimeout(function () {
      setSaved(false);
    }, 2000);
  };

  var handleTestSlack = async function () {
    if (!slackUrl.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      var { data, error } = await supabase.functions.invoke("test-slack", {
        body: { webhook_url: slackUrl.trim() },
        headers: { Authorization: "Bearer " + session?.access_token },
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
            aria-label="Slack webhook URL"
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
          aria-label="Email addresses for alerts"
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

/* ── Digest Preview Modal ── */
function DigestPreviewModal({ org, sites, onClose }) {
  var { t } = useTheme();
  var [stats, setStats] = useState(null);
  var [loading, setLoading] = useState(true);

  useEffect(
    function () {
      if (!org || !sites || sites.length === 0) {
        setLoading(false);
        return;
      }

      var siteIds = sites.map(function (s) {
        return s.id;
      });
      var oneWeekAgo = new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000
      ).toISOString();

      Promise.all([
        supabase
          .from("scans")
          .select("site_id")
          .in("site_id", siteIds)
          .eq("status", "complete")
          .gte("created_at", oneWeekAgo),
        supabase
          .from("issues")
          .select("site_id, impact")
          .in("site_id", siteIds)
          .eq("status", "open"),
      ]).then(function (results) {
        var scansData = results[0].data || [];
        var issuesData = results[1].data || [];

        var weekScans = {};
        scansData.forEach(function (s) {
          weekScans[s.site_id] = (weekScans[s.site_id] || 0) + 1;
        });

        var siteStats = {};
        issuesData.forEach(function (i) {
          if (!siteStats[i.site_id])
            siteStats[i.site_id] = { open: 0, critical: 0 };
          siteStats[i.site_id].open++;
          if (i.impact === "critical") siteStats[i.site_id].critical++;
        });

        setStats({ weekScans: weekScans, siteStats: siteStats });
        setLoading(false);
      });
    },
    [org?.id]
  );

  var orgName = org?.name || "Your workspace";
  var dateStr = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  var totalSites = sites.length;
  var totalScans = 0;
  var totalOpen = 0;
  var totalCritical = 0;
  if (stats) {
    for (var sid in stats.weekScans) totalScans += stats.weekScans[sid];
    for (var sid2 in stats.siteStats) {
      totalOpen += stats.siteStats[sid2].open;
      totalCritical += stats.siteStats[sid2].critical;
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)",
        padding: "1rem",
      }}
      onClick={function (e) {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 640,
          maxHeight: "90vh",
          borderRadius: 16,
          background: t.paper,
          border: "1px solid " + t.ink08,
          boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Modal header */}
        <div
          style={{
            padding: "1rem 1.4rem",
            borderBottom: "1px solid " + t.ink08,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "var(--serif)",
                fontSize: "1.05rem",
                fontWeight: 700,
                color: t.ink,
                margin: 0,
              }}
            >
              Weekly digest preview
            </h2>
            <p
              style={{
                fontSize: "0.72rem",
                color: t.ink50,
                margin: "0.1rem 0 0",
              }}
            >
              This is what your digest email looks like with current data.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close preview"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: t.ink50,
              padding: "0.3rem",
              borderRadius: 6,
              display: "flex",
            }}
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Email preview (rendered as it would appear in inbox) */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            background: "#f6f1eb",
            padding: "1.5rem 1rem",
          }}
        >
          {loading ? (
            <div
              style={{ textAlign: "center", padding: "3rem", color: t.ink50 }}
            >
              <Loader2
                size={20}
                className="xsbl-spin"
                style={{ display: "inline-block" }}
              />
              <p style={{ marginTop: "0.5rem", fontSize: "0.82rem" }}>
                Loading preview data...
              </p>
            </div>
          ) : (
            <div style={{ maxWidth: 560, margin: "0 auto" }}>
              {/* Header card */}
              <div
                style={{
                  background: "white",
                  borderRadius: 12,
                  padding: "24px 22px",
                  marginBottom: 10,
                  border: "1px solid #e8e4df",
                }}
              >
                <div style={{ marginBottom: 14 }}>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontWeight: 700,
                      fontSize: 17,
                      color: "#1a1a1a",
                    }}
                  >
                    xsbl
                  </span>
                  <span
                    style={{ color: "#4338f0", fontSize: 17, fontWeight: 700 }}
                  >
                    .
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#1a1a1a",
                    marginBottom: 4,
                  }}
                >
                  Weekly Accessibility Digest
                </div>
                <div style={{ color: "#888", fontSize: 12 }}>
                  {orgName} · Week of {dateStr}
                </div>
              </div>

              {/* Stats card */}
              <div
                style={{
                  background: "white",
                  borderRadius: 12,
                  padding: "20px 22px",
                  marginBottom: 10,
                  border: "1px solid #e8e4df",
                  display: "flex",
                  justifyContent: "space-around",
                  textAlign: "center",
                }}
              >
                <div>
                  <div
                    style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a" }}
                  >
                    {totalSites}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "#999",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Sites
                  </div>
                </div>
                <div>
                  <div
                    style={{ fontSize: 22, fontWeight: 700, color: "#4338f0" }}
                  >
                    {totalScans}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "#999",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Scans
                  </div>
                </div>
                <div>
                  <div
                    style={{ fontSize: 22, fontWeight: 700, color: "#b45309" }}
                  >
                    {totalOpen}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "#999",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Open Issues
                  </div>
                </div>
                {totalCritical > 0 && (
                  <div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: "#c0392b",
                      }}
                    >
                      {totalCritical}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "#c0392b",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Critical
                    </div>
                  </div>
                )}
              </div>

              {/* Sites table card */}
              <div
                style={{
                  background: "white",
                  borderRadius: 12,
                  padding: "18px 22px",
                  marginBottom: 10,
                  border: "1px solid #e8e4df",
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#1a1a1a",
                    marginBottom: 10,
                  }}
                >
                  Sites Overview
                </div>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 12,
                  }}
                >
                  <thead>
                    <tr style={{ background: "#fafafa" }}>
                      <th
                        style={{
                          padding: "6px 10px",
                          textAlign: "left",
                          fontSize: 9,
                          textTransform: "uppercase",
                          color: "#999",
                          letterSpacing: "0.3px",
                        }}
                      >
                        Site
                      </th>
                      <th
                        style={{
                          padding: "6px 10px",
                          textAlign: "center",
                          fontSize: 9,
                          textTransform: "uppercase",
                          color: "#999",
                          letterSpacing: "0.3px",
                        }}
                      >
                        Score
                      </th>
                      <th
                        style={{
                          padding: "6px 10px",
                          textAlign: "center",
                          fontSize: 9,
                          textTransform: "uppercase",
                          color: "#999",
                          letterSpacing: "0.3px",
                        }}
                      >
                        Scans
                      </th>
                      <th
                        style={{
                          padding: "6px 10px",
                          textAlign: "center",
                          fontSize: 9,
                          textTransform: "uppercase",
                          color: "#999",
                          letterSpacing: "0.3px",
                        }}
                      >
                        Open
                      </th>
                      <th
                        style={{
                          padding: "6px 10px",
                          textAlign: "center",
                          fontSize: 9,
                          textTransform: "uppercase",
                          color: "#999",
                          letterSpacing: "0.3px",
                        }}
                      >
                        Critical
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sites.map(function (s) {
                      var score = s.score != null ? Math.round(s.score) : "—";
                      var scoreColor =
                        s.score >= 80
                          ? "#1a8754"
                          : s.score >= 50
                          ? "#b45309"
                          : "#c0392b";
                      var scanCount =
                        stats && stats.weekScans[s.id]
                          ? stats.weekScans[s.id]
                          : 0;
                      var openIssues =
                        stats && stats.siteStats[s.id]
                          ? stats.siteStats[s.id].open
                          : 0;
                      var criticals =
                        stats && stats.siteStats[s.id]
                          ? stats.siteStats[s.id].critical
                          : 0;
                      return (
                        <tr key={s.id}>
                          <td
                            style={{
                              padding: "8px 10px",
                              borderBottom: "1px solid #f0f0f0",
                              fontWeight: 500,
                              color: "#1a1a1a",
                            }}
                          >
                            {s.display_name || s.domain}
                          </td>
                          <td
                            style={{
                              padding: "8px 10px",
                              borderBottom: "1px solid #f0f0f0",
                              textAlign: "center",
                              fontWeight: 700,
                              color: s.score != null ? scoreColor : "#999",
                            }}
                          >
                            {score}
                          </td>
                          <td
                            style={{
                              padding: "8px 10px",
                              borderBottom: "1px solid #f0f0f0",
                              textAlign: "center",
                              color: "#666",
                            }}
                          >
                            {scanCount}
                          </td>
                          <td
                            style={{
                              padding: "8px 10px",
                              borderBottom: "1px solid #f0f0f0",
                              textAlign: "center",
                              color: "#666",
                            }}
                          >
                            {openIssues}
                          </td>
                          <td
                            style={{
                              padding: "8px 10px",
                              borderBottom: "1px solid #f0f0f0",
                              textAlign: "center",
                              color: criticals > 0 ? "#c0392b" : "#999",
                              fontWeight: criticals > 0 ? 700 : 400,
                            }}
                          >
                            {criticals}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* CTA */}
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "12px 28px",
                    background: "#4338f0",
                    color: "white",
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  Open dashboard
                </span>
              </div>

              {/* Footer */}
              <p
                style={{
                  fontSize: 10,
                  color: "#ccc",
                  textAlign: "center",
                  marginTop: 16,
                }}
              >
                xsbl · AI-powered accessibility scanning · {dateStr}
              </p>
              <p style={{ fontSize: 9, color: "#ddd", textAlign: "center" }}>
                You're receiving this weekly digest because it's enabled in your
                xsbl notification settings.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main ── */
export default function SettingsPage() {
  const { t } = useTheme();
  const { user, org, session, refreshOrg, sites: authSites } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const [members, setMembers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [notifScans, setNotifScans] = useState(false);
  const [notifIssues, setNotifIssues] = useState(false);
  const [notifWeekly, setNotifWeekly] = useState(false);
  const [notifThreshold, setNotifThreshold] = useState(null);
  const [notifSaving, setNotifSaving] = useState(false);
  const [showDigestPreview, setShowDigestPreview] = useState(false);
  const [showScanPreview, setShowScanPreview] = useState(false);
  const [showCriticalPreview, setShowCriticalPreview] = useState(false);
  const [showRegressionPreview, setShowRegressionPreview] = useState(false);

  // Org-wide defaults state
  const [useOrgDefaults, setUseOrgDefaults] = useState(true);
  const [orgDefaults, setOrgDefaults] = useState(null); // null = not loaded, {} = loaded
  const [orgDefaultsSaving, setOrgDefaultsSaving] = useState(false);
  const [orgSyncCount, setOrgSyncCount] = useState(0); // members using org defaults

  const isOwner = org?.role === "owner";
  const isAdmin = org?.role === "owner" || org?.role === "admin";
  const canInvite = ["pro", "agency"].includes(org?.plan);
  const isTeamPlan = org?.plan === "pro" || org?.plan === "agency";

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
    if (!user || !org) return;

    // Load both in parallel, resolve in one step to avoid race conditions
    Promise.all([
      supabase
        .from("notification_prefs")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("org_notification_defaults")
        .select("*")
        .eq("org_id", org.id)
        .maybeSingle(),
    ]).then(function (results) {
      var personalData = results[0].data;
      var orgData = results[1].data;

      setOrgDefaults(orgData || {});

      var followsOrg = personalData
        ? personalData.use_org_defaults !== false
        : true;
      setUseOrgDefaults(followsOrg);

      if (followsOrg && orgData) {
        // Use org defaults
        setNotifScans(orgData.scan_complete ?? false);
        setNotifIssues(orgData.critical_issues ?? false);
        setNotifWeekly(orgData.weekly_digest ?? false);
        setNotifThreshold(
          orgData.score_threshold != null ? orgData.score_threshold : null
        );
      } else if (personalData) {
        // Use personal prefs
        setNotifScans(personalData.scan_complete ?? false);
        setNotifIssues(personalData.critical_issues ?? false);
        setNotifWeekly(personalData.weekly_digest ?? false);
        setNotifThreshold(
          personalData.score_threshold != null
            ? personalData.score_threshold
            : null
        );
      }
    });

    // Count how many members use org defaults (admin only)
    if (org.role === "owner" || org.role === "admin") {
      supabase
        .from("org_members")
        .select("user_id")
        .eq("org_id", org.id)
        .then(({ data: members }) => {
          if (!members || members.length === 0) return;
          var ids = members.map(function (m) {
            return m.user_id;
          });
          supabase
            .from("notification_prefs")
            .select("user_id, use_org_defaults")
            .in("user_id", ids)
            .then(({ data: prefs }) => {
              if (!prefs) return;
              // Count members who either have no prefs (default=true) or use_org_defaults=true
              var prefsMap = {};
              prefs.forEach(function (p) {
                prefsMap[p.user_id] = p;
              });
              var count = ids.filter(function (uid) {
                return (
                  !prefsMap[uid] || prefsMap[uid].use_org_defaults !== false
                );
              }).length;
              setOrgSyncCount(count);
            });
        });
    }
  }, [user, org?.id]);

  const handleOrgNameSave = async (name) => {
    await supabase.from("organizations").update({ name }).eq("id", org.id);
    await refreshOrg?.();
    logAudit({
      action: "settings.updated",
      resourceType: "settings",
      description: "Workspace name changed to " + name,
      metadata: { field: "org_name", value: name },
    });
    toast.success("Workspace name updated");
  };

  const handleRemoveMember = async (userId) => {
    await supabase
      .from("org_members")
      .delete()
      .eq("org_id", org.id)
      .eq("user_id", userId);
    logAudit({
      action: "user.removed",
      resourceType: "user",
      resourceId: userId,
      description: "Team member removed",
      metadata: { removed_user_id: userId },
    });
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
        score_threshold: notifThreshold,
        use_org_defaults: useOrgDefaults,
      },
      { onConflict: "user_id" }
    );
    toast.success(
      useOrgDefaults
        ? "Using organization defaults"
        : "Personal preferences saved"
    );
    logAudit({
      action: "settings.updated",
      resourceType: "settings",
      description: useOrgDefaults
        ? "Switched to org notification defaults"
        : "Personal notification preferences updated",
      metadata: {
        use_org_defaults: useOrgDefaults,
        scan_complete: notifScans,
        critical_issues: notifIssues,
        weekly_digest: notifWeekly,
        score_threshold: notifThreshold,
      },
    });
    setNotifSaving(false);
  };

  const handleSaveOrgDefaults = async () => {
    if (!isAdmin) return;
    setOrgDefaultsSaving(true);
    var defaults = {
      org_id: org.id,
      scan_complete: notifScans,
      critical_issues: notifIssues,
      weekly_digest: notifWeekly,
      score_threshold: notifThreshold,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    };
    await supabase
      .from("org_notification_defaults")
      .upsert(defaults, { onConflict: "org_id" });
    setOrgDefaults(defaults);
    toast.success(
      "Organization defaults saved — applies to " +
        orgSyncCount +
        " member" +
        (orgSyncCount !== 1 ? "s" : "")
    );
    logAudit({
      action: "settings.updated",
      resourceType: "org_settings",
      description: "Organization notification defaults updated",
      metadata: defaults,
    });
    setOrgDefaultsSaving(false);
  };

  const handleSwitchToOrgDefaults = function () {
    setUseOrgDefaults(true);
    if (orgDefaults && orgDefaults.org_id) {
      setNotifScans(orgDefaults.scan_complete ?? false);
      setNotifIssues(orgDefaults.critical_issues ?? false);
      setNotifWeekly(orgDefaults.weekly_digest ?? false);
      setNotifThreshold(
        orgDefaults.score_threshold != null ? orgDefaults.score_threshold : null
      );
    }
  };

  const handleSwitchToPersonal = function () {
    setUseOrgDefaults(false);
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

  var [settingsTab, setSettingsTab] = useState("general");
  var [searchParams, setSearchParams] = useSearchParams();

  // Read ?tab= from URL (e.g. from HelpSearch navigation)
  useEffect(
    function () {
      var urlTab = searchParams.get("tab");
      if (
        urlTab &&
        ["general", "team", "alerts", "integrations", "account"].indexOf(
          urlTab
        ) !== -1
      ) {
        setSettingsTab(urlTab);
        searchParams.delete("tab");
        setSearchParams(searchParams, { replace: true });
      }
    },
    [searchParams]
  );

  var settingsTabs = [
    { id: "general", label: "General", icon: User },
    { id: "team", label: "Team", icon: Users },
    { id: "alerts", label: "Alerts", icon: Bell },
    { id: "integrations", label: "Integrations", icon: Key },
  ];
  if (isOwner) {
    settingsTabs.push({ id: "account", label: "Account", icon: Trash2 });
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
      <p
        style={{ color: t.ink50, fontSize: "0.88rem", marginBottom: "1.2rem" }}
      >
        Account, team, and notification settings.
      </p>

      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Settings sections"
        style={{
          display: "flex",
          gap: "0.2rem",
          marginBottom: "1.5rem",
          borderBottom: "1px solid " + t.ink08,
          paddingBottom: "0",
          overflowX: "auto",
        }}
      >
        {settingsTabs.map(function (tab) {
          var Icon = tab.icon;
          var active = settingsTab === tab.id;
          var isAccount = tab.id === "account";
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active}
              onClick={function () {
                setSettingsTab(tab.id);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.55rem 0.8rem",
                border: "none",
                borderBottom:
                  "2px solid " +
                  (active ? (isAccount ? t.red : t.accent) : "transparent"),
                background: "none",
                color: active ? (isAccount ? t.red : t.accent) : t.ink50,
                fontFamily: "var(--body)",
                fontSize: "0.82rem",
                fontWeight: active ? 600 : 500,
                cursor: "pointer",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
                marginBottom: "-1px",
              }}
            >
              <Icon size={14} strokeWidth={1.8} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ═══ General tab ═══ */}
      {settingsTab === "general" && (
        <>
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

          {/* Public Status Page */}
          {org && isOwner && (
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
                <Shield size={17} color={t.accent} strokeWidth={1.8} />
                <h3
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    color: t.ink,
                    margin: 0,
                  }}
                >
                  Public Status Page
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
                Share a public page showing your accessibility scores. Only
                verified sites are shown.
              </p>
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    aria-label="Enable public status page"
                    checked={!!org.status_page_enabled}
                    onChange={async function (e) {
                      var enabled = e.target.checked;
                      await supabase
                        .from("organizations")
                        .update({ status_page_enabled: enabled })
                        .eq("id", org.id);
                      await refreshOrg?.();
                      logAudit({
                        action: "settings.updated",
                        resourceType: "settings",
                        description:
                          "Status page " + (enabled ? "enabled" : "disabled"),
                        metadata: { status_page_enabled: enabled },
                      });
                      toast.success(
                        enabled ? "Status page enabled" : "Status page disabled"
                      );
                    }}
                    style={{ accentColor: t.accent }}
                  />
                  <span
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 500,
                      color: t.ink,
                    }}
                  >
                    Enable public status page
                  </span>
                </label>
              </div>
              {org.status_page_enabled && org.slug && (
                <div
                  style={{
                    marginTop: "0.6rem",
                    padding: "0.5rem 0.7rem",
                    borderRadius: 6,
                    background: t.ink04,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <Globe size={12} color={t.ink50} />
                  <a
                    href={"/status/" + org.slug}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.72rem",
                      color: t.accent,
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    {window.location.origin}/status/{org.slug}
                  </a>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ═══ Team tab ═══ */}
      {settingsTab === "team" && (
        <>
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
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
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
                <div
                  style={{ marginBottom: isAdmin && canInvite ? "1.2rem" : 0 }}
                >
                  {members.map((m) => (
                    <MemberRow
                      key={m.user_id}
                      member={m}
                      isCurrentUser={m.user_id === user?.id}
                      canManage={isAdmin}
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
                                  style={{
                                    fontSize: "0.82rem",
                                    color: t.ink50,
                                  }}
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
                            {isAdmin && (
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

              {isAdmin && canInvite && (
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

              {isAdmin && !canInvite && (
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
                  <Lock size={13} color={t.ink50} /> Team invites available on
                  Pro and Agency plans.
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ═══ Alerts tab ═══ */}
      {settingsTab === "alerts" && (
        <>
          {/* Org/Personal scope banner (team plans only) */}
          {isTeamPlan && (
            <div
              style={{
                padding: "1rem 1.2rem",
                borderRadius: 10,
                border:
                  "1px solid " + (useOrgDefaults ? t.accent + "25" : t.ink08),
                background: useOrgDefaults ? t.accentBg : t.cardBg,
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "0.6rem",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.84rem",
                    fontWeight: 600,
                    color: t.ink,
                    marginBottom: "0.15rem",
                  }}
                >
                  {useOrgDefaults
                    ? "Using organization defaults"
                    : "Using personal settings"}
                </div>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: t.ink50,
                    lineHeight: 1.5,
                  }}
                >
                  {useOrgDefaults
                    ? isAdmin
                      ? orgSyncCount +
                        " member" +
                        (orgSyncCount !== 1 ? "s" : "") +
                        " synced to these defaults. Changes you save as org defaults apply to everyone."
                      : "Your admin manages these settings for the team. You can switch to personal settings to customize."
                    : "Only you see these settings. Other team members use " +
                      (orgDefaults && orgDefaults.org_id
                        ? "organization defaults"
                        : "their own settings") +
                      "."}
                </div>
              </div>
              <div
                style={{
                  display: "inline-flex",
                  borderRadius: 7,
                  background: t.ink04,
                  border: "1px solid " + t.ink08,
                  padding: 2,
                  gap: 2,
                }}
              >
                <button
                  onClick={handleSwitchToOrgDefaults}
                  style={{
                    padding: "0.3rem 0.65rem",
                    borderRadius: 5,
                    border: "none",
                    background: useOrgDefaults ? t.cardBg : "transparent",
                    boxShadow: useOrgDefaults ? "0 1px 3px " + t.ink08 : "none",
                    color: useOrgDefaults ? t.accent : t.ink50,
                    fontFamily: "var(--body)",
                    fontSize: "0.72rem",
                    fontWeight: useOrgDefaults ? 600 : 400,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  Organization
                </button>
                <button
                  onClick={handleSwitchToPersonal}
                  style={{
                    padding: "0.3rem 0.65rem",
                    borderRadius: 5,
                    border: "none",
                    background: !useOrgDefaults ? t.cardBg : "transparent",
                    boxShadow: !useOrgDefaults
                      ? "0 1px 3px " + t.ink08
                      : "none",
                    color: !useOrgDefaults ? t.ink : t.ink50,
                    fontFamily: "var(--body)",
                    fontSize: "0.72rem",
                    fontWeight: !useOrgDefaults ? 600 : 400,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  Personal
                </button>
              </div>
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

            {/* Score regression threshold */}
            <div
              style={{
                padding: "0.8rem 1rem",
                borderRadius: 8,
                border: "1px solid " + t.ink08,
                background: t.paper,
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: notifThreshold != null ? "0.6rem" : 0,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.84rem",
                      fontWeight: 500,
                      color: t.ink,
                    }}
                  >
                    Score regression alert
                  </div>
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: t.ink50,
                      marginTop: "0.1rem",
                    }}
                  >
                    Get emailed when any site's score drops below a threshold
                  </div>
                </div>
                <Toggle
                  checked={notifThreshold != null}
                  onChange={function (on) {
                    setNotifThreshold(on ? 80 : null);
                  }}
                  label=""
                />
              </div>
              {notifThreshold != null && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      marginBottom: "0.4rem",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "0.72rem",
                        color: t.ink50,
                      }}
                    >
                      Alert below
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={notifThreshold}
                      onChange={function (e) {
                        var val = parseInt(e.target.value, 10);
                        if (isNaN(val)) val = 0;
                        if (val > 100) val = 100;
                        if (val < 0) val = 0;
                        setNotifThreshold(val);
                      }}
                      style={{
                        width: 52,
                        padding: "0.3rem 0.4rem",
                        borderRadius: 5,
                        border: "1.5px solid " + t.ink08,
                        background: t.cardBg,
                        color: t.ink,
                        fontFamily: "var(--mono)",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        textAlign: "center",
                        outline: "none",
                      }}
                      onFocus={function (e) {
                        e.target.style.borderColor = t.accent;
                      }}
                      onBlur={function (e) {
                        e.target.style.borderColor = t.ink08;
                      }}
                    />
                  </div>
                  {/* Range slider */}
                  <div style={{ position: "relative" }}>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={notifThreshold}
                      onChange={function (e) {
                        setNotifThreshold(parseInt(e.target.value, 10));
                      }}
                      style={{
                        width: "100%",
                        height: 6,
                        appearance: "none",
                        WebkitAppearance: "none",
                        borderRadius: 3,
                        outline: "none",
                        cursor: "pointer",
                        background:
                          "linear-gradient(to right, " +
                          t.red +
                          " 0%, " +
                          t.amber +
                          " 50%, " +
                          t.green +
                          " 100%)",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontFamily: "var(--mono)",
                        fontSize: "0.5rem",
                        color: t.ink50,
                        marginTop: "0.15rem",
                      }}
                    >
                      <span>0</span>
                      <span>50</span>
                      <span>100</span>
                    </div>
                  </div>
                  <style>{`
                    input[type="range"]::-webkit-slider-thumb {
                      -webkit-appearance: none;
                      width: 18px; height: 18px;
                      border-radius: 50%;
                      background: ${t.cardBg};
                      border: 2.5px solid ${
                        notifThreshold >= 80
                          ? t.green
                          : notifThreshold >= 50
                          ? t.amber
                          : t.red
                      };
                      box-shadow: 0 1px 4px rgba(0,0,0,0.15);
                      cursor: pointer;
                      transition: border-color 0.2s;
                    }
                    input[type="range"]::-moz-range-thumb {
                      width: 18px; height: 18px;
                      border-radius: 50%;
                      background: ${t.cardBg};
                      border: 2.5px solid ${
                        notifThreshold >= 80
                          ? t.green
                          : notifThreshold >= 50
                          ? t.amber
                          : t.red
                      };
                      box-shadow: 0 1px 4px rgba(0,0,0,0.15);
                      cursor: pointer;
                    }
                  `}</style>
                </div>
              )}
            </div>

            {/* Action bar: Save + org default + preview buttons */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                flexWrap: "wrap",
              }}
            >
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
                )}
                {useOrgDefaults && isTeamPlan ? "Save" : "Save preferences"}
              </button>

              {/* Save as org default — admin only, team plans */}
              {isAdmin && isTeamPlan && (
                <button
                  onClick={handleSaveOrgDefaults}
                  disabled={orgDefaultsSaving}
                  style={{
                    padding: "0.45rem 0.9rem",
                    borderRadius: 6,
                    border: "1.5px solid " + t.accent + "40",
                    background: "transparent",
                    color: t.accent,
                    fontFamily: "var(--body)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: orgDefaultsSaving ? "not-allowed" : "pointer",
                    opacity: orgDefaultsSaving ? 0.5 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={function (e) {
                    if (!orgDefaultsSaving) {
                      e.currentTarget.style.background = t.accent;
                      e.currentTarget.style.color = "white";
                    }
                  }}
                  onMouseLeave={function (e) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = t.accent;
                  }}
                >
                  {orgDefaultsSaving ? (
                    <Loader2 size={13} className="xsbl-spin" />
                  ) : (
                    <Users size={13} />
                  )}
                  Save as org default
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.5rem",
                      padding: "0.06rem 0.3rem",
                      borderRadius: 3,
                      background: t.accent + "15",
                      fontWeight: 700,
                    }}
                  >
                    {orgSyncCount}
                  </span>
                </button>
              )}

              {/* Preview buttons in segmented pill */}
              {(notifScans ||
                notifIssues ||
                notifWeekly ||
                notifThreshold != null) && (
                <div
                  style={{
                    display: "inline-flex",
                    borderRadius: 7,
                    background: t.ink04,
                    border: "1px solid " + t.ink08,
                    padding: 2,
                    gap: 2,
                    alignItems: "center",
                  }}
                >
                  {[
                    {
                      show: notifScans,
                      label: "Scan complete",
                      onClick: function () {
                        setShowScanPreview(true);
                      },
                    },
                    {
                      show: notifIssues,
                      label: "Critical issues",
                      onClick: function () {
                        setShowCriticalPreview(true);
                      },
                    },
                    {
                      show: notifWeekly,
                      label: "Weekly digest",
                      onClick: function () {
                        setShowDigestPreview(true);
                      },
                    },
                    {
                      show: notifThreshold != null,
                      label: "Regression",
                      onClick: function () {
                        setShowRegressionPreview(true);
                      },
                    },
                  ]
                    .filter(function (b) {
                      return b.show;
                    })
                    .map(function (b) {
                      return (
                        <button
                          key={b.label}
                          onClick={b.onClick}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            padding: "0.3rem 0.6rem",
                            height: 28,
                            borderRadius: 5,
                            border: "none",
                            background: "transparent",
                            color: t.ink50,
                            fontFamily: "var(--body)",
                            fontSize: "0.7rem",
                            fontWeight: 500,
                            cursor: "pointer",
                            transition: "all 0.15s",
                            whiteSpace: "nowrap",
                          }}
                          onMouseEnter={function (e) {
                            e.currentTarget.style.background = t.cardBg;
                            e.currentTarget.style.color = t.ink;
                            e.currentTarget.style.boxShadow =
                              "0 1px 3px " + t.ink08;
                          }}
                          onMouseLeave={function (e) {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = t.ink50;
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          <Eye size={11} strokeWidth={1.8} />
                          {b.label}
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          {/* Integrations — Slack + Email */}
          <PlanGate
            currentPlan={org?.plan || "free"}
            requiredPlan="pro"
            feature="Slack & email alerts"
          >
            <AlertIntegrations org={org} />
          </PlanGate>
        </>
      )}

      {/* ═══ Integrations tab ═══ */}
      {settingsTab === "integrations" && (
        <>
          {/* API Keys — Pro+ */}
          <PlanGate
            currentPlan={org?.plan || "free"}
            requiredPlan="pro"
            feature="API keys"
          >
            <ApiKeysPanel org={org} />
          </PlanGate>

          {/* Scheduled Reports — Agency only */}
          <PlanGate
            currentPlan={org?.plan || "free"}
            requiredPlan="agency"
            feature="Scheduled PDF reports to clients"
          >
            <ScheduledReports org={org} />
          </PlanGate>

          {/* Client Access — Agency only */}
          <PlanGate
            currentPlan={org?.plan || "free"}
            requiredPlan="agency"
            feature="Client read-only dashboards"
          >
            <ClientAccessPanel org={org} />
          </PlanGate>
        </>
      )}

      {/* ═══ Account tab ═══ */}
      {settingsTab === "account" && (
        <>
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
        </>
      )}

      {/* Scan complete preview modal */}
      {showScanPreview && (
        <div
          className="dash-modal"
          onClick={function (e) {
            if (e.target === e.currentTarget) setShowScanPreview(false);
          }}
        >
          <div className="dash-modal__dialog" style={{ maxWidth: 480 }}>
            <div className="dash-modal__header">
              <h3 className="dash-modal__title">Scan complete email preview</h3>
              <button
                onClick={function () {
                  setShowScanPreview(false);
                }}
                className="dash-modal__close"
                aria-label="Close preview"
              >
                <X size={16} />
              </button>
            </div>
            <div className="dash-modal__body" style={{ padding: 0 }}>
              <div
                style={{
                  background: "#f6f1eb",
                  padding: "1.5rem",
                  fontFamily: "sans-serif",
                  fontSize: "14px",
                  color: "#1a1714",
                }}
              >
                <div
                  style={{
                    maxWidth: 420,
                    margin: "0 auto",
                    background: "white",
                    borderRadius: 12,
                    border: "1px solid #e8e4df",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ padding: "1.5rem 1.5rem 1rem" }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "16px",
                        marginBottom: "0.3rem",
                      }}
                    >
                      Scan complete
                    </div>
                    <div
                      style={{
                        color: "#888",
                        fontSize: "12px",
                        marginBottom: "1rem",
                      }}
                    >
                      example.com — just now
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.8rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          background: "#1a8754",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: 700,
                          fontSize: "18px",
                        }}
                      >
                        92
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "14px" }}>
                          Score: 92/100
                        </div>
                        <div style={{ color: "#888", fontSize: "12px" }}>
                          5 pages scanned · 4 issues found
                        </div>
                      </div>
                    </div>
                    <table
                      style={{
                        width: "100%",
                        fontSize: "12px",
                        borderCollapse: "collapse",
                      }}
                    >
                      <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                        <td style={{ padding: "6px 0", color: "#888" }}>
                          Critical
                        </td>
                        <td
                          style={{
                            textAlign: "right",
                            fontWeight: 600,
                            color: "#c0392b",
                          }}
                        >
                          0
                        </td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                        <td style={{ padding: "6px 0", color: "#888" }}>
                          Serious
                        </td>
                        <td
                          style={{
                            textAlign: "right",
                            fontWeight: 600,
                            color: "#b45309",
                          }}
                        >
                          2
                        </td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                        <td style={{ padding: "6px 0", color: "#888" }}>
                          Moderate
                        </td>
                        <td
                          style={{
                            textAlign: "right",
                            fontWeight: 600,
                            color: "#4338f0",
                          }}
                        >
                          1
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "6px 0", color: "#888" }}>
                          Minor
                        </td>
                        <td
                          style={{
                            textAlign: "right",
                            fontWeight: 600,
                            color: "#999",
                          }}
                        >
                          1
                        </td>
                      </tr>
                    </table>
                  </div>
                  <div
                    style={{
                      padding: "1rem 1.5rem",
                      borderTop: "1px solid #f0f0f0",
                      textAlign: "center",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        padding: "8px 24px",
                        borderRadius: 6,
                        background: "#4338f0",
                        color: "white",
                        fontWeight: 600,
                        fontSize: "13px",
                      }}
                    >
                      View full results
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Critical issues preview modal */}
      {showCriticalPreview && (
        <div
          className="dash-modal"
          onClick={function (e) {
            if (e.target === e.currentTarget) setShowCriticalPreview(false);
          }}
        >
          <div className="dash-modal__dialog" style={{ maxWidth: 480 }}>
            <div className="dash-modal__header">
              <h3 className="dash-modal__title">
                Critical issues email preview
              </h3>
              <button
                onClick={function () {
                  setShowCriticalPreview(false);
                }}
                className="dash-modal__close"
                aria-label="Close preview"
              >
                <X size={16} />
              </button>
            </div>
            <div className="dash-modal__body" style={{ padding: 0 }}>
              <div
                style={{
                  background: "#f6f1eb",
                  padding: "1.5rem",
                  fontFamily: "sans-serif",
                  fontSize: "14px",
                  color: "#1a1714",
                }}
              >
                <div
                  style={{
                    maxWidth: 420,
                    margin: "0 auto",
                    background: "white",
                    borderRadius: 12,
                    border: "1px solid #e8e4df",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ padding: "1.5rem 1.5rem 1rem" }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "16px",
                        color: "#c0392b",
                        marginBottom: "0.3rem",
                      }}
                    >
                      Critical issues found
                    </div>
                    <div
                      style={{
                        color: "#888",
                        fontSize: "12px",
                        marginBottom: "1rem",
                      }}
                    >
                      example.com — 3 new critical violations
                    </div>
                    {[
                      {
                        rule: "color-contrast",
                        count: 4,
                        desc: "Elements must meet minimum contrast ratio",
                      },
                      {
                        rule: "button-name",
                        count: 1,
                        desc: "Buttons must have discernible text",
                      },
                      {
                        rule: "image-alt",
                        count: 2,
                        desc: "Images must have alt text",
                      },
                    ].map(function (issue, i) {
                      return (
                        <div
                          key={i}
                          style={{
                            padding: "8px 0",
                            borderBottom: i < 2 ? "1px solid #f0f0f0" : "none",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: "#c0392b",
                              flexShrink: 0,
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: "13px" }}>
                              {issue.rule}{" "}
                              <span style={{ color: "#888", fontWeight: 400 }}>
                                ×{issue.count}
                              </span>
                            </div>
                            <div style={{ fontSize: "11px", color: "#888" }}>
                              {issue.desc}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div
                    style={{
                      padding: "1rem 1.5rem",
                      borderTop: "1px solid #f0f0f0",
                      textAlign: "center",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        padding: "8px 24px",
                        borderRadius: 6,
                        background: "#c0392b",
                        color: "white",
                        fontWeight: 600,
                        fontSize: "13px",
                      }}
                    >
                      Fix critical issues
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Regression alert preview modal */}
      {showRegressionPreview && (
        <div
          className="dash-modal"
          onClick={function (e) {
            if (e.target === e.currentTarget) setShowRegressionPreview(false);
          }}
        >
          <div className="dash-modal__dialog" style={{ maxWidth: 480 }}>
            <div className="dash-modal__header">
              <h3 className="dash-modal__title">
                Score regression email preview
              </h3>
              <button
                onClick={function () {
                  setShowRegressionPreview(false);
                }}
                className="dash-modal__close"
                aria-label="Close preview"
              >
                <X size={16} />
              </button>
            </div>
            <div className="dash-modal__body" style={{ padding: 0 }}>
              <div
                style={{
                  background: "#f6f1eb",
                  padding: "1.5rem",
                  fontFamily: "sans-serif",
                  fontSize: "14px",
                  color: "#1a1714",
                }}
              >
                <div
                  style={{
                    maxWidth: 420,
                    margin: "0 auto",
                    background: "white",
                    borderRadius: 12,
                    border: "1px solid #e8e4df",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ padding: "1.5rem 1.5rem 1rem" }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "16px",
                        color: "#b45309",
                        marginBottom: "0.3rem",
                      }}
                    >
                      Score dropped below threshold
                    </div>
                    <div
                      style={{
                        color: "#888",
                        fontSize: "12px",
                        marginBottom: "1rem",
                      }}
                    >
                      example.com — score regression detected
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        marginBottom: "1rem",
                        padding: "0.8rem",
                        borderRadius: 8,
                        background: "#fef3c7",
                      }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            fontSize: "24px",
                            fontWeight: 700,
                            color: "#c0392b",
                          }}
                        >
                          {Math.max(10, (notifThreshold || 80) - 12)}
                        </div>
                        <div style={{ fontSize: "10px", color: "#888" }}>
                          Current
                        </div>
                      </div>
                      <div style={{ fontSize: "16px", color: "#888" }}>←</div>
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            fontSize: "24px",
                            fontWeight: 700,
                            color: "#888",
                          }}
                        >
                          {(notifThreshold || 80) + 5}
                        </div>
                        <div style={{ fontSize: "10px", color: "#888" }}>
                          Previous
                        </div>
                      </div>
                      <div style={{ flex: 1, textAlign: "right" }}>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#b45309",
                            fontWeight: 600,
                          }}
                        >
                          Threshold: {notifThreshold || 80}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#555",
                        lineHeight: 1.6,
                      }}
                    >
                      The accessibility score for <strong>example.com</strong>{" "}
                      dropped from {(notifThreshold || 80) + 5} to{" "}
                      {Math.max(10, (notifThreshold || 80) - 12)}, which is
                      below your alert threshold of {notifThreshold || 80}.
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "1rem 1.5rem",
                      borderTop: "1px solid #f0f0f0",
                      textAlign: "center",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        padding: "8px 24px",
                        borderRadius: 6,
                        background: "#b45309",
                        color: "white",
                        fontWeight: 600,
                        fontSize: "13px",
                      }}
                    >
                      View scan details
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Digest preview modal */}
      {showDigestPreview && (
        <DigestPreviewModal
          org={org}
          sites={authSites || []}
          onClose={function () {
            setShowDigestPreview(false);
          }}
        />
      )}

      <style>{`@keyframes xsbl-spin { to { transform: rotate(360deg); } } .xsbl-spin { animation: xsbl-spin 0.6s linear infinite; }`}</style>
    </div>
  );
}
