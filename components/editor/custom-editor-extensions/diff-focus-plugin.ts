"use client";

import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export const DiffFocusPluginKey = new PluginKey("diffFocus");

/**
 * DiffFocusPlugin - Highlights focused edit using decorations (not DOM)
 *
 * O(n) where n = nodes with diff marks, NOT O(k) DOM scan.
 * Uses Tiptap's native decoration system for performance.
 */
export const DiffFocusPlugin = new Plugin({
  key: DiffFocusPluginKey,

  state: {
    init: () => DecorationSet.empty,

    apply(tr, oldDecorations) {
      // Get focused nodeId from transaction meta
      const focusedNodeId = tr.getMeta("focusedNodeId");

      if (!focusedNodeId) {
        // Map old decorations to account for document changes
        return oldDecorations.map(tr.mapping, tr.doc);
      }

      // O(n) where n = nodes with diff marks (~30 for 15 edits)
      const decorations: Decoration[] = [];

      tr.doc.descendants((node, pos) => {
        // Only check nodes with diff marks
        const diffMark = node.marks.find((m) => m.type.name === "diffMark");
        if (!diffMark) return true;

        // Check if this is the focused node
        if (diffMark.attrs.nodeId === focusedNodeId) {
          // Include diff type in class for CSS targeting (diff-focused-add or diff-focused-delete)
          const diffType = diffMark.attrs.type || "add";
          decorations.push(
            Decoration.inline(pos, pos + node.nodeSize, {
              class: `diff-focused diff-focused-${diffType}`,
            })
          );
        }

        return true;
      });

      return DecorationSet.create(tr.doc, decorations);
    },
  },

  props: {
    decorations(state) {
      return this.getState(state);
    },
  },
});

export default DiffFocusPlugin;
