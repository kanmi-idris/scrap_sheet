"use client";

import { cn } from "@/lib/utils";
import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";

type BannerVariant = "warning" | "info";

const variantStyles: Record<BannerVariant, string> = {
  warning:
    "bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-500",
  info: "bg-blue-500/10 border-blue-500/20 text-blue-400",
};

interface EditorBannerProps {
  variant: BannerVariant;
  icon?: IconSvgElement;
  children: React.ReactNode;
  className?: string;
}

/**
 * EditorBanner - Reusable sticky banner for editor states
 *
 * Variants:
 * - `warning`: Yellow - for version preview mode
 * - `info`: Blue - for agentic editing mode
 */
export function EditorBanner({
  variant,
  icon,
  children,
  className,
}: EditorBannerProps) {
  return (
    <div
      className={cn(
        "sticky top-(--header-height,64px) z-20",
        "border-b px-4 py-2 text-center text-sm font-medium backdrop-blur-sm",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-center justify-center gap-2">
        {icon && (
          <HugeiconsIcon icon={icon} className="size-4" strokeWidth={2} />
        )}
        <span>{children}</span>
      </div>
    </div>
  );
}
