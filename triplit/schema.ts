import { DEFAULT_FONT_FAMILY } from "@/lib/constants";
import { Schema as TriplitSchema, type Entity } from "@triplit/client";

const ScrapSheetStorageSchema = TriplitSchema.Collections({
  documents: {
    schema: TriplitSchema.Schema({
      id: TriplitSchema.Id(),
      title: TriplitSchema.String({ default: "Untitled Document" }),
      preview: TriplitSchema.String({ default: "" }),
      createdAt: TriplitSchema.Date({ default: TriplitSchema.Default.now() }),
      lastModified: TriplitSchema.Date({
        default: TriplitSchema.Default.now(),
      }),
    }),
    relationships: {
      versions: TriplitSchema.RelationMany("versions", {
        where: [["documentId", "=", "$id"]],
      }),
    },
  },
  versions: {
    schema: TriplitSchema.Schema({
      id: TriplitSchema.Id(),
      documentId: TriplitSchema.String(),
      content: TriplitSchema.String({ default: "" }),
      title: TriplitSchema.String(),
      fontFamily: TriplitSchema.String({ default: DEFAULT_FONT_FAMILY }),
      timestamp: TriplitSchema.Date({ default: TriplitSchema.Default.now() }),
    }),
  },
});

export default ScrapSheetStorageSchema;
export type Document = Entity<typeof ScrapSheetStorageSchema, "documents">;
export type Version = Entity<typeof ScrapSheetStorageSchema, "versions">;
