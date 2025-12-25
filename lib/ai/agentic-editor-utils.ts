"use client";

import { SEED_DOCUMENT_ID } from "@/lib/constants";
import { useEditorStore } from "@/lib/store/editor-store";
import { EditorInstance } from "novel";
import { toast } from "sonner";
import { ToolType, getAllEdits, getEditsForTool } from "./mock-ai-edits";

/**
 * Apply a set of AI edits to the editor using NodeCommands.
 * This is called when an AI tool (proofread, grammar, etc.) is triggered.
 *
 * ID-based architecture:
 * 1. Each text node already has a nodeId mark from AutoNodeIdPlugin
 * 2. We use NodeCommands to add diff marks and insert replacement text
 *
 *  If a nodeId doesn't exist, addDiffMarkAndInsertAfter returns false (graceful failure).
 * Note: Currently uses mock edits that only work with the seeded demo document.
 */
export function applyAIEditsToEditor(
  editor: EditorInstance,
  toolType: ToolType
): void {
  // Guard: Prevent re-applying edits if already in agentic mode
  const { isAgenticMode, pendingEdits, versionCurrentlyInUse } =
    useEditorStore.getState();

  if (isAgenticMode && pendingEdits.length > 0) {
    console.log(
      "[AGENTIC] Already in agentic mode, ignoring duplicate trigger"
    );
    return;
  }

  // Guard: Mock edits only work with the demo document
  const currentDocumentId = versionCurrentlyInUse?.documentId;
  if (currentDocumentId !== SEED_DOCUMENT_ID) {
    toast.info("AI editing coming soon! Try the demo document for a preview.");
    return;
  }

  // Get edits for this tool type (O(1) lookup) or all edits for proofread
  const agenticEdits =
    toolType === "proofread" ? getAllEdits() : getEditsForTool(toolType);

  if (agenticEdits.length === 0) {
    console.log("[AGENTIC] No edits found for tool:", toolType);
    toast.info("No AI edits found, please try again.");
    return;
  }

  // Store edits and enter agentic mode
  // This triggers key change → editor remounts → onCreate applies diffs
  useEditorStore.getState().applyPendingEdits(agenticEdits);
}

/**
 * Get the count of available edits for a tool type (for preview in tooltip).
 */
export function getEditCountForTool(toolType: ToolType): number {
  const edits =
    toolType === "proofread" ? getAllEdits() : getEditsForTool(toolType);
  return edits.length;
}
