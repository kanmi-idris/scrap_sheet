"use client";

import { Button } from "@/components/ui/button";
import {
  AiBrain01Icon,
  Edit02Icon,
  TextCheckIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";

interface AIAction {
  id: string;
  label: string;
  icon: typeof TextCheckIcon;
}

const AI_ACTIONS: AIAction[] = [
  { id: "proofread", label: "Proofread", icon: TextCheckIcon },
  { id: "grammar", label: "Fix Grammar", icon: Edit02Icon },
  { id: "paraphrase", label: "Paraphrase", icon: AiBrain01Icon },
];

export function AIActionToolbar() {
  const onAction = (actionId: string) => {
    console.log("AI action:", actionId);
  };
  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className="flex flex-col gap-1 p-1.5 rounded-2xl bg-surface-night/10 backdrop-blur-xl border border-white/5 shadow-xl shadow-black/20 min-w-32"
    >
      <div className="px-2 py-1.5 mb-1 border-b border-white/5">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          AI Tools
        </span>
      </div>
      {AI_ACTIONS.map((action, i) => (
        <div key={action.id}>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 h-9 text-muted-foreground hover:text-foreground hover:bg-surface-night/5 active:bg-surface-night/5 transition-all px-3 rounded-xl cursor-pointer group relative overflow-hidden"
            onClick={() => onAction(action.id)}
          >
            <HugeiconsIcon
              icon={action.icon}
              className="size-4 shrink-0 transition-transform group-hover:scale-110"
              strokeWidth={2}
            />
            <span className="text-xs font-medium">{action.label}</span>
          </Button>
        </div>
      ))}
    </motion.div>
  );
}
