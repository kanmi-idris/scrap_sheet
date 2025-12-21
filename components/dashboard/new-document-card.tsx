import { Card } from "@/components/ui/card";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

export function NewDocumentCard() {
  return (
    <Link
      href="/editor/new"
      className="focus:outline-none"
      aria-label="Create a new document"
    >
      <Card className="flex flex-col items-center justify-center h-48 bg-surface-night/10 border border-surface-night/30 hover:bg-surface-highlight/20 transition-all duration-300 cursor-pointer rounded-2xl group focus-visible:ring-2 focus-visible:ring-primary shadow-sm hover:shadow-md hover:scale-[1.02]">
        <HugeiconsIcon
          icon={PlusSignIcon}
          className="size-6 text-muted-foreground group-hover:text-foreground transition-colors -mb-3"
          strokeWidth={2}
          aria-hidden="true"
        />
        <span className="text-muted-foreground group-hover:text-foreground font-medium">
          New Document
        </span>
      </Card>
    </Link>
  );
}
