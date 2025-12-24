"use client";

import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/lib/store/editor-store";
import { cn } from "@/lib/utils";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  MultiplicationSignIcon,
  Tick01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "motion/react";

export function AgenticDiffToolbar() {
  const pendingEdits = useEditorStore((s) => s.pendingEdits);
  const currentEditIndex = useEditorStore((s) => s.currentEditIndex);
  const isAgenticMode = useEditorStore((s) => s.isAgenticMode);
  const initialEditCount = useEditorStore((s) => s.initialEditCount);

  const acceptEdit = useEditorStore((s) => s.acceptEdit);
  const rejectEdit = useEditorStore((s) => s.rejectEdit);
  const acceptAllEdits = useEditorStore((s) => s.acceptAllEdits);
  const rejectAllEdits = useEditorStore((s) => s.rejectAllEdits);
  const navigateEdit = useEditorStore((s) => s.navigateEdit);
  const exitAgenticMode = useEditorStore((s) => s.exitAgenticMode);
  const continueWithPartialEdits = useEditorStore(
    (s) => s.continueWithPartialEdits
  );

  const currentEdit = pendingEdits[currentEditIndex];
  const hasEdits = pendingEdits.length > 0;
  const acceptedCount = initialEditCount - pendingEdits.length;
  const hasPartialAccepts = acceptedCount > 0 && pendingEdits.length > 0;

  return (
    <AnimatePresence>
      {isAgenticMode && hasEdits && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "flex items-center gap-1 p-1.5 rounded-2xl",
            "bg-surface-night/95 backdrop-blur-xl",
            "border border-white/10",
            "shadow-2xl shadow-black/40"
          )}
        >
          {/* Batch Actions */}
          <div className="flex items-center gap-1 pr-2 border-r border-white/10">
            <Button
              variant="ghost"
              size="sm"
              onClick={rejectAllEdits}
              className="h-8 px-3 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl"
            >
              Reject all
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={acceptAllEdits}
              className="h-8 px-3 text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl"
            >
              Accept all
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2 px-2 border-r border-white/10">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateEdit("prev")}
              disabled={pendingEdits.length <= 1}
              className="size-7 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                className="size-4"
                strokeWidth={2}
              />
            </Button>

            <span className="text-xs font-medium text-muted-foreground min-w-16 text-center tabular-nums">
              {currentEditIndex + 1} / {pendingEdits.length}
            </span>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateEdit("next")}
              disabled={pendingEdits.length <= 1}
              className="size-7 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                className="size-4"
                strokeWidth={2}
              />
            </Button>
          </div>

          {/* Current Edit Actions */}
          <div className="flex items-center gap-1 px-2 border-r border-white/10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => currentEdit && rejectEdit(currentEdit.nodeId)}
              disabled={!currentEdit}
              className="h-8 px-3 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl gap-1.5"
            >
              <HugeiconsIcon
                icon={Cancel01Icon}
                className="size-3.5"
                strokeWidth={2}
              />
              Reject
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => currentEdit && acceptEdit(currentEdit.nodeId)}
              disabled={!currentEdit}
              className="h-8 px-3 text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl gap-1.5"
            >
              <HugeiconsIcon
                icon={Tick01Icon}
                className="size-3.5"
                strokeWidth={2}
              />
              Accept
            </Button>
          </div>

          {/* Partial Accept Button - shows when some edits accepted */}
          {hasPartialAccepts && (
            <div className="px-2 border-r border-white/10">
              <Button
                variant="ghost"
                size="sm"
                onClick={continueWithPartialEdits}
                className="h-8 px-3 text-xs font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-xl gap-1.5"
              >
                <HugeiconsIcon
                  icon={Tick02Icon}
                  className="size-3.5"
                  strokeWidth={2}
                />
                Continue with {acceptedCount} change
                {acceptedCount > 1 ? "s" : ""}
              </Button>
            </div>
          )}

          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={exitAgenticMode}
            className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5"
          >
            <HugeiconsIcon
              icon={MultiplicationSignIcon}
              className="size-4"
              strokeWidth={2}
            />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AgenticDiffToolbar;
