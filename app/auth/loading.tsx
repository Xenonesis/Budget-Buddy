/**
 * Fast loading skeleton for auth pages
 * Uses CSS-only animations for instant display
 */
export default function AuthLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-[400px] space-y-8">
        {/* Logo placeholder */}
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl fast-skeleton" />
          <div className="h-6 w-32 rounded-lg fast-skeleton" />
        </div>

        {/* Title placeholder */}
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg fast-skeleton" />
          <div className="h-4 w-64 rounded-lg fast-skeleton" />
        </div>

        {/* Form placeholder */}
        <div className="bg-card/50 rounded-2xl p-8 space-y-4 border border-border/30">
          <div className="space-y-1.5">
            <div className="h-4 w-24 rounded fast-skeleton" />
            <div className="h-11 w-full rounded-lg fast-skeleton" />
          </div>
          <div className="space-y-1.5">
            <div className="h-4 w-20 rounded fast-skeleton" />
            <div className="h-11 w-full rounded-lg fast-skeleton" />
          </div>
          <div className="h-11 w-full rounded-lg fast-skeleton" />
        </div>
      </div>
    </div>
  );
}
