"use client";

import { EDITOR_DEBOUNCE_MS } from "@/lib/constants";
import { useDebouncedCallback } from "@/lib/hooks/use-debounced-callback";
import { useEditorStore } from "@/lib/store/editor-store";
import { calculateWordCount } from "@/lib/utils";
import {
  EditorContent,
  EditorInstance,
  handleCommandNavigation,
  type JSONContent,
} from "novel";
import { defaultExtensions } from "./extensions";

interface EditorProps {
  initialValue?: JSONContent;
  editable?: boolean;
  isLoading?: boolean;
  documentId: string;
}

export default function Editor({
  initialValue,
  editable = true,
  isLoading = false,
  documentId,
}: EditorProps) {
  const setContent = useEditorStore((s) => s.setContent);
  const setWordCount = useEditorStore((s) => s.setWordCount);
  const markUserTyping = useEditorStore((s) => s.markUserTyping);
  const initiateAutosave = useEditorStore((s) => s.initiateAutosave);
  const setEditorInstance = useEditorStore((s) => s.setEditorInstance);

  const debouncedUpdates = useDebouncedCallback(
    ({ editor }: { editor: EditorInstance }) => {
      const json = editor.getJSON();
      setContent(json);
      setWordCount(calculateWordCount(json));

      // Trigger autosave cycle
      markUserTyping();
      initiateAutosave(documentId);
    },
    EDITOR_DEBOUNCE_MS
  );

  return (
    <EditorContent
      immediatelyRender={false}
      initialContent={initialValue}
      extensions={defaultExtensions}
      onUpdate={debouncedUpdates}
      onCreate={({ editor }) => setEditorInstance(editor)}
      editorProps={{
        handleDOMEvents: {
          keydown: (_view, event) => handleCommandNavigation(event),
        },
        attributes: {
          class: `prose prose-lg dark:prose-invert prose-headings:font-title focus:outline-none max-w-full min-h-[400px] p-6 rounded-none`,
        },
        editable: () => editable,
      }}
      className="relative w-full h-full"
    ></EditorContent>
  );
}
