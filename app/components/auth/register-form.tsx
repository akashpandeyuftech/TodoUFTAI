"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const inputClass =
  "w-full px-3 py-2.5 bg-[#111] border border-border rounded-lg text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/25";

export function RegisterForm() {
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
        display_name: form.get("display_name"),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      if (data.fieldErrors) setFieldErrors(data.fieldErrors);
      else setError(data.error || "Registration failed");
      return;
    }

    router.push("/join-team");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-danger/10 text-danger text-sm px-4 py-3 rounded-lg border border-danger/20">{error}</div>
      )}
      <div>
        <label className="block text-[11px] font-medium text-muted mb-1.5 uppercase tracking-widest">Display Name</label>
        <input name="display_name" placeholder="Your name" required minLength={2} maxLength={50} className={inputClass} />
        {fieldErrors.display_name && <p className="text-danger text-xs mt-1">{fieldErrors.display_name[0]}</p>}
      </div>
      <div>
        <label className="block text-[11px] font-medium text-muted mb-1.5 uppercase tracking-widest">Email</label>
        <input name="email" type="email" placeholder="you@uftech.com" required className={inputClass} />
        {fieldErrors.email && <p className="text-danger text-xs mt-1">{fieldErrors.email[0]}</p>}
      </div>
      <div>
        <label className="block text-[11px] font-medium text-muted mb-1.5 uppercase tracking-widest">Password</label>
        <input name="password" type="password" required minLength={8} className={inputClass} />
        {fieldErrors.password && <p className="text-danger text-xs mt-1">{fieldErrors.password[0]}</p>}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-white text-black py-2.5 rounded-lg text-sm font-semibold hover:bg-white/90 disabled:opacity-50 cursor-pointer transition-colors"
      >
        {loading ? "Creating account..." : "Create Account"}
      </button>
      <p className="text-center text-xs text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-white font-medium hover:underline">Sign in</Link>
      </p>
    </form>
  );
}
