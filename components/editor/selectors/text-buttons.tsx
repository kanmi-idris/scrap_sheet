import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CodeIcon,
  TextBoldIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
  TextUnderlineIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { EditorBubbleItem, useEditor } from "novel";
import type { SelectorItem } from "./node-selector";

export const TextButtons = () => {
  const { editor } = useEditor();
  if (!editor) return null;

  const items: SelectorItem[] = [
    {
      name: "bold",
      isActive: (editor) => (editor ? editor.isActive("bold") : false),
      command: (editor) => editor?.chain().focus().toggleBold().run(),
      icon: TextBoldIcon,
    },
    {
      name: "italic",
      isActive: (editor) => (editor ? editor.isActive("italic") : false),
      command: (editor) => editor?.chain().focus().toggleItalic().run(),
      icon: TextItalicIcon,
    },
    {
      name: "underline",
      isActive: (editor) => (editor ? editor.isActive("underline") : false),
      command: (editor) => editor?.chain().focus().toggleUnderline().run(),
      icon: TextUnderlineIcon,
    },
    {
      name: "strike",
      isActive: (editor) => (editor ? editor.isActive("strike") : false),
      command: (editor) => editor?.chain().focus().toggleStrike().run(),
      icon: TextStrikethroughIcon,
    },
    {
      name: "code",
      isActive: (editor) => (editor ? editor.isActive("code") : false),
      command: (editor) => editor?.chain().focus().toggleCode().run(),
      icon: CodeIcon,
    },
  ];

  return (
    <div className="flex">
      {items.map((item, index) => (
        <EditorBubbleItem
          key={index}
          onSelect={(editor) => {
            item.command(editor);
          }}
        >
          <Button size="icon" className="rounded-none w-8 h-8" variant="ghost">
            <HugeiconsIcon
              icon={item.icon}
              className={cn("h-4 w-4", {
                "text-blue-500": item.isActive(editor),
              })}
              strokeWidth={2}
            />
          </Button>
        </EditorBubbleItem>
      ))}
    </div>
  );
};
