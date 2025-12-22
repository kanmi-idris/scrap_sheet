import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import {
  Add01Icon,
  ArrowUp01Icon,
  Mic02Icon,
  StopIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface AIInputControlsProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onFileUpload: (files: FileList | null) => void;
  onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  onVoiceToggle: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  isRecording: boolean;
  isUploadDisabled: boolean;
  isMicDisabled: boolean;
  isSubmitDisabled: boolean;
  hasContent: boolean;
}

/**
 * AI input controls with textarea and action buttons
 * Handles file upload, voice recording, and message submission
 * Disabled states managed via props for recording/attachment limits
 */
export function AIInputControls({
  value,
  onChange,
  onSubmit,
  onFileUpload,
  onPaste,
  onVoiceToggle,
  fileInputRef,
  textareaRef,
  isRecording,
  isUploadDisabled,
  isMicDisabled,
  isSubmitDisabled,
  hasContent,
}: AIInputControlsProps) {
  return (
    <InputGroup className="w-full max-h-50 rounded-2xl border-0 bg-white/5 backdrop-blur-md">
      <InputGroupTextarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
          }
        }}
        onPaste={onPaste}
        placeholder="Pour out your thoughts exactly as it comes to you"
        className="min-h-15 text-sm font-excali p-4"
        rows={2}
        disabled={isRecording}
      />
      <InputGroupAddon align="block-end">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.txt,.md,.json"
          onChange={(e) => onFileUpload(e.target.files)}
          className="hidden"
          aria-label="Upload files"
        />

        {/* Add/Upload button */}
        <InputGroupButton
          variant="outline"
          className="rounded-full cursor-pointer"
          size="icon-sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploadDisabled}
          title="Upload files"
        >
          <HugeiconsIcon icon={Add01Icon} className="h-4 w-4" strokeWidth={2} />
        </InputGroupButton>

        {/* Mic button */}
        <InputGroupButton
          variant={isRecording ? "default" : "outline"}
          className={cn(
            "rounded-full cursor-pointer",
            isRecording && "bg-red-500/20 hover:bg-red-500/30"
          )}
          size="icon-sm"
          onClick={onVoiceToggle}
          disabled={isMicDisabled}
          title={isRecording ? "Stop recording" : "Start voice recording"}
        >
          <HugeiconsIcon
            icon={isRecording ? StopIcon : Mic02Icon}
            className={cn("h-4 w-4", isRecording && "text-red-400")}
            strokeWidth={2}
          />
        </InputGroupButton>

        {/* Submit button */}
        <InputGroupButton
          variant="default"
          className="rounded-full ml-auto cursor-pointer"
          size="icon-sm"
          disabled={isSubmitDisabled}
          onClick={onSubmit}
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
  );
}
