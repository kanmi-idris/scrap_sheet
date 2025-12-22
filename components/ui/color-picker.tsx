"use client";

import { buttonVariants } from "@/components/ui/button";
import { DEFAULT_TEXT_COLOR, PRESET_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import {
  PaintBoardIcon,
  ReloadIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
  icon: React.ReactNode;
  title?: string;
  className?: string;
  isActive?: boolean;
}

export function ColorPicker({
  value,
  onChange,
  icon,
  title,
  className,
  isActive,
}: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(
    () => value || DEFAULT_TEXT_COLOR
  );
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) setCustomColor(value || DEFAULT_TEXT_COLOR);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    onChange(newColor);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    // Allow typing, but only update if valid hex
    if (/^#?[0-9A-F]{0,6}$/i.test(text)) {
      setCustomColor(text.startsWith("#") ? text : `#${text}`);
      if (/^#[0-9A-F]{6}$/i.test(text)) {
        onChange(text);
      } else if (/^[0-9A-F]{6}$/i.test(text)) {
        onChange(`#${text}`);
      }
    }
  };

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
                  transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                  className={cn(
                    "bg-surface-night/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-4",
                    "w-70 origin-top-left outline-none"
                  )}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <HugeiconsIcon
                        icon={PaintBoardIcon}
                        className="size-4"
                        strokeWidth={2}
                      />
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        Color
                      </span>
                    </div>
                    {/* Reset Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const def = "#000000";
                        setCustomColor(def);
                        onChange(def);
                      }}
                      className="text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 uppercase tracking-wider font-medium"
                    >
                      Reset{" "}
                      <HugeiconsIcon icon={ReloadIcon} className="size-3" />
                    </button>
                  </div>

                  {/* Preset Colors Grid */}
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          setCustomColor(color);
                          onChange(color);
                        }}
                        className={cn(
                          "relative size-8 rounded-full transition-all duration-200 group",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                          value === color
                            ? "scale-110 shadow-md ring-2 ring-white/20"
                            : "hover:scale-110 hover:ring-2 hover:ring-white/10"
                        )}
                        style={{ backgroundColor: color }}
                        aria-label={`Select color ${color}`}
                      >
                        {value === color && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <HugeiconsIcon
                              icon={Tick02Icon}
                              className="size-4 drop-shadow-md"
                              style={{
                                color:
                                  color === "#ffffff" ||
                                  color === "#f97316" ||
                                  color === "#eab308" ||
                                  color === "#84cc16" ||
                                  color === "#22c55e" ||
                                  color === "#10b981" ||
                                  color === "#14b8a6" ||
                                  color === "#06b6d4" ||
                                  color === "#0ea5e9"
                                    ? "#000000"
                                    : "#ffffff",
                              }}
                              strokeWidth={3}
                            />
                          </motion.div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Custom Color Input */}
                  <div className="pt-3 border-t border-white/10">
                    <div className="flex gap-2">
                      {/* Color Preview & Native Picker Trigger */}
                      <div className="relative flex-none">
                        <input
                          ref={inputRef}
                          type="color"
                          value={
                            /^#[0-9A-F]{6}$/i.test(customColor)
                              ? customColor
                              : "#000000"
                          }
                          onChange={handleCustomColorChange}
                          className="sr-only"
                        />
                        <button
                          type="button"
                          onClick={() => inputRef.current?.click()}
                          className={cn(
                            "size-10 rounded-xl border border-white/10 shadow-inner",
                            "flex items-center justify-center overflow-hidden transition-all hover:border-white/25 active:scale-95",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          )}
                          style={{ backgroundColor: customColor }}
                          aria-label="Pick custom color"
                        >
                          {/* Gradient overlay for effect */}
                          <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent pointer-events-none" />
                        </button>
                      </div>

                      {/* Hex Input */}
                      <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none">
                          <span className="text-muted-foreground text-xs font-mono">
                            #
                          </span>
                        </div>
                        <input
                          type="text"
                          value={customColor.replace("#", "")}
                          onChange={handleHexInputChange}
                          className={cn(
                            "w-full h-10 pl-6 pr-3 rounded-xl bg-surface-night/50 border border-white/10",
                            "text-xs font-mono text-foreground placeholder:text-muted-foreground",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring/50",
                            "transition-all uppercase tracking-wide"
                          )}
                          placeholder="HEX"
                          maxLength={6}
                        />
                      </div>
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
