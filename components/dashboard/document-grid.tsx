import { Document } from "@/triplit/schema";
import { DocumentCard } from "./document-card";
import { NewDocumentCard } from "./new-document-card";

interface DocumentGridProps {
  documents: Document[];
  onDelete: (id: string) => void;
  isLoading?: boolean;
  searchTerm?: string;
}

export function DocumentGrid({
  documents,
  onDelete,
  isLoading,
  searchTerm,
}: DocumentGridProps) {
  const showEmptyState = !isLoading && searchTerm && documents.length === 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <NewDocumentCard />

      {isLoading ? (
        <>
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="h-48 bg-white/5 border border-white/5 rounded-2xl animate-pulse"
            />
          ))}
        </>
      ) : showEmptyState ? (
        <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground text-sm">
            No documents found matching "{searchTerm}"
          </p>
          <p className="text-muted-foreground/60 text-xs mt-2">
            Try a different search term
          </p>
        </div>
      ) : (
        documents.map((doc) => (
          <DocumentCard key={doc.id} document={doc} onDelete={onDelete} />
        ))
      )}
    </div>
  );
}
