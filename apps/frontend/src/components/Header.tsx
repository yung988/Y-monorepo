"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { CartDropdown } from "@/components/CartDropdown";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  // Hide header on cart page
  if (pathname?.startsWith("/cart")) {
    return null;
  }

  return (
    <>
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24 max-w-[1400px]">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="text-2xl font-medium text-black hover:text-gray-700 transition-colors"
            >
              YEEZUZ2020
            </Link>

            {/* Right side buttons */}
            <div className="flex items-center gap-2">
              {/* Search icon (link to home for now) */}
              <Link
                href="/"
                aria-label="Hledat"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
              >
                <Search className="h-5 w-5" />
              </Link>
              {/* Cart Dropdown */}
              <CartDropdown />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
