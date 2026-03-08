import { useState, useEffect, useRef } from "react";
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
            return (
              <div
                key={inv.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 0.7rem",
                  borderRadius: 7,
                  border: "1px dashed " + t.ink08,
                  opacity: 0.6,
                }}
              >
                <Mail size={14} color={t.ink50} />
                <span style={{ fontSize: "0.76rem", color: t.ink50 }}>
                  {inv.email}
                </span>
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
                    <span>
                      Created {new Date(k.created_at).toLocaleDateString()}
                    </span>
                    {k.last_used_at && (
                      <span>
                        Last used{" "}
                        {new Date(k.last_used_at).toLocaleDateString()}
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
  const { user, org, session, refreshOrg } = useAuth();
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
      },
      { onConflict: "user_id" }
    );
    toast.success("Notification preferences saved");
    logAudit({
      action: "settings.updated",
      resourceType: "settings",
      description: "Notification preferences updated",
      metadata: {
        scan_complete: notifScans,
        critical_issues: notifIssues,
        weekly_digest: notifWeekly,
      },
    });
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

  var settingsTabs = [
    { id: "general", label: "General", icon: User },
    { id: "team", label: "Team", icon: Users },
    { id: "alerts", label: "Alerts", icon: Bell },
    { id: "integrations", label: "Integrations", icon: Key },
    { id: "account", label: "Account", icon: Trash2 },
  ];

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
                  style={{ marginBottom: isOwner && canInvite ? "1.2rem" : 0 }}
                >
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

      <style>{`@keyframes xsbl-spin { to { transform: rotate(360deg); } } .xsbl-spin { animation: xsbl-spin 0.6s linear infinite; }`}</style>
    </div>
  );
}
