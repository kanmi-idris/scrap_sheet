# Editor Store Documentation

Zustand-based state management for the scrap_sheet editor.

## Overview

This store manages the complete lifecycle of document editing, including:
- Real-time content and metadata state
- Automatic saving with continuous autosave cycles
- Two-tier versioning system (working version + checkpoint rotation)
- Version restoration from history
- Safe reset with async operation abort handling

---

## Architecture Overview

### Data Layer (Triplit)

```
┌─────────────────────────────────────────────────────────────────┐
│  documents (metadata)           versions (content snapshots)   │
│  ├─ id                          ├─ id                          │
│  ├─ title                       ├─ documentId (FK)             │
│  ├─ preview                     ├─ content (JSON string)       │
│  ├─ createdAt                   ├─ title                       │
│  └─ lastModified                └─ timestamp                   │
└─────────────────────────────────────────────────────────────────┘
```

### State Layer (Zustand)

| Property | Type | Description |
|----------|------|-------------|
| `content` | `JSONContent \| null` | Current editor content (from TipTap/Novel) |
| `title` | `string` | Document title |
| `versionCurrentlyInUse` | `Version \| null` | The active working version being mutated |
| `isUserCurrentlyTyping` | `boolean` | Tracks user activity for autosave cycle control |
| `isUpdatingDataStore` | `boolean` | Lock flag preventing concurrent DB operations |
| `isResetting` | `boolean` | Abort flag for safe async operation cancellation |

---

## Autosave Flow

The autosave system uses a **recursive self-scheduling loop** that runs continuously during active typing and self-terminates when idle.

### Trigger: User Types in Editor

```
Editor Component
    │
    ├─► markUserTyping()           // Set typing flag, start 2s inactivity timer
    │
    └─► initiateAutosave(docId)    // Start autosave cycle
             │
             ├─► Guard: isUpdatingDataStore? → EXIT (prevent concurrent saves)
             │
             ├─► First call? → Start version rotation cycle (5min timer)
             │
             └─► updateDocumentAndActiveVersion() → SAVE NOW
                      │
                      └─► .then() → Schedule next save in 500ms
                                      │
                                      └─► setTimeout callback:
                                            isUserCurrentlyTyping? → RECURSE
                                            !isUserCurrentlyTyping? → STOP
```

### Timeline Example

```
t=0.0s   User types → markUserTyping() → initiateAutosave()
t=0.0s   Save #1 executes (creates/updates working version)
t=0.5s   Timer fires → still typing → Save #2
t=1.0s   Timer fires → still typing → Save #3
t=1.5s   User stops typing
t=2.0s   Timer fires → still typing (flag still true)
t=3.5s   Inactivity timeout fires → isUserCurrentlyTyping: false
t=4.0s   Timer fires → NOT typing → Cycle STOPS
```

### Key Constants

| Constant | Value | Purpose |
|----------|-------|---------|
| `AUTOSAVE_INTERVAL_MS` | 500ms | Delay between consecutive saves |
| `TYPING_INACTIVITY_THRESHOLD_MS` | 2000ms | Time until user considered "not typing" |
| `VERSION_ROTATION_MS` | 5 minutes | Interval for creating checkpoint versions |

---

## Versioning Strategy

### Two-Tier System

#### Tier 1: Working Version (Mutable)
- Created on first save
- **MUTATED** every 500ms during autosave cycle
- Same version entity updated repeatedly
- Minimizes version explosion in database

#### Tier 2: Checkpoint Versions (Immutable)
- Created every 5 minutes via `createNewWorkingVersion()`
- Old working version stays in DB as historical checkpoint
- New working version created for future mutations
- Provides meaningful restore points without micro-version spam

### Version Timeline

```
t=0min    v1 created (first save)
t=0.5s    v1 UPDATED
t=1.0s    v1 UPDATED
...
t=5min    v2 CREATED (rotation), v1 becomes checkpoint
t=5.5s    v2 UPDATED
...
t=10min   v3 CREATED (rotation), v2 becomes checkpoint

History UI shows: v1 (0min), v2 (5min), v3 (10min)
```

---

## Version Restoration

When user restores a historical version:

1. Local state updated immediately (optimistic UI)
2. Atomic transaction:
   - Document metadata updated
   - **NEW** version created from restored content
3. New version becomes the working version
4. Original restored version remains unchanged in history

### Flow Diagram

```
restoreVersion(v2)
    │
    ├─► set({ content: v2.content, title: v2.title }) // Instant UI update
    │
    └─► triplit.transact()
             ├─► documents.update(metadata)
             └─► versions.insert(v4) // Copy of v2
                      │
                      └─► versionCurrentlyInUse = v4

History: v1, v2, v3, v4 (restored from v2)
```

---

## Concurrency & Safety

### Guards

| Guard | Purpose |
|-------|---------|
| `isUpdatingDataStore` | Prevents concurrent DB operations |
| `isResetting` | Aborts pending async operations during reset |
| `documentId` validation | Prevents cross-document version corruption |

### Transaction Atomicity

All DB operations use `triplit.transact()` for:
- Document metadata + version updates in single atomic unit
- Rollback on failure (no partial state)
- Consistent timestamps across related entities

### Reset Safety

```
reset() called
    │
    ├─► isResetting = true (module + Zustand)
    ├─► Clear all timeouts
    ├─► Reset state to initialState
    │
    └─► setTimeout(100ms) → isResetting = false

Pending async operations check `isResetting` before state updates
```

---

## Usage in Editor Component

```typescript
import { useEditorStore } from '@/lib/store/editor-store';

function Editor({ documentId }: { documentId: string }) {
  const { setContent, markUserTyping, initiateAutosave, reset } = useEditorStore();

  // On editor content change
  editor?.on('update', ({ editor }) => {
    const json = editor.getJSON();
    setContent(json);
    markUserTyping();
    initiateAutosave(documentId);
  });

  // On unmount
  useEffect(() => {
    return () => reset();
  }, []);
}
```

---

## API Reference

### State Properties

```typescript
interface EditorState {
  content: JSONContent | null;
  title: string;
  versionCurrentlyInUse: Version | null;
  isUserCurrentlyTyping: boolean;
  isUpdatingDataStore: boolean;
  isResetting: boolean;
  lastVersionRotationAt: Date | null;
}
```

### Actions

| Method | Parameters | Description |
|--------|------------|-------------|
| `setContent` | `content: JSONContent` | Update editor content in state |
| `setTitle` | `title: string` | Update document title in state |
| `markUserTyping` | none | Set typing flag, start inactivity timer |
| `initiateAutosave` | `documentId: string` | Start/continue autosave cycle |
| `restoreVersion` | `version: Version, documentId: string` | Restore from historical version |
| `reset` | none | Clean up and reset to initial state |
