"use client";

import { AgenticDiffToolbar } from "@/components/editor/agentic-diff-toolbar";
import { AIActionToolbar } from "@/components/editor/ai-action-toolbar";
import { AIInputBar } from "@/components/editor/ai-input-bar";
import { DocHistoryCard } from "@/components/editor/doc-history-card";
import Editor from "@/components/editor/editor";
import { EditorBanner } from "@/components/editor/editor-banner";
import { EditorHeader } from "@/components/editor/editor-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEditorStore } from "@/lib/store/editor-store";
import { cn, formatPreviewTimestamp } from "@/lib/utils";
import { triplit } from "@/triplit/client";
import { AiBrain01Icon } from "@hugeicons/core-free-icons";
import { useQuery } from "@triplit/react";
import Link from "next/link";
import { EditorRoot } from "novel";
import { use, useEffect, useMemo } from "react";

export default function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: documentId } = use(params);

  const content = useEditorStore((s) => s.content);
  const fontFamily = useEditorStore((s) => s.fontFamily);
  const versionBeingPreviewed = useEditorStore((s) => s.versionBeingPreviewed);
  const isHydrated = useEditorStore((s) => s.isHydrated);
  const isAgenticMode = useEditorStore((s) => s.isAgenticMode);
  const agenticContent = useEditorStore((s) => s.agenticContent);

  const hydrateFromVersion = useEditorStore((s) => s.hydrateFromVersion);
  const cleanupOldVersions = useEditorStore((s) => s.cleanupOldVersions);
  const reset = useEditorStore((s) => s.reset);

  // Triplit query for versions (source of truth)
  const versionsQuery = useMemo(
    () =>
      triplit
        .query("versions")
        .Where("documentId", "=", documentId)
        .Order("timestamp", "DESC"),
    [documentId]
  );

  const { results: versions, fetching: fetchingVersions } = useQuery(
    triplit,
    versionsQuery
  );

  const versionsList = useMemo(() => versions || [], [versions]);
  const latestVersion = versionsList[0];
  const isLoading = fetchingVersions;
  const documentNotFound = !fetchingVersions && versionsList.length === 0;

  // Reset store when documentId changes + cleanup on unmount
  useEffect(() => {
    reset();
    return () => {
      reset();
    };
  }, [documentId, reset]);

  // Hydrate store when latest version is available (ONLY on initial load)
  useEffect(() => {
    // Only hydrate if NOT already hydrated (prevents loop after saves)
    if (latestVersion && !fetchingVersions && !isHydrated) {
      hydrateFromVersion(latestVersion);

      // Fire-and-forget; cleanup after hydration completes to not block the editor load
      cleanupOldVersions(documentId, versionsList).catch((error) => {
        console.error("[PAGE] Cleanup failed (non-critical):", error);
      });
    }
  }, [
    latestVersion,
    fetchingVersions,
    isHydrated,
    hydrateFromVersion,
    cleanupOldVersions,
    documentId,
    versionsList,
  ]);

  // Compute display content based on preview mode, agentic mode, or hydration state
  const displayContent = useMemo(() => {
    if (versionBeingPreviewed) {
      try {
        return typeof versionBeingPreviewed.content === "string"
          ? JSON.parse(versionBeingPreviewed.content)
          : versionBeingPreviewed.content;
      } catch {
        return { type: "doc", content: [] };
      }
    }
    // In agentic mode, show the working copy with AI suggestions
    if (isAgenticMode && agenticContent) {
      return agenticContent;
    }
    // Only return content after hydration is complete
    return isHydrated ? content : undefined;
  }, [
    versionBeingPreviewed,
    isAgenticMode,
    agenticContent,
    isHydrated,
    content,
  ]);

  if (documentNotFound) {
    return (
      <AlertDialog open={true}>
        <AlertDialogContent className="bg-surface-night border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Document Not Found
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              The document you&apos;re looking for doesn&apos;t exist or has
              been deleted. Please return to the dashboard to create a new
              document or select an existing one.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Link href="/dashboard">
              <AlertDialogAction className="w-full outline-none border-none focus-visible:ring-0">
                Go to Dashboard
              </AlertDialogAction>
            </Link>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <EditorRoot>
      <div
        className={cn(
          "h-full flex flex-col relative scrollbar-hide",
          isAgenticMode && "agentic-mode"
        )}
      >
        {/* Fixed Header - stays at top during scroll */}
        <div className="sticky top-0 z-30">
          <EditorHeader documentId={documentId} />
        </div>

        {/* Preview Banner - fixed below header */}
        {versionBeingPreviewed && (
          <EditorBanner variant="warning">
            Previewing version from{" "}
            {formatPreviewTimestamp(versionBeingPreviewed.timestamp)}
          </EditorBanner>
        )}

        {/* Agentic Mode Banner - fixed below header */}
        {isAgenticMode && (
          <EditorBanner variant="info" icon={AiBrain01Icon}>
            AI is suggesting changes. Review and accept or reject each
            suggestion.
          </EditorBanner>
        )}

        {/* AI Action Toolbar - fixed to viewport, always visible */}
        <div className="fixed left-4 top-1/2 -translate-y-1/2 z-20">
          <AIActionToolbar />
        </div>

        {/* Main scrollable content area */}
        <div className="flex-1 overflow-y-auto w-full scrollbar-hide">
          {/* Editor - Google Docs style */}
          <div className="h-full flex flex-col items-center justify-start sm:py-3 sm:px-4 px-0 py-0 w-full">
            <div
              className="w-full sm:max-w-[210mm] min-h-full sm:min-h-[297mm] bg-editor-paper sm:shadow-xl sm:border border-white/5 sm:rounded-sm shrink-0 mx-auto transition-all duration-300"
              style={{ fontFamily }}
              aria-busy={isLoading}
            >
              {isLoading && (
                <span className="sr-only">Loading document content...</span>
              )}
              <Editor
                // this key changes forces the editor to remount to c=show the new changes
                key={`${documentId}:${
                  versionBeingPreviewed?.id ?? (isHydrated ? "live" : "loading")
                }`}
                initialValue={displayContent ?? undefined}
                editable={
                  !versionBeingPreviewed && !isAgenticMode && isHydrated
                }
                isLoading={!isHydrated}
                documentId={documentId}
              />
            </div>
          </div>
        </div>

        {/* Document History Card */}
        <DocHistoryCard documentId={documentId} history={versionsList} />

        {/* Agentic Diff Toolbar - shows when AI edits are pending */}
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50">
          <AgenticDiffToolbar />
        </div>

        {/* Floating AI Input Bar - fixed at bottom center */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md z-[99999px]">
          <AIInputBar />
        </div>
      </div>
    </EditorRoot>
  );
}
