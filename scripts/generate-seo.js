/**
 * generate-seo.js
 *
 * Post-build script that generates sitemap.xml and blog/feed.xml
 * into the dist/ directory. Run after `vite build`.
 *
 * Usage: node scripts/generate-seo.js
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

var __dirname = dirname(fileURLToPath(import.meta.url));
var distDir = join(__dirname, "..", "dist");

// ── Import blog articles ──
// The source file uses `export var`, which works with dynamic import
var blogModule = await import("../src/data/blogArticles.js");
var blogArticles = blogModule.blogArticles || [];

var SITE_URL = "https://xsbl.io";
var NOW = new Date().toISOString();

// ── Static pages ──
var staticPages = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/docs", priority: "0.8", changefreq: "weekly" },
  { path: "/blog", priority: "0.8", changefreq: "daily" },
  { path: "/contact", priority: "0.5", changefreq: "monthly" },
  { path: "/agency", priority: "0.7", changefreq: "monthly" },
  { path: "/privacy", priority: "0.3", changefreq: "yearly" },
  { path: "/terms", priority: "0.3", changefreq: "yearly" },
  { path: "/security", priority: "0.4", changefreq: "yearly" },
  { path: "/login", priority: "0.4", changefreq: "monthly" },
  { path: "/signup", priority: "0.6", changefreq: "monthly" },
];

// ═══════════════════════════════════════════
// SITEMAP
// ═══════════════════════════════════════════

function generateSitemap() {
  var urls = [];

  // Static pages
  for (var i = 0; i < staticPages.length; i++) {
    var pg = staticPages[i];
    urls.push(
      "  <url>\n" +
        "    <loc>" +
        SITE_URL +
        pg.path +
        "</loc>\n" +
        "    <lastmod>" +
        NOW.split("T")[0] +
        "</lastmod>\n" +
        "    <changefreq>" +
        pg.changefreq +
        "</changefreq>\n" +
        "    <priority>" +
        pg.priority +
        "</priority>\n" +
        "  </url>"
    );
  }

  // Blog articles
  for (var j = 0; j < blogArticles.length; j++) {
    var article = blogArticles[j];
    urls.push(
      "  <url>\n" +
        "    <loc>" +
        SITE_URL +
        "/blog/" +
        article.slug +
        "</loc>\n" +
        "    <lastmod>" +
        (article.date || NOW.split("T")[0]) +
        "</lastmod>\n" +
        "    <changefreq>monthly</changefreq>\n" +
        "    <priority>0.7</priority>\n" +
        "  </url>"
    );
  }

  var xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.join("\n") +
    "\n" +
    "</urlset>\n";

  return xml;
}

// ═══════════════════════════════════════════
// RSS FEED
// ═══════════════════════════════════════════

function escapeXml(str) {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateRss() {
  // Sort articles by date descending
  var sorted = blogArticles.slice().sort(function (a, b) {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  var items = [];

  for (var i = 0; i < sorted.length; i++) {
    var article = sorted[i];
    var articleUrl = SITE_URL + "/blog/" + article.slug;

    // Build description from first 2 paragraphs
    var descParts = [];
    for (var bi = 0; bi < article.body.length && descParts.length < 2; bi++) {
      if (article.body[bi].type === "p") {
        descParts.push(article.body[bi].text);
      }
    }
    var description = descParts.join(" ").substring(0, 500);

    // RFC 822 date for RSS
    var pubDate = new Date(article.date + "T12:00:00Z").toUTCString();

    items.push(
      "    <item>\n" +
        "      <title>" +
        escapeXml(article.title) +
        "</title>\n" +
        "      <link>" +
        articleUrl +
        "</link>\n" +
        '      <guid isPermaLink="true">' +
        articleUrl +
        "</guid>\n" +
        "      <pubDate>" +
        pubDate +
        "</pubDate>\n" +
        "      <description>" +
        escapeXml(description) +
        "</description>\n" +
        "      <category>" +
        escapeXml(article.category) +
        "</category>\n" +
        "    </item>"
    );
  }

  var xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n' +
    "  <channel>\n" +
    "    <title>xsbl Blog — Web Accessibility</title>\n" +
    "    <link>" +
    SITE_URL +
    "/blog</link>\n" +
    "    <description>Articles on web accessibility, WCAG compliance, inclusive design, and building accessible products.</description>\n" +
    "    <language>en-us</language>\n" +
    "    <lastBuildDate>" +
    new Date().toUTCString() +
    "</lastBuildDate>\n" +
    '    <atom:link href="' +
    SITE_URL +
    '/blog/feed.xml" rel="self" type="application/rss+xml"/>\n' +
    "    <image>\n" +
    "      <url>" +
    SITE_URL +
    "/favicon-96x96.png</url>\n" +
    "      <title>xsbl Blog</title>\n" +
    "      <link>" +
    SITE_URL +
    "/blog</link>\n" +
    "    </image>\n" +
    items.join("\n") +
    "\n" +
    "  </channel>\n" +
    "</rss>\n";

  return xml;
}

// ═══════════════════════════════════════════
// WRITE FILES
// ═══════════════════════════════════════════

// Ensure dist/ exists
if (!existsSync(distDir)) {
  console.error("dist/ directory not found. Run `npm run build` first.");
  process.exit(1);
}

// Ensure dist/blog/ exists for feed.xml
var blogDir = join(distDir, "blog");
if (!existsSync(blogDir)) {
  mkdirSync(blogDir, { recursive: true });
}

var sitemap = generateSitemap();
writeFileSync(join(distDir, "sitemap.xml"), sitemap);
console.log(
  "[seo] Generated sitemap.xml (" +
    staticPages.length +
    " pages + " +
    blogArticles.length +
    " articles)"
);

var rss = generateRss();
writeFileSync(join(blogDir, "feed.xml"), rss);
console.log(
  "[seo] Generated blog/feed.xml (" + blogArticles.length + " articles)"
);

// Also generate robots.txt with sitemap reference
var robots =
  "User-agent: *\n" +
  "Allow: /\n" +
  "\n" +
  "Sitemap: " +
  SITE_URL +
  "/sitemap.xml\n";

writeFileSync(join(distDir, "robots.txt"), robots);
console.log("[seo] Generated robots.txt");
