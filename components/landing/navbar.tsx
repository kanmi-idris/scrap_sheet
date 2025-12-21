import { buttonVariants } from "@/components/ui/button";
import { GITHUB_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export function LandingNavbar() {
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

          {/* CTA */}
          <div className="flex items-center gap-4">
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
                "bg-white/5 border-white/10 hover:bg-white/10 text-white hover:text-white rounded-full px-6 cursor-pointer focus-visible:ring-2 focus-visible:ring-white"
              )}
              aria-label="Log in to your dashboard"
            >
              Log in
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
