"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GITHUB_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Avatar } from "@base-ui/react/avatar";
import { Cancel01Icon, SearchIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef } from "react";

interface AppNavbarProps {
  isLoggedIn?: boolean;
  initials?: string;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
}

export function AppNavbar({
  isLoggedIn = false,
  initials,
  searchTerm = "",
  onSearchChange,
}: AppNavbarProps) {
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = useCallback(
    (value: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new debounced timer
      debounceTimerRef.current = setTimeout(() => {
        onSearchChange?.(value);
      }, 300);
    },
    [onSearchChange]
  );

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded-md focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>
      <nav
        className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-md"
        aria-label="Primary navigation"
        role="navigation"
      >
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-sm"
              aria-label="Scrap Sheet Home"
            >
              <Image
                src="/full_logo.png"
                alt="Scrap_sheet"
                width={120}
                height={32}
                className="h-6 w-auto opacity-90"
                priority
                aria-hidden="true"
              />
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                {/* Search */}
                <div className="relative max-w-56" role="search">
                  <HugeiconsIcon
                    icon={SearchIcon}
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50 z-10 pointer-events-none"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <Input
                    className="h-9 w-full bg-white/5 border-transparent pl-9 pr-9 rounded-xl text-neutral-50 placeholder:text-muted-foreground/50 hover:bg-white/10 hover:border-white/5 focus-visible:bg-black/40 focus-visible:border-white/10 focus-visible:ring-1 focus-visible:ring-white/10 transition-all font-excali text-xs"
                    placeholder="Search documents"
                    aria-label="Search documents by title"
                    defaultValue={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                  {/* Clear search button */}
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onSearchChange?.("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      aria-label="Clear search"
                    >
                      <HugeiconsIcon
                        icon={Cancel01Icon}
                        className="size-3.5 text-muted-foreground/50 hover:text-muted-foreground"
                        strokeWidth={2}
                      />
                    </Button>
                  )}
                </div>

                {/* Avatar */}
                <Avatar.Root
                  className="inline-flex size-10 sh items-center justify-center overflow-hidden rounded-full bg-background-night border border-white/8 align-middle text-sm font-medium text-muted-foreground select-none cursor-pointer hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white font-excali"
                  aria-label="User initials"
                >
                  {initials}
                </Avatar.Root>
              </>
            ) : (
              <>
                <Link
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-neutral-400 hover:text-white transition-colors hidden sm:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-sm px-2 py-1"
                  aria-label="Visit Scrap Sheet GitHub repository (opens in a new tab)"
                >
                  GitHub
                </Link>
                <Link
                  href="/dashboard"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "bg-white/5 border-white/10 hover:bg-white/8 text-white hover:text-white rounded-full px-6 cursor-pointer focus-visible:ring-2 focus-visible:ring-white"
                  )}
                  aria-label="Log in to your dashboard"
                >
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
