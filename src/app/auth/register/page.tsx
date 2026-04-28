"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2045c0-.638-.0573-1.252-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.6150z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1818l-2.9087-2.2581c-.8059.5400-1.8368.8582-3.0477.8582-2.3441 0-4.3282-1.5832-5.036-3.7105H.957v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71C3.7836 10.17 3.6818 9.5932 3.6818 9s.1018-1.17.2822-1.71V4.9582H.957C.3477 6.1732 0 7.5477 0 9s.3477 2.8268.957 4.0418L3.964 10.71z" fill="#FBBC05"/>
      <path d="M9 3.5791c1.3214 0 2.5077.4541 3.4405 1.346l2.5814-2.5814C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.957 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5791 9 3.5791z" fill="#EA4335"/>
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "success">("form");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState<"customer" | "owner">("customer");

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.name.trim().length < 2) { setError("Name must be at least 2 characters."); return; }
    if (!form.email.includes("@")) { setError("Enter a valid email address."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name.trim(), email: form.email.trim(), password: form.password, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Registration failed");
      setStep("success");
      setTimeout(() => router.push("/auth/login"), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (step === "success") {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <CheckCircle size={32} className="text-emerald-400" />
        </div>
        <h2 className="text-white font-bold text-2xl">Account Created!</h2>
        <p className="text-neutral-400 text-sm">Redirecting you to sign in...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center px-6 py-12">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="text-5xl mb-3">🎭</div>
        <h1 className="text-white font-bold text-3xl tracking-tight">Create Account</h1>
        <p className="text-neutral-400 text-sm mt-1">Join VenueGo — India&apos;s premier venue network</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        {/* Role toggle */}
        <div className="flex bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-1">
          <button
            type="button"
            onClick={() => setRole("customer")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${role === "customer" ? "bg-amber-400 text-black" : "text-neutral-400"}`}
          >
            I&apos;m a Customer
          </button>
          <button
            type="button"
            onClick={() => setRole("owner")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${role === "owner" ? "bg-amber-400 text-black" : "text-neutral-400"}`}
          >
            I&apos;m an Owner
          </button>
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={() => {
            document.cookie = `intended_role=${role}; path=/; max-age=300; SameSite=Lax`;
            import("next-auth/react").then(({ signIn }) => 
              signIn("google", { callbackUrl: role === "owner" ? "/owner/dashboard" : "/" })
            );
          }}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-semibold py-3.5 rounded-2xl hover:bg-gray-50 transition-colors text-sm"
        >
          <GoogleIcon /> Continue with Google
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#2a2a2a]" />
          <span className="text-neutral-600 text-xs">or register with email</span>
          <div className="flex-1 h-px bg-[#2a2a2a]" />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="name"
            type="text"
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Full name"
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3.5 text-sm outline-none focus:border-amber-400 placeholder:text-neutral-600 transition-colors"
          />
          <input
            name="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="Email address"
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3.5 text-sm outline-none focus:border-amber-400 placeholder:text-neutral-600 transition-colors"
          />
          <div className="relative">
            <input
              name="password"
              type={showPass ? "text" : "password"}
              required
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="Password (min. 8 characters)"
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3.5 text-sm outline-none focus:border-amber-400 placeholder:text-neutral-600 transition-colors pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#BFC8CA] hover:text-neutral-300"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {role === "owner" && (
            <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-3">
              <p className="text-amber-400 text-xs">
                🎭 As an owner you&apos;ll be able to list venues and manage inquiries from your dashboard.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-black font-bold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : "Create Account →"}
          </button>
        </form>

        <p className="text-center text-[#BFC8CA] text-sm">
          Already have an account?{" "}
          <a href="/auth/login" className="text-amber-400 hover:underline font-medium">Sign in</a>
        </p>

        <p className="text-center text-neutral-700 text-xs">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
