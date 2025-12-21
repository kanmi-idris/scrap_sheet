import { SITE_NAME } from "@/lib/constants";
import Link from "next/link";

const FOOTER_LINKS = [
  { name: "Privacy", href: "/privacy", ariaLabel: "Privacy Policy" },
  { name: "Terms", href: "/terms", ariaLabel: "Terms of Service" },
] as const;

export default function AppFooter() {
  return (
    <footer
      className="py-6 border-t border-white/5"
      aria-label="Site footer"
      role="contentinfo"
    >
      <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <p>
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </p>
        <nav aria-label="Footer navigation">
          <ul className="flex items-center gap-6 list-none p-0 m-0">
            {FOOTER_LINKS.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-sm"
                  aria-label={link.ariaLabel}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
