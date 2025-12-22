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
  MILLISECONDS_IN_DAY,
  TYPING_INACTIVITY_MS,
  VERSION_ROTATION_MS,
  VERSION_VALIDITY_SECONDS,
} from "../constants";
import { calculateWordCount, extractTextFromContent } from "../utils";

let autosaveTimeout: ReturnType<typeof setTimeout> | null = null;
let typingInactivityTimeout: ReturnType<typeof setTimeout> | null = null;
let versionRotationTimeout: ReturnType<typeof setTimeout> | null = null;
let isResetting = false; // Flag to prevent state updates during/after reset

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
    console.log("[HYDRATE] Starting hydration...");
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
        lastVersionRotationAt: new Date(version.timestamp).getTime(),
        isSaved: true,
        isHydrated: true,
      });

      console.log("[HYDRATE] Complete. State:", {
        isSaved: get().isSaved,
        isHydrated: get().isHydrated,
        isUpdatingDataStore: get().isUpdatingDataStore,
        title: get().title,
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
    console.log("[TYPING] User typing detected");
    set({ isUserCurrentlyTyping: true });

    // Clear existing inactivity timeout
    if (typingInactivityTimeout) {
      clearTimeout(typingInactivityTimeout);
    }

    // Set new timeout to mark user as stopped typing after inactivity
    typingInactivityTimeout = setTimeout(() => {
      console.log("[TYPING] User stopped typing (inactivity timeout)");
      set({ isUserCurrentlyTyping: false });
    }, TYPING_INACTIVITY_MS);
  },

  initiateAutosave: (documentId: string) => {
    const { isUpdatingDataStore, lastVersionRotationAt } = get();
    console.log(
      "[AUTOSAVE] Initiated. isUpdatingDataStore:",
      isUpdatingDataStore
    );

    // Guard: Don't start new save if already saving
    if (isUpdatingDataStore) {
      console.log("[AUTOSAVE] Skipped - already updating");
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
        console.log("[AUTOSAVE] Save complete. Scheduling next check...");
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
    console.log("[SAVE] Starting save...", {
      hasContent: !!content,
      hasVersion: !!versionCurrentlyInUse,
    });

    if (!content) {
      console.warn("[SAVE] Aborted - content is null");
      return;
    }

    // Guard: Don't start if resetting
    if (isResetting) {
      console.warn("[SAVE] Aborted - reset in progress");
      return;
    }

    console.log("[SAVE] Setting isUpdatingDataStore=true, isSaved=false");
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
        console.warn(
          "Save state update aborted: reset called during transaction"
        );
        return;
      }

      // Only update state after successful transaction
      if (updatedVersion) {
        set({ versionCurrentlyInUse: updatedVersion });
      }

      console.log("[SAVE] Transaction success. Setting isSaved=true");
      set({
        lastSavedAt: Date.now(),
        isSaved: true,
      });
    } catch (error: unknown) {
      console.error("[SAVE] Transaction failed:", error);
      set({ isSaved: false });
    } finally {
      console.log(
        "[SAVE] Finally block. Setting isUpdatingDataStore=false. Current state:",
        {
          isSaved: get().isSaved,
          isUpdatingDataStore: get().isUpdatingDataStore,
        }
      );
      set({ isUpdatingDataStore: false });
    }
  },

  autoCreateVersion: (documentId: string) => {
    console.log(
      "[VERSION_ROTATION] Scheduling version rotation in 5 minutes..."
    );
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

      console.log("[VERSION_ROTATION] Timer fired. Checking conditions:", {
        isUserCurrentlyTyping,
        isUpdatingDataStore,
        hasVersion: !!versionCurrentlyInUse,
      });

      // Only rotate if:
      // 1. User is actively working (has typed recently)
      // 2. Not currently in a save operation
      // 3. Has a working version to rotate from
      if (
        isUserCurrentlyTyping &&
        !isUpdatingDataStore &&
        versionCurrentlyInUse
      ) {
        try {
          console.log("[VERSION_ROTATION] Creating new version snapshot...");
          await get().createNewWorkingVersion(documentId);
          // Schedule next rotation
          get().autoCreateVersion(documentId);
        } catch (error: unknown) {
          console.error("[VERSION_ROTATION] Failed:", error);
        }
      } else if (isUserCurrentlyTyping) {
        // User is typing but other conditions not met, reschedule
        console.log("[VERSION_ROTATION] Conditions not met, rescheduling...");
        get().autoCreateVersion(documentId);
      } else {
        console.log("[VERSION_ROTATION] User not typing, cycle stopped");
      }
    }, VERSION_ROTATION_MS);
  },

  createNewWorkingVersion: async (documentId: string) => {
    const { title, content, versionCurrentlyInUse } = get();
    console.log("[NEW_VERSION] Starting...", {
      hasContent: !!content,
      hasVersion: !!versionCurrentlyInUse,
    });

    if (!content) {
      console.warn("[NEW_VERSION] Aborted - content is null");
      return;
    }

    // Guard: Don't start if resetting
    if (isResetting) {
      console.warn("[NEW_VERSION] Aborted - reset in progress");
      return;
    }

    // If no current version, this is handled by updateDocumentAndActiveVersion
    if (!versionCurrentlyInUse) {
      console.log(
        "[NEW_VERSION] Skipped - no current version (handled by save)"
      );
      return;
    }

    // Validate version belongs to this document
    if (versionCurrentlyInUse.documentId !== documentId) {
      console.error(
        `[NEW_VERSION] Failed - version documentId ${versionCurrentlyInUse.documentId} does not match ${documentId}`
      );
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
        console.warn("[NEW_VERSION] State update aborted - reset called");
        return;
      }

      console.log(
        "[NEW_VERSION] Created successfully. New version ID:",
        newVersion.id
      );
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
    console.log("[RESTORE] Starting restore from version:", version.id);
    // Guard: Don't start if resetting
    if (isResetting) {
      console.warn("[RESTORE] Aborted - reset in progress");
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

      console.log("[RESTORE] Setting local state for instant UI feedback");
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
        console.warn(
          "[RESTORE] State update aborted - reset called during transaction"
        );
        return;
      }

      // Only update version state after successful transaction
      if (newVersion) {
        console.log(
          "[RESTORE] Success. New version ID:",
          (newVersion as Version).id
        );
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
    console.log(
      "[CLEANUP] Starting cleanup for documentId:",
      documentId,
      "Total versions:",
      allVersions.length
    );

    // Guard: Don't run if resetting
    if (isResetting) {
      console.warn("[CLEANUP] Aborted - reset in progress");
      return;
    }

    try {
      // Calculate cutoff timestamp
      const cutoffDate = new Date();
      cutoffDate.setSeconds(cutoffDate.getSeconds() - VERSION_VALIDITY_SECONDS);
      const cutoffTimestamp = cutoffDate.getTime();

      console.log("[CLEANUP] Cutoff date:", cutoffDate.toISOString());

      // Filter versions to delete: older than cutoff AND not the working version
      const versionsToDelete = allVersions.filter((version) => {
        const versionTimestamp = new Date(version.timestamp).getTime();
        const isOld = versionTimestamp < cutoffTimestamp;
        const isWorkingVersion = versionCurrentlyInUse?.id === version.id;
        const shouldDelete =
          isOld && !isWorkingVersion && version.documentId === documentId;

        if (shouldDelete) {
          console.log("[CLEANUP] Marking for deletion:", {
            id: version.id,
            timestamp: new Date(version.timestamp).toISOString(),
            age:
              Math.floor(
                (Date.now() - versionTimestamp) / MILLISECONDS_IN_DAY
              ) + " days",
          });
        }

        return shouldDelete;
      });

      if (versionsToDelete.length === 0) {
        console.log("[CLEANUP] No old versions to delete");
        return;
      }

      console.log(`[CLEANUP] Deleting ${versionsToDelete.length} old versions`);

      await triplit.transact(async (tx) => {
        for (const version of versionsToDelete) {
          await tx.delete("versions", version.id);
        }
      });

      console.log(
        "[CLEANUP] Successfully deleted",
        versionsToDelete.length,
        "versions"
      );

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
    const { isUpdatingDataStore, isSaved, isHydrated } = get();
    console.log("[RESET] Called. Current state:", {
      isUpdatingDataStore,
      isSaved,
      isHydrated,
    });

    // Set abort flag to prevent any pending async operations from updating state
    isResetting = true;
    set({ isResetting: true });

    if (isUpdatingDataStore) {
      console.warn(
        "[RESET] Warning: save/restore in progress. Pending operations will be aborted."
      );
    }

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
    console.log(
      "[RESET] Resetting to initialState. isSaved will be:",
      initialState.isSaved
    );
    set({
      ...initialState,
      isResetting: true, // Override initialState.isResetting
    });

    // Clear abort flag after brief delay to ensure pending operations have checked it
    setTimeout(() => {
      isResetting = false;
      set({ isResetting: false });
      console.log("[RESET] Complete. Final state:", {
        isSaved: get().isSaved,
        isHydrated: get().isHydrated,
      });
    }, 100);
  },
}));
