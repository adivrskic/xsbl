/* ── Fuzzy fingerprinting: normalize selectors for stable dedup across scans ── */
export function normalizeSelector(selector) {
  if (!selector) return "";
  return selector
    .replace(/__[a-zA-Z0-9]{5,}/g, "__*")
    .replace(/\.sc-[a-zA-Z0-9]{6,}/g, ".sc-*")
    .replace(/\.css-[a-zA-Z0-9-]+/g, ".css-*")
    .replace(/\.emotion-[a-zA-Z0-9]+/g, ".emotion-*")
    .replace(/\.\[[^\]]+\]/g, ".[*]")
    .replace(/#([a-zA-Z_-]+?)[-_](\d+)([-_][a-zA-Z_-]+)?/g, "#$1-*$3")
    .replace(/#([a-zA-Z_-]+?)[-:][:a-zA-Z0-9]+:/g, "#$1-*")
    .replace(/#[a-f0-9]{6,}(?=[\s>+~.#\[:,]|$)/gi, "#*")
    .replace(/\[data-v-[a-zA-Z0-9]+\]/g, "[data-v-*]")
    .replace(/\[data-reactid="[^"]*"\]/g, '[data-reactid="*"]')
    .trim();
}

export function generateFingerprint(rule_id, page_url, element_selector) {
  return (
    (rule_id || "") +
    "||" +
    (page_url || "") +
    "||" +
    normalizeSelector(element_selector)
  );
}

/* ── CSV Export ── */
export function exportIssuesToCSV(issues, siteName) {
  var headers = [
    "Rule ID",
    "Impact",
    "Status",
    "Description",
    "Page URL",
    "Element Selector",
    "Element HTML",
    "WCAG Tags",
    "Fix Suggestion",
  ];
  var rows = issues.map(function (iss) {
    return [
      iss.rule_id || "",
      iss.impact || "",
      iss.status || "",
      (iss.description || "").replace(/"/g, '""'),
      iss.page_url || "",
      (iss.element_selector || "").replace(/"/g, '""'),
      (iss.element_html || "").replace(/"/g, '""').substring(0, 500),
      (iss.wcag_tags || []).join("; "),
      (iss.fix_suggestion || "").replace(/"/g, '""').substring(0, 300),
    ]
      .map(function (cell) {
        return '"' + cell + '"';
      })
      .join(",");
  });
  var csv = headers.join(",") + "\n" + rows.join("\n");
  var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = (siteName || "issues") + "-accessibility-issues.csv";
  a.click();
  URL.revokeObjectURL(url);
}
