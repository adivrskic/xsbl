/**
 * timeAgo — human-friendly relative timestamps.
 *
 * Returns: "Just now", "3m ago", "2h ago", "Yesterday", "3d ago",
 * then falls back to "Mar 5" (same year) or "Mar 5, 2025" (different year).
 *
 * Pass `full: true` for a tooltip-friendly absolute date string.
 */

export function timeAgo(dateStr) {
  if (!dateStr) return "Never";
  var d = new Date(dateStr);
  var now = new Date();
  var diff = now.getTime() - d.getTime();

  if (diff < 0) return "Just now";
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return Math.floor(diff / 60000) + "m ago";
  if (diff < 86400000) return Math.floor(diff / 3600000) + "h ago";

  var days = Math.floor(diff / 86400000);
  if (days === 1) return "Yesterday";
  if (days < 7) return days + "d ago";

  var sameYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  });
}

/**
 * Full absolute date — for tooltips and secondary displays.
 * Returns: "Mar 5, 2026 at 2:30 PM"
 */
export function fullDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
