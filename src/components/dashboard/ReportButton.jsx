import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { FileText, Loader2, Download } from "lucide-react";
import "../../styles/dashboard.css";

export default function ReportButton({ site, scan, className, style }) {
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

      var blob = new Blob([data], { type: "text/html" });
      var url = URL.createObjectURL(blob);
      var win = window.open(url, "_blank");

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
      className={className || "dash-action-btn"}
      style={style || {}}
    >
      {loading ? (
        <Loader2 size={className ? 13 : 14} className="xsbl-spin" />
      ) : (
        <FileText size={className ? 13 : 14} strokeWidth={1.8} />
      )}
      {loading ? "Generating…" : className ? "Report" : "Download report"}
    </button>
  );
}
