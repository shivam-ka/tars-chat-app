"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b px-6 py-4">
      <Link href="/" className="text-xl font-semibold">
        Tars Chat
      </Link>

      <div>
        <SignedOut>
          <Link
            href="/sign-in"
            className="rounded-md bg-black px-4 py-2 text-white"
          >
            Get Started
          </Link>
        </SignedOut>

        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </nav>
  );
}
