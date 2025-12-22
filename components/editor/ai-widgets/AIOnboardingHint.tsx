import { Button } from "@/components/ui/button";
import { SquigglyArrow } from "@/lib/assets/svgs/SquigglyArrow";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "motion/react";

interface AIOnboardingHintProps {
  showHint: boolean;
  onDismiss: () => void;
}

/**
 * Onboarding hint with animated squiggly arrow
 */
export function AIOnboardingHint({
  showHint,
  onDismiss,
}: AIOnboardingHintProps) {
  return (
    <AnimatePresence>
      {showHint && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 5 }}
          transition={{
            type: "spring",
            damping: 12,
            stiffness: 100,
            mass: 0.8,
          }}
          className="absolute -top-52 left-10 -translate-x-1/2 w-80 pointer-events-auto z-50 font-excali bg-transparent"
        >
          <div className="relative">
            {/* Dismiss Button */}
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onDismiss}
              className="absolute -top-2 -right-2 text-muted-foreground hover:text-foreground z-10 hover:bg-transparent"
              aria-label="Dismiss hint"
            >
              <div className="border border-dashed border-muted-foreground/40 rounded-full p-1 bg-background">
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  className="h-3 w-3"
                  strokeWidth={2}
                />
              </div>
            </Button>

            {/* Message Card */}
            <div className="border-2 border-dashed border-muted-foreground/30 rounded-2xl p-5 shadow-sm transform -rotate-1">
              <div
                role="status"
                className="text-lg text-foreground/80 leading-snug space-y-3"
              >
                <p className="font-medium flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  Start here...
                </p>
                <div className="text-base text-muted-foreground space-y-1 pl-1">
                  <p>- Upload files for context</p>
                  <p>- Dictate your ideas</p>
                  <p>- Let AI brainstorm</p>
                </div>
              </div>
            </div>

            {/* Animated Squiggly Arrow */}
            <motion.div
              animate={{
                y: [-4, 4, -4],
                rotate: [-2, 2, -2],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -bottom-14 left-1/2 -translate-x-1/2 text-muted-foreground/50"
              aria-hidden="true"
            >
              <SquigglyArrow dashed className="w-16 h-16 transform rotate-12" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
