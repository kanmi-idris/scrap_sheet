"use client";

import { Extension } from "@tiptap/core";
import type { Node } from "@tiptap/pm/model";

/**
 * NodeCommands - Direct ID-based node manipulation
 *
 * Encapsulates position calculation logic, providing clean API
 * for editing nodes by their ID instead of positions.
 */

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    nodeCommands: {
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
            const domNode = view.domAtPos(targetPos).node;
            if (domNode && domNode instanceof Element) {
              domNode.scrollIntoView({ behavior: "smooth", block: "center" });
              return true;
            }
          }

          return false;
        },
    };
  },
});

export default NodeCommands;
