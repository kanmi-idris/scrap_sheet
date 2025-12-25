"use client";

import { Extension } from "@tiptap/core";
import type { Node } from "@tiptap/pm/model";

/**
 * NodeCommands - Direct ID-based node manipulation
 *
 * Encapsulates position calculation logic, providing clean API
 * for editing nodes by their ID instead of positions.
 *
 * Batch operations use Set<string> for O(1) lookups, reducing
 * doc traversals from O(k×n) to O(n) for k operations.
 */

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    nodeCommands: {
      // Single-node operations (O(n) each)
      updateNodeById: (nodeId: string, newText: string) => ReturnType;
      deleteNodeById: (nodeId: string) => ReturnType;
      addDiffMark: (nodeId: string, diffType: "add" | "delete") => ReturnType;
      removeDiffMarks: (nodeId: string) => ReturnType;
      removeAllDiffMarks: () => ReturnType;
      insertAfterNode: (
        nodeId: string,
        text: string,
        marks?: any[]
      ) => ReturnType;
      deleteReplacementNode: (originalNodeId: string) => ReturnType;
      scrollToNode: (nodeId: string) => ReturnType;

      // Batch operations (O(n) total for k items)
      deleteNodesByIds: (nodeIds: Set<string>) => ReturnType;
      deleteReplacementNodesByIds: (nodeIds: Set<string>) => ReturnType;
      addDiffMarkAndInsertAfter: (
        nodeId: string,
        text: string,
        diffType: "add" | "delete"
      ) => ReturnType;
    };
  }
}

export const NodeCommands = Extension.create({
  name: "nodeCommands",

  addCommands() {
    return {
      ...this.parent?.(),

      /**
       * @deprecated Not currently used. Original intent was direct text replacement,
       * but the agentic flow uses mark original as "delete" + insert replacement as "add".
       */
      updateNodeById:
        (nodeId: string, newText: string) =>
        ({ tr, state, dispatch }) => {
          let found = false;

          state.doc.descendants((node: Node, pos: number) => {
            if (found) return false;

            const idMark = node.marks.find(
              (m: any) => m.type.name === "nodeId"
            );

            if (idMark?.attrs.id === nodeId && node.isText) {
              const newNode = state.schema.text(newText, node.marks);
              tr.replaceWith(pos, pos + node.nodeSize, newNode);
              found = true;
              return false;
            }

            return true;
          });

          if (dispatch && found) dispatch(tr);
          return found;
        },

      deleteNodeById:
        (nodeId: string) =>
        ({ tr, state, dispatch }) => {
          let found = false;

          state.doc.descendants((node: Node, pos: number) => {
            if (found) return false;

            const idMark = node.marks.find(
              (m: any) => m.type.name === "nodeId"
            );

            if (idMark?.attrs.id === nodeId) {
              tr.delete(pos, pos + node.nodeSize);
              found = true;
              return false;
            }

            return true;
          });

          if (dispatch && found) dispatch(tr);
          return found;
        },

      addDiffMark:
        (nodeId: string, diffType: "add" | "delete") =>
        ({ tr, state, dispatch }) => {
          let found = false;

          state.doc.descendants((node: Node, pos: number) => {
            if (found) return false;

            const idMark = node.marks.find(
              (m: any) => m.type.name === "nodeId"
            );

            if (idMark?.attrs.id === nodeId && node.isText) {
              const diffMark = state.schema.marks.diffMark.create({
                type: diffType,
                nodeId: nodeId,
              });
              tr.addMark(pos, pos + node.nodeSize, diffMark);
              found = true;
              return false;
            }

            return true;
          });

          if (dispatch && found) dispatch(tr);
          return found;
        },

      removeDiffMarks:
        (nodeId: string) =>
        ({ tr, state, dispatch }) => {
          let found = false;

          state.doc.descendants((node: Node, pos: number) => {
            if (found) return false;

            const idMark = node.marks.find(
              (m: any) => m.type.name === "nodeId"
            );

            if (idMark?.attrs.id === nodeId) {
              const diffMarks = node.marks.filter(
                (m: any) => m.type.name === "diffMark"
              );
              diffMarks.forEach((mark: any) => {
                tr.removeMark(pos, pos + node.nodeSize, mark);
              });
              found = true;
              return false;
            }

            return true;
          });

          if (dispatch && found) dispatch(tr);
          return found;
        },

      /**
       * Remove all diff marks from the entire document.
       * Used for batch operations (accept all / reject all).
       */
      removeAllDiffMarks:
        () =>
        ({ tr, state, dispatch }) => {
          let modified = false;

          state.doc.descendants((node: Node, pos: number) => {
            const diffMarks = node.marks.filter(
              (m: any) => m.type.name === "diffMark"
            );
            diffMarks.forEach((mark: any) => {
              tr.removeMark(pos, pos + node.nodeSize, mark);
              modified = true;
            });
            return true;
          });

          if (dispatch && modified) dispatch(tr);
          return modified;
        },

      insertAfterNode:
        (
          nodeId: string,
          text: string,
          markSpecs: Array<{
            type: string;
            attrs?: Record<string, unknown>;
          }> = []
        ) =>
        ({ tr, state, dispatch }) => {
          let found = false;

          state.doc.descendants((node: Node, pos: number) => {
            if (found) return false;

            const idMark = node.marks.find(
              (m: any) => m.type.name === "nodeId"
            );

            if (idMark?.attrs.id === nodeId) {
              const insertPos = pos + node.nodeSize;

              // Convert plain mark specs to actual Mark instances
              const marks = markSpecs
                .map((spec) => {
                  const markType = state.schema.marks[spec.type];
                  if (!markType) {
                    console.warn(
                      `[NodeCommands] Mark type "${spec.type}" not found in schema`
                    );
                    return null;
                  }
                  return markType.create(spec.attrs || {});
                })
                .filter((m): m is NonNullable<typeof m> => m !== null);

              const newNode = state.schema.text(text, marks);
              tr.insert(insertPos, newNode);
              found = true;
              return false;
            }

            return true;
          });

          if (dispatch && found) dispatch(tr);
          return found;
        },

      deleteReplacementNode:
        (originalNodeId: string) =>
        ({ tr, state, dispatch }) => {
          let found = false;

          state.doc.descendants((node: Node, pos: number) => {
            if (found) return false;

            const diffMark = node.marks.find(
              (m: any) =>
                m.type.name === "diffMark" && m.attrs.nodeId === originalNodeId
            );

            if (diffMark && diffMark.attrs.type === "add") {
              tr.delete(pos, pos + node.nodeSize);
              found = true;
              return false;
            }

            return true;
          });

          if (dispatch && found) dispatch(tr);
          return found;
        },

      scrollToNode:
        (nodeId: string) =>
        ({ state, view }) => {
          let targetPos = -1;

          state.doc.descendants((node: Node, pos: number) => {
            if (targetPos !== -1) return false;

            const idMark = node.marks.find(
              (m: any) => m.type.name === "nodeId"
            );
            if (idMark?.attrs.id === nodeId) {
              targetPos = pos;
              return false;
            }

            return true;
          });

          if (targetPos !== -1 && view) {
            // Walk up the DOM tree to find the parent element
            // domAtPos may return a text node, which can't be scrolled
            let element: globalThis.Node | null = view.domAtPos(targetPos).node;
            while (element && !(element instanceof Element)) {
              element = element.parentNode;
            }
            if (element instanceof Element) {
              element.scrollIntoView({ behavior: "smooth", block: "center" });
              return true;
            }
          }

          return false;
        },

      // ============================================
      // Batch Operations - O(n) total for k items
      // ============================================

      /**
       * Delete multiple nodes by their IDs in a single traversal.
       * O(n) instead of O(k×n) for k deletions.
       */
      deleteNodesByIds:
        (nodeIds: Set<string>) =>
        ({ tr, state, dispatch }) => {
          const toDelete: Array<{ from: number; to: number }> = [];

          state.doc.descendants((node: Node, pos: number) => {
            const idMark = node.marks.find(
              (m: any) => m.type.name === "nodeId"
            );
            if (idMark && nodeIds.has(idMark.attrs.id)) {
              toDelete.push({ from: pos, to: pos + node.nodeSize });
            }
            return true;
          });

          // Delete in reverse order to preserve positions
          toDelete.sort((a, b) => b.from - a.from);
          for (const { from, to } of toDelete) {
            tr.delete(from, to);
          }

          if (dispatch && toDelete.length > 0) dispatch(tr);
          return toDelete.length > 0;
        },

      /**
       * Delete replacement nodes (type="add") for multiple original nodeIds.
       * Used for batch reject operations. O(n) instead of O(k×n).
       */
      deleteReplacementNodesByIds:
        (nodeIds: Set<string>) =>
        ({ tr, state, dispatch }) => {
          const toDelete: Array<{ from: number; to: number }> = [];

          state.doc.descendants((node: Node, pos: number) => {
            const diffMark = node.marks.find(
              (m: any) =>
                m.type.name === "diffMark" &&
                m.attrs.type === "add" &&
                nodeIds.has(m.attrs.nodeId)
            );
            if (diffMark) {
              toDelete.push({ from: pos, to: pos + node.nodeSize });
            }
            return true;
          });

          // Delete in reverse order to preserve positions
          toDelete.sort((a, b) => b.from - a.from);
          for (const { from, to } of toDelete) {
            tr.delete(from, to);
          }

          if (dispatch && toDelete.length > 0) dispatch(tr);
          return toDelete.length > 0;
        },

      /**
       * Combined operation: add diff mark to node AND insert text after it.
       * Single traversal instead of two. O(n) instead of O(2n).
       */
      addDiffMarkAndInsertAfter:
        (nodeId: string, text: string, diffType: "add" | "delete") =>
        ({ tr, state, dispatch }) => {
          let found = false;

          state.doc.descendants((node: Node, pos: number) => {
            if (found) return false;

            const idMark = node.marks.find(
              (m: any) => m.type.name === "nodeId"
            );

            if (idMark?.attrs.id === nodeId && node.isText) {
              // Add diff mark to original node
              const deleteMark = state.schema.marks.diffMark.create({
                type: "delete",
                nodeId: nodeId,
              });
              tr.addMark(pos, pos + node.nodeSize, deleteMark);

              // Insert replacement text after with "add" mark
              const addMark = state.schema.marks.diffMark.create({
                type: diffType,
                nodeId: nodeId,
              });
              const newNode = state.schema.text(text, [addMark]);
              tr.insert(pos + node.nodeSize, newNode);

              found = true;
              return false;
            }

            return true;
          });

          if (dispatch && found) dispatch(tr);
          return found;
        },
    };
  },
});

export default NodeCommands;
