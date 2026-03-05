import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import MobileNav from "@/components/MobileNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "CS Signature Celebrations | Party Rentals London",
  description:
    "Premium party and event rentals in London—spoons, coolers, barware, seating and more. Book online with live availability.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-950 via-[#080808] to-black text-white antialiased">
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-black border border-white/10">
                  <Image
                    src="/logo.png"
                    alt="CS Signature Celebrations Logo"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <span className="text-sm font-semibold tracking-wide">
                    CS Signature
                  </span>
                  <span className="ml-1 text-xs text-white/50">
                    Celebrations
                  </span>
                </div>
              </Link>
              <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
                <Link
                  href="/products"
                  className="hover:text-white transition-colors"
                >
                  Collections
                </Link>
              </nav>
              <MobileNav />
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="mt-auto border-t border-white/5 bg-black/60">
            <div className="mx-auto max-w-6xl px-6 py-16">
              <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <Link href="/" className="flex items-center gap-2">
                    <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-black border border-white/10">
                      <Image
                        src="/logo.png"
                        alt="CS Signature Celebrations Logo"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="font-semibold">
                      CS Signature Celebrations
                    </span>
                  </Link>
                  <p className="mt-4 text-sm text-white/50">
                    Premium party and event rentals across London.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Shop</h4>
                  <ul className="mt-4 space-y-2 text-sm text-white/50">
                    <li>
                      <Link
                        href="/products"
                        className="hover:text-white transition-colors"
                      >
                        All collections
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/products"
                        className="hover:text-white transition-colors"
                      >
                        Party spoons & stirrers
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/products"
                        className="hover:text-white transition-colors"
                      >
                        Coolers & ice buckets
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/products"
                        className="hover:text-white transition-colors"
                      >
                        Barware & drink dispensers
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Support</h4>
                  <ul className="mt-4 space-y-2 text-sm text-white/50">
                    <li>
                      <Link
                        href="/how-it-works"
                        className="hover:text-white transition-colors"
                      >
                        How it works
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/delivery-areas"
                        className="hover:text-white transition-colors"
                      >
                        Delivery areas
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/faqs"
                        className="hover:text-white transition-colors"
                      >
                        FAQs
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Contact</h4>
                  <p className="mt-4 text-sm text-white/50">London, UK</p>
                  <p className="mt-1 text-sm text-white/50">
                    hello@cssignature.co.uk
                  </p>
                </div>
              </div>
              <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
                <p className="text-xs text-white/40">
                  © {new Date().getFullYear()} CS Signature Celebrations. All
                  rights reserved.
                </p>
                <div className="flex gap-6 text-xs text-white/40">
                  <Link
                    href="#"
                    className="hover:text-white/60 transition-colors"
                  >
                    Privacy
                  </Link>
                  <Link
                    href="#"
                    className="hover:text-white/60 transition-colors"
                  >
                    Terms
                  </Link>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
