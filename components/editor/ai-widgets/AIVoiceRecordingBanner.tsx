import { Button } from "@/components/ui/button";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "motion/react";

interface AIVoiceRecordingBannerProps {
  isRecording: boolean;
  onCancel: () => void;
}

/**
 * Voice recording status banner
 * Displays pulsing red indicator during active recording
 * Provides cancel action to abort recording
 */
export function AIVoiceRecordingBanner({
  isRecording,
  onCancel,
}: AIVoiceRecordingBannerProps) {
  return (
    <AnimatePresence>
      {isRecording && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-2"
        >
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-red-500"
              />
              <span className="text-sm font-medium text-red-400">
                Recording...
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onCancel}
              className="text-red-400 hover:text-red-300"
            >
              <HugeiconsIcon
                icon={Cancel01Icon}
                className="h-3 w-3"
                strokeWidth={2}
              />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
