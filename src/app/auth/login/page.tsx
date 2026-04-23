import { Metadata } from "next";
import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserByEmail } from "@/db/queries/users";

export const metadata: Metadata = { title: "Sign In — VenueGo" };

const googleConfigured =
  !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const session = await auth();
  // If already logged in, redirect to the right place
  if (session?.user) {
    if (session.user.role === "owner" || session.user.role === "admin") {
      redirect("/owner/dashboard");
    }
    redirect("/");
  }

  const { error, callbackUrl } = await searchParams;

  async function handleCredentials(fd: FormData) {
    "use server";
    const email = fd.get("email") as string;
    const password = fd.get("password") as string;

    // Look up user role to decide where to redirect after login
    let redirectTo = callbackUrl ?? "/";
    try {
      const user = await getUserByEmail(email);
      if (user?.role === "owner" || user?.role === "admin") {
        redirectTo = "/owner/dashboard";
      }
    } catch {}

    await signIn("credentials", { email, password, redirectTo });
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="text-5xl mb-3">🎭</div>
        <h1 className="text-white font-bold text-3xl tracking-tight">Venue Go</h1>
        <p className="text-neutral-400 text-sm mt-1">Discover &amp; Book Auditoriums</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        {/* Error from NextAuth */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-center">
            <p className="text-red-400 text-sm font-semibold">
              {error === "OAuthSignin" || error === "OAuthCallbackError"
                ? "Google sign-in failed. Check your OAuth credentials in .env.local."
                : error === "CredentialsSignin"
                ? "Invalid email or password. Please try again."
                : "Sign in failed. Please try again."}
            </p>
          </div>
        )}

        {/* Google Sign In */}
        {googleConfigured ? (
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-semibold py-3.5 rounded-2xl hover:bg-gray-50 transition-colors text-sm"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </form>
        ) : (
          <div className="bg-[#1a1a1a] border border-amber-500/30 rounded-2xl p-4 text-center">
            <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
              Google OAuth not configured
            </p>
            <p className="text-[#BFC8CA] text-xs">
              Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local to enable Google Sign-In.
            </p>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#2a2a2a]" />
          <span className="text-neutral-600 text-xs">or sign in with email</span>
          <div className="flex-1 h-px bg-[#2a2a2a]" />
        </div>

        {/* Dev quick-login hint */}
        <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-3">
          <p className="text-teal-400 text-xs font-semibold mb-1">🔑 Test accounts</p>
          <p className="text-neutral-400 text-xs font-mono">owner@venuego.dev</p>
          <p className="text-neutral-400 text-xs font-mono">customer@venuego.dev</p>
          <p className="text-neutral-600 text-xs mt-1">(any password works in dev mode)</p>
        </div>

        {/* Email form */}
        <form action={handleCredentials} className="space-y-3">
          <input
            name="email"
            type="email"
            required
            placeholder="Email address"
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3.5 text-sm outline-none focus:border-amber-400 placeholder:text-neutral-600 transition-colors"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Password (any value works in dev)"
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3.5 text-sm outline-none focus:border-amber-400 placeholder:text-neutral-600 transition-colors"
          />
          <button
            type="submit"
            className="w-full bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-black font-bold py-3.5 rounded-xl text-sm transition-colors"
          >
            Sign In →
          </button>
        </form>

        <p className="text-center text-[#BFC8CA] text-sm">
          Don&apos;t have an account?{" "}
          <a href="/auth/register" className="text-amber-400 hover:underline font-medium">Create one</a>
        </p>

        <p className="text-center text-neutral-700 text-xs">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

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
