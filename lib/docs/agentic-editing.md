# Agentic AI Editing System

Comprehensive documentation for scrap_sheet's AI-powered editing with visual diff preview.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AGENTIC EDITING FLOW                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  User clicks "Proofread"                                                │
│        │                                                                │
│        ▼                                                                │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐   │
│  │ applyPendingEdits│ ──► │ Save Original   │ ──► │ isAgenticMode   │   │
│  │ (save snapshot) │     │ to agenticContent│    │ = true          │   │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘   │
│        │                                                                │
│        ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Apply Visual Diffs to Editor (NodeCommands)                    │   │
│  │  • addDiffMark(nodeId, "delete") → Original text strikethrough  │   │
│  │  • insertAfterNode(nodeId, text) → Replacement text in green    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│        │                                                                │
│        ▼                                                                │
│  User Reviews Changes (Accept/Reject individual or all)                 │
│        │                                                                │
│   ┌────┴────┐                                                          │
│   │         │                                                          │
│   ▼         ▼                                                          │
│ Accept    Reject                                                        │
│   │         │                                                          │
│   ▼         ▼                                                          │
│ Delete   Restore                                                        │
│ originals  agenticContent                                               │
│ + strip    to editor                                                    │
│ marks                                                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. NodeIdMark Extension

Invisible Tiptap mark that assigns unique IDs to text nodes.

**File**: `components/editor/custom-editor-extensions/node-id-mark.ts`

```typescript
// Mark renders as:
<span data-node-id="abc123" style="all: unset; display: contents;">
  Text content
</span>
```

**Key Properties**:
- `excludes: ""` - Coexists with all marks
- `inclusive: false` - Doesn't extend at boundaries

---

### 2. AutoNodeIdPlugin

ProseMirror plugin that auto-assigns IDs to new text nodes.

**File**: `components/editor/custom-editor-extensions/auto-node-id-plugin.ts`

**Trigger**: `appendTransaction` - runs after every document change

```typescript
// Walks document, assigns ID to unmarked text
newState.doc.descendants((node, pos) => {
  if (node.isText && !hasNodeIdMark(node)) {
    tr.addMark(pos, pos + node.nodeSize, nodeIdMark);
  }
});
```

---

### 3. NodeCommands Extension

ID-based commands for manipulating nodes without position tracking.

**File**: `components/editor/custom-editor-extensions/node-commands.ts`

| Command | Purpose |
|---------|---------|
| `addDiffMark(nodeId, type)` | Mark node as "add" or "delete" |
| `removeDiffMarks(nodeId)` | Remove diff mark from specific node |
| `removeAllDiffMarks()` | Batch remove all diff marks |
| `insertAfterNode(nodeId, text, marks)` | Insert replacement text after node |
| `deleteNodeById(nodeId)` | Delete node by ID |
| `deleteReplacementNode(originalNodeId)` | Delete the "add" node for an original |
| `scrollToNode(nodeId)` | Scroll node into view |

---

### 4. DiffMark Extension

Visual styling mark for diff display.

**File**: `components/editor/custom-editor-extensions/diff-mark.ts`

**Attributes**:
- `type`: "add" | "delete"
- `nodeId`: Links replacement to original

**Renders as**:
```html
<span data-diff-mark="true" data-diff-type="add" data-node-id="abc123">
  Replacement text
</span>
```

---

### 5. DiffFocusPlugin

Decoration-based focus highlighting for edit navigation.

**File**: `components/editor/custom-editor-extensions/diff-focus-plugin.ts`

**Trigger**: `tr.setMeta('focusedNodeId', nodeId)`

**Output**: Adds class `.diff-focused-add` or `.diff-focused-delete`

---

## State Management

### Agentic State Properties

| Property | Type | Description |
|----------|------|-------------|
| `isAgenticMode` | `boolean` | Whether AI edit mode is active |
| `agenticContent` | `JSONContent \| null` | **Original** content snapshot (for reject) |
| `pendingEdits` | `AgenticEdit[]` | List of pending AI suggestions |
| `currentEditIndex` | `number` | Currently focused edit index |
| `focusedNodeId` | `string \| null` | Node ID being highlighted |
| `initialEditCount` | `number` | Total edits at start (for partial accept) |

### AgenticEdit Interface

```typescript
interface AgenticEdit {
  nodeId: string;      // Target node's unique ID
  replaceText: string; // Suggested replacement
  explanation: string; // Why this change (for tooltip)
}
```

---

## Critical Order of Operations

```
applyAIEditsToEditor()
    │
    ├─► 1. Build edits list (filter valid nodeIds)
    │
    ├─► 2. applyPendingEdits() ← SAVE ORIGINAL FIRST!
    │       └─► agenticContent = content (deep copy)
    │       └─► isAgenticMode = true
    │
    └─► 3. Apply visual diffs to editor
            └─► addDiffMark(), insertAfterNode()
```

> **CRITICAL**: Original content MUST be saved BEFORE modifying the editor.
> Otherwise, `debouncedUpdates` may fire and pollute `content` state.

---

## Actions

### Accept All

```typescript
acceptAllEdits() {
  // Delete all original nodes
  for (edit of pendingEdits) {
    editor.deleteNodeById(edit.nodeId);
  }
  // Strip remaining diff marks
  editor.removeAllDiffMarks();
  // Capture clean state
  content = editor.getJSON();
}
```

### Reject All

```typescript
rejectAllEdits() {
  // Restore original content
  editor.setContent(agenticContent);
  // Clear agentic state
  isAgenticMode = false;
}
```

### Single Accept/Reject

```typescript
acceptEdit(nodeId) {
  editor.deleteNodeById(nodeId);           // Remove original
  editor.removeDiffMarks(nodeId);          // Clean replacement
}

rejectEdit(nodeId) {
  editor.deleteReplacementNode(nodeId);    // Remove replacement
  editor.removeDiffMarks(nodeId);          // Clean original
}
```

---

## CSS Styling

**Scoped to**: `.agentic-mode .ProseMirror`

| Selector | Style |
|----------|-------|
| `[data-diff-type="add"]` | Green background, green text |
| `[data-diff-type="delete"]` | Red background, strikethrough |
| `.diff-focused-add` | Green outline |
| `.diff-focused-delete` | Red outline |

### Heading-Specific Styling

```css
.agentic-mode .ProseMirror h1 span[data-diff-mark],
.agentic-mode .ProseMirror h2 span[data-diff-mark],
.agentic-mode .ProseMirror h3 span[data-diff-mark] {
  padding-block: 4px !important;
  display: inline-block !important;
}
```

---

## File Reference

| File | Purpose |
|------|---------|
| `lib/ai/agentic-editor-utils.ts` | Main orchestration function |
| `lib/ai/mock-ai-edits.ts` | Mock AI suggestions for demo |
| `lib/store/editor-store.ts` | State management (agentic actions) |
| `components/editor/agentic-diff-toolbar.tsx` | Accept/Reject UI |
| `components/editor/editor-banner.tsx` | Mode indicator banners |
| `app/globals.css` | Diff styling (scoped to .agentic-mode) |
