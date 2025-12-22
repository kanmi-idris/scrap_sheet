"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  Add01Icon,
  ArrowUp01Icon,
  Mic02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

interface AIInputBarProps {
  showAcceptReject: boolean;
  onAccept: () => void;
  onReject: () => void;
}

export function AIInputBar() {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = () => {
    if (inputValue.trim()) {
      setInputValue("");
    }
  };

  return (
    <div className="flex flex-col gap-3 items-center">
      <InputGroup className="w-full max-w-md rounded-2xl border border-muted-foreground/30 bg-card">
        <InputGroupTextarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="pour out your thoughts exactly as it comes to you"
          className="min-h-15 text-sm"
          rows={2}
        />
        <InputGroupAddon align="block-end">
          <InputGroupButton
            variant="outline"
            className="rounded-full cursor-pointer"
            size="icon-sm"
          >
            <HugeiconsIcon
              icon={Add01Icon}
              className="h-4 w-4"
              strokeWidth={2}
            />
          </InputGroupButton>

          <InputGroupButton
            variant="outline"
            className="rounded-full ml-2 cursor-pointer"
            size="icon-sm"
          >
            <HugeiconsIcon
              icon={Mic02Icon}
              className="h-4 w-4"
              strokeWidth={2}
            />
          </InputGroupButton>

          <InputGroupButton
            variant="default"
            className="rounded-full ml-auto cursor-pointer"
            size="icon-sm"
            disabled={!inputValue.trim()}
            onClick={handleSubmit}
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
  );
}
