import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabase";
import { logAudit } from "../../lib/audit";
import {
  FileText,
  Check,
  Loader2,
  Mail,
  Calendar,
  Send,
  X,
} from "lucide-react";
import "../../styles/dashboard.css";

/**
 * ReportSchedulePicker — per-site scheduled report emails.
 *
 * Saves `report_schedule` ("weekly" | "monthly" | null) and
 * `report_emails` (string[]) on the sites table.
 *
 * When set, the send-scheduled-reports edge function will email
 * an HTML accessibility report to the listed recipients on the
 * configured schedule. Per-site settings override org-level defaults.
 */
export default function ReportSchedulePicker({ site, plan, onUpdate }) {
  var { t } = useTheme();
  var [schedule, setSchedule] = useState(site.report_schedule || "");
  var [emails, setEmails] = useState((site.report_emails || []).join(", "));
  var [saving, setSaving] = useState(false);
  var [saved, setSaved] = useState(false);
  var [sendingTest, setSendingTest] = useState(false);
  var [testResult, setTestResult] = useState(null);

  var isAgency = plan === "agency";
  var isPro = plan === "pro" || isAgency;

  var hasChanged =
    schedule !== (site.report_schedule || "") ||
    emails !== (site.report_emails || []).join(", ");

  var parsedEmails = emails
    .split(",")
    .map(function (e) {
      return e.trim();
    })
    .filter(function (e) {
      return e.indexOf("@") !== -1;
    });

  var handleSave = async function () {
    setSaving(true);
    var { data, error } = await supabase
      .from("sites")
      .update({
        report_schedule: schedule || null,
        report_emails: parsedEmails.length > 0 ? parsedEmails : null,
      })
      .eq("id", site.id)
      .select()
      .single();

    setSaving(false);
    if (!error && data) {
      setSaved(true);
      onUpdate(data);
      logAudit({
        action: "settings.report_schedule_updated",
        resourceType: "site",
        resourceId: site.id,
        description:
          "Report schedule set to " +
          (schedule || "off") +
          " for " +
          site.domain +
          " (" +
          parsedEmails.length +
          " recipients)",
        metadata: {
          schedule: schedule || "off",
          recipients: parsedEmails.length,
          domain: site.domain,
        },
      });
      setTimeout(function () {
        setSaved(false);
      }, 2000);
    }
  };

  var handleSendTest = async function () {
    if (parsedEmails.length === 0) return;
    setSendingTest(true);
    setTestResult(null);
    try {
      var {
        data: { session },
      } = await supabase.auth.getSession();
      var res = await supabase.functions.invoke("send-scheduled-reports", {
        body: { test_site_id: site.id, test_emails: parsedEmails },
        headers: {
          Authorization: "Bearer " + (session?.access_token || ""),
        },
      });
      if (res.error) throw new Error(res.error.message);
      setTestResult({ ok: true });
    } catch (err) {
      setTestResult({ ok: false, error: err.message });
    }
    setSendingTest(false);
    setTimeout(function () {
      setTestResult(null);
    }, 5000);
  };

  var scheduleOptions = [
    { value: "", label: "Off", desc: "No scheduled reports" },
    { value: "weekly", label: "Weekly", desc: "Every Monday morning" },
    { value: "monthly", label: "Monthly", desc: "First of each month" },
  ];

  return (
    <div
      style={{
        padding: "1.3rem",
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
          marginBottom: "0.5rem",
        }}
      >
        <Mail size={16} color={t.accent} strokeWidth={1.8} />
        <div
          style={{
            fontSize: "0.88rem",
            fontWeight: 600,
            color: t.ink,
          }}
        >
          Scheduled reports
        </div>
        {!isPro && (
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.5rem",
              fontWeight: 700,
              padding: "0.1rem 0.35rem",
              borderRadius: 3,
              background: t.amber + "15",
              color: t.amber,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Pro+
          </span>
        )}
      </div>
      <p
        style={{
          fontSize: "0.76rem",
          color: t.ink50,
          marginBottom: "0.8rem",
          lineHeight: 1.6,
        }}
      >
        Email an accessibility report to stakeholders on a schedule.
        {isAgency ? " Uses your org's white-label branding if configured." : ""}
      </p>

      {!isPro ? (
        <p
          style={{
            fontSize: "0.74rem",
            color: t.ink50,
            fontStyle: "italic",
            margin: 0,
          }}
        >
          Scheduled reports are available on Pro and Agency plans.
        </p>
      ) : (
        <>
          {/* Schedule frequency */}
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
              {scheduleOptions.map(function (opt) {
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
            {schedule && (
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.62rem",
                  color: t.ink50,
                  marginTop: "0.3rem",
                }}
              >
                {scheduleOptions.find(function (o) {
                  return o.value === schedule;
                })?.desc || ""}
              </div>
            )}
          </div>

          {/* Recipient emails */}
          {schedule && (
            <>
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
                {parsedEmails.length > 0 && (
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.6rem",
                      color: t.ink50,
                      marginTop: "0.2rem",
                    }}
                  >
                    {parsedEmails.length} recipient
                    {parsedEmails.length !== 1 ? "s" : ""}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "0.4rem",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                {(hasChanged || saved) && (
                  <button
                    onClick={handleSave}
                    disabled={saving || saved || parsedEmails.length === 0}
                    style={{
                      padding: "0.45rem 0.9rem",
                      borderRadius: 6,
                      border: "none",
                      background: saved ? t.green : t.accent,
                      color: "white",
                      fontFamily: "var(--body)",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor:
                        saving || saved || parsedEmails.length === 0
                          ? "not-allowed"
                          : "pointer",
                      opacity: saving || parsedEmails.length === 0 ? 0.5 : 1,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    {saving ? (
                      <Loader2 size={13} className="xsbl-spin" />
                    ) : saved ? (
                      <Check size={13} />
                    ) : null}
                    {saving ? "Saving…" : saved ? "Saved" : "Save schedule"}
                  </button>
                )}

                {/* Send test report */}
                {parsedEmails.length > 0 && site.score != null && (
                  <button
                    onClick={handleSendTest}
                    disabled={sendingTest}
                    style={{
                      padding: "0.45rem 0.9rem",
                      borderRadius: 6,
                      border: "1.5px solid " + t.ink20,
                      background: "none",
                      color: t.ink50,
                      fontFamily: "var(--body)",
                      fontSize: "0.8rem",
                      fontWeight: 500,
                      cursor: sendingTest ? "not-allowed" : "pointer",
                      opacity: sendingTest ? 0.5 : 1,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    {sendingTest ? (
                      <Loader2 size={13} className="xsbl-spin" />
                    ) : (
                      <Send size={13} />
                    )}
                    {sendingTest ? "Sending…" : "Send test report"}
                  </button>
                )}
              </div>

              {/* Test result feedback */}
              {testResult && (
                <div
                  style={{
                    marginTop: "0.5rem",
                    padding: "0.5rem 0.7rem",
                    borderRadius: 6,
                    background: testResult.ok ? t.green + "08" : t.red + "08",
                    border:
                      "1px solid " +
                      (testResult.ok ? t.green + "20" : t.red + "20"),
                    fontSize: "0.76rem",
                    color: testResult.ok ? t.green : t.red,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  {testResult.ok ? (
                    <>
                      <Check size={13} strokeWidth={2.5} />
                      Test report sent to {parsedEmails.join(", ")}
                    </>
                  ) : (
                    <>
                      <X size={13} strokeWidth={2.5} />
                      {testResult.error || "Failed to send test report"}
                    </>
                  )}
                </div>
              )}

              {/* No-scan hint */}
              {site.score == null && (
                <p
                  style={{
                    fontSize: "0.72rem",
                    color: t.amber,
                    marginTop: "0.4rem",
                    fontStyle: "italic",
                  }}
                >
                  Run at least one scan before reports can be generated.
                </p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
