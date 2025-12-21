import {
  MoreVerticalCircle01Icon,
  PencilEdit01Icon,
  Search01Icon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";

export function HeroVisual() {
  return (
    <div className="relative w-full max-w-250 aspect-16/10 mx-auto perspective-[2000px]">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Interface Card - Tilted */}
      <motion.div
        initial={{ rotateX: 20, rotateY: -10, y: 100, opacity: 0 }}
        animate={{ rotateX: 5, rotateY: 0, y: 0, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative w-full h-full bg-background/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Mock Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-2">
            {/* Mac style buttons */}
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
          </div>
          <div className="px-4 py-1.5 rounded-full bg-black/40 border border-white/5 text-[10px] text-muted-foreground font-mono">
            untitled_thought.txt
          </div>
          <HugeiconsIcon
            icon={MoreVerticalCircle01Icon}
            className="w-5 h-5 text-muted-foreground"
          />
        </div>

        {/* Editor Body */}
        <div className="flex-1 p-12 md:p-16 flex flex-col items-center">
          <div className="w-full max-w-2xl space-y-6">
            {/* Title Skeleton */}
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "60%" }}
              transition={{ delay: 0.5, duration: 1 }}
              className="h-10 bg-white/10 rounded-lg w-3/4"
            />

            {/* Paragraph 1 */}
            <div className="space-y-3">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="h-4 bg-white/5 rounded w-full"
              />
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "95%" }}
                transition={{ delay: 0.9, duration: 0.8 }}
                className="h-4 bg-white/5 rounded w-full"
              />
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "80%" }}
                transition={{ delay: 1.0, duration: 0.8 }}
                className="h-4 bg-white/5 rounded w-full"
              />
            </div>

            {/* AI Suggestion - Floating */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="mt-8 p-4 rounded-xl bg-primary/10 border border-primary/20 backdrop-blur-md"
            >
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-md bg-primary/20">
                  <HugeiconsIcon
                    icon={PencilEdit01Icon}
                    className="w-4 h-4 text-primary"
                  />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="h-3 w-1/3 bg-primary/20 rounded" />
                  <div className="h-3 w-3/4 bg-primary/10 rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="p-1.5 rounded bg-green-500/20 text-green-500">
                    <HugeiconsIcon icon={Tick01Icon} className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Floating Elements - 3D Effect */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-12 top-1/4 w-48 p-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-10"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
            <HugeiconsIcon icon={Search01Icon} className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="h-2 w-16 bg-white/20 rounded mb-1" />
            <div className="h-2 w-10 bg-white/10 rounded" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
