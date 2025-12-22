"use client";

import { MAX_ATTACHMENTS } from "@/lib/constants";
import { useEditorStore } from "@/lib/store/editor-store";
import {
  Attachment,
  VoiceRecorder,
  VoiceRecordingState,
  createFileUploadHandler,
  createPasteHandler,
  createRemoveAttachmentHandler,
  createSubmitHandler,
  createVoiceCancelHandler,
  createVoiceToggleHandler,
  revokeAttachmentURL,
} from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AIAttachmentsList,
  AIInputControls,
  AIOnboardingHint,
  AIVoiceRecordingBanner,
} from "./ai-widgets";

export function AIInputBar() {
  const [inputValue, setInputValue] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [voiceRecordingState, setVoiceRecordingState] =
    useState<VoiceRecordingState>({
      isRecording: false,
      error: null,
    });

  const content = useEditorStore((s) => s.content);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const voiceRecorderRef = useRef<VoiceRecorder | null>(null);

  // Check if document has no content (empty doc object)
  const isContentEmpty = content?.content?.length === 0;

  // Initialize voice recorder
  useEffect(() => {
    voiceRecorderRef.current = new VoiceRecorder(setVoiceRecordingState);
    return () => {
      voiceRecorderRef.current?.cancel();
    };
  }, []);

  // Show hint immediately if document content is empty and no attachments
  useEffect(() => {
    if (isContentEmpty && attachments.length === 0) {
      setShowHint(true);
    } else {
      setShowHint(false);
    }
  }, [isContentEmpty, attachments.length]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      attachments.forEach(revokeAttachmentURL);
    };
  }, [attachments]);

  const handleDismissHint = () => {
    setShowHint(false);
  };

  const handleFileUpload = createFileUploadHandler(
    attachments,
    setAttachments,
    MAX_ATTACHMENTS,
    toast
  );

  const handlePasteEvent = createPasteHandler(
    attachments,
    setAttachments,
    MAX_ATTACHMENTS,
    toast
  );

  const handleRemoveAttachment = createRemoveAttachmentHandler(setAttachments);

  const handleVoiceToggle = createVoiceToggleHandler(
    voiceRecordingState,
    setVoiceRecordingState,
    voiceRecorderRef,
    attachments,
    setAttachments,
    MAX_ATTACHMENTS,
    toast
  );

  const handleVoiceCancel = createVoiceCancelHandler(
    voiceRecorderRef,
    setVoiceRecordingState
  );

  const handleSubmit = createSubmitHandler(
    inputValue,
    attachments,
    setInputValue,
    setAttachments,
    toast
  );

  const handleClearAll = () => {
    attachments.forEach(revokeAttachmentURL);
    setAttachments([]);
  };

  const hasContent = inputValue.trim() || attachments.length > 0;

  return (
    <div className="relative w-full px-4">
      <AIOnboardingHint showHint={showHint} onDismiss={handleDismissHint} />

      <div className="relative">
        <AIAttachmentsList
          attachments={attachments}
          onRemove={handleRemoveAttachment}
          onClearAll={handleClearAll}
        />

        <AIVoiceRecordingBanner
          isRecording={voiceRecordingState.isRecording}
          onCancel={handleVoiceCancel}
        />

        <AIInputControls
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          onFileUpload={handleFileUpload}
          onPaste={handlePasteEvent}
          onVoiceToggle={handleVoiceToggle}
          fileInputRef={fileInputRef}
          textareaRef={textareaRef}
          isRecording={voiceRecordingState.isRecording}
          isUploadDisabled={
            voiceRecordingState.isRecording ||
            attachments.length >= MAX_ATTACHMENTS
          }
          isMicDisabled={attachments.length >= MAX_ATTACHMENTS}
          isSubmitDisabled={!hasContent || voiceRecordingState.isRecording}
          hasContent={!!hasContent}
        />
      </div>
    </div>
  );
}
