"use client";

import { AgenticEdit } from "@/lib/store/editor-store";

export type ToolType =
  | "proofread"
  | "grammar"
  | "paraphrase"
  | "improve"
  | "shorten";

/**
 * Pre-defined edits organized by tool type for O(1) lookup.
 * Each edit matches AgenticEdit interface directly — no mapping needed.
 *
 * NodeIds are deterministic and match those assigned in seed-db.ts.
 */
export const MOCK_EDITS: Record<ToolType, AgenticEdit[]> = {
  grammar: [
    {
      nodeId: "seed-heading-1",
      replaceText: "Institution C1 – Nutrition and Metabolism Laboratory",
      explanation: "Corrected spelling: 'Metabelism' → 'Metabolism'",
    },
    {
      nodeId: "seed-para-1",
      replaceText:
        "The Nutrition and Metabolism Laboratory is a cutting-edge research facility dedicated to understanding the complex relationships between diet, metabolism, and human health.",
      explanation: "Corrected spelling: 'Metabelism' → 'Metabolism'",
    },
    {
      nodeId: "seed-para-2",
      replaceText:
        "Our research focuses on understanding how nutrients affect metabolic pathways and overall health outcomes. We utilize state-of-the-art equipment to conduct our experiments.",
      explanation:
        "Corrected spellings: 'focusses' → 'focuses', 'equipement' → 'equipment'",
    },
    {
      nodeId: "seed-para-3",
      replaceText:
        "The laboratory was established in 2015 and has since published over 200 peer-reviewed articles. Our team consists of 15 dedicated researchers from diverse backgrounds.",
      explanation:
        "Corrected spellings: 'laborotory' → 'laboratory', 'reseachers' → 'researchers'",
    },
    {
      nodeId: "seed-para-4",
      replaceText:
        "We specialize in several key areas including macronutrient metabolism, micronutrient absorption, and the gut microbiome. Each area receives dedicated funding and attention from our expert staff.",
      explanation:
        "Corrected spellings: 'specialise' → 'specialize', 'absorbtion' → 'absorption', 'recieves' → 'receives'",
    },
    {
      nodeId: "seed-para-5",
      replaceText:
        "Our findings have contributed significantly to the field of nutritional science. We are committed to advancing knowledge that can improve public health outcomes worldwide.",
      explanation:
        "Corrected spellings: 'feild' → 'field', 'commited' → 'committed'",
    },
  ],
  proofread: [
    {
      nodeId: "seed-heading-2",
      replaceText: "About Us",
      explanation: "Improved heading: 'About Information' → 'About Us'",
    },
  ],
  paraphrase: [
    {
      nodeId: "seed-para-6",
      replaceText:
        "For inquiries about our research or collaboration opportunities, please reach out to our administrative office. We actively seek partnerships with universities and industry partners.",
      explanation:
        "Corrected spellings and rephrased: 'inqueries' → 'inquiries', 'oportunities' → 'opportunities'",
    },
  ],
  improve: [],
  shorten: [],
};

/**
 * Get edits for a specific tool type. O(1) lookup.
 */
export function getEditsForTool(toolType: ToolType): AgenticEdit[] {
  return MOCK_EDITS[toolType] ?? [];
}

/**
 * Get all available edits (for "proofread" which catches everything).
 */
export function getAllEdits(): AgenticEdit[] {
  return Object.values(MOCK_EDITS).flat();
}

/**
 * Find edit by nodeId.
 */
export function getEditByNodeId(nodeId: string): AgenticEdit | undefined {
  return getAllEdits().find((edit) => edit.nodeId === nodeId);
}
