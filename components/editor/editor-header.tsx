"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { TOOLBAR_GROUPS } from "@/lib/config/editor-toolbar-config";
import { useEditorStore } from "@/lib/store/editor-store";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  ArrowLeft01Icon,
  Clock01Icon,
  MoreHorizontalIcon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEditor } from "novel";
import { Fragment } from "react";
import { FontSelector } from "./selectors/font-selector";

interface EditorHeaderProps {
  documentId: string;
}

const VISIBLE_GROUPS_COUNT = 2;

export function EditorHeader({ documentId }: EditorHeaderProps) {
  const { editor } = useEditor();
  const title = useEditorStore((s) => s.title);
  const isHistoryOpen = useEditorStore((s) => s.isHistoryOpen);
  const isSaved = useEditorStore((s) => s.isSaved);
  const isUpdatingDataStore = useEditorStore((s) => s.isUpdatingDataStore);
  const lastSavedAt = useEditorStore((s) => s.lastSavedAt);
  const wordCount = useEditorStore((s) => s.wordCount);

  const visibleGroups = TOOLBAR_GROUPS.slice(0, VISIBLE_GROUPS_COUNT);
  const overflowGroups = TOOLBAR_GROUPS.slice(VISIBLE_GROUPS_COUNT);
  const activeOverflowItems = overflowGroups.flatMap((group) =>
    group.items.filter((item) => item.isActive?.(editor))
  );

  const setTitle = useEditorStore((s) => s.setTitle);
  const setIsHistoryOpen = useEditorStore((s) => s.setIsHistoryOpen);
  const markUserTyping = useEditorStore((s) => s.markUserTyping);
  const initiateAutosave = useEditorStore((s) => s.initiateAutosave);

  // Debug: Log save state changes
  console.log(
    "[HEADER] Render. isSaved:",
    isSaved,
    "isUpdatingDataStore:",
    isUpdatingDataStore,
    "lastSavedAt:",
    lastSavedAt
  );

  const handleTitleChange = (nextTitle: string) => {
    setTitle(nextTitle);
    markUserTyping();
    initiateAutosave(documentId);
  };

  const handleManualSave = () => {
    initiateAutosave(documentId);
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex h-14 items-center justify-between px-2 sm:px-4 sm:m-3 m-0 sm:rounded-2xl rounded-none border-b sm:border border-white/10 bg-surface-night/10 backdrop-blur-xl shadow-lg shadow-black/20 z-50 overflow-hidden sticky top-0 left-0 right-0 sm:static"
    >
      {/* Left section - Go back + Title */}
      <div className="flex items-center min-w-0 shrink h-full">
        <Link
          href="/dashboard"
          className="me-3.5 flex items-center justify-center h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
          title="Back to Dashboard"
        >
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            className="h-5 w-5"
            strokeWidth={2}
          />
          <span className="sr-only">Back</span>
        </Link>
        <Separator
          orientation="vertical"
          className="bg-white/10 hidden sm:block"
        />
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Untitled Document"
          className="bg-transparent border-none outline-none text-sm font-medium text-foreground placeholder:text-muted-foreground/50 w-32 sm:w-48 truncate focus:ring-0 h-full py-1 focus:bg-white/5 px-4 transition-colors"
        />
      </div>

      {/* Center section - Toolbar (Desktop) */}
      <div className="flex items-center gap-1 overflow-hidden">
        <div className="hidden md:flex">
          {/* Font Selector */}
          <FontSelector />

          <Separator orientation="vertical" className="mx-1 bg-white/10" />

          {/* Visible toolbar groups */}
          {visibleGroups.map((group, group_index) => (
            <Fragment key={group.id}>
              {group_index > 0 && (
                <Separator
                  orientation="vertical"
                  className=" mx-1 bg-white/10"
                />
              )}
              {group.items.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 shrink-0 hover:bg-white/10 hover:text-foreground rounded-lg cursor-pointer transition-colors text-muted-foreground",
                    item.isActive?.(editor) &&
                      "bg-white/15 text-foreground shadow-sm"
                  )}
                  onClick={() => item.action(editor)}
                  disabled={item.disabled?.(editor)}
                  title={item.label}
                >
                  <HugeiconsIcon
                    icon={item.icon}
                    className="h-4 w-4"
                    strokeWidth={2}
                  />
                </Button>
              ))}
            </Fragment>
          ))}

          {/* Active items from overflow groups - always visible */}
          {activeOverflowItems.length > 0 && (
            <>
              <Separator orientation="vertical" className=" mx-1 bg-white/10" />
              {activeOverflowItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-lg cursor-pointer bg-white/15 text-foreground shadow-sm"
                  onClick={() => item.action(editor)}
                  disabled={item.disabled?.(editor)}
                  title={item.label}
                >
                  <HugeiconsIcon
                    icon={item.icon}
                    className="h-4 w-4"
                    strokeWidth={2}
                  />
                </Button>
              ))}
            </>
          )}
        </div>

        {/* More dropdown for overflow groups */}
        {overflowGroups.length > 0 && (
          <>
            <Separator orientation="vertical" className="mx-1 bg-white/10" />
            <DropdownMenu>
              <DropdownMenuTrigger className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg hover:bg-white/10 hover:text-foreground cursor-pointer text-muted-foreground focus-visible:outline-none transition-colors">
                <HugeiconsIcon
                  icon={MoreHorizontalIcon}
                  className="h-4 w-4"
                  strokeWidth={2}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                className="w-48 max-h-80 overflow-y-auto bg-surface-night border-white/10 text-foreground"
              >
                {overflowGroups.map((group, group_index) => (
                  <Fragment key={group.id}>
                    {group_index > 0 && (
                      <Separator className="my-1 bg-white/10" />
                    )}
                    {group.items.map((item) => (
                      <DropdownMenuItem
                        key={item.id}
                        onClick={() => item.action(editor)}
                        disabled={item.disabled?.(editor)}
                        className={cn(
                          "gap-2 cursor-pointer focus:bg-white/10 focus:text-foreground",
                          item.isActive?.(editor) && "bg-white/15"
                        )}
                      >
                        <HugeiconsIcon
                          icon={item.icon}
                          className="h-4 w-4"
                          strokeWidth={2}
                        />
                        <span>{item.label}</span>
                      </DropdownMenuItem>
                    ))}
                  </Fragment>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>

      {/* Right section - Word Count, Save Status, History */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0 justify-end ps-4">
        {/* Word Count */}
        <span className="text-xs sm:text-xs text-muted-foreground/60 tabular-nums hidden sm:inline font-medium">
          {wordCount.toLocaleString()} words
        </span>

        <Separator
          orientation="vertical"
          className="bg-white/10 hidden sm:block"
        />

        {/* Save Status */}
        <div className="relative h-8 flex items-center justify-end min-w-20">
          <AnimatePresence mode="wait">
            {!isUpdatingDataStore && isSaved ? (
              <motion.div
                key="saved"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center gap-1.5 text-emerald-500"
              >
                <HugeiconsIcon
                  icon={Tick01Icon}
                  className="h-4 w-4"
                  strokeWidth={2.5}
                />
                <span className="text-xs font-medium">Saved</span>
              </motion.div>
            ) : (
              <motion.div
                key={isUpdatingDataStore ? "saving" : "save"}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                onClick={handleManualSave}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors group"
              >
                <span className="text-xs group-hover:underline decoration-white/30 underline-offset-2">
                  {isUpdatingDataStore ? "Saving…" : "Save"}
                </span>
                {lastSavedAt && !isUpdatingDataStore && (
                  <span className="hidden sm:inline font-mono text-[10px] opacity-40 tabular-nums bg-white/5 px-1 rounded-sm">
                    {formatRelativeTime(lastSavedAt)}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Button
          variant={isHistoryOpen ? "secondary" : "ghost"}
          size="sm"
          className={cn(
            "h-8 px-2.5 text-xs gap-1.5 rounded-lg cursor-pointer shrink-0 transition-all",
            isHistoryOpen
              ? "bg-white/15 text-foreground hover:bg-white/20"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          )}
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
        >
          <HugeiconsIcon
            icon={Clock01Icon}
            className="h-4 w-4"
            strokeWidth={2}
          />
          <span className="hidden sm:inline font-medium">History</span>
        </Button>
      </div>
    </motion.header>
  );
}
