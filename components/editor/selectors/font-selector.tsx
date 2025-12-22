"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FONTS } from "@/lib/constants";
import { useEditorStore } from "@/lib/store/editor-store";

export function FontSelector() {
  const fontFamily = useEditorStore((s) => s.fontFamily);
  const setFontFamily = useEditorStore((s) => s.setFontFamily);

  const currentFontName =
    FONTS.find((f) => f.value === fontFamily)?.name || "Select Font";

  const handleFontChange = (newValue: string | null) => {
    if (newValue) {
      setFontFamily(newValue);
    }
  };

  return (
    <Select value={fontFamily} onValueChange={handleFontChange}>
      <SelectTrigger className="h-8 w-24 shrink-0 border-white/10 shadow-none text-xs focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer truncate rounded-lg mr-2">
        <SelectValue>{currentFontName}</SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-surface-night border-white/10">
        {FONTS.map((font) => (
          <SelectItem
            key={font.value}
            value={font.value}
            className="cursor-pointer focus:bg-white/10 focus:text-foreground text-xs"
          >
            <span style={{ fontFamily: font.value }}>{font.name}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
