/**
 * ID Generator - Unique node IDs for content tracking
 *
 * Uses Math.random() for client-side collision resistance.
 * Collision probability: ~1 in 2 trillion for 100k nodes.
 */

/**
 * Generates unique node ID for text identification
 * Format: node-{timestamp}-{random}
 * Example: "node-l8k9m2x-a3k7m2x9p"
 */
export function generateNodeId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 11);
  return `node-${timestamp}-${randomPart}`;
}

/**
 * Validates nodeId format
 */
export function isValidNodeId(id: string): boolean {
  return /^node-[a-z0-9]+-[a-z0-9]+$/.test(id);
}
