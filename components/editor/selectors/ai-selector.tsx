import { Button } from "@/components/ui/button";
import { MagicWand01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { useEditor } from "novel";

export type AISelectorItem = {
  name: string;
  command: (editor: ReturnType<typeof useEditor>["editor"]) => void;
  icon?: React.ReactNode;
};

const items: AISelectorItem[] = [
  {
    name: "Improve",
    command: (editor) => console.log("Improve Writing triggered"),
  },
  {
    name: "Fix Grammar",
    command: (editor) => console.log("Fix Grammar triggered"),
  },
  {
    name: "Rephrase",
    command: (editor) => console.log("Rephrase triggered"),
  },
  {
    name: "Shorten",
    command: (editor) => console.log("Shorten triggered"),
  },
];

export const AISelector = () => {
  const { editor } = useEditor();
  if (!editor) return null;

  return (
    <div className="flex items-center gap-1 p-1 bg-surface-night/95 backdrop-blur-md rounded-lg border border-white/10 shadow-2xl">
      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-purple-500/10 text-purple-400 mr-1">
        <HugeiconsIcon icon={MagicWand01Icon} className="w-4 h-4" />
      </div>

      {items.map((item, index) => (
        <motion.div
          key={item.name}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05, duration: 0.2 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => item.command(editor)}
            className="h-7 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/10 rounded-md transition-all"
          >
            {item.name}
          </Button>
        </motion.div>
      ))}
    </div>
  );
};
