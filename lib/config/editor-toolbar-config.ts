"use client";

import {
  ArrowTurnBackwardIcon,
  ArrowTurnForwardIcon,
  CheckListIcon,
  CodeIcon,
  FunctionIcon,
  GridTableIcon,
  Heading01Icon,
  Heading02Icon,
  Heading03Icon,
  LeftToRightListBulletIcon,
  LeftToRightListNumberIcon,
  Link01Icon,
  PaintBoardIcon,
  QuoteDownIcon,
  TextAlignCenterIcon,
  TextAlignJustifyLeftIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  TextBoldIcon,
  TextColorIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
  TextSubscriptIcon,
  TextSuperscriptIcon,
  TextUnderlineIcon,
} from "@hugeicons/core-free-icons";

type IconDefinition = any;

export interface ToolbarItem {
  id: string;
  label: string;
  icon: IconDefinition;
  action: (editor: any) => void;
  isActive?: (editor: any) => boolean;
  disabled?: (editor: any) => boolean;
}

export interface ToolbarGroup {
  id: string;
  items: ToolbarItem[];
}

export const TOOLBAR_GROUPS: ToolbarGroup[] = [
  {
    id: "history",
    items: [
      {
        id: "undo",
        label: "Undo",
        icon: ArrowTurnBackwardIcon,
        action: (e) => e?.chain().focus().undo().run(),
        disabled: (e) => !e?.can().undo(),
      },
      {
        id: "redo",
        label: "Redo",
        icon: ArrowTurnForwardIcon,
        action: (e) => e?.chain().focus().redo().run(),
        disabled: (e) => !e?.can().redo(),
      },
    ],
  },
  {
    id: "formatting",
    items: [
      {
        id: "bold",
        label: "Bold",
        icon: TextBoldIcon,
        action: (e) => e?.chain().focus().toggleBold().run(),
        isActive: (e) => e?.isActive("bold"),
      },
      {
        id: "italic",
        label: "Italic",
        icon: TextItalicIcon,
        action: (e) => e?.chain().focus().toggleItalic().run(),
        isActive: (e) => e?.isActive("italic"),
      },
      {
        id: "underline",
        label: "Underline",
        icon: TextUnderlineIcon,
        action: (e) => e?.chain().focus().toggleUnderline().run(),
        isActive: (e) => e?.isActive("underline"),
      },
      {
        id: "strike",
        label: "Strikethrough",
        icon: TextStrikethroughIcon,
        action: (e) => e?.chain().focus().toggleStrike().run(),
        isActive: (e) => e?.isActive("strike"),
      },
      {
        id: "highlight",
        label: "Highlight",
        icon: PaintBoardIcon,
        action: (e) => e?.chain().focus().toggleHighlight().run(),
        isActive: (e) => e?.isActive("highlight"),
      },
      {
        id: "textColor",
        label: "Text Color",
        icon: TextColorIcon,
        action: (e) => {
          const color = window.prompt("Enter color (hex or name):", "#ff0000");
          if (color) {
            e?.chain().focus().setColor(color).run();
          }
        },
        isActive: () => false,
      },
      {
        id: "superscript",
        label: "Superscript",
        icon: TextSuperscriptIcon,
        action: (e) => e?.chain().focus().toggleSuperscript().run(),
        isActive: (e) => e?.isActive("superscript"),
      },
      {
        id: "subscript",
        label: "Subscript",
        icon: TextSubscriptIcon,
        action: (e) => e?.chain().focus().toggleSubscript().run(),
        isActive: (e) => e?.isActive("subscript"),
      },
    ],
  },
  {
    id: "headings",
    items: [
      {
        id: "h1",
        label: "Heading 1",
        icon: Heading01Icon,
        action: (e) => e?.chain().focus().toggleHeading({ level: 1 }).run(),
        isActive: (e) => e?.isActive("heading", { level: 1 }),
      },
      {
        id: "h2",
        label: "Heading 2",
        icon: Heading02Icon,
        action: (e) => e?.chain().focus().toggleHeading({ level: 2 }).run(),
        isActive: (e) => e?.isActive("heading", { level: 2 }),
      },
      {
        id: "h3",
        label: "Heading 3",
        icon: Heading03Icon,
        action: (e) => e?.chain().focus().toggleHeading({ level: 3 }).run(),
        isActive: (e) => e?.isActive("heading", { level: 3 }),
      },
      {
        id: "table",
        label: "Insert Table",
        icon: GridTableIcon,
        action: (e) =>
          e
            ?.chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run(),
        isActive: (e) => e?.isActive("table"),
      },
    ],
  },
  {
    id: "insert",
    items: [
      {
        id: "link",
        label: "Link",
        icon: Link01Icon,
        action: (e) => {
          const previousUrl = e?.getAttributes("link").href;
          const url = window.prompt("URL", previousUrl);
          if (url === null) return;
          if (url === "") {
            e?.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
          }
          e?.chain()
            .focus()
            .extendMarkRange("link")
            .setLink({ href: url })
            .run();
        },
        isActive: (e) => e?.isActive("link"),
      },
      {
        id: "math",
        label: "Math Formula",
        icon: FunctionIcon,
        action: (e) => {
          const latex = window.prompt("Enter LaTeX formula:", "E = mc^2");
          if (latex) {
            e?.chain().focus().insertInlineMath({ latex }).run();
          }
        },
        isActive: (e) => e?.isActive("inlineMath"),
      },
    ],
  },
  {
    id: "alignment",
    items: [
      {
        id: "alignLeft",
        label: "Align Left",
        icon: TextAlignLeftIcon,
        action: (e) => e?.chain().focus().setTextAlign("left").run(),
        isActive: (e) => e?.isActive({ textAlign: "left" }),
      },
      {
        id: "alignCenter",
        label: "Align Center",
        icon: TextAlignCenterIcon,
        action: (e) => e?.chain().focus().setTextAlign("center").run(),
        isActive: (e) => e?.isActive({ textAlign: "center" }),
      },
      {
        id: "alignRight",
        label: "Align Right",
        icon: TextAlignRightIcon,
        action: (e) => e?.chain().focus().setTextAlign("right").run(),
        isActive: (e) => e?.isActive({ textAlign: "right" }),
      },
      {
        id: "alignJustify",
        label: "Justify",
        icon: TextAlignJustifyLeftIcon,
        action: (e) => e?.chain().focus().setTextAlign("justify").run(),
        isActive: (e) => e?.isActive({ textAlign: "justify" }),
      },
    ],
  },
  {
    id: "blocks",
    items: [
      {
        id: "bulletList",
        label: "Bullet List",
        icon: LeftToRightListBulletIcon,
        action: (e) => e?.chain().focus().toggleBulletList().run(),
        isActive: (e) => e?.isActive("bulletList"),
      },
      {
        id: "orderedList",
        label: "Numbered List",
        icon: LeftToRightListNumberIcon,
        action: (e) => e?.chain().focus().toggleOrderedList().run(),
        isActive: (e) => e?.isActive("orderedList"),
      },
      {
        id: "blockquote",
        label: "Quote",
        icon: QuoteDownIcon,
        action: (e) => e?.chain().focus().toggleBlockquote().run(),
        isActive: (e) => e?.isActive("blockquote"),
      },
      {
        id: "codeBlock",
        label: "Code Block",
        icon: CodeIcon,
        action: (e) => e?.chain().focus().toggleCodeBlock().run(),
        isActive: (e) => e?.isActive("codeBlock"),
      },
      {
        id: "taskList",
        label: "Task List",
        icon: CheckListIcon,
        action: (e) => e?.chain().focus().toggleTaskList().run(),
        isActive: (e) => e?.isActive("taskList"),
      },
    ],
  },
];
