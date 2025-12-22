"use client";
import { TriplitClient } from "@triplit/client";
import ScrapSheetStorageSchema from "./schema";

const isBrowser = typeof window !== "undefined";

// Singleton pattern to prevent multiple instances
let clientInstance: TriplitClient<typeof ScrapSheetStorageSchema> | null = null;

export const triplit =
  clientInstance ||
  (clientInstance = new TriplitClient({
    schema: ScrapSheetStorageSchema,
    storage: isBrowser ? "indexeddb" : "memory",
    autoConnect: false,
  }));
