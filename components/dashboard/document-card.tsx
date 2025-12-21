import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/utils";
import { Document } from "@/triplit/schema";
import { Delete02Icon, File01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

interface DocumentCardProps {
  document: Document;
  onDelete: (id: string) => void;
}

export function DocumentCard({ document, onDelete }: DocumentCardProps) {
  return (
    <Link href={`/editor/${document.id}`}>
      <Card className="group relative flex flex-col justify-between p-4 h-48 bg-surface-night/10 border border-surface-night/30 hover:bg-surface-highlight/20 transition-all duration-300 cursor-pointer rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02]">
        {/* icon and delete button */}
        <div className="flex justify-between items-start">
          <HugeiconsIcon
            icon={File01Icon}
            className="size-5 text-muted-foreground"
            strokeWidth={1.5}
          />
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-red-500/60 hover:bg-red-500/5 transition-colors"
            aria-label={`Delete document: ${document.title}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(document.id);
            }}
          >
            <HugeiconsIcon
              icon={Delete02Icon}
              className="size-5"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <span className="sr-only">Delete {document.title}</span>
          </Button>
        </div>

        {/* title, preview and date */}
        <div>
          <h3 className="font-medium text-foreground mb-1 line-clamp-1">
            {document.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {document.preview}
          </p>
          <p className="text-xs text-muted-foreground/40">
            Edited {formatRelativeTime(document.lastModified)}
          </p>
        </div>
      </Card>
    </Link>
  );
}
