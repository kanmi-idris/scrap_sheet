"use client";

import { DocumentGrid } from "@/components/dashboard/document-grid";
import AppFooter from "@/components/landing/footer";
import { AppNavbar } from "@/components/landing/navbar";
import { triplit } from "@/triplit/client";
import { useQuery } from "@triplit/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const query = useMemo(() => {
    // Build query with optional search filter
    const baseQuery = triplit.query("documents").Order("lastModified", "DESC");

    if (searchTerm.trim()) {
      // Search for the user's query in the title and preview content of the document
      return baseQuery.Where([
        ["title", "like", `%${searchTerm}%`],
        ["preview", "like", `%${searchTerm}%`],
      ]);
    }

    return baseQuery;
  }, [searchTerm]);

  const { results: documents, fetching } = useQuery(triplit, query);

  const handleDelete = async (id: string) => {
    try {
      const versionsToDelete = await triplit.fetch(
        triplit.query("versions").Where("documentId", "=", id)
      );

      await triplit.transact(async (tx) => {
        if (versionsToDelete) {
          for (const version of versionsToDelete) {
            await tx.delete("versions", version.id);
          }
        }
        await tx.delete("documents", id);
      });

      toast.success("Document deleted successfully");
    } catch (e) {
      console.error("Failed to delete document", e);
      toast.error("Failed to delete document");
    }
  };

  return (
    <div className="dark min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      <AppNavbar
        isLoggedIn
        initials="OL"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <main className="flex-1 container mx-auto px-6 py-8 pt-24">
        <h2 className="text-lg font-medium font-excali">Welcome Olasunkanmi</h2>
        <p className="text-muted-foreground font-excali mb-8">
          Create a new scrapsheet or jump back in to the previous one's.
        </p>

        {/* Search result count (accessibility) */}
        <div aria-live="polite" className="sr-only">
          {documents && searchTerm ? `${documents.length} documents found` : ""}
        </div>

        <DocumentGrid
          documents={documents || []}
          onDelete={handleDelete}
          isLoading={fetching}
          searchTerm={searchTerm}
        />
      </main>
      <AppFooter />
    </div>
  );
}
