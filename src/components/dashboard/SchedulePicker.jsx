import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabase";
import { Clock, Check, Loader2, Lock } from "lucide-react";

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

    if (!error) {
      setSaved(true);
      onUpdate?.({ ...site, scan_schedule: schedule, schedule_hour: hour });
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  return (
    <div
      style={{
        padding: "1.3rem",
        borderRadius: 10,
        border: `1px solid ${t.ink08}`,
        background: t.cardBg,
        marginBottom: "1rem",
      }}
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
        <div style={{ fontSize: "0.88rem", fontWeight: 600, color: t.ink }}>
          Scan schedule
        </div>
      </div>

      {/* Schedule options */}
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
              style={{
                padding: "0.6rem 0.8rem",
                borderRadius: 7,
                cursor: isLocked ? "not-allowed" : "pointer",
                border: `1.5px solid ${isActive ? t.accent : t.ink08}`,
                background: isActive ? t.accentBg : "transparent",
                opacity: isLocked ? 0.5 : 1,
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: isActive ? t.accent : t.ink,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                >
                  {opt.label}
                  {isLocked && <Lock size={12} color={t.ink50} />}
                </div>
                <div style={{ fontSize: "0.72rem", color: t.ink50 }}>
                  {opt.desc}
                </div>
              </div>
              {isActive && (
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: t.accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Check size={12} color="white" strokeWidth={3} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Hour picker — only show for non-manual */}
      {schedule !== "manual" && isPaid && (
        <div style={{ marginBottom: "1rem" }}>
          <label
            style={{
              display: "block",
              fontFamily: "var(--mono)",
              fontSize: "0.6rem",
              color: t.ink50,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "0.3rem",
            }}
          >
            Scan time (UTC)
          </label>
          <select
            value={hour}
            onChange={(e) => setHour(Number(e.target.value))}
            style={{
              padding: "0.45rem 0.7rem",
              borderRadius: 6,
              border: `1.5px solid ${t.ink20}`,
              background: t.cardBg,
              color: t.ink,
              fontFamily: "var(--mono)",
              fontSize: "0.78rem",
              outline: "none",
              cursor: "pointer",
            }}
          >
            {HOURS.map((h) => (
              <option key={h.value} value={h.value}>
                {h.label}
              </option>
            ))}
          </select>
          <div
            style={{ fontSize: "0.68rem", color: t.ink50, marginTop: "0.2rem" }}
          >
            {schedule === "daily" ? "Runs every day" : "Runs every 7 days"} at
            this time.
          </div>
        </div>
      )}

      {/* Upgrade nudge */}
      {!isPaid && schedule === "manual" && (
        <p
          style={{
            fontSize: "0.74rem",
            color: t.ink50,
            fontStyle: "italic",
            margin: 0,
          }}
        >
          Scheduled scans are available on Starter, Pro, and Agency plans.
        </p>
      )}

      {/* Save button */}
      {hasChanged && (
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "0.45rem 0.9rem",
            borderRadius: 6,
            border: "none",
            background: t.accent,
            color: "white",
            fontFamily: "var(--body)",
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.5 : 1,
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
          }}
        >
          {saving ? (
            <Loader2 size={13} className="xsbl-spin" />
          ) : saved ? (
            <>
              <Check size={13} /> Saved
            </>
          ) : (
            "Save schedule"
          )}
        </button>
      )}

      <style>{`@keyframes xsbl-spin { to { transform: rotate(360deg); } } .xsbl-spin { animation: xsbl-spin 0.6s linear infinite; }`}</style>
    </div>
  );
}
