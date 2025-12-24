"use client";

import { SEED_DOCUMENT_ID } from "@/lib/constants";
import { triplit } from "./client";

/**
 * Sample document content with intentional errors for AI correction demo.
 * Each text node has a deterministic nodeId mark for the ID-based editing system.
 *
 * NodeId convention: seed-{type}-{number}
 */
const SEED_CONTENT = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [
        {
          type: "text",
          text: "Institution C1 – Nutrition and Metabelism Laboratory",
          marks: [{ type: "nodeId", attrs: { id: "seed-heading-1" } }],
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "The Nutrition and Metabelism Laboratory is a cutting-edge research facility dedicated to understanding the complex relationships between diet, metabolism, and human health.",
          marks: [{ type: "nodeId", attrs: { id: "seed-para-1" } }],
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [
        {
          type: "text",
          text: "About Information",
          marks: [{ type: "nodeId", attrs: { id: "seed-heading-2" } }],
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Our research focusses on understanding how nutrients affect metabolic pathways and overall health outcomes. We utilize state-of-the-art equipement to conduct our experiments.",
          marks: [{ type: "nodeId", attrs: { id: "seed-para-2" } }],
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "The laborotory was established in 2015 and has since published over 200 peer-reviewed articles. Our team consists of 15 dedicated reseachers from diverse backgrounds.",
          marks: [{ type: "nodeId", attrs: { id: "seed-para-3" } }],
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [
        {
          type: "text",
          text: "Research Areas",
          marks: [{ type: "nodeId", attrs: { id: "seed-heading-3" } }],
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "We specialise in several key areas including macronutrient metabolism, micronutrient absorbtion, and the gut microbiome. Each area recieves dedicated funding and attention from our expert staff.",
          marks: [{ type: "nodeId", attrs: { id: "seed-para-4" } }],
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Our findings have contributed significantly to the feild of nutritional science. We are commited to advancing knowledge that can improve public health outcomes worldwide.",
          marks: [{ type: "nodeId", attrs: { id: "seed-para-5" } }],
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [
        {
          type: "text",
          text: "Contact Information",
          marks: [{ type: "nodeId", attrs: { id: "seed-heading-4" } }],
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "For inqueries about our research or collaboration oportunities, please reach out to our administrative office. We welcome partnerships with acedemic institutions and industry leaders.",
          marks: [{ type: "nodeId", attrs: { id: "seed-para-6" } }],
        },
      ],
    },
  ],
};

/**
 * Seeds the database with a demo document for testing the agentic AI editor.
 * This function is idempotent - calling it multiple times won't create duplicates.
 */
export async function seedDemoDocument(): Promise<void> {
  try {
    // Check if seed document already exists
    const existingDoc = await triplit.fetchOne(
      triplit.query("documents").Where("id", "=", SEED_DOCUMENT_ID)
    );

    if (existingDoc) {
      console.log("[SEED] Demo document already exists, skipping seed.");
      return;
    }

    // Create document metadata
    await triplit.insert("documents", {
      id: SEED_DOCUMENT_ID,
      title: "Nutrition and Metabolism Laboratory",
      preview:
        "The Nutrition and Metabelism Laboratory is a cutting-edge research facility...",
      createdAt: new Date(),
      lastModified: new Date(),
    });

    // Create initial version with seeded content
    await triplit.insert("versions", {
      documentId: SEED_DOCUMENT_ID,
      content: JSON.stringify(SEED_CONTENT),
      title: "Nutrition and Metabolism Laboratory",
      fontFamily: "Georgia, serif",
      timestamp: new Date(),
    });

    console.log("[SEED] Demo document created successfully.");
  } catch (error) {
    console.error("[SEED] Failed to seed demo document:", error);
    throw error;
  }
}

/**
 * Removes the seeded demo document (useful for testing reset)
 */
export async function clearSeedDocument(): Promise<void> {
  try {
    // Delete all versions for this document
    const versions = await triplit.fetch(
      triplit.query("versions").Where("documentId", "=", SEED_DOCUMENT_ID)
    );

    for (const version of versions) {
      await triplit.delete("versions", version.id);
    }

    // Delete the document itself
    await triplit.delete("documents", SEED_DOCUMENT_ID);

    console.log("[SEED] Demo document cleared successfully.");
  } catch (error) {
    console.error("[SEED] Failed to clear demo document:", error);
  }
}
