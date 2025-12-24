export const GITHUB_URL = "https://github.com/kanmi-idris/scrap_sheet";
export const SITE_NAME = "Scrap_sheet";
export const SITE_DESCRIPTION =
  "The agentic workspace where ideas become structured thought.";
export const DOC_PREVIEW_LENGTH = 100;

export const EDITOR_DEBOUNCE_MS = 300; // Delay before saving after user stops typing
export const AUTOSAVE_INTERVAL_MS = 1000; // Interval between saves during continuous typing
export const TYPING_INACTIVITY_MS = 2000; // Time until is user considered "not typing"
export const VERSION_ROTATION_MS = 5 * 60 * 1000; // Create new version snapshot every 5 minutes

export const SECONDS_IN_MONTH = 30 * 24 * 60 * 60; // 30 days = 1 month
export const VERSION_VALIDITY_SECONDS = 3 * SECONDS_IN_MONTH; // 3 months (90 days) before auto-cleanup
export const MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24; // Milliseconds in one day

export const VISIBLE_TOOLBAR_GROUPS_COUNT = 2; // Number of toolbar groups visible in editor header before overflow

export const DEFAULT_FONT_FAMILY = "Arial, sans-serif";
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

export const PRESET_COLORS = [
  "#000000",
  "#444444",
  "#888888",
  "#ffffff", // Monochrome
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308", // Warm
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6", // Green/Teal
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1", // Blue/Indigo
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899", // Purple/Pink
];

export const DEFAULT_TEXT_COLOR = "#ffffff";

export const PRESET_FORMULAS = [
  { label: "E = mc²", latex: "E = mc^2" },
  { label: "Pythagorean", latex: "a^2 + b^2 = c^2" },
  { label: "Quadratic", latex: "x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}" },
  { label: "Summation", latex: "\\sum_{i=1}^{n} x_i" },
  { label: "Integral", latex: "\\int_{a}^{b} f(x) dx" },
  { label: "Limit", latex: "\\lim_{x \\to \\infty} f(x)" },
  { label: "Derivative", latex: "\\frac{dy}{dx}" },
  { label: "Partial", latex: "\\frac{\\partial f}{\\partial x}" },
  {
    label: "Matrix",
    latex: "\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}",
  },
  { label: "Square Root", latex: "\\sqrt{x}" },
  { label: "Fraction", latex: "\\frac{a}{b}" },
  { label: "Pi", latex: "\\pi" },
];

// AI Input Configuration
export const MAX_ATTACHMENTS = 5;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const SUPPORTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
];
export const SUPPORTED_FILE_TYPES = [
  ...SUPPORTED_IMAGE_TYPES,
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/json",
];

// Seed/Demo Document
export const SEED_DOCUMENT_ID = "seed-demo-document";
