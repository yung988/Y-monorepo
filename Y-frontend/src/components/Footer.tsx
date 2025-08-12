"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import NewsletterSignup from "./NewsletterSignup";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/cart")) {
    return null;
  }
  return (
    <div className="mt-20 mb-10">
      {/* Newsletter signup */}
      <div className="mb-16">
        <NewsletterSignup />
      </div>

      {/* Footer links */}
      <footer className="flex flex-wrap justify-between text-sm gap-4">
        <Link href="/pomoc" className="hover:underline">
          POMOC
        </Link>
        <Link href="/privacy" className="hover:underline">
          PRIVACY
        </Link>
        <Link href="/podminky" className="hover:underline">
          PODMÍNKY
        </Link>
        <Link href="/neprodavejte-me-osobni-udaje" className="hover:underline">
          NEPRODÁVEJTE MÉ OSOBNÍ ÚDAJE
        </Link>
        <Link href="/pristupnost" className="hover:underline">
          PŘÍSTUPNOST
        </Link>
      </footer>
    </div>
  );
}
