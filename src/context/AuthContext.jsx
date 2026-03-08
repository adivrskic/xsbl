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
  const CACHE_TTL = 30000; // 30 seconds

  const fetchOrg = useCallback(async (userId, force) => {
    var now = Date.now();
    if (!force && now - lastFetch.current.org < CACHE_TTL && org) return org;

    try {
      var { data, error } = await supabase
        .from("org_members")
        .select(
          "org_id, role, organizations(id, name, slug, plan, onboarding_complete, plan_limits, status_page_enabled)"
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
      var {
        data: { session: s },
      } = await supabase.auth.getSession();
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
        // Clients: only fetch sites they have explicit access to
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

  // Initial load
  useEffect(() => {
    supabase.auth.getSession().then(function ({ data: { session: s } }) {
      setSession(s);
      setUser(s && s.user ? s.user : null);
      if (s && s.user) {
        fetchOrg(s.user.id, true).then(function (orgData) {
          if (orgData) {
            fetchUsage(true);
            fetchSites(orgData.id, true, orgData.role);
          }
        });
      }
      setLoading(false);
    });

    var {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(function (_event, s) {
      setSession(s);
      setUser(s && s.user ? s.user : null);
      if (s && s.user) {
        fetchOrg(s.user.id, true).then(function (orgData) {
          if (orgData) {
            fetchUsage(true);
            fetchSites(orgData.id, true, orgData.role);
          }
        });
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
