import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabase";
import { Settings, Save, Loader2, X, Plus } from "lucide-react";
import "../../styles/dashboard.css";

var COMMON_RULES = [
  { id: "color-contrast", desc: "Color contrast minimum" },
  { id: "image-alt", desc: "Images must have alt text" },
  { id: "link-name", desc: "Links must have discernible text" },
  { id: "button-name", desc: "Buttons must have discernible text" },
  { id: "label", desc: "Form elements must have labels" },
  { id: "heading-order", desc: "Heading levels should increase by one" },
  { id: "region", desc: "All content must be in landmarks" },
  { id: "landmark-one-main", desc: "Page must have one main landmark" },
  { id: "html-has-lang", desc: "html element must have lang attribute" },
  { id: "meta-viewport", desc: "Zoom and scaling must not be disabled" },
];

export default function ScanProfileEditor({ site, onUpdate }) {
  var { t } = useTheme();
  var profile = site.scan_profile || {};
  var [excludeRules, setExcludeRules] = useState(profile.exclude_rules || []);
  var [excludeSelectors, setExcludeSelectors] = useState(
    (profile.exclude_selectors || []).join("\n")
  );
  var [includeBestPractice, setIncludeBestPractice] = useState(
    profile.include_best_practice !== false
  );
  var [saving, setSaving] = useState(false);
  var [saved, setSaved] = useState(false);
  var [newRule, setNewRule] = useState("");

  var handleToggleRule = function (ruleId) {
    if (excludeRules.indexOf(ruleId) !== -1) {
      setExcludeRules(
        excludeRules.filter(function (r) {
          return r !== ruleId;
        })
      );
    } else {
      setExcludeRules(excludeRules.concat([ruleId]));
    }
  };

  var handleAddCustomRule = function () {
    var r = newRule.trim();
    if (r && excludeRules.indexOf(r) === -1) {
      setExcludeRules(excludeRules.concat([r]));
      setNewRule("");
    }
  };

  var handleSave = async function () {
    setSaving(true);
    var selectors = excludeSelectors
      .split("\n")
      .map(function (s) {
        return s.trim();
      })
      .filter(function (s) {
        return s.length > 0;
      });

    var profileData = {
      exclude_rules: excludeRules,
      exclude_selectors: selectors,
      include_best_practice: includeBestPractice,
    };

    var { error } = await supabase
      .from("sites")
      .update({ scan_profile: profileData })
      .eq("id", site.id);

    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(function () {
        setSaved(false);
      }, 2000);
      if (onUpdate) onUpdate({ ...site, scan_profile: profileData });
    }
  };

  return (
    <div
      style={{
        padding: "1.2rem",
        borderRadius: 10,
        border: "1px solid " + t.ink08,
        background: t.cardBg,
        marginBottom: "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          marginBottom: "0.6rem",
        }}
      >
        <Settings size={15} color={t.accent} strokeWidth={2} />
        <h4
          style={{
            fontSize: "0.88rem",
            fontWeight: 600,
            color: t.ink,
            margin: 0,
          }}
        >
          Custom scan profile
        </h4>
      </div>

      <p
        style={{
          fontSize: "0.72rem",
          color: t.ink50,
          lineHeight: 1.6,
          marginBottom: "1rem",
        }}
      >
        Customize which rules and elements are scanned. Excluded rules won't
        generate issues and excluded selectors won't be tested.
      </p>

      {/* Excluded rules */}
      <div style={{ marginBottom: "1rem" }}>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.58rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: t.ink50,
            marginBottom: "0.4rem",
          }}
        >
          Excluded rules
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.2rem",
            marginBottom: "0.5rem",
          }}
        >
          {COMMON_RULES.map(function (rule) {
            var isExcluded = excludeRules.indexOf(rule.id) !== -1;
            return (
              <label
                key={rule.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.35rem 0.5rem",
                  borderRadius: 5,
                  cursor: "pointer",
                  background: isExcluded ? t.red + "08" : "transparent",
                  transition: "background 0.15s",
                }}
              >
                <input
                  type="checkbox"
                  checked={isExcluded}
                  onChange={function () {
                    handleToggleRule(rule.id);
                  }}
                  style={{ accentColor: t.red }}
                />
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.68rem",
                    color: isExcluded ? t.red : t.accent,
                    fontWeight: 600,
                    minWidth: 120,
                  }}
                >
                  {rule.id}
                </span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: isExcluded ? t.red + "80" : t.ink50,
                    textDecoration: isExcluded ? "line-through" : "none",
                  }}
                >
                  {rule.desc}
                </span>
              </label>
            );
          })}
        </div>

        {/* Custom excluded rules not in the common list */}
        {excludeRules
          .filter(function (r) {
            return !COMMON_RULES.some(function (cr) {
              return cr.id === r;
            });
          })
          .map(function (r) {
            return (
              <div
                key={r}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.25rem 0.5rem",
                  marginBottom: "0.15rem",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.68rem",
                    color: t.red,
                    fontWeight: 600,
                  }}
                >
                  {r}
                </span>
                <button
                  onClick={function () {
                    handleToggleRule(r);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: t.ink50,
                    padding: "0.1rem",
                    display: "flex",
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}

        {/* Add custom rule */}
        <div style={{ display: "flex", gap: "0.3rem", marginTop: "0.3rem" }}>
          <input
            value={newRule}
            onChange={function (e) {
              setNewRule(e.target.value);
            }}
            onKeyDown={function (e) {
              if (e.key === "Enter") handleAddCustomRule();
            }}
            placeholder="custom-rule-id"
            style={{
              flex: 1,
              padding: "0.3rem 0.6rem",
              borderRadius: 5,
              border: "1.5px solid " + t.ink08,
              background: t.paper,
              color: t.ink,
              fontFamily: "var(--mono)",
              fontSize: "0.65rem",
              outline: "none",
            }}
          />
          <button
            onClick={handleAddCustomRule}
            disabled={!newRule.trim()}
            style={{
              padding: "0.3rem 0.5rem",
              borderRadius: 5,
              border: "1.5px solid " + t.ink08,
              background: "none",
              color: t.ink50,
              cursor: newRule.trim() ? "pointer" : "default",
              opacity: newRule.trim() ? 1 : 0.4,
              display: "flex",
              alignItems: "center",
              gap: "0.2rem",
              fontFamily: "var(--mono)",
              fontSize: "0.6rem",
            }}
          >
            <Plus size={12} /> Add
          </button>
        </div>
      </div>

      {/* Excluded selectors */}
      <div style={{ marginBottom: "1rem" }}>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.58rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: t.ink50,
            marginBottom: "0.3rem",
          }}
        >
          Excluded selectors (one per line)
        </div>
        <textarea
          value={excludeSelectors}
          onChange={function (e) {
            setExcludeSelectors(e.target.value);
          }}
          placeholder={".ad-banner\n.cookie-consent\n#third-party-widget"}
          rows={3}
          style={{
            width: "100%",
            padding: "0.5rem 0.6rem",
            borderRadius: 6,
            border: "1.5px solid " + t.ink08,
            background: t.paper,
            color: t.ink,
            fontFamily: "var(--mono)",
            fontSize: "0.65rem",
            outline: "none",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />
        <div
          style={{
            fontSize: "0.6rem",
            color: t.ink50,
            marginTop: "0.2rem",
            lineHeight: 1.5,
          }}
        >
          Elements matching these CSS selectors will be excluded from scans.
        </div>
      </div>

      {/* Best practice toggle */}
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1rem",
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={includeBestPractice}
          onChange={function () {
            setIncludeBestPractice(!includeBestPractice);
          }}
          style={{ accentColor: t.accent }}
        />
        <span style={{ fontSize: "0.78rem", color: t.ink }}>
          Include best-practice rules
        </span>
        <span style={{ fontSize: "0.65rem", color: t.ink50 }}>
          (non-WCAG recommendations)
        </span>
      </label>

      {/* Save */}
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
          gap: "0.3rem",
        }}
      >
        {saving ? (
          <Loader2 size={13} className="xsbl-spin" />
        ) : saved ? (
          <Save size={13} />
        ) : (
          <Save size={13} />
        )}
        {saved ? "Saved" : "Save profile"}
      </button>
    </div>
  );
}
