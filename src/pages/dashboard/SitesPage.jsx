import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { useToast } from "../../components/ui/Toast";
import { useConfirm } from "../../components/ui/ConfirmModal";
import { Globe, Plus, Trash2, Lock } from "lucide-react";

const SITE_LIMITS = { free: 1, starter: 1, pro: 999, agency: 999 };

// Module-level cache — persists across component mounts
var _sitesCache = { orgId: null, data: null };

/* Allow other pages to invalidate the sites cache (e.g. after verification) */
export function invalidateSitesCache() {
  _sitesCache = { orgId: null, data: null };
}

function genToken() {
  const c = "abcdef0123456789";
  let t = "xsbl-v1-";
  for (let i = 0; i < 12; i++) t += c[Math.floor(Math.random() * c.length)];
  return t;
}

function AddSiteModal({ onClose, onAdded }) {
  const { t } = useTheme();
  const { org } = useAuth();
  const [domain, setDomain] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const dialogRef = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    previousFocus.current = document.activeElement;
    const handleKeyDown = (e) => {
      const dialog = dialogRef.current;
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

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(null);
    let d = domain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "");
    if (!d || !d.includes(".")) {
      setError("Enter a valid domain (e.g. example.com)");
      return;
    }
    setLoading(true);
    const { data, error: err } = await supabase
      .from("sites")
      .insert({
        org_id: org.id,
        domain: d,
        display_name: displayName.trim() || d,
        verification_token: genToken(),
      })
      .select()
      .single();
    if (err) {
      setError(err.code === "23505" ? "Domain already added." : err.message);
      setLoading(false);
    } else {
      onAdded(data);
      onClose();
    }
  };

  const inp = {
    width: "100%",
    padding: "0.6rem 0.9rem",
    borderRadius: 8,
    border: `1.5px solid ${t.ink20}`,
    background: t.cardBg,
    color: t.ink,
    fontFamily: "var(--body)",
    fontSize: "0.88rem",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        padding: "1rem",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-site-title"
        style={{
          background: t.cardBg,
          borderRadius: 14,
          padding: "2rem",
          width: "100%",
          maxWidth: 440,
          border: `1px solid ${t.ink08}`,
          boxShadow: "0 16px 48px rgba(0,0,0,0.15)",
        }}
      >
        <h2
          id="add-site-title"
          style={{
            fontFamily: "var(--serif)",
            fontSize: "1.3rem",
            fontWeight: 700,
            color: t.ink,
            marginBottom: "0.4rem",
          }}
        >
          Add a site
        </h2>
        <p
          style={{
            color: t.ink50,
            fontSize: "0.85rem",
            marginBottom: "1.5rem",
          }}
        >
          Enter the domain to monitor.
        </p>
        <form
          onSubmit={handleAdd}
          style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}
        >
          <div>
            <label
              htmlFor="add-site-domain"
              style={{
                display: "block",
                fontSize: "0.78rem",
                fontWeight: 500,
                color: t.ink,
                marginBottom: "0.35rem",
              }}
            >
              Domain
            </label>
            <input
              id="add-site-domain"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              style={inp}
              autoFocus
            />
          </div>
          <div>
            <label
              htmlFor="add-site-name"
              style={{
                display: "block",
                fontSize: "0.78rem",
                fontWeight: 500,
                color: t.ink,
                marginBottom: "0.35rem",
              }}
            >
              Display name{" "}
              <span style={{ color: t.ink50, fontWeight: 400 }}>
                (optional)
              </span>
            </label>
            <input
              id="add-site-name"
              type="text"
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="My Website"
              style={inp}
            />
          </div>
          {error && (
            <p style={{ color: t.red, fontSize: "0.82rem", margin: 0 }}>
              {error}
            </p>
          )}
          <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.5rem" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "0.65rem",
                borderRadius: 8,
                border: `1.5px solid ${t.ink20}`,
                background: "none",
                color: t.ink,
                fontFamily: "var(--body)",
                fontSize: "0.85rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: "0.65rem",
                borderRadius: 8,
                border: "none",
                background: t.accent,
                color: "white",
                fontFamily: "var(--body)",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Adding\u2026" : "Add site"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SitesPage() {
  const { t } = useTheme();
  const { org } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Auto-open add modal when navigated with ?add=true
  useEffect(() => {
    if (searchParams.get("add") === "true") {
      setShowAdd(true);
      setSearchParams({}, { replace: true }); // Clean the URL
    }
  }, [searchParams]);

  const plan = org?.plan || "free";
  const siteLimit = SITE_LIMITS[plan] || 1;
  const atLimit = sites.length >= siteLimit;

  const loadedOrgId = useRef(null);

  useEffect(() => {
    if (!org) return;
    // Use module-level cache — survives component unmount/remount
    if (_sitesCache.orgId === org.id && _sitesCache.data) {
      setSites(_sitesCache.data);
      setLoading(false);
      return;
    }
    supabase
      .from("sites")
      .select("*")
      .eq("org_id", org.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        var result = data || [];
        _sitesCache = { orgId: org.id, data: result };
        setSites(result);
        setLoading(false);
      });
  }, [org?.id]);

  const handleAddClick = () => {
    if (atLimit) {
      toast.warning(
        `You've reached the ${siteLimit} site${
          siteLimit === 1 ? "" : "s"
        } limit on the ${plan} plan. Upgrade to add more.`
      );
      return;
    }
    setShowAdd(true);
  };

  const handleDelete = async (id, domain) => {
    const ok = await confirm({
      title: "Remove site",
      message: `Remove ${domain} and all its scan history, issues, and data? This cannot be undone.`,
      confirmLabel: "Remove site",
      danger: true,
    });
    if (!ok) return;
    await supabase.from("sites").delete().eq("id", id);
    setSites((p) => {
      var updated = p.filter((s) => s.id !== id);
      _sitesCache.data = updated;
      return updated;
    });
    toast.success(`${domain} removed`);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
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
            Sites
          </h1>
          <p style={{ color: t.ink50, fontSize: "0.88rem" }}>
            Manage the domains you're monitoring.
            {siteLimit < 999 && (
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.72rem",
                  marginLeft: "0.5rem",
                  color: atLimit ? t.red : t.ink50,
                }}
              >
                {sites.length}/{siteLimit} used
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleAddClick}
          style={{
            background: atLimit ? t.ink20 : t.accent,
            color: atLimit ? t.ink50 : "white",
            border: "none",
            padding: "0.55rem 1.2rem",
            borderRadius: 8,
            fontSize: "0.85rem",
            fontWeight: 600,
            fontFamily: "var(--body)",
            cursor: atLimit ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
          }}
        >
          {atLimit ? <Lock size={15} /> : <Plus size={15} strokeWidth={2.5} />}
          {atLimit ? "Limit reached" : "Add site"}
        </button>
      </div>

      {loading ? (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          {[1, 2, 3].map(function (i) {
            return (
              <div
                key={i}
                style={{
                  padding: "1rem 1.2rem",
                  borderRadius: 10,
                  border: "1px solid " + t.ink04,
                  background: t.cardBg,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.8rem",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: t.ink08,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      width: "45%",
                      height: 13,
                      borderRadius: 4,
                      background: t.ink08,
                      animation: "skeletonPulse 1.5s ease-in-out infinite",
                      marginBottom: "0.3rem",
                    }}
                  />
                  <div
                    style={{
                      width: "30%",
                      height: 10,
                      borderRadius: 4,
                      background: t.ink08,
                      animation: "skeletonPulse 1.5s ease-in-out infinite",
                    }}
                  />
                </div>
                <div
                  style={{
                    width: 30,
                    height: 18,
                    borderRadius: 4,
                    background: t.ink08,
                    animation: "skeletonPulse 1.5s ease-in-out infinite",
                  }}
                />
              </div>
            );
          })}
          <style>{`@keyframes skeletonPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
        </div>
      ) : sites.length === 0 ? (
        <div
          style={{
            padding: "4rem 2rem",
            borderRadius: 14,
            border: `1px dashed ${t.ink20}`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "1rem",
            }}
          >
            <Globe size={36} color={t.ink20} strokeWidth={1.2} />
          </div>
          <p style={{ color: t.ink, fontWeight: 600, marginBottom: "0.4rem" }}>
            No sites yet
          </p>
          <p
            style={{
              color: t.ink50,
              fontSize: "0.88rem",
              marginBottom: "1.5rem",
            }}
          >
            Add a domain to start scanning.
          </p>
          <button
            onClick={() => setShowAdd(true)}
            style={{
              background: t.accent,
              color: "white",
              border: "none",
              padding: "0.6rem 1.4rem",
              borderRadius: 8,
              fontSize: "0.88rem",
              fontWeight: 600,
              fontFamily: "var(--body)",
              cursor: "pointer",
            }}
          >
            Add your first site
          </button>
        </div>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          {sites.map((site) => (
            <div
              key={site.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem 1.2rem",
                borderRadius: 10,
                border: `1px solid ${t.ink08}`,
                background: t.cardBg,
                flexWrap: "wrap",
                gap: "0.8rem",
              }}
            >
              <Link
                to={`/dashboard/sites/${site.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.8rem",
                  textDecoration: "none",
                  flex: 1,
                  minWidth: 200,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: site.verified ? t.green : t.amber,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "0.88rem",
                      color: t.ink,
                    }}
                  >
                    {site.display_name || site.domain}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.72rem",
                      color: t.ink50,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    {site.domain}
                    {!site.verified && (
                      <span
                        style={{
                          fontSize: "0.6rem",
                          background: `${t.amber}18`,
                          color: t.amber,
                          padding: "0.1rem 0.4rem",
                          borderRadius: 3,
                          fontWeight: 600,
                        }}
                      >
                        Unverified
                      </span>
                    )}
                  </div>
                </div>
              </Link>
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}
              >
                {site.score != null && (
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      color:
                        site.score >= 80
                          ? t.green
                          : site.score >= 50
                          ? t.amber
                          : t.red,
                    }}
                  >
                    {Math.round(site.score)}
                  </div>
                )}
                <button
                  onClick={() => handleDelete(site.id, site.domain)}
                  title="Remove"
                  style={{
                    background: "none",
                    border: "none",
                    color: t.ink50,
                    cursor: "pointer",
                    padding: "0.2rem",
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = t.red)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = t.ink50)}
                >
                  <Trash2 size={15} strokeWidth={1.8} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddSiteModal
          onClose={() => setShowAdd(false)}
          onAdded={(s) => {
            setSites((p) => {
              var updated = [s, ...p];
              _sitesCache.data = updated;
              return updated;
            });
            toast.success(`${s.domain} added`);
          }}
        />
      )}
    </div>
  );
}
