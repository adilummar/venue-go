"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl mb-6">📡</div>
      <h1 className="text-white font-bold text-2xl mb-2">You&apos;re Offline</h1>
      <p className="text-neutral-400 text-sm mb-8 max-w-xs">
        No internet connection detected. Check your connection and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-amber-400 text-black font-bold rounded-2xl hover:bg-amber-500 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
