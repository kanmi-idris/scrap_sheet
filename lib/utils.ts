import { clsx, type ClassValue } from "clsx";
import { JSONContent } from "novel";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAsShortDate(date: Date | string | number): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Formats a date as relative time (e.g., "2h ago", "3d ago", "Just now")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffWeek < 4) return `${diffWeek}w ago`;
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  return `${diffYear}y ago`;
}

/**
 * Format countdown as mm:ss
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Helper to extract text from JSONContent for word count
export function extractTextFromContent(content: JSONContent | null): string {
  if (!content) return "";

  let text = "";

  function traverse(node: any) {
    if (node.text) {
      text += node.text + " ";
    }
    if (node.content && Array.isArray(node.content)) {
      node.content.forEach(traverse);
    }
  }

  traverse(content);
  return text.trim();
}

export function calculateWordCount(content: JSONContent | null): number {
  const text = extractTextFromContent(content);
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Format time as 12-hour format (e.g., "4:14 PM")
 */
export function formatTime12Hour(date: Date | string | number): string {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Format date without year (e.g., "Dec 22")
 */
export function formatDateShort(date: Date | string | number): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Format full date and time for preview banner (e.g., "Dec 22, 2025 at 4:54 PM")
 */
export function formatPreviewTimestamp(date: Date | string | number): string {
  const d = new Date(date);
  return (
    d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) +
    " at " +
    d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })
  );
}

// ============================================================================
// MEDIA UTILITIES (File Upload, Voice Recording, Paste Handling)
// ============================================================================

/**
 * Attachment type discriminated union for type-safe rendering
 */
export type Attachment =
  | {
      type: "image";
      id: string;
      url: string;
      file: File;
    }
  | {
      type: "file";
      id: string;
      name: string;
      size: number;
      file: File;
      mimeType: string;
    }
  | {
      type: "voice";
      id: string;
      url: string;
      blob: Blob;
    }
  | {
      type: "text";
      id: string;
      content: string;
    };

/**
 * Voice recording state for UI feedback
 */
export interface VoiceRecordingState {
  isRecording: boolean;
  error: string | null;
}

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
];
const SUPPORTED_FILE_TYPES = [
  ...SUPPORTED_IMAGE_TYPES,
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/json",
];

/**
 * Process uploaded files into Attachment objects
 * Validates size, type, and compresses images
 */
export async function processFiles(files: File[]): Promise<{
  attachments: Attachment[];
  errors: string[];
}> {
  const attachments: Attachment[] = [];
  const errors: string[] = [];

  for (const file of files) {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`${file.name} exceeds 10MB limit`);
      continue;
    }

    // Validate file type
    if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
      errors.push(`${file.name} is not a supported file type`);
      continue;
    }

    try {
      if (SUPPORTED_IMAGE_TYPES.includes(file.type)) {
        // Process image (no compression - Next Image handles optimization)
        const url = URL.createObjectURL(file);

        attachments.push({
          type: "image",
          id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          url,
          file,
        });
      } else {
        // Process other files
        attachments.push({
          type: "file",
          id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          name: file.name,
          size: file.size,
          file,
          mimeType: file.type,
        });
      }
    } catch (error) {
      errors.push(`Failed to process ${file.name}`);
    }
  }

  return { attachments, errors };
}

/**
 * Handle paste event and extract attachments
 * Supports: images, rich text, plain text
 */
export async function handlePaste(event: ClipboardEvent): Promise<{
  attachments: Attachment[];
  errors: string[];
}> {
  const attachments: Attachment[] = [];
  const errors: string[] = [];

  const items = event.clipboardData?.items;
  if (!items) return { attachments, errors };

  for (const item of Array.from(items)) {
    // Handle images
    if (item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (file) {
        try {
          const { attachments: processed, errors: processErrors } =
            await processFiles([file]);
          attachments.push(...processed);
          errors.push(...processErrors);
        } catch (error) {
          errors.push("Failed to process pasted image");
        }
      }
    }
    // Handle text (could be rich HTML or plain text)
    else if (item.type === "text/html" || item.type === "text/plain") {
      item.getAsString((text) => {
        if (text.trim()) {
          attachments.push({
            type: "text",
            id: `text_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
            content: text,
          });
        }
      });
    }
  }

  return { attachments, errors };
}

/**
 * Voice recording manager class
 */
export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private onStateChange?: (state: VoiceRecordingState) => void;

  constructor(onStateChange?: (state: VoiceRecordingState) => void) {
    this.onStateChange = onStateChange;
  }

  /**
   * Start recording audio from user's microphone
   */
  async start(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Use webm format for best compatibility
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      });

      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100); // Collect data every 100ms
      this.emitState();
    } catch (error) {
      this.emitState("Microphone access denied or not available");
      throw error;
    }
  }

  /**
   * Stop recording and return the audio blob
   */
  async stop(): Promise<Attachment | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.audioChunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);

        // Stop all tracks
        this.mediaRecorder?.stream.getTracks().forEach((track) => track.stop());

        const attachment: Attachment = {
          type: "voice",
          id: `voice_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          url,
          blob,
        };

        this.cleanup();
        resolve(attachment);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Cancel recording without saving
   */
  cancel(): void {
    if (this.mediaRecorder) {
      this.mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      this.cleanup();
    }
  }

  /**
   * Emit current state to callback
   */
  private emitState(error: string | null = null): void {
    if (this.onStateChange) {
      this.onStateChange({
        isRecording: this.mediaRecorder?.state === "recording",
        error,
      });
    }
  }

  /**
   * Clean up resources
   */
  private cleanup(): void {
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  /**
   * Check if browser supports audio recording
   */
  static isSupported(): boolean {
    return !!(
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function" &&
      typeof MediaRecorder !== "undefined"
    );
  }
}

/**
 * Revoke object URL to free memory
 * CRITICAL: Must be called when attachment is removed or component unmounts
 */
export function revokeAttachmentURL(attachment: Attachment): void {
  if (attachment.type === "image" || attachment.type === "voice") {
    URL.revokeObjectURL(attachment.url);
  }
}

// ============================================================================
// AI INPUT HANDLER FACTORIES
// ============================================================================

/**
 * Creates file upload handler with validation and max attachment limit
 */
export function createFileUploadHandler(
  attachments: Attachment[],
  setAttachments: (fn: (prev: Attachment[]) => Attachment[]) => void,
  maxAttachments: number,
  toast: { error: (msg: string) => void; success: (msg: string) => void }
) {
  return async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);
    const remainingSlots = maxAttachments - attachments.length;

    if (filesArray.length > remainingSlots) {
      toast.error(`Maximum ${maxAttachments} attachments allowed`);
      return;
    }

    const { attachments: newAttachments, errors } = await processFiles(
      filesArray
    );

    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
    }

    if (newAttachments.length > 0) {
      setAttachments((prev) => [...prev, ...newAttachments]);
      toast.success(`${newAttachments.length} file(s) added`);
    }
  };
}

/**
 * Creates paste event handler and enforces attachment limit
 */
export function createPasteHandler(
  attachments: Attachment[],
  setAttachments: (fn: (prev: Attachment[]) => Attachment[]) => void,
  maxAttachments: number,
  toast: { error: (msg: string) => void }
) {
  return async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const { attachments: newAttachments, errors } = await handlePaste(
      e.nativeEvent
    );

    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
    }

    if (newAttachments.length > 0) {
      const remainingSlots = maxAttachments - attachments.length;
      const toAdd = newAttachments.slice(0, remainingSlots);

      if (toAdd.length > 0) {
        setAttachments((prev) => [...prev, ...toAdd]);
      }

      if (newAttachments.length > remainingSlots) {
        toast.error(`Maximum ${maxAttachments} attachments allowed`);
      }
    }
  };
}

/**
 * Creates attachment removal handler with memory cleanup
 */
export function createRemoveAttachmentHandler(
  setAttachments: (fn: (prev: Attachment[]) => Attachment[]) => void
) {
  return (id: string) => {
    setAttachments((prev) => {
      const attachment = prev.find((a) => a.id === id);
      if (attachment) {
        revokeAttachmentURL(attachment);
      }
      return prev.filter((a) => a.id !== id);
    });
  };
}

/**
 * Creates voice recording toggle handler with state management
 */
export function createVoiceToggleHandler(
  voiceRecordingState: VoiceRecordingState,
  setVoiceRecordingState: (state: VoiceRecordingState) => void,
  voiceRecorderRef: React.RefObject<VoiceRecorder | null>,
  attachments: Attachment[],
  setAttachments: (fn: (prev: Attachment[]) => Attachment[]) => void,
  maxAttachments: number,
  toast: { error: (msg: string) => void; success: (msg: string) => void }
) {
  return async () => {
    if (!VoiceRecorder.isSupported()) {
      toast.error("Voice recording is not supported in your browser");
      return;
    }

    if (voiceRecordingState.isRecording) {
      // Stop recording
      const voiceAttachment = await voiceRecorderRef.current?.stop();
      if (voiceAttachment) {
        if (attachments.length >= maxAttachments) {
          toast.error(`Maximum ${maxAttachments} attachments allowed`);
          revokeAttachmentURL(voiceAttachment);
        } else {
          setAttachments((prev) => [...prev, voiceAttachment]);
          toast.success("Voice recording added");
        }
      }
      // Reset recording state after stop
      setVoiceRecordingState({
        isRecording: false,
        error: null,
      });
    } else {
      // Start recording
      try {
        await voiceRecorderRef.current?.start();
      } catch (error) {
        toast.error("Failed to start recording");
      }
    }
  };
}

/**
 * Creates voice recording cancel handler
 */
export function createVoiceCancelHandler(
  voiceRecorderRef: React.MutableRefObject<VoiceRecorder | null>,
  setVoiceRecordingState: (state: VoiceRecordingState) => void
) {
  return () => {
    voiceRecorderRef.current?.cancel();
    setVoiceRecordingState({ isRecording: false, error: null });
  };
}

/**
 * Creates AI input submission handler
 */
export function createSubmitHandler(
  inputValue: string,
  attachments: Attachment[],
  setInputValue: (value: string) => void,
  setAttachments: (attachments: Attachment[]) => void,
  toast: { success: (msg: string) => void }
) {
  return () => {
    if (inputValue.trim() || attachments.length > 0) {
      // TODO: Send to AI processing pipeline
      console.log("Submit:", { inputValue, attachments });

      // Clear input and attachments
      attachments.forEach(revokeAttachmentURL);
      setInputValue("");
      setAttachments([]);

      toast.success("Sent to AI");
    }
  };
}
