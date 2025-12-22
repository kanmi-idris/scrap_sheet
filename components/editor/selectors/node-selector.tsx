import {
  ArrowDown01Icon,
  CodeIcon,
  FilesIcon,
  Heading01Icon,
  Heading02Icon,
  Heading03Icon,
  ListViewIcon,
  QuoteDownIcon,
  Task01Icon,
  TextIcon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cx } from "class-variance-authority";
import { useEditor } from "novel";

import { Menu } from "@base-ui/react/menu";

export type SelectorItem = {
  name: string;
  icon: any;
  command: (editor: ReturnType<typeof useEditor>["editor"]) => void;
  isActive: (editor: ReturnType<typeof useEditor>["editor"]) => boolean;
};

const items: SelectorItem[] = [
  {
    name: "Text",
    icon: TextIcon,
    command: (editor) =>
      editor?.chain().focus().toggleNode("paragraph", "paragraph").run(),
    isActive: (editor) =>
      editor
        ? editor.isActive("paragraph") &&
          !editor.isActive("bulletList") &&
          !editor.isActive("orderedList")
        : false,
  },
  {
    name: "Heading 1",
    icon: Heading01Icon,
    command: (editor) =>
      editor?.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: (editor) =>
      editor ? editor.isActive("heading", { level: 1 }) : false,
  },
  {
    name: "Heading 2",
    icon: Heading02Icon,
    command: (editor) =>
      editor?.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: (editor) =>
      editor ? editor.isActive("heading", { level: 2 }) : false,
  },
  {
    name: "Heading 3",
    icon: Heading03Icon,
    command: (editor) =>
      editor?.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: (editor) =>
      editor ? editor.isActive("heading", { level: 3 }) : false,
  },
  {
    name: "To-do List",
    icon: Task01Icon,
    command: (editor) => editor?.chain().focus().toggleTaskList().run(),
    isActive: (editor) => (editor ? editor.isActive("taskItem") : false),
  },
  {
    name: "Bullet List",
    icon: FilesIcon,
    command: (editor) => editor?.chain().focus().toggleBulletList().run(),
    isActive: (editor) => (editor ? editor.isActive("bulletList") : false),
  },
  {
    name: "Numbered List",
    icon: ListViewIcon,
    command: (editor) => editor?.chain().focus().toggleOrderedList().run(),
    isActive: (editor) => (editor ? editor.isActive("orderedList") : false),
  },
  {
    name: "Quote",
    icon: QuoteDownIcon,
    command: (editor) =>
      editor
        ?.chain()
        .focus()
        .toggleNode("paragraph", "paragraph")
        .toggleBlockquote()
        .run(),
    isActive: (editor) => (editor ? editor.isActive("blockquote") : false),
  },
  {
    name: "Code",
    icon: CodeIcon,
    command: (editor) => editor?.chain().focus().toggleCodeBlock().run(),
    isActive: (editor) => (editor ? editor.isActive("codeBlock") : false),
  },
];

interface NodeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NodeSelector = ({ open, onOpenChange }: NodeSelectorProps) => {
  const { editor } = useEditor();
  if (!editor) return null;

  const activeItem = items.filter((item) => item.isActive(editor)).pop() ?? {
    name: "Multiple",
  };

  return (
    <Menu.Root open={open} onOpenChange={onOpenChange}>
      <Menu.Trigger className="gap-2 rounded-none border-none hover:bg-accent focus:ring-0 flex items-center p-2 text-sm font-medium">
        <span className="whitespace-nowrap">{activeItem.name}</span>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          className="h-4 w-4"
          strokeWidth={2}
        />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="start" sideOffset={5}>
          <Menu.Popup className="w-48 p-1 rounded-md border bg-popover shadow-md outline-none">
            {items.map((item, index) => (
              <Menu.Item
                key={index}
                className={cx(
                  "flex cursor-pointer items-center justify-between rounded-sm px-2 py-1 text-sm hover:bg-accent outline-none data-highlighted:bg-accent",
                  activeItem.name === item.name && "bg-accent"
                )}
                onClick={() => {
                  item.command(editor);
                  onOpenChange(false);
                }}
              >
                <div className="flex items-center space-x-2">
                  <div className="rounded-sm border p-1">
                    <HugeiconsIcon
                      icon={item.icon}
                      className="h-3 w-3"
                      strokeWidth={2}
                    />
                  </div>
                  <span>{item.name}</span>
                </div>
                {activeItem.name === item.name && (
                  <HugeiconsIcon
                    icon={Tick01Icon}
                    className="h-4 w-4"
                    strokeWidth={2}
                  />
                )}
              </Menu.Item>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
};
