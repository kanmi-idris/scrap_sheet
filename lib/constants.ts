export const GITHUB_URL = "https://github.com/kanmi-idris/scrap_sheet";
export const SITE_NAME = "Scrap_sheet";
export const SITE_DESCRIPTION =
  "The agentic workspace where ideas become structured thought.";
export const DOC_PREVIEW_LENGTH = 100;

export const EDITOR_DEBOUNCE_MS = 300; // Delay before saving after user stops typing
export const AUTOSAVE_INTERVAL_MS = 1000; // Interval between saves during continuous typing
export const TYPING_INACTIVITY_MS = 2000; // Time until is user considered "not typing"
export const VERSION_ROTATION_MS = 5 * 60 * 1000; // Create new version snapshot every 5 minutes

export const VISIBLE_TOOLBAR_GROUPS_COUNT = 2; // Number of toolbar groups visible in editor header before overflow

export const FONTS = [
  { name: "Arial", value: "Arial, sans-serif" },
  { name: "Arial Narrow", value: "'Arial Narrow', Arial, sans-serif" },
  { name: "Calibri", value: "Calibri, sans-serif" },
  { name: "Cambria", value: "Cambria, serif" },
  { name: "Comic Sans MS", value: "'Comic Sans MS', cursive, sans-serif" },
  { name: "Courier New", value: "'Courier New', Courier, monospace" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Lucida Console", value: "'Lucida Console', Monaco, monospace" },
  {
    name: "Lucida Sans Unicode",
    value: "'Lucida Sans Unicode', 'Lucida Grande', sans-serif",
  },
  { name: "Merriweather", value: "Merriweather, serif" },
  { name: "Mono", value: "'JetBrains Mono', monospace" },
  { name: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { name: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { name: "Excalifont", value: "Excalifont, sans-serif" },
];
