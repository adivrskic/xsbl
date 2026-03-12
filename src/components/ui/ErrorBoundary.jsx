import { Component, useEffect } from "react";
import { supabase } from "../../lib/supabase";

/**
 * Report a client-side error to the `client_errors` Supabase table.
 * Fire-and-forget — never blocks UI or throws secondary errors.
 */
function reportError(payload) {
  try {
    // Don't report if Supabase isn't configured
    var url = import.meta.env.VITE_SUPABASE_URL;
    if (!url || url.indexOf("placeholder") !== -1) return;

    supabase
      .from("client_errors")
      .insert({
        message: (payload.message || "Unknown error").substring(0, 1000),
        stack: (payload.stack || "").substring(0, 4000),
        component_stack: (payload.componentStack || "").substring(0, 4000),
        source: payload.source || "unknown",
        url: (typeof window !== "undefined"
          ? window.location.href
          : ""
        ).substring(0, 500),
        user_agent: (typeof navigator !== "undefined"
          ? navigator.userAgent
          : ""
        ).substring(0, 500),
        timestamp: new Date().toISOString(),
      })
      .then(function (res) {
        if (res.error) {
          console.warn("[xsbl] Error report failed:", res.error.message);
        }
      })
      .catch(function () {
        // Silently ignore — never cause a secondary crash
      });
  } catch (e) {
    // Silently ignore
  }
}

/**
 * Deduplication: avoid flooding the DB with the same error on rapid re-renders.
 * Stores a Set of "message|source" keys and skips if seen in the last 60s.
 */
var _recentErrors = new Set();
var _DEDUP_TTL = 60000;

function deduped(payload) {
  var key = (payload.message || "") + "|" + (payload.source || "");
  if (_recentErrors.has(key)) return;
  _recentErrors.add(key);
  setTimeout(function () {
    _recentErrors.delete(key);
  }, _DEDUP_TTL);
  reportError(payload);
}

/**
 * GlobalErrorHandler — mount once at the app root.
 * Catches unhandled errors and promise rejections that escape the ErrorBoundary.
 */
export function GlobalErrorHandler() {
  useEffect(function () {
    function onError(event) {
      deduped({
        message: event.message || String(event.error),
        stack: event.error && event.error.stack ? event.error.stack : "",
        source: "window.onerror",
      });
    }

    function onRejection(event) {
      var reason = event.reason;
      deduped({
        message: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack || "" : "",
        source: "unhandledrejection",
      });
    }

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    return function () {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}

/**
 * ErrorBoundary — catches React render errors, reports them, and shows a fallback UI.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error: error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info.componentStack);

    deduped({
      message: error.message || String(error),
      stack: error.stack || "",
      componentStack: info.componentStack || "",
      source: "ErrorBoundary",
    });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "2rem",
          textAlign: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "1.3rem",
              fontWeight: 600,
              marginBottom: "0.5rem",
            }}
          >
            xsbl<span style={{ color: "#4338f0" }}>.</span>
          </div>
          <h1
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "1.5rem",
              fontWeight: 700,
              marginBottom: "0.5rem",
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: "0.9rem",
              color: "#777",
              lineHeight: 1.6,
              marginBottom: "1.5rem",
              maxWidth: 340,
            }}
          >
            An unexpected error occurred. The issue has been reported to our
            team automatically.
          </p>
          <div
            style={{
              display: "flex",
              gap: "0.6rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={function () {
                window.location.reload();
              }}
              style={{
                padding: "0.55rem 1.3rem",
                borderRadius: 8,
                border: "none",
                background: "#4338f0",
                color: "white",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Refresh page
            </button>
            <button
              onClick={function () {
                window.location.href = "/";
              }}
              style={{
                padding: "0.55rem 1.3rem",
                borderRadius: 8,
                border: "1.5px solid #ddd",
                background: "none",
                color: "#555",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Go home
            </button>
          </div>
        </div>
      </div>
    );
  }
}
