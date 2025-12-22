"use client";

import { Card } from "@/components/ui/card";
import { triplit } from "@/triplit/client";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function NewDocumentCard() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateDocument = async () => {
    if (isCreating) return;
    setIsCreating(true);

    try {
      let documentId: string | undefined;

      await triplit.transact(async (tx) => {
        const newDoc = await tx.insert("documents", {
          title: "Untitled Document",
          preview: "Start writing...",
          createdAt: new Date(),
          lastModified: new Date(),
        });

        documentId = newDoc.id;

        await tx.insert("versions", {
          documentId: newDoc.id,
          content: JSON.stringify({ type: "doc", content: [] }),
          title: "Untitled Document",
          timestamp: new Date(),
        });
      });

      if (documentId) {
        router.push(`/editor/${documentId}`);
      }
    } catch (error) {
      console.error("Failed to create document:", error);
      toast.error("Failed to create document. Please try again.");
      setIsCreating(false);
    }
  };

  return (
    <button
      onClick={handleCreateDocument}
      disabled={isCreating}
      className="focus:outline-none w-full text-left"
      aria-label="Create a new document"
      aria-busy={isCreating}
    >
      <Card className="flex flex-col items-center justify-center h-48 bg-surface-night/10 border border-surface-night/30 hover:bg-surface-highlight/20 transition-all duration-300 cursor-pointer rounded-2xl group focus-visible:ring-2 focus-visible:ring-primary shadow-sm hover:shadow-md hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
        <HugeiconsIcon
          icon={PlusSignIcon}
          className={`size-6 text-muted-foreground group-hover:text-foreground transition-colors -mb-3 ${
            isCreating ? "animate-pulse" : ""
          }`}
          strokeWidth={2}
          aria-hidden="true"
        />
        <span className="text-muted-foreground group-hover:text-foreground font-medium">
          {isCreating ? "Creating..." : "New Document"}
        </span>
      </Card>
    </button>
  );
}
