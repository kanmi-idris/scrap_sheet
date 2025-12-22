import { Button } from "@/components/ui/button";
import { Attachment } from "@/lib/utils";
import {
  Cancel01Icon,
  File02Icon,
  VoiceIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";

interface AIAttachmentItemProps {
  attachment: Attachment;
  onRemove: (id: string) => void;
}

/**
 * Individual attachment item renderer
 * Handles type-specific icons and previews (image, file, voice, text)
 * Displays metadata with hover-reveal remove button
 */
export function AIAttachmentItem({
  attachment,
  onRemove,
}: AIAttachmentItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative flex items-start gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
    >
      {/* Attachment Icon/Preview */}
      <div className="shrink-0">
        {attachment.type === "image" ? (
          <div className="relative w-12 h-12 rounded-md overflow-hidden bg-black/20">
            <img
              src={attachment.url}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        ) : attachment.type === "voice" ? (
          <div className="w-12 h-12 rounded-md bg-purple-500/20 flex items-center justify-center">
            <HugeiconsIcon
              icon={VoiceIcon}
              className="h-5 w-5 text-purple-400"
              strokeWidth={2}
            />
          </div>
        ) : attachment.type === "text" ? (
          <div className="w-12 h-12 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-mono">
            TXT
          </div>
        ) : (
          <div className="w-12 h-12 rounded-md bg-gray-500/20 flex items-center justify-center">
            <HugeiconsIcon
              icon={File02Icon}
              className="h-5 w-5 text-gray-400"
              strokeWidth={2}
            />
          </div>
        )}
      </div>

      {/* Attachment Details */}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-foreground truncate">
          {attachment.type === "image" && "Image"}
          {attachment.type === "file" && attachment.name}
          {attachment.type === "voice" && "Voice Recording"}
          {attachment.type === "text" && "Text"}
        </div>
        <div className="text-[10px] text-muted-foreground truncate">
          {attachment.type === "image" && attachment.file.name}
          {attachment.type === "file" && attachment.mimeType}
          {attachment.type === "voice" && "Audio/WebM"}
          {attachment.type === "text" &&
            `${attachment.content.length} characters`}
        </div>
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => onRemove(attachment.id)}
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
        aria-label="Remove attachment"
      >
        <HugeiconsIcon
          icon={Cancel01Icon}
          className="h-3 w-3"
          strokeWidth={2}
        />
      </Button>
    </motion.div>
  );
}
