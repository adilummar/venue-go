export default function ExploreLoading() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] px-4 pt-12 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-28 bg-[#1a1a1a] rounded-lg" />
        <div className="w-9 h-9 bg-[#1a1a1a] rounded-full" />
      </div>

      {/* Search skeleton */}
      <div className="bg-[#1a1a1a] rounded-2xl h-40 mb-5" />

      {/* Category tabs skeleton */}
      <div className="flex gap-2 mb-5 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 w-28 bg-[#1a1a1a] rounded-full shrink-0" />
        ))}
      </div>

      {/* Title skeleton */}
      <div className="h-8 w-40 bg-[#1a1a1a] rounded-lg mb-4" />

      {/* Card skeletons */}
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-[#1a1a1a] rounded-xl overflow-hidden mb-4">
          <div className="aspect-[16/9] bg-[#222]" />
          <div className="p-4 space-y-2">
            <div className="h-5 w-3/4 bg-[#2a2a2a] rounded" />
            <div className="h-4 w-1/2 bg-[#2a2a2a] rounded" />
            <div className="h-4 w-24 bg-[#2a2a2a] rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
