"use client";

import { useState } from "react";
import { seedProductsAction } from "./actions";

export default function SeedProductsButton() {
  const [isPending, setIsPending] = useState(false);

  async function handleSeed() {
    setIsPending(true);
    await seedProductsAction();
    setIsPending(false);
  }

  return (
    <button
      onClick={handleSeed}
      disabled={isPending}
      className="rounded-md bg-accent px-4 py-2 text-xs font-semibold text-black transition hover:bg-accentMuted disabled:opacity-50"
    >
      {isPending ? "Seeding..." : "Seed Default Products"}
    </button>
  );
}
