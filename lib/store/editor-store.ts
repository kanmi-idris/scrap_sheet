/**
 * Editor Store - @see {@link file://lib/docs/editor-store.md}
 */

import { triplit } from "@/triplit/client";
import { Version } from "@/triplit/schema";
import { EditorInstance, JSONContent } from "novel";
import { toast } from "sonner";
import { create } from "zustand";
import {
  AUTOSAVE_INTERVAL_MS,
  DEFAULT_FONT_FAMILY,
  DOC_PREVIEW_LENGTH,
  TYPING_INACTIVITY_MS,
  VERSION_ROTATION_MS,
  VERSION_VALIDITY_SECONDS,
} from "../constants";
import { calculateWordCount, extractTextFromContent } from "../utils";

let autosaveTimeout: ReturnType<typeof setTimeout> | null = null;
let typingInactivityTimeout: ReturnType<typeof setTimeout> | null = null;
let versionRotationTimeout: ReturnType<typeof setTimeout> | null = null;
let isResetting = false; // Flag to prevent state updates during/after reset

/**
 * Simplified agentic edit - uses node IDs instead of positions.
 * The client finds nodes by their nodeId mark, eliminating position drift.
 */
export interface AgenticEdit {
  nodeId: string;
  replaceText: string;
  explanation: string;
}

interface EditorState {
  title: string;
  content: JSONContent | null;
  versionCurrentlyInUse: Version | null;
  versionBeingPreviewed: Version | null; // For history preview (read-only)

  // Save state
  isSaved: boolean;
  isUpdatingDataStore: boolean;
  isResetting: boolean;
  isHydrated: boolean;
  lastSavedAt: number | null;
  isUserCurrentlyTyping: boolean;
  lastVersionRotationAt: number | null;

  // UI state
  fontFamily: string;
  wordCount: number;
  isHistoryOpen: boolean;
  editorInstance: EditorInstance | null;

  // Agentic AI state
  pendingEdits: AgenticEdit[];
  currentEditIndex: number;
  isAgenticMode: boolean;
  focusedNodeId: string | null;
  agenticContent: JSONContent | null; // Working copy with AI suggestions
  initialEditCount: number; // Total edits from AI (for partial accept UI)

  // Setters
  setTitle: (title: string) => void;
  setContent: (content: JSONContent | null) => void;
  setFontFamily: (fontFamily: string) => void;
  setWordCount: (wordCount: number) => void;
  setIsHistoryOpen: (isOpen: boolean) => void;
  setVersionBeingPreviewed: (version: Version | null) => void;
  setEditorInstance: (editor: EditorInstance | null) => void;

  // Autosave orchestration
  initiateAutosave: (documentId: string) => void;
  updateDocumentAndActiveVersion: (documentId: string) => Promise<void>;
  autoCreateVersion: (documentId: string) => void; // Schedules version rotation
  createNewWorkingVersion: (documentId: string) => Promise<void>;
  restoreVersion: (documentId: string, version: Version) => Promise<void>;
  markUserTyping: () => void;

  // Document loading
  hydrateFromVersion: (version: Version) => void;
  cleanupOldVersions: (
    documentId: string,
    allVersions: Version[]
  ) => Promise<void>;

  // Reset
  reset: () => void;

  // Agentic AI actions
  applyPendingEdits: (edits: AgenticEdit[]) => void;
  applyDiffsToNewEditor: () => void; // Called from editor onCreate after remount
  acceptEdit: (nodeId: string) => void;
  rejectEdit: (nodeId: string) => void;
  acceptAllEdits: () => void;
  rejectAllEdits: () => void;
  navigateEdit: (direction: "prev" | "next") => void;
  exitAgenticMode: () => void;
  continueWithPartialEdits: () => void; // Accept edits so far, exit agentic mode
}

const initialState = {
  title: "",
  content: { type: "doc", content: [] } as JSONContent,
  isSaved: false,
  isUpdatingDataStore: false,
  isResetting: false,
  isHydrated: false,
  lastSavedAt: null as number | null,
  fontFamily: DEFAULT_FONT_FAMILY,
  wordCount: 0,
  isHistoryOpen: false,
  versionCurrentlyInUse: null as Version | null,
  versionBeingPreviewed: null as Version | null,
  isUserCurrentlyTyping: false,
  lastVersionRotationAt: null as number | null,
  editorInstance: null as EditorInstance | null,
  // Agentic AI initial state
  pendingEdits: [] as AgenticEdit[],
  currentEditIndex: 0,
  isAgenticMode: false,
  focusedNodeId: null as string | null,
  agenticContent: null as JSONContent | null,
  initialEditCount: 0,
};

export const useEditorStore = create<EditorState>()((set, get) => ({
  ...initialState,

  setTitle: (title) => set({ title }),
  setContent: (content) => set({ content }),
  setFontFamily: (fontFamily) => set({ fontFamily }),
  setWordCount: (wordCount) => set({ wordCount }),
  setIsHistoryOpen: (isOpen) => set({ isHistoryOpen: isOpen }),
  setVersionBeingPreviewed: (version) =>
    set({ versionBeingPreviewed: version }),
  setEditorInstance: (editor) => set({ editorInstance: editor }),

  hydrateFromVersion: (version: Version) => {
    try {
      const parsedContent =
        typeof version.content === "string"
          ? JSON.parse(version.content)
          : version.content;

      set({
        title: version.title || "Untitled Document",
        content: parsedContent,
        fontFamily: version.fontFamily || DEFAULT_FONT_FAMILY,
        wordCount: calculateWordCount(parsedContent),
        versionCurrentlyInUse: version,
        lastVersionRotationAt: null, // Don't set from old timestamp - let rotation cycle start fresh
        isSaved: true,
        isHydrated: true,
      });
    } catch (e) {
      console.error("[HYDRATE] Failed to parse version content", e);
      set({
        title: version.title || "Untitled Document",
        content: { type: "doc", content: [] },
        fontFamily: version.fontFamily || DEFAULT_FONT_FAMILY,
        wordCount: 0,
        versionCurrentlyInUse: version,
        isHydrated: true,
      });
    }
  },

  markUserTyping: () => {
    const { versionBeingPreviewed } = get();

    // If user starts typing while previewing a version, clear the preview
    // to avoid confusion between preview content and live editing
    if (versionBeingPreviewed) {
      set({ versionBeingPreviewed: null });
    }

    set({ isUserCurrentlyTyping: true });

    // Clear existing inactivity timeout
    if (typingInactivityTimeout) {
      clearTimeout(typingInactivityTimeout);
    }

    // Set new timeout to mark user as stopped typing after inactivity
    typingInactivityTimeout = setTimeout(() => {
      set({ isUserCurrentlyTyping: false });
    }, TYPING_INACTIVITY_MS);
  },

  initiateAutosave: (documentId: string) => {
    const { isUpdatingDataStore, lastVersionRotationAt, isAgenticMode } = get();

    // Guard: Don't start new save if already saving or in agentic mode
    if (isUpdatingDataStore || isAgenticMode) {
      return;
    }

    // Clear any existing scheduled save
    if (autosaveTimeout) {
      clearTimeout(autosaveTimeout);
    }

    // Start version rotation cycle if not already started
    if (!lastVersionRotationAt) {
      // Mark rotation as started to prevent re-initialization
      set({ lastVersionRotationAt: Date.now() });
      get().autoCreateVersion(documentId);
    }

    // Save immediately
    get()
      .updateDocumentAndActiveVersion(documentId)
      .then(() => {
        // After save completes, schedule next save for 500ms in the future
        autosaveTimeout = setTimeout(() => {
          const { isUserCurrentlyTyping, isUpdatingDataStore } = get();

          // Only continue autosave cycle if user is still typing
          if (isUserCurrentlyTyping && !isUpdatingDataStore) {
            get().initiateAutosave(documentId); // Recursive: starts the cycle again
          }
          // If not typing, cycle stops naturally
        }, AUTOSAVE_INTERVAL_MS);
      })
      .catch((error: unknown) => {
        console.error("[AUTOSAVE] Failed:", error);
        set({ isSaved: false });
      });
  },

  updateDocumentAndActiveVersion: async (documentId: string) => {
    const { title, content, versionCurrentlyInUse } = get();

    if (!content) {
      return;
    }

    // Guard: Don't start if resetting
    if (isResetting) {
      return;
    }

    set({ isUpdatingDataStore: true, isSaved: false });

    try {
      const contentString = JSON.stringify(content);
      const text = extractTextFromContent(content);
      const preview =
        text.slice(0, DOC_PREVIEW_LENGTH) +
        (text.length > DOC_PREVIEW_LENGTH ? "..." : "");

      // Create timestamp once for consistency across transaction and state
      const now = new Date();
      let updatedVersion: Version | null = null;

      // Execute operations in a single atomic transaction
      await triplit.transact(async (tx) => {
        // Update document metadata
        await tx.update("documents", documentId, (doc) => {
          doc.title = title || "Untitled Document";
          doc.preview = preview || "Start writing...";
          doc.lastModified = now;
        });

        // If no working version exists, create one
        if (!versionCurrentlyInUse) {
          updatedVersion = await tx.insert("versions", {
            documentId,
            content: contentString,
            title: title || "Untitled Document",
            fontFamily: get().fontFamily,
            timestamp: now,
          });
        } else {
          // Validate version belongs to this document
          if (versionCurrentlyInUse.documentId !== documentId) {
            throw new Error(
              `Version mismatch: expected documentId ${documentId}, got ${versionCurrentlyInUse.documentId}`
            );
          }

          // Update the existing working version
          await tx.update("versions", versionCurrentlyInUse.id, (version) => {
            version.content = contentString;
            version.title = title || "Untitled Document";
            version.fontFamily = get().fontFamily;
            version.timestamp = now;
          });

          updatedVersion = {
            ...versionCurrentlyInUse,
            content: contentString,
            title: title || "Untitled Document",
            fontFamily: get().fontFamily,
            timestamp: now,
          };
        }
      });

      // Abort if reset was called during transaction
      if (isResetting) {
        return;
      }

      // Only update state after successful transaction
      if (updatedVersion) {
        set({ versionCurrentlyInUse: updatedVersion });
      }

      set({
        lastSavedAt: Date.now(),
        isSaved: true,
      });
    } catch (error: unknown) {
      console.error("[SAVE] Transaction failed:", error);
      set({ isSaved: false });
    } finally {
      set({ isUpdatingDataStore: false });
    }
  },

  autoCreateVersion: (documentId: string) => {
    // Clear any existing rotation timeout (reschedule)
    if (versionRotationTimeout) {
      clearTimeout(versionRotationTimeout);
    }

    // Schedule version rotation for VERSION_ROTATION_MS in the future
    versionRotationTimeout = setTimeout(async () => {
      const {
        isUpdatingDataStore,
        isUserCurrentlyTyping,
        versionCurrentlyInUse,
      } = get();

      // Only rotate if:
      // 1. User is actively working (has typed recently)
      // 2. Has a working version to rotate from
      // Note: We don't check isUpdatingDataStore because autosave runs frequently (1s interval)
      // and would block all version rotations. The createNewWorkingVersion itself sets
      // isUpdatingDataStore to prevent concurrent operations.
      if (isUserCurrentlyTyping && versionCurrentlyInUse) {
        try {
          await get().createNewWorkingVersion(documentId);
          // Schedule next rotation
          get().autoCreateVersion(documentId);
        } catch (error: unknown) {
          console.error("[VERSION_ROTATION] Failed:", error);
        }
      } else if (isUserCurrentlyTyping) {
        // User is typing but other conditions not met, reschedule
        get().autoCreateVersion(documentId);
      } else {
        // User stopped typing - clear rotation state so next typing session can start fresh
        set({ lastVersionRotationAt: null });
      }
    }, VERSION_ROTATION_MS);
  },

  createNewWorkingVersion: async (documentId: string) => {
    const { title, content, versionCurrentlyInUse } = get();

    if (!content) {
      return;
    }

    // Guard: Don't start if resetting
    if (isResetting) {
      return;
    }

    // If no current version, this is handled by updateDocumentAndActiveVersion
    if (!versionCurrentlyInUse) {
      return;
    }

    // Validate version belongs to this document
    if (versionCurrentlyInUse.documentId !== documentId) {
      return;
    }

    set({ isUpdatingDataStore: true });

    try {
      const contentString = JSON.stringify(content);
      const now = new Date();

      // NOTE: The current working version is already in the DB from continuous autosaves.
      // It's already immutable in history. We just create a NEW working version.
      // The old version automatically becomes a checkpoint in the history timeline.

      const newVersion = await triplit.insert("versions", {
        documentId,
        content: contentString,
        title: title || "Untitled Document",
        fontFamily: get().fontFamily,
        timestamp: now,
      });

      // Abort if reset was called during insert
      if (isResetting) {
        return;
      }

      // Update state to use the new version as the working version
      set({
        versionCurrentlyInUse: newVersion,
        lastVersionRotationAt: Date.now(),
      });
    } catch (error: unknown) {
      console.error("[NEW_VERSION] Failed:", error);
    } finally {
      set({ isUpdatingDataStore: false });
    }
  },

  restoreVersion: async (documentId: string, version: Version) => {
    // Guard: Don't start if resetting
    if (isResetting) {
      return;
    }

    try {
      const restoredContent =
        typeof version.content === "string"
          ? JSON.parse(version.content)
          : (version.content as unknown);

      // Validate version belongs to this document
      if (version.documentId !== documentId) {
        throw new Error(
          `[RESTORE] Failed - version documentId ${version.documentId} does not match ${documentId}`
        );
      }

      // Update local state immediately for instant UI feedback
      set({
        content: restoredContent as JSONContent,
        title: version.title || "Untitled Document",
        fontFamily: version.fontFamily || DEFAULT_FONT_FAMILY,
        isSaved: false,
        isUpdatingDataStore: true,
      });

      const contentString = JSON.stringify(restoredContent);
      const text = extractTextFromContent(restoredContent as JSONContent);
      const preview =
        text.slice(0, DOC_PREVIEW_LENGTH) +
        (text.length > DOC_PREVIEW_LENGTH ? "..." : "");

      const now = new Date();
      let newVersion: Version | null = null;

      // Create restoration as an atomic transaction
      await triplit.transact(async (tx) => {
        // Update document metadata
        await tx.update("documents", documentId, (doc) => {
          doc.title = version.title || "Untitled Document";
          doc.preview = preview || "Start writing...";
          doc.lastModified = now;
        });

        // Create new working version from restored content
        newVersion = await tx.insert("versions", {
          documentId,
          content: contentString,
          title: version.title || "Untitled Document",
          fontFamily: version.fontFamily || DEFAULT_FONT_FAMILY,
          timestamp: now,
        });
      });

      // Abort if reset was called during transaction
      if (isResetting) {
        return;
      }

      // Only update version state after successful transaction
      if (newVersion) {
        set({
          versionCurrentlyInUse: newVersion,
          lastSavedAt: Date.now(),
          isSaved: true,
        });
      }
    } catch (e) {
      console.error("[RESTORE] Failed:", e);
      set({ isSaved: false });
    } finally {
      set({ isUpdatingDataStore: false });
    }
  },

  cleanupOldVersions: async (documentId: string, allVersions: Version[]) => {
    const { versionCurrentlyInUse } = get();

    // Guard: Don't run if resetting
    if (isResetting) {
      return;
    }

    try {
      // Calculate cutoff timestamp
      const cutoffDate = new Date();
      cutoffDate.setSeconds(cutoffDate.getSeconds() - VERSION_VALIDITY_SECONDS);
      const cutoffTimestamp = cutoffDate.getTime();

      // Filter versions to delete: older than cutoff AND not the working version
      const versionsToDelete = allVersions.filter((version) => {
        const versionTimestamp = new Date(version.timestamp).getTime();
        const isOld = versionTimestamp < cutoffTimestamp;
        const isWorkingVersion = versionCurrentlyInUse?.id === version.id;
        return isOld && !isWorkingVersion && version.documentId === documentId;
      });

      if (versionsToDelete.length === 0) {
        return;
      }

      await triplit.transact(async (tx) => {
        for (const version of versionsToDelete) {
          await tx.delete("versions", version.id);
        }
      });

      // Show success toast
      toast.success(
        `Cleaned up ${versionsToDelete.length} old version${
          versionsToDelete.length > 1 ? "s" : ""
        }`
      );
    } catch (error: unknown) {
      console.error("[CLEANUP] Failed:", error);
      // Non-critical failure - don't throw, just log
    }
  },

  // Reset all state
  reset: () => {
    const { isUpdatingDataStore } = get();

    // Set abort flag to prevent any pending async operations from updating state
    isResetting = true;
    set({ isResetting: true });

    // Clear all timeouts to prevent memory leaks and stale callbacks
    if (autosaveTimeout) {
      clearTimeout(autosaveTimeout);
      autosaveTimeout = null;
    }
    if (typingInactivityTimeout) {
      clearTimeout(typingInactivityTimeout);
      typingInactivityTimeout = null;
    }
    if (versionRotationTimeout) {
      clearTimeout(versionRotationTimeout);
      versionRotationTimeout = null;
    }

    // Reset state (keep isResetting true until timeout clears it)
    set({
      ...initialState,
      isResetting: true, // Override initialState.isResetting
    });

    // Clear abort flag after brief delay to ensure pending operations have checked it
    setTimeout(() => {
      isResetting = false;
      set({ isResetting: false });
    }, 100);
  },

  // ============================================
  // Agentic AI Actions
  // ============================================

  applyPendingEdits: (edits: AgenticEdit[]) => {
    if (edits.length === 0) return;

    const firstNodeId = edits[0]?.nodeId ?? null;

    // Just store the edits and set mode
    // Diffs will be applied by applyDiffsToNewEditor after editor remounts
    set({
      pendingEdits: edits,
      currentEditIndex: 0,
      isAgenticMode: true,
      focusedNodeId: firstNodeId,
      agenticContent: null, // Not used anymore - editor displays diffs directly
      initialEditCount: edits.length,
    });
  },

  // Called from editor onCreate after remount by the agentic content key to apply diff marks
  applyDiffsToNewEditor: () => {
    const { editorInstance, pendingEdits, isAgenticMode } = get();

    // Only apply if we're in agentic mode and have pending edits
    if (!editorInstance || !isAgenticMode || pendingEdits.length === 0) return;

    // Apply diff marks to each pending edit using combined operation
    // O(n) per edit
    for (const edit of pendingEdits) {
      editorInstance.commands.addDiffMarkAndInsertAfter(
        edit.nodeId,
        edit.replaceText,
        "add"
      );
    }
  },

  acceptEdit: (nodeId: string) => {
    const {
      pendingEdits,
      currentEditIndex,
      editorInstance,
      versionCurrentlyInUse,
    } = get();
    const editIndex = pendingEdits.findIndex((e) => e.nodeId === nodeId);

    if (editIndex === -1 || !editorInstance) return;

    // Use NodeCommands to accept the edit:
    // 1. Remove the original node (marked as delete)
    // 2. Remove diff marks from replacement node
    editorInstance
      .chain()
      .focus()
      .deleteNodeById(nodeId) // Removes original (deleted) text
      .removeDiffMarks(nodeId) // Clear diff marks from replacement
      .run();

    // Remove this edit from pending
    const newPendingEdits = pendingEdits.filter((e) => e.nodeId !== nodeId);

    // If this was the last edit, finalize and exit agentic mode properly
    if (newPendingEdits.length === 0) {
      // Clean any remaining diff marks (safety)
      editorInstance.commands.removeAllDiffMarks();

      // Capture final content as new source of truth
      const finalContent = editorInstance.getJSON();

      set({
        content: finalContent,
        pendingEdits: [],
        currentEditIndex: 0,
        isAgenticMode: false,
        focusedNodeId: null,
        agenticContent: null,
        initialEditCount: 0,
      });

      // Restore editable and trigger autosave
      editorInstance.setEditable(true);
      if (versionCurrentlyInUse?.documentId) {
        get().initiateAutosave(versionCurrentlyInUse.documentId);
      }
    } else {
      // More edits remaining - just update pending list
      const newIndex = Math.min(
        currentEditIndex,
        Math.max(0, newPendingEdits.length - 1)
      );
      const newFocusedId = newPendingEdits[newIndex]?.nodeId ?? null;

      set({
        pendingEdits: newPendingEdits,
        currentEditIndex: newIndex,
        focusedNodeId: newFocusedId,
      });
    }
  },

  rejectEdit: (nodeId: string) => {
    const {
      pendingEdits,
      currentEditIndex,
      editorInstance,
      versionCurrentlyInUse,
    } = get();
    const editIndex = pendingEdits.findIndex((e) => e.nodeId === nodeId);

    if (editIndex === -1 || !editorInstance) return;

    // Use NodeCommands to reject the edit:
    // 1. Delete the replacement node
    // 2. Remove diff marks from original node
    editorInstance
      .chain()
      .focus()
      .deleteReplacementNode(nodeId) // Removes the replacement (added) text
      .removeDiffMarks(nodeId) // Clear diff marks from original
      .run();

    // Remove this edit from pending
    const newPendingEdits = pendingEdits.filter((e) => e.nodeId !== nodeId);

    // If this was the last edit, finalize and exit agentic mode properly
    if (newPendingEdits.length === 0) {
      // Clean any remaining diff marks (safety)
      editorInstance.commands.removeAllDiffMarks();

      // Capture final content as new source of truth
      const finalContent = editorInstance.getJSON();

      set({
        content: finalContent,
        pendingEdits: [],
        currentEditIndex: 0,
        isAgenticMode: false,
        focusedNodeId: null,
        agenticContent: null,
        initialEditCount: 0,
      });

      // Restore editable and trigger autosave
      editorInstance.setEditable(true);
      if (versionCurrentlyInUse?.documentId) {
        get().initiateAutosave(versionCurrentlyInUse.documentId);
      }
    } else {
      // More edits remaining - just update pending list
      const newIndex = Math.min(
        currentEditIndex,
        Math.max(0, newPendingEdits.length - 1)
      );
      const newFocusedId = newPendingEdits[newIndex]?.nodeId ?? null;

      set({
        pendingEdits: newPendingEdits,
        currentEditIndex: newIndex,
        focusedNodeId: newFocusedId,
      });
    }
  },

  acceptAllEdits: () => {
    const { editorInstance, pendingEdits, versionCurrentlyInUse } = get();
    if (!editorInstance) return;

    // Accept = remove original (delete) nodes, keep replacement (add) nodes, strip marks
    // Use batch operation for O(n)
    const nodeIdsToDelete = new Set(pendingEdits.map((e) => e.nodeId));

    editorInstance
      .chain()
      .focus()
      .deleteNodesByIds(nodeIdsToDelete) // O(n) single traversal
      .removeAllDiffMarks() // O(n)
      .run();

    // Capture the cleaned editor content as the new source of truth
    const cleanedContent = editorInstance.getJSON();

    set({
      content: cleanedContent,
      agenticContent: null,
      pendingEdits: [],
      currentEditIndex: 0,
      isAgenticMode: false,
      focusedNodeId: null,
      initialEditCount: 0,
    });

    // Restore editable state (extra redundancy; key prop already handles this)
    editorInstance.setEditable(true);

    // Trigger autosave to persist the accepted changes
    if (versionCurrentlyInUse?.documentId) {
      get().initiateAutosave(versionCurrentlyInUse.documentId);
    }
  },

  rejectAllEdits: () => {
    const { editorInstance, content, versionCurrentlyInUse } = get();
    if (!editorInstance) return;

    // content holds the ORIGINAL content (frozen when entering agentic mode)
    // agenticContent is the working copy with diffs (now being discarded)
    // Restore the editor to the original content
    if (content) {
      editorInstance.commands.setContent(content);
    }

    set({
      agenticContent: null,
      pendingEdits: [],
      currentEditIndex: 0,
      isAgenticMode: false,
      focusedNodeId: null,
      initialEditCount: 0,
    });

    // Restore editable state (extra redundancy; key prop already handles this)
    editorInstance.setEditable(true);

    // Trigger autosave to persist the restored content
    if (versionCurrentlyInUse?.documentId) {
      get().initiateAutosave(versionCurrentlyInUse.documentId);
    }
  },

  navigateEdit: (direction: "prev" | "next") => {
    const { pendingEdits, currentEditIndex, editorInstance } = get();

    if (pendingEdits.length === 0) return;

    let newIndex: number;
    if (direction === "next") {
      newIndex = (currentEditIndex + 1) % pendingEdits.length;
    } else {
      newIndex =
        currentEditIndex === 0 ? pendingEdits.length - 1 : currentEditIndex - 1;
    }

    const edit = pendingEdits[newIndex];

    set({
      currentEditIndex: newIndex,
      focusedNodeId: edit?.nodeId ?? null,
    });

    // Use NodeCommands to scroll to the focused edit
    // Dispatch focusedNodeId via transaction meta for DiffFocusPlugin decorations
    if (editorInstance && edit) {
      editorInstance.view.dispatch(
        editorInstance.state.tr.setMeta("focusedNodeId", edit.nodeId)
      );
      editorInstance.commands.scrollToNode(edit.nodeId);
    }
  },

  exitAgenticMode: () => {
    // Reject all remaining edits and exit
    get().rejectAllEdits();

    set({
      pendingEdits: [],
      currentEditIndex: 0,
      isAgenticMode: false,
      focusedNodeId: null,
      agenticContent: null,
      initialEditCount: 0,
    });
  },

  continueWithPartialEdits: () => {
    const {
      pendingEdits,
      initialEditCount,
      editorInstance,
      versionCurrentlyInUse,
    } = get();
    if (!editorInstance) return;

    const acceptedCount = initialEditCount - pendingEdits.length;

    // Remove all remaining pending edits (reject them visually)
    // Use batch operation for O(n)
    const nodeIdsToReject = new Set(pendingEdits.map((e) => e.nodeId));

    editorInstance
      .chain()
      .focus()
      .deleteReplacementNodesByIds(nodeIdsToReject) // O(n) single traversal
      .removeAllDiffMarks() // O(n)
      .run();

    // Capture the current editor content (with accepted changes applied)
    const currentContent = editorInstance.getJSON();

    set({
      content: currentContent,
      pendingEdits: [],
      currentEditIndex: 0,
      isAgenticMode: false,
      focusedNodeId: null,
      agenticContent: null,
      initialEditCount: 0,
    });

    // Restore editable state
    editorInstance.setEditable(true);

    // Trigger autosave
    if (versionCurrentlyInUse?.documentId) {
      get().initiateAutosave(versionCurrentlyInUse.documentId);
    }

    if (acceptedCount > 0) {
      toast.success(
        `Applied ${acceptedCount} suggestion${acceptedCount > 1 ? "s" : ""}`
      );
    }
  },
}));
