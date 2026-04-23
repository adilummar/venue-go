import Link from "next/link";

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const messages: Record<string, string> = {
    OAuthSignin: "Could not start Google sign-in. Check OAuth credentials.",
    OAuthCallback: "Google OAuth callback failed.",
    OAuthCreateAccount: "Could not create account from Google.",
    Callback: "OAuth callback error.",
    OAuthAccountNotLinked: "Email already used with a different provider.",
    EmailCreateAccount: "Could not create email account.",
    SessionRequired: "You must be signed in to access this page.",
    Default: "An authentication error occurred.",
  };

  const message = error ? (messages[error] ?? messages.Default) : messages.Default;

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center px-6 text-center">
      <div className="text-5xl mb-5">⚠️</div>
      <h1 className="text-white font-bold text-2xl mb-2">Sign In Error</h1>
      <p className="text-neutral-400 text-sm mb-2 max-w-sm">{message}</p>
      {error === "OAuthSignin" || error === "OAuthCallback" ? (
        <div className="mt-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 max-w-sm text-left">
          <p className="text-amber-400 text-xs font-bold mb-1">Fix for Google OAuth:</p>
          <ol className="text-neutral-400 text-xs space-y-1 list-decimal list-inside">
            <li>Go to console.cloud.google.com</li>
            <li>APIs & Services → Credentials → Create OAuth 2.0 client</li>
            <li>Add redirect URI: http://localhost:3000/api/auth/callback/google</li>
            <li>Paste Client ID & Secret into .env.local</li>
            <li>Restart the dev server</li>
          </ol>
        </div>
      ) : null}
      <Link
        href="/auth/login"
        className="mt-6 px-6 py-3 bg-amber-400 text-black font-bold rounded-xl text-sm hover:bg-amber-500 transition-colors"
      >
        ← Back to Login
      </Link>
    </div>
  );
}
