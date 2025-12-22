"use client";

import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LinkInput } from "@/components/ui/link-input";
import { MathInput } from "@/components/ui/math-input";
import { Separator } from "@/components/ui/separator";
import {
  ALL_TOOLBAR_ITEMS,
  getVisibilityClasses,
} from "@/lib/config/editor-toolbar-config";
import { useEditorStore } from "@/lib/store/editor-store";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  ArrowLeft01Icon,
  Clock01Icon,
  MoreHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { Fragment } from "react";
import { FontSelector } from "./selectors/font-selector";

interface EditorHeaderProps {
  documentId: string;
}

export function EditorHeader({ documentId }: EditorHeaderProps) {
  const editor = useEditorStore((s) => s.editorInstance);
  const title = useEditorStore((s) => s.title);
  const isHistoryOpen = useEditorStore((s) => s.isHistoryOpen);
  const isUpdatingDataStore = useEditorStore((s) => s.isUpdatingDataStore);
  const lastSavedAt = useEditorStore((s) => s.lastSavedAt);
  const wordCount = useEditorStore((s) => s.wordCount);
  const versionBeingPreviewed = useEditorStore((s) => s.versionBeingPreviewed);

  const hasOverflowItems = ALL_TOOLBAR_ITEMS.some(
    (item) => item.visibleFrom !== "always"
  );

  const setTitle = useEditorStore((s) => s.setTitle);
  const setIsHistoryOpen = useEditorStore((s) => s.setIsHistoryOpen);
  const markUserTyping = useEditorStore((s) => s.markUserTyping);
  const initiateAutosave = useEditorStore((s) => s.initiateAutosave);

  const isPreviewMode = !!versionBeingPreviewed;

  const handleTitleChange = (nextTitle: string) => {
    setTitle(nextTitle);
    markUserTyping();
    initiateAutosave(documentId);
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        "flex h-14 items-center justify-between px-2 sm:px-4 sm:m-3 m-0 sm:rounded-2xl rounded-none border-b sm:border border-white/10 bg-surface-night/10 backdrop-blur-xl shadow-lg shadow-black/20 z-50 overflow-hidden sticky top-0 left-0 right-0 sm:static transition-opacity",
        isPreviewMode && "pointer-events-none opacity-50 select-none"
      )}
    >
      {/* Left section - Go back + Title */}
      <div className="flex items-center min-w-0 shrink h-full">
        <Link
          href="/dashboard"
          className="me-3.5 flex items-center justify-center h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-colors cursor-pointer shrink-0"
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
          className="bg-white/10 hidden sm:block shrink-0"
        />
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Untitled Document"
          className="bg-transparent border-none outline-none text-sm font-medium text-foreground placeholder:text-muted-foreground/50 w-32 sm:w-48 md:w-56 truncate focus:ring-0 h-full py-1 focus:bg-white/5 px-4 transition-colors"
        />
      </div>

      {/* Center section - Toolbar (Desktop) */}
      <div className="flex items-center gap-1 overflow-hidden ms-4">
        <div className="hidden md:flex items-center">
          {ALL_TOOLBAR_ITEMS.map((item, index) => (
            <Fragment key={item.id}>
              {item.isFirstInGroup && (
                <Separator
                  orientation="vertical"
                  className={cn(
                    "mx-1 bg-white/10",
                    getVisibilityClasses(item.visibleFrom).toolbar
                  )}
                />
              )}
              {item.component === "FontSelector" ? (
                <div
                  className={cn(getVisibilityClasses(item.visibleFrom).toolbar)}
                >
                  <FontSelector />
                </div>
              ) : item.component === "ColorPicker" ? (
                <ColorPicker
                  value={editor?.getAttributes("textStyle").color}
                  onChange={(color) =>
                    editor?.chain().focus().setColor(color).run()
                  }
                  icon={
                    <HugeiconsIcon
                      icon={item.icon}
                      className="h-4 w-4"
                      strokeWidth={2}
                    />
                  }
                  title={item.label}
                  isActive={item.isActive?.(editor)}
                  className={cn(
                    "shrink-0 hover:bg-white/10 hover:text-foreground rounded-lg cursor-pointer transition-colors text-muted-foreground",
                    getVisibilityClasses(item.visibleFrom).toolbar
                  )}
                />
              ) : item.component === "MathInput" ? (
                <MathInput
                  onInsert={(latex) =>
                    editor?.chain().focus().insertInlineMath({ latex }).run()
                  }
                  icon={
                    <HugeiconsIcon
                      icon={item.icon}
                      className="h-4 w-4"
                      strokeWidth={2}
                    />
                  }
                  title={item.label}
                  isActive={item.isActive?.(editor)}
                  className={cn(
                    "shrink-0 hover:bg-white/10 hover:text-foreground rounded-lg cursor-pointer transition-colors text-muted-foreground",
                    getVisibilityClasses(item.visibleFrom).toolbar
                  )}
                />
              ) : item.component === "LinkInput" ? (
                <LinkInput
                  editor={editor}
                  icon={
                    <HugeiconsIcon
                      icon={item.icon}
                      className="h-4 w-4"
                      strokeWidth={2}
                    />
                  }
                  title={item.label}
                  isActive={item.isActive?.(editor)}
                  className={cn(
                    "shrink-0 hover:bg-white/10 hover:text-foreground rounded-lg cursor-pointer transition-colors text-muted-foreground",
                    getVisibilityClasses(item.visibleFrom).toolbar
                  )}
                />
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 shrink-0 hover:bg-white/10 hover:text-foreground rounded-lg cursor-pointer transition-colors text-muted-foreground",
                    item.isActive?.(editor) &&
                      "bg-white/15 text-foreground shadow-sm",
                    getVisibilityClasses(item.visibleFrom).toolbar
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
              )}
            </Fragment>
          ))}
        </div>

        {/* More dropdown - hidden on 2xl when all tools are visible */}
        {hasOverflowItems && (
          <>
            <Separator
              orientation="vertical"
              className="mx-1 bg-white/10 2xl:hidden"
            />
            <DropdownMenu>
              <DropdownMenuTrigger className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg hover:bg-white/10 hover:text-foreground cursor-pointer text-muted-foreground focus-visible:outline-none transition-colors 2xl:hidden">
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
                {ALL_TOOLBAR_ITEMS.filter(
                  (item) => item.component !== "FontSelector"
                ).map((item) => (
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

        {/* Save Status (autosave only - no manual save button) */}
        <div className="relative h-8 flex items-center justify-end min-w-20">
          <AnimatePresence mode="wait">
            {isUpdatingDataStore ? (
              <motion.div
                key="saving"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center gap-1.5 text-muted-foreground"
              >
                <span className="text-xs">Saving…</span>
              </motion.div>
            ) : lastSavedAt ? (
              <motion.div
                key="saved"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center gap-1.5 text-emerald-500"
              >
                <span className="text-xs font-medium">Saved</span>
                <span className="hidden sm:inline font-mono text-[10px] opacity-60 tabular-nums">
                  {formatRelativeTime(lastSavedAt)}
                </span>
              </motion.div>
            ) : null}
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
