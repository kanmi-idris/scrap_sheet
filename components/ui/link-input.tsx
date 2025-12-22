"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { AnimatePresence, motion } from "motion/react";
import { EditorInstance } from "novel";
import React from "react";

interface LinkInputProps {
  editor: EditorInstance | null;
  icon: React.ReactNode;
  title?: string;
  className?: string;
  isActive?: boolean;
}

export function LinkInput({
  editor,
  icon,
  title,
  className,
  isActive,
}: LinkInputProps) {
  const [url, setUrl] = React.useState("");
  const [text, setText] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const urlInputRef = React.useRef<HTMLInputElement>(null);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    if (open && editor) {
      // Get current link attributes if editing existing link
      const previousUrl = editor.getAttributes("link").href || "";
      setUrl(previousUrl);

      // Get selected text
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to, " ");
      setText(selectedText);

      // Wait until the popup is painted
      requestAnimationFrame(() => urlInputRef.current?.focus());
    }
  };

  const handleInsert = () => {
    if (!editor) return;

    if (url === "") {
      // Remove link
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      const { from, to } = editor.state.selection;
      const hasSelection = from !== to;

      if (hasSelection) {
        // If text is selected, apply link to selection
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: url })
          .run();
      } else if (text.trim()) {
        // If no selection but text is provided, insert text with link
        editor
          .chain()
          .focus()
          .insertContent({
            type: "text",
            text: text,
            marks: [{ type: "link", attrs: { href: url } }],
          })
          .run();
      } else {
        // If no selection and no text, insert URL as text with link
        editor
          .chain()
          .focus()
          .insertContent({
            type: "text",
            text: url,
            marks: [{ type: "link", attrs: { href: url } }],
          })
          .run();
      }
    }

    setUrl("");
    setText("");
    setIsOpen(false);
  };

  const handleRemoveLink = () => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setUrl("");
    setText("");
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();

    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleInsert();
    }
  };

  const isEditingExistingLink = editor?.isActive("link");

  return (
    <MenuPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
      <MenuPrimitive.Trigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "h-8 w-8",
          isActive && "bg-white/15 text-foreground shadow-sm",
          className
        )}
        title={title}
      >
        {icon}
      </MenuPrimitive.Trigger>

      <MenuPrimitive.Portal>
        <MenuPrimitive.Positioner
          className="isolate z-50 outline-none"
          align="start"
          side="bottom"
          sideOffset={8}
        >
          <AnimatePresence>
            {isOpen && (
              <MenuPrimitive.Popup>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className={cn(
                    "bg-surface-night/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl p-4",
                    "w-96 origin-(--transform-origin) outline-none"
                  )}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* URL Input */}
                  <div className="mb-3">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      URL
                    </label>
                    <input
                      ref={urlInputRef}
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="https://example.com"
                      className={cn(
                        "w-full h-9 px-3 py-2 rounded-md bg-surface-night/50 border border-white/10",
                        "text-sm text-foreground placeholder:text-muted-foreground",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        "transition-all"
                      )}
                    />
                  </div>

                  {/* Text Input (optional) */}
                  <div className="mb-3">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      Link Text (optional)
                    </label>
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Link text"
                      className={cn(
                        "w-full h-9 px-3 py-2 rounded-md bg-surface-night/50 border border-white/10",
                        "text-sm text-foreground placeholder:text-muted-foreground",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        "transition-all"
                      )}
                    />
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      {editor?.state.selection.empty
                        ? "Enter text or it will use the URL"
                        : "Using selected text from editor"}
                    </p>
                  </div>

                  <p className="text-[10px] text-muted-foreground mb-3 pb-3 border-b border-white/10">
                    Press{" "}
                    <kbd className="px-1 py-0.5 bg-white/5 rounded border border-white/10">
                      ⌘
                    </kbd>{" "}
                    +{" "}
                    <kbd className="px-1 py-0.5 bg-white/5 rounded border border-white/10">
                      Enter
                    </kbd>{" "}
                    to insert
                  </p>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2">
                    {isEditingExistingLink && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveLink}
                        className="h-8 px-3 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        Remove Link
                      </Button>
                    )}
                    <div className="flex items-center gap-2 ml-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsOpen(false)}
                        className="h-8 px-3 text-xs hover:bg-white/5"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleInsert}
                        disabled={!url.trim()}
                        className="h-8 px-3 text-xs bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isEditingExistingLink ? "Update Link" : "Insert Link"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </MenuPrimitive.Popup>
            )}
          </AnimatePresence>
        </MenuPrimitive.Positioner>
      </MenuPrimitive.Portal>
    </MenuPrimitive.Root>
  );
}
