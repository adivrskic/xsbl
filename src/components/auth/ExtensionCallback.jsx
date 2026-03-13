import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Check, AlertTriangle, Loader2, Chrome } from "lucide-react";
import "../../styles/auth.css";

/**
 * ExtensionCallback — handles authentication handshake between
 * the xsbl Chrome extension and the user's account.
 *
 * Flow:
 * 1. Extension opens this page in a new tab
 * 2. If user is logged in, we generate a short-lived extension token
 * 3. We postMessage the token back to the extension and/or show a
 *    "connected" confirmation the user can close
 * 4. If not logged in, redirect to login with a return URL
 */
export default function ExtensionCallback() {
  var { t } = useTheme();
  var { user, session } = useAuth();
  var [status, setStatus] = useState("loading"); // loading | success | error
  var [error, setError] = useState(null);

  useEffect(
    function () {
      if (user === undefined) return; // still loading auth

      if (!user || !session) {
        // Not logged in — redirect to login, then back here
        var returnUrl = encodeURIComponent(
          window.location.pathname + window.location.search
        );
        window.location.replace("/login?redirect=" + returnUrl);
        return;
      }

      // Generate extension token
      async function generateToken() {
        try {
          var { data, error: fnErr } = await supabase.functions.invoke(
            "extension-auth",
            {
              body: { action: "generate_token" },
              headers: {
                Authorization: "Bearer " + (session?.access_token || ""),
              },
            }
          );
          if (fnErr) throw new Error(fnErr.message);
          if (data?.error) throw new Error(data.error);

          var token = data?.token;
          if (!token) throw new Error("No token returned");

          // Send token to extension via postMessage
          // The extension listens for this on the page
          window.postMessage(
            {
              type: "XSBL_EXTENSION_AUTH",
              token: token,
              user_id: user.id,
              email: user.email,
              plan: data?.plan || "free",
            },
            window.location.origin
          );

          // Also store in a data attribute the extension can read
          document.documentElement.setAttribute("data-xsbl-ext-token", token);

          setStatus("success");
        } catch (err) {
          setError(err.message);
          setStatus("error");
        }
      }

      generateToken();
    },
    [user, session]
  );

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--center">
        {status === "loading" && (
          <>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: t.accentBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.2rem",
              }}
            >
              <Loader2
                size={24}
                color={t.accent}
                strokeWidth={2}
                className="xsbl-spin"
              />
            </div>
            <h1
              className="auth-title"
              style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}
            >
              Connecting extension…
            </h1>
            <p className="auth-subtitle">
              Linking your xsbl account to the Chrome extension.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: t.greenBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.2rem",
              }}
            >
              <Check size={24} color={t.green} strokeWidth={2.5} />
            </div>
            <h1
              className="auth-title"
              style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}
            >
              Extension connected
            </h1>
            <p
              className="auth-subtitle"
              style={{ lineHeight: 1.6, marginBottom: "1.5rem" }}
            >
              Your xsbl Chrome extension is now linked to your account. You can
              close this tab and start using the extension.
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.5rem 0.8rem",
                borderRadius: 7,
                background: t.greenBg,
                fontSize: "0.78rem",
                fontWeight: 600,
                color: t.green,
                fontFamily: "var(--mono)",
              }}
            >
              <Chrome size={14} strokeWidth={2} />
              Signed in as {user?.email}
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: t.red + "08",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.2rem",
              }}
            >
              <AlertTriangle size={24} color={t.red} strokeWidth={2} />
            </div>
            <h1
              className="auth-title"
              style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}
            >
              Connection failed
            </h1>
            <p
              className="auth-subtitle"
              style={{ lineHeight: 1.6, marginBottom: "1rem" }}
            >
              {error || "Something went wrong connecting the extension."}
            </p>
            <button
              onClick={function () {
                setStatus("loading");
                setError(null);
                window.location.reload();
              }}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: 7,
                border: "none",
                background: t.accent,
                color: "white",
                fontFamily: "var(--body)",
                fontSize: "0.84rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </>
        )}
      </div>
      <style>{`@keyframes xsbl-spin { to { transform: rotate(360deg); } } .xsbl-spin { animation: xsbl-spin 0.6s linear infinite; }`}</style>
    </div>
  );
}
