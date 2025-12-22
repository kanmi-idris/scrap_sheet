"use client";

import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/lib/store/editor-store";
import {
  AiBrain01Icon,
  Edit02Icon,
  MagicWand01Icon,
  SearchAreaIcon,
  TextCheckIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "motion/react";
import { EditorInstance } from "novel";
import { useEffect, useState } from "react";

interface AIAction {
  id: string;
  label: string;
  icon: typeof TextCheckIcon;
  command: (editor: EditorInstance) => void;
}

// ALWAYS visible
const CONSTANT_ACTIONS: AIAction[] = [
  {
    id: "proofread",
    label: "Proofread",
    icon: SearchAreaIcon,
    command: () => {},
  },
  {
    id: "grammar",
    label: "Grammar",
    icon: TextCheckIcon,
    command: () => {},
  },
  {
    id: "paraphrase",
    label: "Paraphrase",
    icon: AiBrain01Icon,
    command: () => {},
  },
];

// only appear when text is highlighted
const CONTEXTUAL_ACTIONS: AIAction[] = [
  {
    id: "improve",
    label: "Improve",
    icon: MagicWand01Icon,
    command: () => {},
  },
  {
    id: "shorten",
    label: "Shorten",
    icon: Edit02Icon,
    command: () => {},
  },
];

export function AIActionToolbar() {
  const editor = useEditorStore((s) => s.editorInstance);
  const [hasSelection, setHasSelection] = useState(false);

  useEffect(() => {
    if (!editor) return;

    const checkSelection = () => {
      setHasSelection(!editor.state.selection.empty);
    };

    // Initial check
    checkSelection();

    editor.on("selectionUpdate", checkSelection);
    editor.on("update", checkSelection);

    return () => {
      editor.off("selectionUpdate", checkSelection);
      editor.off("update", checkSelection);
    };
  }, [editor]);

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

      {/* Constant Actions - Always Visible */}
      {CONSTANT_ACTIONS.map((action) => (
        <Button
          key={action.id}
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 h-9 text-muted-foreground hover:text-foreground hover:bg-surface-night/5 active:bg-surface-night/5 transition-all px-3 rounded-xl cursor-pointer group relative overflow-hidden"
          onClick={() => editor && action.command(editor)}
        >
          <HugeiconsIcon
            icon={action.icon}
            className="size-4 shrink-0 transition-transform group-hover:scale-110"
            strokeWidth={2}
          />
          <span className="text-xs font-medium">{action.label}</span>
        </Button>
      ))}

      {/* Contextual Actions - Only on Selection */}
      <AnimatePresence>
        {hasSelection && (
          <>
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="border-t border-white/5 my-1"
            />
            {CONTEXTUAL_ACTIONS.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  duration: 0.15,
                  delay: index * 0.05,
                  ease: "easeOut",
                }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-3 h-9 text-muted-foreground hover:text-foreground hover:bg-surface-night/5 active:bg-surface-night/5 transition-all px-3 rounded-xl cursor-pointer group relative overflow-hidden"
                  onClick={() => editor && action.command(editor)}
                >
                  <HugeiconsIcon
                    icon={action.icon}
                    className="size-4 shrink-0 transition-transform group-hover:scale-110"
                    strokeWidth={2}
                  />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
