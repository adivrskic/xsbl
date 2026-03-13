import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabase";
import { logAudit } from "../../lib/audit";
import { Clock, Check, Loader2, Lock, Globe } from "lucide-react";
import "../../styles/dashboard.css";
import "../../styles/dashboard-modals.css";

const SCHEDULES = [
  {
    value: "manual",
    label: "Manual only",
    desc: "Scan when you click the button",
  },
  {
    value: "daily",
    label: "Daily",
    desc: "Scans once per day at the configured hour",
  },
  {
    value: "weekly",
    label: "Weekly",
    desc: "Scans once per week at the configured hour",
  },
];

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: `${i.toString().padStart(2, "0")}:00 UTC`,
}));

function utcToTz(utcHour, tzName) {
  try {
    var d = new Date();
    d.setUTCHours(utcHour, 0, 0, 0);
    return d.toLocaleTimeString("en-US", {
      timeZone: tzName,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch (e) {
    return null;
  }
}

function getLocalTzAbbr() {
  try {
    var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    var abbr = new Date()
      .toLocaleTimeString("en-US", { timeZone: tz, timeZoneName: "short" })
      .split(" ")
      .pop();
    return { tz: tz, abbr: abbr };
  } catch (e) {
    return null;
  }
}

var REFERENCE_ZONES = [
  { tz: "America/New_York", abbr: "ET" },
  { tz: "America/Chicago", abbr: "CT" },
  { tz: "America/Denver", abbr: "MT" },
  { tz: "America/Los_Angeles", abbr: "PT" },
  { tz: "Europe/London", abbr: "GMT" },
  { tz: "Europe/Berlin", abbr: "CET" },
  { tz: "Asia/Tokyo", abbr: "JST" },
];

export default function SchedulePicker({ site, plan, onUpdate }) {
  const { t } = useTheme();
  const [schedule, setSchedule] = useState(site.scan_schedule || "manual");
  const [hour, setHour] = useState(site.schedule_hour ?? 6);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isPaid = ["starter", "pro", "agency"].includes(plan);
  const hasChanged =
    schedule !== (site.scan_schedule || "manual") ||
    hour !== (site.schedule_hour ?? 6);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("sites")
      .update({ scan_schedule: schedule, schedule_hour: hour })
      .eq("id", site.id);
    setSaving(false);
    if (!error) {
      setSaved(true);
      logAudit({
        action: "settings.schedule_updated",
        resourceType: "site",
        resourceId: site.id,
        description:
          "Scan schedule set to " +
          schedule +
          " at " +
          hour +
          ":00 UTC for " +
          site.domain,
        metadata: { schedule: schedule, hour: hour, domain: site.domain },
      });
      setTimeout(() => {
        onUpdate?.({ ...site, scan_schedule: schedule, schedule_hour: hour });
        setSaved(false);
      }, 2000);
    }
  };

  return (
    <div
      className="dash-card"
      style={{ marginBottom: "1rem", padding: "1.3rem" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "0.8rem",
        }}
      >
        <Clock size={16} color={t.accent} strokeWidth={1.8} />
        <div
          style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--ink)" }}
        >
          Scan schedule
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.35rem",
          marginBottom: "1rem",
        }}
      >
        {SCHEDULES.map((opt) => {
          const isActive = schedule === opt.value;
          const isLocked = opt.value !== "manual" && !isPaid;
          return (
            <div
              key={opt.value}
              onClick={() => !isLocked && setSchedule(opt.value)}
              className={
                "dash-schedule-opt" +
                (isActive ? " dash-schedule-opt--active" : "") +
                (isLocked ? " dash-schedule-opt--locked" : "")
              }
            >
              <div>
                <div className="dash-schedule-opt__label">
                  {opt.label}
                  {isLocked && <Lock size={12} color="var(--ink50)" />}
                </div>
                <div className="dash-schedule-opt__desc">{opt.desc}</div>
              </div>
              {isActive && (
                <div className="dash-option__check">
                  <Check size={12} color="white" strokeWidth={3} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {schedule !== "manual" && isPaid && (
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="scan-hour" className="dash-config-label">
            Scan time (UTC)
          </label>
          <select
            id="scan-hour"
            value={hour}
            onChange={(e) => setHour(Number(e.target.value))}
            className="dash-config-select"
          >
            {HOURS.map((h) => (
              <option key={h.value} value={h.value}>
                {h.label}
              </option>
            ))}
          </select>

          {(() => {
            var local = getLocalTzAbbr();
            var localTime = local ? utcToTz(hour, local.tz) : null;
            var refs = REFERENCE_ZONES.filter(function (z) {
              return !local || z.tz !== local.tz;
            }).slice(0, 4);
            return (
              <div style={{ marginTop: "0.4rem" }}>
                {localTime && (
                  <div
                    style={{
                      fontSize: "0.76rem",
                      color: "var(--ink)",
                      fontWeight: 500,
                      marginBottom: "0.25rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                    }}
                  >
                    <Globe size={12} color={t.accent} />
                    {localTime} {local.abbr}
                    <span style={{ color: "var(--ink50)", fontWeight: 400 }}>
                      (your time)
                    </span>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    gap: "0.6rem",
                    flexWrap: "wrap",
                    fontSize: "0.65rem",
                    fontFamily: "var(--mono)",
                    color: "var(--ink50)",
                  }}
                >
                  {refs.map(function (z) {
                    var converted = utcToTz(hour, z.tz);
                    if (!converted) return null;
                    return (
                      <span key={z.tz}>
                        {converted}{" "}
                        <span style={{ opacity: 0.6 }}>{z.abbr}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          <div className="dash-config-hint" style={{ marginTop: "0.35rem" }}>
            {schedule === "daily" ? "Runs every day" : "Runs every 7 days"} at
            this time.
          </div>
        </div>
      )}

      {!isPaid && schedule === "manual" && (
        <p
          style={{
            fontSize: "0.74rem",
            color: "var(--ink50)",
            fontStyle: "italic",
            margin: 0,
          }}
        >
          Scheduled scans are available on Starter, Pro, and Agency plans.
        </p>
      )}

      {(hasChanged || saved) && (
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className={
            "dash-btn-sm " +
            (saved ? "dash-btn-sm--green" : "dash-btn-sm--accent")
          }
          style={{ transition: "background 0.2s" }}
        >
          {saving ? (
            <Loader2 size={13} className="xsbl-spin" />
          ) : saved ? (
            <>
              <Check size={13} /> Schedule saved
            </>
          ) : (
            "Save schedule"
          )}
        </button>
      )}

      {/* Monitoring mode indicator */}
      {isPaid && schedule !== "manual" && (
        <MonitoringModePanel site={site} onUpdate={onUpdate} />
      )}
    </div>
  );
}

function MonitoringModePanel({ site, onUpdate }) {
  var { t } = useTheme();
  var isMonitoring = !!site.monitoring_mode;
  var consecutiveHigh = site.consecutive_high_scores || 0;
  var score = site.score || 0;
  var [toggling, setToggling] = useState(false);

  var handleToggle = async function () {
    setToggling(true);
    var newVal = !isMonitoring;
    var { error } = await supabase
      .from("sites")
      .update({
        monitoring_mode: newVal,
        consecutive_high_scores: newVal ? 4 : 0,
      })
      .eq("id", site.id);
    if (!error) {
      onUpdate?.({
        ...site,
        monitoring_mode: newVal,
        consecutive_high_scores: newVal ? 4 : 0,
      });
      logAudit({
        action: "settings.monitoring_mode",
        resourceType: "site",
        resourceId: site.id,
        description:
          "Monitoring mode " +
          (newVal ? "enabled" : "disabled") +
          " for " +
          site.domain,
        metadata: { monitoring_mode: newVal, domain: site.domain },
      });
    }
    setToggling(false);
  };

  return (
    <div
      style={{
        marginTop: "1rem",
        padding: "0.9rem",
        borderRadius: 8,
        border: "1px solid " + (isMonitoring ? t.green + "30" : t.ink08),
        background: isMonitoring ? t.greenBg || t.green + "06" : t.ink04 + "60",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.5rem",
          marginBottom: "0.3rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ fontSize: "0.9rem" }}>
            {isMonitoring ? "🛡" : "⚡"}
          </span>
          <span
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: isMonitoring ? t.green : t.ink,
            }}
          >
            {isMonitoring ? "Monitoring mode" : "Full scan mode"}
          </span>
        </div>
        <button
          onClick={handleToggle}
          disabled={toggling}
          style={{
            padding: "0.25rem 0.55rem",
            borderRadius: 5,
            border: "1.5px solid " + (isMonitoring ? t.ink20 : t.green + "40"),
            background: "none",
            color: isMonitoring ? t.ink50 : t.green,
            fontFamily: "var(--mono)",
            fontSize: "0.6rem",
            fontWeight: 600,
            cursor: toggling ? "not-allowed" : "pointer",
            opacity: toggling ? 0.5 : 1,
          }}
        >
          {toggling
            ? "..."
            : isMonitoring
            ? "Switch to full"
            : "Enable monitoring"}
        </button>
      </div>
      <p
        style={{
          fontSize: "0.68rem",
          color: t.ink50,
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        {isMonitoring
          ? "Lightweight regression checks only — unchanged pages are skipped, using ~90% fewer Browserless minutes. Automatically switches back to full scans if score drops or new issues appear."
          : score >= 95
          ? "Score is " +
            Math.round(score) +
            " — monitoring mode activates automatically after 4 consecutive high-score scans (" +
            consecutiveHigh +
            "/4 so far)."
          : "Monitoring mode activates when your score stays above 95 for 4 consecutive scans. Current score: " +
            Math.round(score) +
            "."}
      </p>
    </div>
  );
}
