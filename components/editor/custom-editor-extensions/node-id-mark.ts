"use client";

import { Mark, mergeAttributes } from "@tiptap/core";

export interface NodeIdMarkOptions {
  HTMLAttributes: Record<string, unknown>;
}

/**
 * NodeIdMark - Invisible mark that assigns unique IDs to text nodes
 *
 * Used for precise edit targeting in agentic mode.
 * The mark renders as an invisible span with data-node-id attribute.
 */
export const NodeIdMark = Mark.create<NodeIdMarkOptions>({
  name: "nodeId",

  // Allow this mark to coexist with all other marks
  excludes: "",

  // Don't extend mark when typing at boundaries
  inclusive: false,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-node-id"),
        renderHTML: (attributes: { id: string | null }) => ({
          "data-node-id": attributes.id,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-node-id]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        // Invisible styling - mark doesn't affect appearance
        style: "all: unset; display: contents;",
      }),
      0,
    ];
  },
});

export default NodeIdMark;
