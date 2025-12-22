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
import type { IconSvgElement } from "@hugeicons/react";
import type { EditorInstance } from "novel";

type IconDefinition = IconSvgElement;
export type ToolbarBreakpoint = "always" | "sm" | "md" | "lg" | "xl" | "2xl";

export interface ToolbarItem {
  id: string;
  label: string;
  icon: IconDefinition;
  action: (editor: EditorInstance | null) => void;
  isActive?: (editor: EditorInstance | null) => boolean;
  disabled?: (editor: EditorInstance | null) => boolean;
  visibleFrom?: ToolbarBreakpoint;
  component?: string;
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
        visibleFrom: "lg",
      },
      {
        id: "redo",
        label: "Redo",
        icon: ArrowTurnForwardIcon,
        action: (e) => e?.chain().focus().redo().run(),
        disabled: (e) => !e?.can().redo(),
        visibleFrom: "lg",
      },
    ],
  },
  {
    id: "font",
    items: [
      {
        id: "fontFamily",
        label: "Font Family",
        icon: TextBoldIcon,
        action: () => {},
        isActive: () => false,
        visibleFrom: "always",
        component: "FontSelector",
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
        isActive: (e) => !!e?.isActive("bold"),
        visibleFrom: "always",
      },
      {
        id: "italic",
        label: "Italic",
        icon: TextItalicIcon,
        action: (e) => e?.chain().focus().toggleItalic().run(),
        isActive: (e) => !!e?.isActive("italic"),
        visibleFrom: "always",
      },
      {
        id: "underline",
        label: "Underline",
        icon: TextUnderlineIcon,
        action: (e) => e?.chain().focus().toggleUnderline().run(),
        isActive: (e) => !!e?.isActive("underline"),
        visibleFrom: "md",
      },
      {
        id: "strike",
        label: "Strikethrough",
        icon: TextStrikethroughIcon,
        action: (e) => e?.chain().focus().toggleStrike().run(),
        isActive: (e) => !!e?.isActive("strike"),
        visibleFrom: "lg",
      },
      {
        id: "highlight",
        label: "Highlight",
        icon: PaintBoardIcon,
        action: (e) => e?.chain().focus().toggleHighlight().run(),
        isActive: (e) => !!e?.isActive("highlight"),
        visibleFrom: "lg",
      },
      {
        id: "textColor",
        label: "Text Color",
        icon: TextColorIcon,
        action: (e) => {},
        isActive: () => false,
        visibleFrom: "lg",
        component: "ColorPicker",
      },
      {
        id: "superscript",
        label: "Superscript",
        icon: TextSuperscriptIcon,
        action: (e) => e?.chain().focus().toggleSuperscript().run(),
        isActive: (e) => !!e?.isActive("superscript"),
        visibleFrom: "lg",
      },
      {
        id: "subscript",
        label: "Subscript",
        icon: TextSubscriptIcon,
        action: (e) => e?.chain().focus().toggleSubscript().run(),
        isActive: (e) => !!e?.isActive("subscript"),
        visibleFrom: "lg",
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
        isActive: (e) => !!e?.isActive("heading", { level: 1 }),
        visibleFrom: "sm",
      },
      {
        id: "h2",
        label: "Heading 2",
        icon: Heading02Icon,
        action: (e) => e?.chain().focus().toggleHeading({ level: 2 }).run(),
        isActive: (e) => !!e?.isActive("heading", { level: 2 }),
        visibleFrom: "sm",
      },
      {
        id: "h3",
        label: "Heading 3",
        icon: Heading03Icon,
        action: (e) => e?.chain().focus().toggleHeading({ level: 3 }).run(),
        isActive: (e) => !!e?.isActive("heading", { level: 3 }),
        visibleFrom: "md",
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
        isActive: (e) => !!e?.isActive("table"),
        visibleFrom: "xl",
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
        action: () => {},
        isActive: (e) => !!e?.isActive("link"),
        visibleFrom: "md",
        component: "LinkInput",
      },
      {
        id: "math",
        label: "Math Formula",
        icon: FunctionIcon,
        action: () => {},
        isActive: (e) => !!e?.isActive("inlineMath"),
        visibleFrom: "lg",
        component: "MathInput",
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
        isActive: (e) => !!e?.isActive({ textAlign: "left" }),
        visibleFrom: "xl",
      },
      {
        id: "alignCenter",
        label: "Align Center",
        icon: TextAlignCenterIcon,
        action: (e) => e?.chain().focus().setTextAlign("center").run(),
        isActive: (e) => !!e?.isActive({ textAlign: "center" }),
        visibleFrom: "xl",
      },
      {
        id: "alignRight",
        label: "Align Right",
        icon: TextAlignRightIcon,
        action: (e) => e?.chain().focus().setTextAlign("right").run(),
        isActive: (e) => !!e?.isActive({ textAlign: "right" }),
        visibleFrom: "xl",
      },
      {
        id: "alignJustify",
        label: "Justify",
        icon: TextAlignJustifyLeftIcon,
        action: (e) => e?.chain().focus().setTextAlign("justify").run(),
        isActive: (e) => !!e?.isActive({ textAlign: "justify" }),
        visibleFrom: "xl",
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
        isActive: (e) => !!e?.isActive("bulletList"),
        visibleFrom: "sm",
      },
      {
        id: "orderedList",
        label: "Numbered List",
        icon: LeftToRightListNumberIcon,
        action: (e) => e?.chain().focus().toggleOrderedList().run(),
        isActive: (e) => !!e?.isActive("orderedList"),
        visibleFrom: "sm",
      },
      {
        id: "blockquote",
        label: "Quote",
        icon: QuoteDownIcon,
        action: (e) => e?.chain().focus().toggleBlockquote().run(),
        isActive: (e) => !!e?.isActive("blockquote"),
        visibleFrom: "lg",
      },
      {
        id: "codeBlock",
        label: "Code Block",
        icon: CodeIcon,
        action: (e) => e?.chain().focus().toggleCodeBlock().run(),
        isActive: (e) => !!e?.isActive("codeBlock"),
        visibleFrom: "2xl",
      },
      {
        id: "taskList",
        label: "Task List",
        icon: CheckListIcon,
        action: (e) => e?.chain().focus().toggleTaskList().run(),
        isActive: (e) => !!e?.isActive("taskList"),
        visibleFrom: "lg",
      },
    ],
  },
];

export interface FlatToolbarItem extends ToolbarItem {
  groupId: string;
  isFirstInGroup: boolean;
}

export const ALL_TOOLBAR_ITEMS: FlatToolbarItem[] = TOOLBAR_GROUPS.flatMap(
  (group, groupIndex) =>
    group.items.map((item, itemIndex) => ({
      ...item,
      groupId: group.id,
      isFirstInGroup: itemIndex === 0 && groupIndex > 0,
    }))
);

// O(1) lookup
const VISIBILITY_CLASSES: Record<
  ToolbarBreakpoint,
  { toolbar: string; dropdown: string }
> = {
  always: { toolbar: "flex", dropdown: "hidden" },
  sm: { toolbar: "hidden sm:flex", dropdown: "sm:hidden" },
  md: { toolbar: "hidden md:flex", dropdown: "md:hidden" },
  lg: { toolbar: "hidden lg:flex", dropdown: "lg:hidden" },
  xl: { toolbar: "hidden xl:flex", dropdown: "xl:hidden" },
  "2xl": { toolbar: "hidden 2xl:flex", dropdown: "2xl:hidden" },
};

export const getVisibilityClasses = (
  breakpoint: ToolbarBreakpoint = "always"
) => VISIBILITY_CLASSES[breakpoint] ?? VISIBILITY_CLASSES["always"];

export const getOverflowItems = (
  currentBreakpoint: ToolbarBreakpoint
): FlatToolbarItem[] => {
  const breakpointOrder: ToolbarBreakpoint[] = [
    "always",
    "sm",
    "md",
    "lg",
    "xl",
    "2xl",
  ];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);

  return ALL_TOOLBAR_ITEMS.filter((item) => {
    const itemBreakpoint = item.visibleFrom || "2xl";
    const itemIndex = breakpointOrder.indexOf(itemBreakpoint);
    return itemIndex > currentIndex;
  });
};
