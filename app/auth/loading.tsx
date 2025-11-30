/**
 * Fast loading skeleton for auth pages
 * Uses CSS-only animations for instant display
 */
export default function AuthLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-gradient-to-br from-background via-background to-primary/5">
      {/* Minimal loading indicator */}
      <div className="w-full max-w-md space-y-8">
        {/* Logo placeholder */}
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full fast-skeleton" />
        </div>

        {/* Title placeholder */}
        <div className="text-center space-y-2">
          <div className="h-8 w-48 mx-auto rounded fast-skeleton" />
          <div className="h-4 w-64 mx-auto rounded fast-skeleton" />
        </div>

        {/* Form placeholder */}
        <div className="bg-card/50 rounded-2xl p-8 space-y-4 border border-border/50">
          <div className="h-10 w-full rounded-lg fast-skeleton" />
          <div className="h-10 w-full rounded-lg fast-skeleton" />
          <div className="h-12 w-full rounded-lg fast-skeleton" />
        </div>

        {/* Footer link placeholder */}
        <div className="flex justify-center">
          <div className="h-4 w-32 rounded fast-skeleton" />
        </div>
      </div>
    </div>
  );
}
