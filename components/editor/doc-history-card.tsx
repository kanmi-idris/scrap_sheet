import { Button } from "@/components/ui/button";
import { SECONDS_IN_MONTH, VERSION_VALIDITY_SECONDS } from "@/lib/constants";
import { useEditorStore } from "@/lib/store/editor-store";
import {
  cn,
  formatDateShort,
  formatRelativeTime,
  formatTime12Hour,
} from "@/lib/utils";
import { Version } from "@/triplit/schema";
import { Close } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "motion/react";

interface DocHistoryCardProps {
  documentId: string;
  history?: Version[];
}

export function DocHistoryCard({
  documentId,
  history = [],
}: DocHistoryCardProps) {
  const isHistoryOpen = useEditorStore((s) => s.isHistoryOpen);
  const setIsHistoryOpen = useEditorStore((s) => s.setIsHistoryOpen);
  const versionBeingPreviewed = useEditorStore((s) => s.versionBeingPreviewed);
  const setVersionBeingPreviewed = useEditorStore(
    (s) => s.setVersionBeingPreviewed
  );
  const restoreVersion = useEditorStore((s) => s.restoreVersion);

  // Group versions by date (e.g. "Dec 20")
  const groupedHistory = history.reduce((acc, version) => {
    const dateStr = formatDateShort(version.timestamp);

    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(version);
    return acc;
  }, {} as Record<string, Version[]>);

  // Find selected version object
  const selectedVersion = history.find(
    (v) => v.id === versionBeingPreviewed?.id
  );

  const validityMonths = Math.floor(
    VERSION_VALIDITY_SECONDS / SECONDS_IN_MONTH
  );

  return (
    <AnimatePresence>
      {isHistoryOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed right-6 top-24 w-72 max-h-[calc(100vh-176px)] flex flex-col rounded-2xl border border-muted-foreground/30 bg-background shadow-lg z-50 overflow-hidden"
        >
          {/* Header with Close Button */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-muted-foreground/10">
            <h2 className="text-sm font-semibold">Version History</h2>
            <Button
              onClick={() => setIsHistoryOpen(false)}
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close version history"
            >
              <HugeiconsIcon
                icon={Close}
                className="size-4"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </Button>
          </div>

          {/* Top Action Area - Only visible if version selected */}
          {selectedVersion && (
            <div className="p-3 border-b border-muted-foreground/10 bg-muted/20">
              <Button
                onClick={() => {
                  setVersionBeingPreviewed(null);
                  restoreVersion(documentId, selectedVersion);
                }}
                className="w-full"
                size="default"
                variant="default"
              >
                Restore this version
              </Button>
            </div>
          )}

          <div className="p-4 overflow-y-auto flex-1">
            <p className="text-[10px] text-muted-foreground mb-4 leading-tight opacity-70">
              Note: All versions older than {validityMonths} months are auto
              deleted.
            </p>

            <div className="space-y-5">
              {Object.entries(groupedHistory).length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No versions yet
                </p>
              ) : (
                Object.entries(groupedHistory).map(([date, versions]) => (
                  <div key={date}>
                    <h3 className="text-xs font-medium text-muted-foreground mb-3 pl-1">
                      {date}
                    </h3>
                    <div className="space-y-2">
                      {versions.map((version) => {
                        const isSelected =
                          versionBeingPreviewed?.id === version.id;
                        return (
                          <Button
                            key={version.id}
                            onClick={() => setVersionBeingPreviewed(version)}
                            variant="ghost"
                            className={cn(
                              "w-full justify-start px-3 py-2.5 h-auto rounded-xl border transition-all text-sm flex-col items-start gap-0.5",
                              isSelected
                                ? "bg-primary/10 border-primary/40 text-foreground ring-1 ring-primary/30"
                                : "border-white/10 hover:bg-white/5 hover:border-white/20 text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <span className="truncate w-full text-left font-medium">
                              {formatTime12Hour(version.timestamp)}
                            </span>
                            <span className="text-xs opacity-60 truncate w-full text-left">
                              {formatRelativeTime(version.timestamp)}
                            </span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
