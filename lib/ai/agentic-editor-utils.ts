"use client";

import { AgenticEdit, useEditorStore } from "@/lib/store/editor-store";
import { EditorInstance } from "novel";
import { AIDiffEdit, getAllEdits, getEditsForTool } from "./mock-ai-edits";

/**
 * Find a node by its nodeId mark and return its position.
 * Returns -1 if not found.
 */
function findNodePositionByNodeId(
  editor: EditorInstance,
  nodeId: string
): number {
  let foundPos = -1;

  editor.state.doc.descendants((node, pos) => {
    if (foundPos !== -1) return false;

    const idMark = node.marks.find((m) => m.type.name === "nodeId");
    if (idMark?.attrs.id === nodeId) {
      foundPos = pos;
      return false;
    }
    return true;
  });

  return foundPos;
}

/**
 * Apply a set of AI edits to the editor using NodeCommands.
 * This is called when an AI tool (proofread, grammar, etc.) is triggered.
 *
 * The new ID-based architecture:
 * 1. Each text node already has a nodeId mark from AutoNodeIdPlugin
 * 2. Mock edits now reference nodeIds instead of searchText
 * 3. We use NodeCommands to add diff marks and insert replacement text
 */
export function applyAIEditsToEditor(
  editor: EditorInstance,
  toolType: AIDiffEdit["toolType"]
): void {
  // Guard: Prevent re-applying edits if already in agentic mode
  const { isAgenticMode, pendingEdits } = useEditorStore.getState();
  if (isAgenticMode && pendingEdits.length > 0) {
    console.log(
      "[AGENTIC] Already in agentic mode, ignoring duplicate trigger"
    );
    return;
  }

  // Get edits for this tool type (or all edits for proofread)
  const mockEdits =
    toolType === "proofread" ? getAllEdits() : getEditsForTool(toolType);

  if (mockEdits.length === 0) {
    console.log("[AGENTIC] No edits found for tool:", toolType);
    return;
  }

  // CRITICAL: Build the agentic edits list FIRST
  const agenticEdits: AgenticEdit[] = mockEdits
    .filter(
      (mockEdit) => findNodePositionByNodeId(editor, mockEdit.nodeId) !== -1
    )
    .map((mockEdit) => ({
      nodeId: mockEdit.nodeId,
      replaceText: mockEdit.replaceText,
      explanation: mockEdit.explanation,
    }));

  if (agenticEdits.length === 0) {
    console.log("[AGENTIC] No valid edits found (all nodeIds missing)");
    return;
  }

  // CRITICAL: Save original content BEFORE modifying the editor
  // This ensures agenticContent captures the true original state
  useEditorStore.getState().applyPendingEdits(agenticEdits);

  // NOW apply the visual diffs to the editor
  for (const mockEdit of mockEdits) {
    const nodePos = findNodePositionByNodeId(editor, mockEdit.nodeId);
    if (nodePos === -1) continue;

    // Use NodeCommands to:
    // 1. Mark the original node as "delete"
    // 2. Insert replacement text with "add" mark after the original
    editor.commands.addDiffMark(mockEdit.nodeId, "delete");
    editor.commands.insertAfterNode(mockEdit.nodeId, mockEdit.replaceText, [
      {
        type: "diffMark",
        attrs: { type: "add", nodeId: mockEdit.nodeId },
      },
    ]);
  }
}

/**
 * Get the count of available edits for a tool type (for preview in tooltip).
 */
export function getEditCountForTool(toolType: AIDiffEdit["toolType"]): number {
  const edits =
    toolType === "proofread" ? getAllEdits() : getEditsForTool(toolType);
  return edits.length;
}
