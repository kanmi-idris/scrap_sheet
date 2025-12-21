import { SITE_NAME } from "@/lib/constants";
import Link from "next/link";

const FOOTER_LINKS = [
  { name: "Privacy", href: "/privacy", ariaLabel: "Privacy Policy" },
  { name: "Terms", href: "/terms", ariaLabel: "Terms of Service" },
] as const;

export default function LandingFooter() {
  return (
    <footer
      className="mt-32 py-12 border-t border-white/5"
      aria-label="Site footer"
      role="contentinfo"
    >
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-neutral-400">
        <p aria-label="Copyright">
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </p>
        <nav aria-label="Footer navigation">
          <ul className="flex items-center gap-8 list-none p-0 m-0" role="list">
            {FOOTER_LINKS.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-sm"
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
