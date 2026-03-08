import { Component } from "react";

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
            An unexpected error occurred. Try refreshing the page.
          </p>
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
        </div>
      </div>
    );
  }
}
