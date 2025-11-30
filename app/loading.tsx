// CSS-only loading for instant render - no JS hydration needed
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        {/* CSS-only spinner */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-primary/10" />
          <div
            className="absolute inset-0 w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary"
            style={{ animation: 'spin 0.8s linear infinite' }}
          />
        </div>

        {/* CSS-only shimmer loading text */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-4 w-32 rounded fast-skeleton" />
          <div className="h-3 w-24 rounded fast-skeleton" />
        </div>
      </div>
    </div>
  );
}
