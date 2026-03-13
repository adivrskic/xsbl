import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { supabase } from "../lib/supabase";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [usage, setUsage] = useState(null);
  const [sites, setSites] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cache timestamps to prevent redundant fetches
  const lastFetch = useRef({ org: 0, usage: 0, sites: 0 });
  const sessionRef = useRef(null);
  const CACHE_TTL = 30000; // 30 seconds
  const initializedRef = useRef(false);

  const fetchOrg = useCallback(async (userId, force) => {
    var now = Date.now();
    if (!force && now - lastFetch.current.org < CACHE_TTL && org) return org;

    try {
      var { data, error } = await supabase
        .from("org_members")
        .select(
          "org_id, role, organizations(id, name, slug, plan, onboarding_complete, plan_limits, status_page_enabled, report_schedule, report_emails, report_white_label, report_company_name, slack_webhook_url, slack_bot_token, slack_channel_id, alert_emails)"
        )
        .eq("user_id", userId)
        .order("role", { ascending: true })
        .limit(1)
        .single();

      if (!error && data && data.organizations) {
        var orgData = { ...data.organizations, role: data.role };
        setOrg(orgData);
        lastFetch.current.org = now;
        return orgData;
      }
    } catch (e) {
      // Supabase not configured
    }
    return null;
  }, []);

  const fetchUsage = useCallback(async (force) => {
    var now = Date.now();
    if (!force && now - lastFetch.current.usage < CACHE_TTL && usage)
      return usage;

    try {
      // Use cached session ref instead of calling getSession()
      var s = sessionRef.current;
      if (!s || !s.access_token) return null;

      var { data } = await supabase.functions.invoke("check-usage", {
        headers: { Authorization: "Bearer " + s.access_token },
      });
      if (data && !data.error) {
        setUsage(data);
        lastFetch.current.usage = now;
        return data;
      }
    } catch (e) {
      console.error("fetchUsage error:", e);
    }
    return null;
  }, []);

  const fetchSites = useCallback(async (orgId, force, role) => {
    var now = Date.now();
    if (!force && now - lastFetch.current.sites < CACHE_TTL && sites)
      return sites;

    if (!orgId) return null;
    try {
      var result = [];
      if (role === "client") {
        var { data: accessData } = await supabase
          .from("client_site_access")
          .select(
            "site_id, sites(id, domain, display_name, score, verified, last_scan_at)"
          )
          .eq("org_id", orgId);
        result = (accessData || [])
          .filter(function (a) {
            return a.sites;
          })
          .map(function (a) {
            return a.sites;
          });
      } else {
        var { data } = await supabase
          .from("sites")
          .select("id, domain, display_name, score, verified, last_scan_at")
          .eq("org_id", orgId)
          .order("created_at", { ascending: false });
        result = data || [];
      }
      setSites(result);
      lastFetch.current.sites = now;
      return result;
    } catch (e) {
      console.error("fetchSites error:", e);
    }
    return null;
  }, []);

  // Single initialization via onAuthStateChange — no separate getSession call
  useEffect(() => {
    var {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(function (_event, s) {
      sessionRef.current = s;
      setSession(s);
      setUser(s && s.user ? s.user : null);

      if (s && s.user) {
        // Only fetch data on first load or actual auth changes (not INITIAL_SESSION duplicates)
        if (
          !initializedRef.current ||
          _event === "SIGNED_IN" ||
          _event === "TOKEN_REFRESHED"
        ) {
          initializedRef.current = true;

          // Auto-accept pending client invite (survives OAuth redirects via localStorage)
          if (_event === "SIGNED_IN") {
            try {
              var pendingInvite = localStorage.getItem("xsbl-pending-invite");
              if (pendingInvite) {
                localStorage.removeItem("xsbl-pending-invite");
                supabase.functions
                  .invoke("client-access?action=accept", {
                    body: { invite_id: pendingInvite },
                    headers: { Authorization: "Bearer " + s.access_token },
                  })
                  .catch(function (e) {
                    console.log("Invite accept failed:", e);
                  });
              }
            } catch (e) {}

            // Auto-accept pending team invite (matches by email)
            supabase.functions
              .invoke("accept-team-invite", {
                headers: { Authorization: "Bearer " + s.access_token },
              })
              .then(function (res) {
                if (res.data && res.data.accepted) {
                  console.log(
                    "[auth] Team invite accepted, role:",
                    res.data.role
                  );
                }
              })
              .catch(function () {});
          }

          fetchOrg(s.user.id, true).then(function (orgData) {
            if (orgData) {
              fetchUsage(true);
              fetchSites(orgData.id, true, orgData.role);
            }
          });
        }
      } else {
        setOrg(null);
        setUsage(null);
        setSites(null);
      }
      setLoading(false);
    });

    return function () {
      subscription.unsubscribe();
    };
  }, [fetchOrg, fetchUsage, fetchSites]);

  const signUp = function (email, password, fullName) {
    return supabase.auth.signUp({
      email: email,
      password: password,
      options: { data: { full_name: fullName } },
    });
  };

  const signIn = function (email, password) {
    return supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
  };

  const resetPassword = function (email) {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
  };

  const updatePassword = function (newPassword) {
    return supabase.auth.updateUser({ password: newPassword });
  };

  const signInWithOAuth = function (provider) {
    return supabase.auth.signInWithOAuth({
      provider: provider,
      options: { redirectTo: window.location.origin + "/dashboard" },
    });
  };

  const signOut = async function () {
    var result = await supabase.auth.signOut();
    if (!result.error) {
      setSession(null);
      setUser(null);
      setOrg(null);
      setUsage(null);
      setSites(null);
    }
    return result;
  };

  // Refresh helpers — force=true bypasses cache
  const refreshOrg = function () {
    if (user) return fetchOrg(user.id, true);
  };
  const refreshUsage = function () {
    return fetchUsage(true);
  };
  const refreshSites = function () {
    if (org) return fetchSites(org.id, true, org.role);
  };
  const refreshAll = function () {
    if (user) {
      fetchOrg(user.id, true).then(function (o) {
        if (o) {
          fetchUsage(true);
          fetchSites(o.id, true, o.role);
        }
      });
    }
  };

  // Update sites list locally (optimistic update)
  const addSiteLocal = function (site) {
    setSites(function (prev) {
      return prev ? [site].concat(prev) : [site];
    });
    // Invalidate usage cache since site count changed
    lastFetch.current.usage = 0;
  };
  const removeSiteLocal = function (siteId) {
    setSites(function (prev) {
      return prev
        ? prev.filter(function (s) {
            return s.id !== siteId;
          })
        : [];
    });
    lastFetch.current.usage = 0;
  };

  return (
    <AuthCtx.Provider
      value={{
        session: session,
        user: user,
        org: org,
        usage: usage,
        sites: sites,
        loading: loading,
        signUp: signUp,
        signIn: signIn,
        signInWithOAuth: signInWithOAuth,
        signOut: signOut,
        resetPassword: resetPassword,
        updatePassword: updatePassword,
        refreshOrg: refreshOrg,
        refreshUsage: refreshUsage,
        refreshSites: refreshSites,
        refreshAll: refreshAll,
        fetchUsage: fetchUsage,
        fetchSites: fetchSites,
        addSiteLocal: addSiteLocal,
        removeSiteLocal: removeSiteLocal,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  var ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
