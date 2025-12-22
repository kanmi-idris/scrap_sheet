"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { PRESET_FORMULAS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect } from "react";

interface MathInputProps {
  onInsert: (latex: string) => void;
  icon: React.ReactNode;
  title?: string;
  className?: string;
  isActive?: boolean;
}

export function MathInput({
  onInsert,
  icon,
  title,
  className,
  isActive,
}: MathInputProps) {
  const [latex, setLatex] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const handleInsert = () => {
    if (latex.trim()) {
      onInsert(latex.trim());
      setLatex("");
      setIsOpen(false);
    }
  };

  const handlePresetClick = (presetLatex: string) => {
    setLatex(presetLatex);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent menu from closing on keyboard events
    e.stopPropagation();

    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleInsert();
    }
  };

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <MenuPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
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
                  {/* Header */}
                  <div className="mb-3">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      LaTeX Formula
                    </label>
                    <textarea
                      ref={inputRef}
                      value={latex}
                      onChange={(e) => setLatex(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="E = mc^2"
                      className={cn(
                        "w-full h-24 px-3 py-2 rounded-md bg-surface-night/50 border border-white/10",
                        "text-sm font-mono text-foreground placeholder:text-muted-foreground",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        "transition-all resize-none"
                      )}
                    />
                    <p className="text-[10px] text-muted-foreground mt-1.5">
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
                  </div>

                  {/* Preset Formulas */}
                  <div className="border-t border-white/10 pt-3">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      Common Formulas
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto scrollbar-hide">
                      {PRESET_FORMULAS.map((formula) => (
                        <button
                          key={formula.latex}
                          type="button"
                          onClick={() => handlePresetClick(formula.latex)}
                          className={cn(
                            "px-2 py-1.5 rounded-md text-xs font-medium transition-all text-left",
                            "bg-surface-night/50 hover:bg-white/10 border border-white/5 hover:border-white/20",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            latex === formula.latex &&
                              "bg-white/15 border-white/30"
                          )}
                        >
                          <div className="text-foreground truncate">
                            {formula.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-white/10">
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
                      disabled={!latex.trim()}
                      className="h-8 px-3 text-xs bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Insert Formula
                    </Button>
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
