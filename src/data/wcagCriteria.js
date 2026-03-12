/**
 * wcagCriteria.js — WCAG 2.2 success criteria mapped to axe-core rules.
 * Used for programmatic SEO pages at /wcag/{slug}.
 */

export var wcagCriteria = [
  {
    id: "1.1.1",
    slug: "1-1-1-non-text-content",
    title: "Non-text Content",
    level: "A",
    version: "2.0",
    principle: "Perceivable",
    guideline: "1.1 Text Alternatives",
    description:
      "All non-text content that is presented to the user has a text alternative that serves the equivalent purpose.",
    why: "Screen readers cannot interpret images, icons, or charts without text alternatives. Users who are blind, have low vision, or have cognitive disabilities rely on alt text to understand visual content. Without it, critical information is invisible to them.",
    commonFailures: [
      "Images missing alt attributes entirely",
      "Decorative images not marked with empty alt or role='presentation'",
      "Icon buttons with no accessible label",
      "Complex charts or infographics without text summaries",
      "Image links with no discernible text",
      "SVGs without title or accessible name",
    ],
    howToFix: [
      "Add descriptive alt text to all informational images: <img src='chart.png' alt='Revenue grew 40% in Q3'>",
      "Use empty alt for decorative images: <img src='divider.svg' alt=''>",
      "Add aria-label to icon buttons: <button aria-label='Close menu'>",
      "Provide text summaries for complex visuals using figcaption or adjacent text",
      "Ensure SVGs have <title> elements or aria-label attributes",
    ],
    axeRules: [
      "image-alt",
      "input-image-alt",
      "area-alt",
      "object-alt",
      "svg-img-alt",
      "role-img-alt",
    ],
  },
  {
    id: "1.3.1",
    slug: "1-3-1-info-and-relationships",
    title: "Info and Relationships",
    level: "A",
    version: "2.0",
    principle: "Perceivable",
    guideline: "1.3 Adaptable",
    description:
      "Information, structure, and relationships conveyed through presentation can be programmatically determined or are available in text.",
    why: "When headings, lists, tables, and form labels are only visually styled but not semantically marked up, assistive technologies cannot convey the structure to users. A sighted user sees a bold heading; a screen reader user hears undifferentiated text.",
    commonFailures: [
      "Using <b> or font-size for headings instead of <h1>-<h6>",
      "Form inputs without associated <label> elements",
      "Data tables without <th> headers",
      "Lists built with <div> and dashes instead of <ul>/<ol>",
      "Required fields indicated only by color",
      "Fieldsets without legends for grouped controls",
    ],
    howToFix: [
      "Use semantic HTML: <h1>-<h6> for headings, <ul>/<ol> for lists, <table> with <th> for data",
      "Associate labels with inputs using for/id or wrapping: <label for='email'>Email</label><input id='email'>",
      "Use <fieldset> and <legend> for related form controls",
      "Mark required fields with aria-required='true' in addition to visual indicators",
    ],
    axeRules: [
      "label",
      "form-field-multiple-labels",
      "input-button-name",
      "select-name",
      "empty-heading",
      "p-as-heading",
      "definition-list",
      "dlitem",
      "list",
      "listitem",
      "td-headers-attr",
      "th-has-data-cells",
      "table-fake-caption",
    ],
  },
  {
    id: "1.4.3",
    slug: "1-4-3-contrast-minimum",
    title: "Contrast (Minimum)",
    level: "AA",
    version: "2.0",
    principle: "Perceivable",
    guideline: "1.4 Distinguishable",
    description:
      "Text and images of text have a contrast ratio of at least 4.5:1, except for large text which requires 3:1.",
    why: "Low contrast text is difficult or impossible to read for users with low vision, color blindness, or when viewing screens in bright sunlight. Approximately 1 in 12 men and 1 in 200 women have color vision deficiency.",
    commonFailures: [
      "Light gray text on white backgrounds",
      "Placeholder text with insufficient contrast",
      "Disabled button text that's nearly invisible",
      "Brand colors that don't meet contrast ratios",
      "Text overlaid on images without a background",
      "Links that are only distinguished by color with insufficient contrast against surrounding text",
    ],
    howToFix: [
      "Use a contrast checker: aim for 4.5:1 for normal text, 3:1 for large text (18px+ or 14px+ bold)",
      "Adjust your color palette — often a slightly darker shade passes while maintaining the brand feel",
      "Add semi-transparent backgrounds behind text overlaid on images",
      "Test in both light and dark mode",
      "Use CSS custom properties to maintain consistent, accessible colors across your site",
    ],
    axeRules: ["color-contrast"],
  },
  {
    id: "1.4.11",
    slug: "1-4-11-non-text-contrast",
    title: "Non-text Contrast",
    level: "AA",
    version: "2.1",
    principle: "Perceivable",
    guideline: "1.4 Distinguishable",
    description:
      "UI components and graphical objects have a contrast ratio of at least 3:1 against adjacent colors.",
    why: "Form fields, buttons, icons, and charts need sufficient contrast to be perceivable. A checkbox border that blends into the background is invisible to users with low vision.",
    commonFailures: [
      "Input borders with insufficient contrast against the background",
      "Icon-only buttons where the icon is low contrast",
      "Chart segments or graph lines that are indistinguishable",
      "Focus indicators that don't meet contrast requirements",
      "Custom checkboxes/radio buttons with faint borders",
    ],
    howToFix: [
      "Ensure all interactive element borders have at least 3:1 contrast against their background",
      "Test icons and UI graphics with a contrast checker",
      "Use distinct patterns or labels in addition to color in charts",
      "Make focus indicators clearly visible with sufficient contrast",
    ],
    axeRules: ["color-contrast-enhanced"],
  },
  {
    id: "2.1.1",
    slug: "2-1-1-keyboard",
    title: "Keyboard",
    level: "A",
    version: "2.0",
    principle: "Operable",
    guideline: "2.1 Keyboard Accessible",
    description:
      "All functionality of the content is operable through a keyboard interface without requiring specific timings for individual keystrokes.",
    why: "Users who cannot use a mouse — due to motor disabilities, blindness, or preference — rely on keyboard navigation. If interactive elements aren't keyboard accessible, these users are locked out of core functionality.",
    commonFailures: [
      "Click handlers on <div> or <span> without keyboard support",
      "Custom dropdowns that can't be navigated with arrow keys",
      "Modal dialogs that don't trap focus",
      "Drag-and-drop without keyboard alternatives",
      "Hover-only tooltips with no keyboard trigger",
      "Carousel controls that are mouse-only",
    ],
    howToFix: [
      "Use native interactive elements: <button>, <a>, <input>, <select>",
      "If custom elements are necessary, add tabindex='0', role, and keyboard event handlers",
      "Ensure all onClick handlers also work with Enter and Space keys",
      "Implement keyboard support for custom widgets following WAI-ARIA patterns",
      "Provide keyboard alternatives for drag-and-drop operations",
    ],
    axeRules: ["scrollable-region-focusable", "nested-interactive"],
  },
  {
    id: "2.4.1",
    slug: "2-4-1-bypass-blocks",
    title: "Bypass Blocks",
    level: "A",
    version: "2.0",
    principle: "Operable",
    guideline: "2.4 Navigable",
    description:
      "A mechanism is available to bypass blocks of content that are repeated on multiple Web pages.",
    why: "Keyboard and screen reader users encounter the same navigation, header, and sidebar on every page. Without a way to skip these repeated blocks, they must tab through dozens of links before reaching the main content.",
    commonFailures: [
      "No skip navigation link at the top of the page",
      "Skip link exists but is permanently hidden (display:none) so screen readers can't use it",
      "Skip link target doesn't exist or points to the wrong element",
      "No landmark roles (main, nav, aside) for screen reader navigation",
    ],
    howToFix: [
      "Add a skip link as the first focusable element: <a href='#main' class='skip-link'>Skip to content</a>",
      "Make the skip link visible on focus (CSS: .skip-link:focus { position: static; })",
      "Use HTML5 landmark elements: <main>, <nav>, <aside>, <header>, <footer>",
      "Ensure the skip link target has id='main' or matching value",
    ],
    axeRules: [
      "bypass",
      "region",
      "landmark-one-main",
      "landmark-no-duplicate-main",
    ],
  },
  {
    id: "2.4.2",
    slug: "2-4-2-page-titled",
    title: "Page Titled",
    level: "A",
    version: "2.0",
    principle: "Operable",
    guideline: "2.4 Navigable",
    description: "Web pages have titles that describe topic or purpose.",
    why: "Page titles are the first thing announced by screen readers and appear in browser tabs, bookmarks, and search results. A missing or generic title makes it impossible to identify pages when multiple tabs are open.",
    commonFailures: [
      "Empty <title> tag",
      "Same title on every page (e.g. 'My App')",
      "Title doesn't describe the page content",
      "SPA that doesn't update the title on navigation",
    ],
    howToFix: [
      "Set descriptive, unique titles: <title>Account Settings — xsbl</title>",
      "Follow the pattern: Page Name — Site Name",
      "In SPAs, update document.title on every route change",
      "Include key information first (e.g. '3 items in cart' not 'Cart page')",
    ],
    axeRules: ["document-title"],
  },
  {
    id: "2.4.4",
    slug: "2-4-4-link-purpose",
    title: "Link Purpose (In Context)",
    level: "A",
    version: "2.0",
    principle: "Operable",
    guideline: "2.4 Navigable",
    description:
      "The purpose of each link can be determined from the link text alone or from the link text together with its programmatically determined link context.",
    why: "Screen reader users often navigate by listing all links on a page. Multiple 'click here' or 'read more' links are meaningless without context. Link text should describe where the link goes.",
    commonFailures: [
      "'Click here' or 'Read more' as link text",
      "Links that say 'here' or 'this'",
      "Image links with no alt text",
      "Links with identical text going to different destinations",
    ],
    howToFix: [
      "Use descriptive link text: 'View pricing plans' instead of 'Click here'",
      "For image links, add alt text that describes the destination",
      "If short text is needed visually, use aria-label for a longer accessible name",
      "Use visually hidden text to add context: 'Read more <span class=\"sr-only\">about accessibility testing</span>'",
    ],
    axeRules: ["link-name", "link-in-text-block"],
  },
  {
    id: "2.4.7",
    slug: "2-4-7-focus-visible",
    title: "Focus Visible",
    level: "AA",
    version: "2.0",
    principle: "Operable",
    guideline: "2.4 Navigable",
    description:
      "Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible.",
    why: "Sighted keyboard users need to see where focus is. Without a visible focus indicator, they can't tell which element is active, making the interface unusable for keyboard navigation.",
    commonFailures: [
      "CSS outline:none without a replacement focus style",
      "Focus styles that are nearly invisible (thin dotted outline in low contrast)",
      "Focus styles removed on buttons or links for aesthetic reasons",
      "Custom focus styles that don't provide sufficient contrast",
    ],
    howToFix: [
      "Never remove outline without providing a visible alternative",
      "Use :focus-visible for styles that only appear during keyboard navigation",
      "Ensure focus indicators have at least 3:1 contrast and are clearly visible",
      "Example: :focus-visible { outline: 2px solid #4338f0; outline-offset: 2px; }",
    ],
    axeRules: ["focus-order-semantics"],
  },
  {
    id: "3.1.1",
    slug: "3-1-1-language-of-page",
    title: "Language of Page",
    level: "A",
    version: "2.0",
    principle: "Understandable",
    guideline: "3.1 Readable",
    description:
      "The default human language of each Web page can be programmatically determined.",
    why: "Screen readers use the language attribute to select the correct pronunciation engine. Without it, an English screen reader might try to pronounce French text with English phonetics, making it incomprehensible.",
    commonFailures: [
      "Missing lang attribute on <html> element",
      "Incorrect language code (e.g. lang='english' instead of lang='en')",
      "Language not matching the actual page content",
    ],
    howToFix: [
      "Add the lang attribute to the html element: <html lang='en'>",
      "Use valid BCP 47 language tags: en, es, fr, de, ja, zh, etc.",
      "For pages with mixed languages, set the primary language on <html> and use lang on specific elements",
    ],
    axeRules: ["html-has-lang", "html-lang-valid", "html-xml-lang-mismatch"],
  },
  {
    id: "3.3.1",
    slug: "3-3-1-error-identification",
    title: "Error Identification",
    level: "A",
    version: "2.0",
    principle: "Understandable",
    guideline: "3.3 Input Assistance",
    description:
      "If an input error is automatically detected, the item that is in error is identified and the error is described to the user in text.",
    why: "When form validation fails, users need to know which field has an error and what went wrong. Relying on color alone (a red border) is invisible to screen reader users and people with color blindness.",
    commonFailures: [
      "Error messages not associated with the input field",
      "Errors indicated only by color change",
      "Generic messages like 'There was an error' without specifics",
      "Error messages that disappear before the user can read them",
    ],
    howToFix: [
      "Use aria-describedby to associate error messages with inputs",
      "Set aria-invalid='true' on fields with errors",
      "Provide specific error text: 'Email address must include @' not just 'Invalid input'",
      "Use role='alert' or aria-live='polite' for dynamically displayed errors",
    ],
    axeRules: ["aria-input-field-name"],
  },
  {
    id: "4.1.1",
    slug: "4-1-1-parsing",
    title: "Parsing",
    level: "A",
    version: "2.0",
    principle: "Robust",
    guideline: "4.1 Compatible",
    description:
      "In content implemented using markup languages, elements have complete start and end tags, are nested according to their specifications, do not contain duplicate attributes, and IDs are unique.",
    why: "Invalid HTML can cause assistive technologies to misinterpret page structure. Duplicate IDs break label associations and ARIA relationships. Malformed markup leads to unpredictable behavior across browsers and screen readers.",
    commonFailures: [
      "Duplicate id attributes on the same page",
      "Unclosed elements or incorrect nesting",
      "Duplicate attributes on the same element",
      "ARIA attributes referencing non-existent IDs",
    ],
    howToFix: [
      "Validate HTML using the W3C validator or axe-core",
      "Ensure all id values are unique within the page",
      "Fix any unclosed tags or incorrect nesting",
      "Verify all aria-labelledby and aria-describedby references point to existing elements",
    ],
    axeRules: ["duplicate-id", "duplicate-id-active", "duplicate-id-aria"],
  },
  {
    id: "4.1.2",
    slug: "4-1-2-name-role-value",
    title: "Name, Role, Value",
    level: "A",
    version: "2.0",
    principle: "Robust",
    guideline: "4.1 Compatible",
    description:
      "For all user interface components, the name and role can be programmatically determined; states, properties, and values can be programmatically set; and notification of changes is available to user agents.",
    why: "Assistive technologies need to know what each element is (role), what it's called (name), and its current state (expanded, checked, selected). Without this, custom widgets are opaque black boxes to screen reader users.",
    commonFailures: [
      "Custom buttons implemented as <div> or <span> without role='button'",
      "ARIA attributes used incorrectly or on wrong elements",
      "Missing accessible names on interactive elements",
      "State changes not communicated (e.g. accordion expanded but no aria-expanded)",
      "Custom select/dropdown without proper ARIA roles",
    ],
    howToFix: [
      "Prefer native HTML elements that have built-in roles and states",
      "When using ARIA, follow the ARIA Authoring Practices patterns exactly",
      "Ensure every interactive element has an accessible name (aria-label, aria-labelledby, or visible label)",
      "Update aria-expanded, aria-selected, aria-checked etc. when state changes",
      "Test with a screen reader to verify announcements",
    ],
    axeRules: [
      "aria-allowed-attr",
      "aria-allowed-role",
      "aria-hidden-body",
      "aria-hidden-focus",
      "aria-required-attr",
      "aria-required-children",
      "aria-required-parent",
      "aria-roles",
      "aria-valid-attr",
      "aria-valid-attr-value",
      "button-name",
      "frame-title",
      "frame-title-unique",
    ],
  },
];

/**
 * Get a criterion by its slug.
 */
export function getCriterionBySlug(slug) {
  return wcagCriteria.find(function (c) {
    return c.slug === slug;
  });
}

/**
 * Group criteria by principle.
 */
export function getCriteriaByPrinciple() {
  var groups = {};
  for (var i = 0; i < wcagCriteria.length; i++) {
    var c = wcagCriteria[i];
    if (!groups[c.principle]) groups[c.principle] = [];
    groups[c.principle].push(c);
  }
  return groups;
}
