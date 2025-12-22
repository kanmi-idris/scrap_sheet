import { Button } from "@/components/ui/button";
import { Attachment } from "@/lib/utils";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "motion/react";
import { AIAttachmentItem } from "./AIAttachmentItem";

interface AIAttachmentsListProps {
  attachments: Attachment[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

/**
 * Attachments preview container
 * Displays grid of attachments with clear-all action
 * Animated entry/exit with height transition
 */
export function AIAttachmentsList({
  attachments,
  onRemove,
  onClearAll,
}: AIAttachmentsListProps) {
  return (
    <AnimatePresence>
      {attachments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-2 overflow-hidden"
        >
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">
                {attachments.length} attachment
                {attachments.length > 1 ? "s" : ""}
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={onClearAll}
                className="text-muted-foreground hover:text-foreground"
              >
                <HugeiconsIcon
                  icon={Delete02Icon}
                  className="h-3 w-3"
                  strokeWidth={2}
                />
              </Button>
            </div>

            {/* Attachment Items */}
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
              {attachments.map((attachment) => (
                <AIAttachmentItem
                  key={attachment.id}
                  attachment={attachment}
                  onRemove={onRemove}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
