"use client";

import { useDebouncedCallback } from "@/lib/hooks/use-debounced-callback";
import { useEditorStore } from "@/lib/store/editor-store";
import { calculateWordCount } from "@/lib/utils";
import {
  EditorBubble,
  EditorContent,
  EditorInstance,
  EditorRoot,
  handleCommandNavigation,
  Placeholder,
  type JSONContent,
} from "novel";
import { useMemo } from "react";
import { defaultExtensions } from "./extensions";
import { AISelector } from "./selectors/ai-selector";

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

  const extensions = useMemo(() => {
    const placeholderExt = Placeholder.configure({
      placeholder: isLoading ? "Fetching your document..." : "Start writing...",
    });

    // Replace default placeholder with our dynamic one
    const filteredExtensions = defaultExtensions.filter(
      (ext) => ext.name !== "placeholder"
    );

    return [...filteredExtensions, placeholderExt];
  }, [isLoading]);

  const debouncedUpdates = useDebouncedCallback(
    ({ editor }: { editor: EditorInstance }) => {
      const json = editor.getJSON();
      setContent(json);
      setWordCount(calculateWordCount(json));

      // Trigger autosave cycle
      markUserTyping();
      initiateAutosave(documentId);
    },
    500
  );

  return (
    <EditorRoot>
      <EditorContent
        immediatelyRender={false}
        initialContent={initialValue}
        extensions={extensions}
        onUpdate={debouncedUpdates}
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
      >
        <EditorBubble
          tippyOptions={{
            placement: "top",
            animation: "shift-away",
            duration: 200,
          }}
          className="flex w-fit max-w-[90vw] overflow-hidden rounded-lg border-none bg-transparent shadow-none"
        >
          <AISelector />
        </EditorBubble>
      </EditorContent>
    </EditorRoot>
  );
}
