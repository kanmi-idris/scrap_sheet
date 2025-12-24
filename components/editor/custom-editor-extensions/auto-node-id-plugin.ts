"use client";

import { generateNodeId } from "@/lib/utils/id-generator";
import { Plugin, PluginKey } from "@tiptap/pm/state";

export const AutoNodeIdPluginKey = new PluginKey("autoNodeId");

/**
 * AutoNodeIdPlugin - Automatically assigns unique IDs to new text nodes
 *`
 * runs after every transaction that changes the document:
 * User types a character → plugin runs
 * User pastes content → plugin runs
 * AI inserts replacement text → plugin runs
 *
 * Adds nodeId mark to text nodes without IDs.
 * This ensures all text content is trackable for AI editing.
 */
export const AutoNodeIdPlugin = new Plugin({
  key: AutoNodeIdPluginKey,

  appendTransaction(transactions, oldState, newState) {
    // Skip if no doc changes
    const docChanged = transactions.some((tr) => tr.docChanged);
    if (!docChanged) return null;

    // Guard: Check if nodeId mark type is available in schema
    const nodeIdMarkType = newState.schema.marks.nodeId;
    if (!nodeIdMarkType) {
      // Mark not registered yet, skip
      return null;
    }

    const tr = newState.tr;
    let modified = false;

    // Walk the document and assign IDs to unmarked text
    newState.doc.descendants((node, pos) => {
      if (node.isText) {
        // Check if node already has nodeId mark
        const hasNodeId = node.marks.some(
          (mark) => mark.type.name === "nodeId"
        );

        if (!hasNodeId) {
          try {
            // Assign new ID
            const nodeIdMark = nodeIdMarkType.create({
              id: generateNodeId(),
            });

            tr.addMark(pos, pos + node.nodeSize, nodeIdMark);
            modified = true;
          } catch (error) {
            // Silently skip if mark creation fails
            console.warn("[AutoNodeIdPlugin] Mark creation failed:", error);
          }
        }
      }

      return true; // Continue traversal
    });

    return modified ? tr : null;
  },
});

export default AutoNodeIdPlugin;
