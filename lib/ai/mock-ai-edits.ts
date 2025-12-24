"use client";

/**
 * Mock AI Edits - Pre-defined corrections for the seeded document.
 * Uses nodeId-based references for O(n) lookup instead of text search.
 *
 * The nodeIds here must match the nodeId marks in the seeded document content.
 */

export interface AIDiffEdit {
  nodeId: string;
  toolType: "proofread" | "grammar" | "paraphrase" | "improve" | "shorten";
  replaceText: string;
  explanation: string;
}

/**
 * Pre-defined edits that simulate AI corrections.
 * These target the intentional errors in the seeded document.
 *
 * NodeIds are deterministic and match those assigned in seed-db.ts.
 */
export const MOCK_EDITS: AIDiffEdit[] = [
  // Spelling corrections (grammar tool)
  {
    nodeId: "seed-heading-1",
    toolType: "grammar",
    replaceText: "Institution C1 – Nutrition and Metabolism Laboratory",
    explanation: "Corrected spelling: 'Metabelism' → 'Metabolism'",
  },
  {
    nodeId: "seed-para-1",
    toolType: "grammar",
    replaceText:
      "The Nutrition and Metabolism Laboratory is a cutting-edge research facility dedicated to understanding the complex relationships between diet, metabolism, and human health.",
    explanation: "Corrected spelling: 'Metabelism' → 'Metabolism'",
  },
  {
    nodeId: "seed-heading-2",
    toolType: "proofread",
    replaceText: "About Us",
    explanation: "Improved heading: 'About Information' → 'About Us'",
  },
  {
    nodeId: "seed-para-2",
    toolType: "grammar",
    replaceText:
      "Our research focuses on understanding how nutrients affect metabolic pathways and overall health outcomes. We utilize state-of-the-art equipment to conduct our experiments.",
    explanation:
      "Corrected spellings: 'focusses' → 'focuses', 'equipement' → 'equipment'",
  },
  {
    nodeId: "seed-para-3",
    toolType: "grammar",
    replaceText:
      "The laboratory was established in 2015 and has since published over 200 peer-reviewed articles. Our team consists of 15 dedicated researchers from diverse backgrounds.",
    explanation:
      "Corrected spellings: 'laborotory' → 'laboratory', 'reseachers' → 'researchers'",
  },
  {
    nodeId: "seed-para-4",
    toolType: "grammar",
    replaceText:
      "We specialize in several key areas including macronutrient metabolism, micronutrient absorption, and the gut microbiome. Each area receives dedicated funding and attention from our expert staff.",
    explanation:
      "Corrected spellings: 'specialise' → 'specialize', 'absorbtion' → 'absorption', 'recieves' → 'receives'",
  },
  {
    nodeId: "seed-para-5",
    toolType: "grammar",
    replaceText:
      "Our findings have contributed significantly to the field of nutritional science. We are committed to advancing knowledge that can improve public health outcomes worldwide.",
    explanation:
      "Corrected spellings: 'feild' → 'field', 'commited' → 'committed'",
  },
  {
    nodeId: "seed-para-6",
    toolType: "paraphrase",
    replaceText:
      "For inquiries about our research or collaboration opportunities, please reach out to our administrative office. We actively seek partnerships with universities and industry partners.",
    explanation:
      "Corrected spellings and rephrased: 'inqueries' → 'inquiries', 'oportunities' → 'opportunities', 'acedemic' → 'academic'",
  },
];

/**
 * Get edits filtered by tool type.
 * @param toolType - The AI tool being used (proofread, grammar, etc.)
 * @returns Array of edits applicable to that tool
 */
export function getEditsForTool(
  toolType: AIDiffEdit["toolType"]
): AIDiffEdit[] {
  return MOCK_EDITS.filter((edit) => edit.toolType === toolType);
}

/**
 * Get all available edits (for "proofread" which catches everything)
 */
export function getAllEdits(): AIDiffEdit[] {
  return MOCK_EDITS;
}

/**
 * Find edit by nodeId
 */
export function getEditByNodeId(nodeId: string): AIDiffEdit | undefined {
  return MOCK_EDITS.find((edit) => edit.nodeId === nodeId);
}
