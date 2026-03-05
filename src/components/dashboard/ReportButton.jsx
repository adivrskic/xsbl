import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabase";
import { FileText, Loader2, Download } from "lucide-react";

export default function ReportButton({ site, scan }) {
  const { t } = useTheme();
  const [loading, setLoading] = useState(false);

  var handleGenerate = async function () {
    setLoading(true);
    try {
      var {
        data: { session },
      } = await supabase.auth.getSession();
      var { data, error } = await supabase.functions.invoke("generate-report", {
        body: {
          site_id: site.id,
          scan_id: scan ? scan.id : undefined,
          format: "html",
        },
        headers: { Authorization: "Bearer " + (session?.access_token || "") },
      });

      if (error) throw new Error(error.message);

      // data is the HTML string — open in new window for print/PDF
      var blob = new Blob([data], { type: "text/html" });
      var url = URL.createObjectURL(blob);
      var win = window.open(url, "_blank");

      // Auto-trigger print dialog for PDF save
      if (win) {
        win.onload = function () {
          setTimeout(function () {
            win.print();
          }, 500);
        };
      }
    } catch (err) {
      console.error("Report generation failed:", err);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleGenerate}
      disabled={loading}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.5rem 1rem",
        borderRadius: 7,
        border: "1.5px solid " + t.ink20,
        background: "none",
        color: t.ink,
        fontFamily: "var(--body)",
        fontSize: "0.82rem",
        fontWeight: 500,
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.6 : 1,
        transition: "all 0.2s",
      }}
      onMouseEnter={function (e) {
        e.currentTarget.style.borderColor = t.accent;
        e.currentTarget.style.color = t.accent;
      }}
      onMouseLeave={function (e) {
        e.currentTarget.style.borderColor = t.ink20;
        e.currentTarget.style.color = t.ink;
      }}
    >
      {loading ? (
        <Loader2 size={14} className="xsbl-spin" />
      ) : (
        <FileText size={14} />
      )}
      {loading ? "Generating..." : "Download report"}
      <style>{`.xsbl-spin { animation: xsbl-spin 0.6s linear infinite; } @keyframes xsbl-spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}
