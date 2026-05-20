"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const inputClass = "w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50";

export function LoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }

    router.push(data.teamId ? "/dashboard" : "/join-team");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-danger/10 text-danger text-sm px-4 py-3 rounded-lg border border-danger/20">{error}</div>
      )}
      <div>
        <label className="block text-[12px] font-medium text-muted mb-1.5 uppercase tracking-wider">Email</label>
        <input name="email" type="email" placeholder="you@uftech.com" required className={inputClass} />
      </div>
      <div>
        <label className="block text-[12px] font-medium text-muted mb-1.5 uppercase tracking-wider">Password</label>
        <input name="password" type="password" required className={inputClass} />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-hover disabled:opacity-50 cursor-pointer transition-colors"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
      <p className="text-center text-sm text-muted">
        No account?{" "}
        <Link href="/register" className="text-primary font-medium hover:underline">Register</Link>
      </p>
    </form>
  );
}
