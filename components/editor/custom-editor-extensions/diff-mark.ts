"use client";

/**
 * DiffMark Extension - Highlights AI-suggested changes in the editor.
 *
 * This mark is used to visually indicate:
 * - `type="add"` → New text suggested by AI (green highlight)
 * - `type="delete"` → Original text to be removed (red strikethrough)
 *
 * The mark is transient and should be stripped before saving to the database.
 *
 * Usage:
 * - editor.commands.setMark('diffMark', { type: 'add', nodeId: 'node-123' })
 * - editor.commands.unsetMark('diffMark')
 */

import { Mark, mergeAttributes } from "@tiptap/core";

export interface DiffMarkOptions {
  HTMLAttributes: Record<string, unknown>;
}

export const DiffMark = Mark.create<DiffMarkOptions>({
  name: "diffMark",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      type: {
        default: "add",
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-diff-type") || "add",
        renderHTML: (attributes: { type: string }) => ({
          "data-diff-type": attributes.type,
        }),
      },
      nodeId: {
        default: null,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-node-id"),
        renderHTML: (attributes: { nodeId: string | null }) => ({
          "data-node-id": attributes.nodeId,
        }),
      },
      focused: {
        default: false,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-diff-focused") === "true",
        renderHTML: (attributes: { focused: boolean }) => ({
          "data-diff-focused": attributes.focused ? "true" : null,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-diff-mark]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-diff-mark": "true",
      }),
      0,
    ];
  },
});

export default DiffMark;
