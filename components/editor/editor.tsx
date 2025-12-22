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
import { toast } from "sonner";
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
      onCreate={({ editor }) => {
        setEditorInstance(editor);

        // error handler for paste operations
        const originalHandlePaste = editor.view.props.handlePaste;
        editor.view.props.handlePaste = (view, event, slice) => {
          try {
            if (originalHandlePaste) {
              return originalHandlePaste(view, event, slice);
            }
            return false;
          } catch (error) {
            console.error("[EDITOR] Paste error:", error);
            toast.error("Unable to paste content. Please try plain text.");
            event.preventDefault();
            return true;
          }
        };
      }}
      editorProps={{
        handleDOMEvents: {
          keydown: (_view, event) => handleCommandNavigation(event),
        },
        handlePaste: (view, event) => {
          try {
            const text = event.clipboardData?.getData("text/plain");
            if (text) {
              // Strip Zalgo text (combining diacritical marks)
              // Remove BiDi overrides that can cause layout issues
              // Remove zero-width characters and other invisibles
              const sanitized = text
                .replace(/[\u0300-\u036f]/g, "") // Combining diacritical marks
                .replace(/[\u202e\u202d\u202a-\u202c]/g, "") // BiDi overrides
                .replace(/[\u200b-\u200f\u2060\ufeff]/g, ""); // Zero-width chars

              if (sanitized !== text) {
                console.log("[EDITOR] Sanitized paste content");
                toast.info("Pasted content was cleaned for safety");
              }

              view.dispatch(view.state.tr.insertText(sanitized));
              return true; // We handled it
            }
          } catch (error) {
            console.error("[EDITOR] Paste error:", error);
            toast.error("Unable to paste content. Please try again.");
            return true; // Prevent default to avoid crash
          }
          return false; // Let editor handle other paste types (images, HTML, etc.)
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
