"use client";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { SquigglyArrow } from "@/lib/assets/svgs/SquigglyArrow";
import { useEditorStore } from "@/lib/store/editor-store";
import {
  Attachment,
  VoiceRecorder,
  VoiceRecordingState,
  cn,
  createFileUploadHandler,
  createPasteHandler,
  createRemoveAttachmentHandler,
  createSubmitHandler,
  createVoiceCancelHandler,
  createVoiceToggleHandler,
  revokeAttachmentURL,
} from "@/lib/utils";
import {
  Add01Icon,
  ArrowUp01Icon,
  Cancel01Icon,
  Delete02Icon,
  File02Icon,
  Mic02Icon,
  StopIcon,
  VoiceIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const MAX_ATTACHMENTS = 5;

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

  const hasContent = inputValue.trim() || attachments.length > 0;

  return (
    <div className="relative w-full px-4">
      {/* Onboarding Hint with Animated Arrow */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            transition={{
              type: "spring",
              damping: 12,
              stiffness: 100,
              mass: 0.8,
            }}
            className="absolute -top-52 left-10 -translate-x-1/2 w-80 pointer-events-auto z-50 font-excali bg-transparent"
          >
            <div className="relative">
              {/* Dismiss Button */}
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleDismissHint}
                className="absolute -top-2 -right-2 text-muted-foreground hover:text-foreground z-10 hover:bg-transparent"
                aria-label="Dismiss hint"
              >
                <div className="border border-dashed border-muted-foreground/40 rounded-full p-1 bg-background">
                  <HugeiconsIcon
                    icon={Cancel01Icon}
                    className="h-3 w-3"
                    strokeWidth={2}
                  />
                </div>
              </Button>

              {/* Message Card */}
              <div className="border-2 border-dashed border-muted-foreground/30 rounded-2xl p-5 shadow-sm transform -rotate-1">
                <div
                  role="status"
                  className="text-lg text-foreground/80 leading-snug space-y-3"
                >
                  <p className="font-medium flex items-center gap-2">
                    <span className="text-xl">✨</span>
                    Start here...
                  </p>
                  <div className="text-base text-muted-foreground space-y-1 pl-1">
                    <p>- Upload files for context</p>
                    <p>- Dictate your ideas</p>
                    <p>- Let AI brainstorm</p>
                  </div>
                </div>
              </div>

              {/* Animated Squiggly Arrow */}
              <motion.div
                animate={{
                  y: [-4, 4, -4],
                  rotate: [-2, 2, -2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -bottom-14 left-1/2 -translate-x-1/2 text-muted-foreground/50"
                aria-hidden="true"
              >
                <SquigglyArrow
                  dashed
                  className="w-16 h-16 transform rotate-12"
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Input Bar with Attachments */}
      <div className="relative">
        {/* Attachments Preview Area */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-2 overflow-hidden"
            >
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {attachments.length} attachment
                    {attachments.length > 1 ? "s" : ""}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => {
                      attachments.forEach(revokeAttachmentURL);
                      setAttachments([]);
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <HugeiconsIcon
                      icon={Delete02Icon}
                      className="h-3 w-3"
                      strokeWidth={2}
                    />
                  </Button>
                </div>

                {/* Attachment Items */}
                <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
                  {attachments.map((attachment) => (
                    <AttachmentItem
                      key={attachment.id}
                      attachment={attachment}
                      onRemove={handleRemoveAttachment}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voice Recording Status */}
        <AnimatePresence>
          {voiceRecordingState.isRecording && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-2"
            >
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-red-500"
                  />
                  <span className="text-sm font-medium text-red-400">
                    Recording...
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleVoiceCancel}
                  className="text-red-400 hover:text-red-300"
                >
                  <HugeiconsIcon
                    icon={Cancel01Icon}
                    className="h-3 w-3"
                    strokeWidth={2}
                  />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Input Group */}
        <InputGroup className="w-full max-h-50 rounded-2xl border-0 bg-white/5 backdrop-blur-md">
          <InputGroupTextarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            onPaste={handlePasteEvent}
            placeholder="Pour out your thoughts exactly as it comes to you"
            className="min-h-15 text-sm font-excali p-4"
            rows={2}
            disabled={voiceRecordingState.isRecording}
          />
          <InputGroupAddon align="block-end">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.txt,.md,.json"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              aria-label="Upload files"
            />

            {/* Add/Upload button */}
            <InputGroupButton
              variant="outline"
              className="rounded-full cursor-pointer"
              size="icon-sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={
                voiceRecordingState.isRecording ||
                attachments.length >= MAX_ATTACHMENTS
              }
              title="Upload files"
            >
              <HugeiconsIcon
                icon={Add01Icon}
                className="h-4 w-4"
                strokeWidth={2}
              />
            </InputGroupButton>

            {/* Mic button */}
            <InputGroupButton
              variant={voiceRecordingState.isRecording ? "default" : "outline"}
              className={cn(
                "rounded-full cursor-pointer",
                voiceRecordingState.isRecording &&
                  "bg-red-500/20 hover:bg-red-500/30"
              )}
              size="icon-sm"
              onClick={handleVoiceToggle}
              disabled={attachments.length >= MAX_ATTACHMENTS}
              title={
                voiceRecordingState.isRecording
                  ? "Stop recording"
                  : "Start voice recording"
              }
            >
              <HugeiconsIcon
                icon={voiceRecordingState.isRecording ? StopIcon : Mic02Icon}
                className={cn(
                  "h-4 w-4",
                  voiceRecordingState.isRecording && "text-red-400"
                )}
                strokeWidth={2}
              />
            </InputGroupButton>

            {/* Submit button */}
            <InputGroupButton
              variant="default"
              className="rounded-full ml-auto cursor-pointer"
              size="icon-sm"
              disabled={!hasContent || voiceRecordingState.isRecording}
              onClick={handleSubmit}
              title="Send to AI"
            >
              <HugeiconsIcon
                icon={ArrowUp01Icon}
                className="h-4 w-4"
                strokeWidth={2}
              />
              <span className="sr-only">Send</span>
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  );
}

/**
 * Individual attachment item renderer
 * Handles images, files, voice recordings, and text
 */
function AttachmentItem({
  attachment,
  onRemove,
}: {
  attachment: Attachment;
  onRemove: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative flex items-start gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
    >
      {/* Attachment Icon/Preview */}
      <div className="shrink-0">
        {attachment.type === "image" ? (
          <div className="relative w-12 h-12 rounded-md overflow-hidden bg-black/20">
            <img
              src={attachment.url}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        ) : attachment.type === "voice" ? (
          <div className="w-12 h-12 rounded-md bg-purple-500/20 flex items-center justify-center">
            <HugeiconsIcon
              icon={VoiceIcon}
              className="h-5 w-5 text-purple-400"
              strokeWidth={2}
            />
          </div>
        ) : attachment.type === "text" ? (
          <div className="w-12 h-12 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-mono">
            TXT
          </div>
        ) : (
          <div className="w-12 h-12 rounded-md bg-gray-500/20 flex items-center justify-center">
            <HugeiconsIcon
              icon={File02Icon}
              className="h-5 w-5 text-gray-400"
              strokeWidth={2}
            />
          </div>
        )}
      </div>

      {/* Attachment Details */}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-foreground truncate">
          {attachment.type === "image" && "Image"}
          {attachment.type === "file" && attachment.name}
          {attachment.type === "voice" && "Voice Recording"}
          {attachment.type === "text" && "Text"}
        </div>
        <div className="text-[10px] text-muted-foreground truncate">
          {attachment.type === "image" && attachment.file.name}
          {attachment.type === "file" && attachment.mimeType}
          {attachment.type === "voice" && "Audio/WebM"}
          {attachment.type === "text" &&
            `${attachment.content.length} characters`}
        </div>
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => onRemove(attachment.id)}
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
        aria-label="Remove attachment"
      >
        <HugeiconsIcon
          icon={Cancel01Icon}
          className="h-3 w-3"
          strokeWidth={2}
        />
      </Button>
    </motion.div>
  );
}
