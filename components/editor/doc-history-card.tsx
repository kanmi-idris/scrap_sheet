import { SECONDS_IN_MONTH, VERSION_VALIDITY_SECONDS } from "@/lib/constants";
import { useEditorStore } from "@/lib/store/editor-store";
import { cn } from "@/lib/utils";
import { Version } from "@/triplit/schema";
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
  const versionBeingPreviewed = useEditorStore((s) => s.versionBeingPreviewed);
  const setVersionBeingPreviewed = useEditorStore(
    (s) => s.setVersionBeingPreviewed
  );
  const restoreVersion = useEditorStore((s) => s.restoreVersion);

  // Group versions by date (e.g. "Dec 20")
  const groupedHistory = history.reduce((acc, version) => {
    const date = new Date(version.timestamp);
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

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
          {/* Top Action Area - Only visible if version selected */}
          {selectedVersion && (
            <div className="p-3 border-b border-muted-foreground/10 bg-muted/20">
              <button
                onClick={() => {
                  setVersionBeingPreviewed(null);
                  restoreVersion(documentId, selectedVersion);
                }}
                className="w-full py-2 px-3 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
              >
                Restore this version
              </button>
            </div>
          )}

          <div className="p-4 overflow-y-auto flex-1">
            <p className="text-[10px] text-muted-foreground mb-4 leading-tight opacity-70">
              Note: All versions are auto deleted after {validityMonths} months.
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
                          <button
                            key={version.id}
                            onClick={() => setVersionBeingPreviewed(version)}
                            className={cn(
                              "w-full text-left px-3 py-2.5 rounded-xl border transition-all text-sm group flex items-center justify-between",
                              isSelected
                                ? "bg-accent border-primary/50 text-foreground ring-1 ring-primary/20"
                                : "border-muted-foreground/30 hover:bg-muted text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <span className="truncate flex-1 pr-2">
                              {new Date(version.timestamp).toLocaleTimeString(
                                "en-US",
                                { hour: "numeric", minute: "2-digit" }
                              )}
                            </span>
                          </button>
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
