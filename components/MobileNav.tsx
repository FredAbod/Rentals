"use client";

import { useState } from "react";
import Link from "next/link";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger button — visible only on small screens */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-8 w-8 flex-col items-center justify-center gap-1.5 rounded-md md:hidden"
        aria-label="Toggle menu"
      >
        <span
          className={`block h-0.5 w-5 bg-white/80 transition-all duration-300 ${
            isOpen ? "translate-y-2 rotate-45" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-5 bg-white/80 transition-all duration-300 ${
            isOpen ? "opacity-0" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-5 bg-white/80 transition-all duration-300 ${
            isOpen ? "-translate-y-2 -rotate-45" : ""
          }`}
        />
      </button>

      {/* Full-screen overlay menu */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl md:hidden">
          <div className="flex h-full flex-col items-center justify-center gap-8">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-6 top-6 text-white/70 hover:text-white text-2xl"
              aria-label="Close menu"
            >
              ✕
            </button>
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="text-xl font-semibold text-white hover:text-accent transition-colors"
            >
              Home
            </Link>
            <Link
              href="/products"
              onClick={() => setIsOpen(false)}
              className="text-xl font-semibold text-white hover:text-accent transition-colors"
            >
              Collections
            </Link>
            <Link
              href="/how-it-works"
              onClick={() => setIsOpen(false)}
              className="text-xl font-semibold text-white/70 hover:text-accent transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/faqs"
              onClick={() => setIsOpen(false)}
              className="text-xl font-semibold text-white/70 hover:text-accent transition-colors"
            >
              FAQs
            </Link>
            <Link
              href="/delivery-areas"
              onClick={() => setIsOpen(false)}
              className="text-xl font-semibold text-white/70 hover:text-accent transition-colors"
            >
              Delivery Areas
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
