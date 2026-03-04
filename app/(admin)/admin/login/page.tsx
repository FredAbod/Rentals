"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error ?? "Login failed");
      }
      router.push("/admin");
    } catch (error) {
      setStatus((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4.25rem)] max-w-sm items-center px-6">
      <div className="glass-surface w-full p-6 text-xs text-white/80">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-accent">
          Admin access
        </p>
        <h1 className="mt-2 text-lg font-semibold tracking-tight text-white">
          CS Signature command center
        </h1>
        <p className="mt-2 text-[0.75rem] text-white/60">
          This area is designed for internal operations only. Enter your admin
          credentials to continue.
        </p>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="space-y-1 block">
            <span className="text-[0.7rem] uppercase tracking-[0.22em] text-accent">
              Admin Email
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-xs outline-none ring-accent/40 focus:ring-1 text-white"
            />
          </label>
          <label className="space-y-1 block">
            <span className="text-[0.7rem] uppercase tracking-[0.22em] text-accent">
              Admin Password
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-xs outline-none ring-accent/40 focus:ring-1 text-white"
            />
          </label>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-accent px-4 py-2 text-xs font-medium text-black shadow-[0_0_30px_rgba(198,166,103,0.6)] hover:bg-accentMuted disabled:cursor-not-allowed disabled:bg-accent/60"
          >
            {isSubmitting ? "Signing in…" : "Enter dashboard"}
          </button>
          {status && (
            <p className="mt-2 text-[0.7rem] text-red-300">{status}</p>
          )}
        </form>
      </div>
    </div>
  );
}
