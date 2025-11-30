// CSS-only dashboard loading - no JS hydration needed for instant render
export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar skeleton */}
      <div className="hidden md:flex w-64 flex-col border-r bg-card p-4 gap-4">
        <div className="h-10 w-full rounded fast-skeleton" />
        <div className="flex flex-col gap-2 mt-4">
          <div className="h-10 w-full rounded fast-skeleton" />
          <div className="h-10 w-full rounded fast-skeleton" />
          <div className="h-10 w-full rounded fast-skeleton" />
          <div className="h-10 w-full rounded fast-skeleton" />
          <div className="h-10 w-full rounded fast-skeleton" />
          <div className="h-10 w-full rounded fast-skeleton" />
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 w-48 mb-2 rounded fast-skeleton" />
            <div className="h-4 w-32 rounded fast-skeleton" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-10 rounded-full fast-skeleton" />
            <div className="h-10 w-10 rounded-full fast-skeleton" />
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="p-6 rounded-lg border bg-card">
            <div className="h-4 w-24 mb-3 rounded fast-skeleton" />
            <div className="h-8 w-32 mb-2 rounded fast-skeleton" />
            <div className="h-3 w-20 rounded fast-skeleton" />
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <div className="h-4 w-24 mb-3 rounded fast-skeleton" />
            <div className="h-8 w-32 mb-2 rounded fast-skeleton" />
            <div className="h-3 w-20 rounded fast-skeleton" />
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <div className="h-4 w-24 mb-3 rounded fast-skeleton" />
            <div className="h-8 w-32 mb-2 rounded fast-skeleton" />
            <div className="h-3 w-20 rounded fast-skeleton" />
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <div className="h-4 w-24 mb-3 rounded fast-skeleton" />
            <div className="h-8 w-32 mb-2 rounded fast-skeleton" />
            <div className="h-3 w-20 rounded fast-skeleton" />
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <div className="p-6 rounded-lg border bg-card">
            <div className="h-5 w-40 mb-4 rounded fast-skeleton" />
            <div className="h-64 w-full rounded fast-skeleton" />
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <div className="h-5 w-40 mb-4 rounded fast-skeleton" />
            <div className="h-64 w-full rounded fast-skeleton" />
          </div>
        </div>

        {/* Recent transactions */}
        <div className="p-6 rounded-lg border bg-card">
          <div className="h-5 w-48 mb-4 rounded fast-skeleton" />
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full fast-skeleton" />
                <div>
                  <div className="h-4 w-32 mb-1 rounded fast-skeleton" />
                  <div className="h-3 w-24 rounded fast-skeleton" />
                </div>
              </div>
              <div className="h-5 w-20 rounded fast-skeleton" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full fast-skeleton" />
                <div>
                  <div className="h-4 w-32 mb-1 rounded fast-skeleton" />
                  <div className="h-3 w-24 rounded fast-skeleton" />
                </div>
              </div>
              <div className="h-5 w-20 rounded fast-skeleton" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full fast-skeleton" />
                <div>
                  <div className="h-4 w-32 mb-1 rounded fast-skeleton" />
                  <div className="h-3 w-24 rounded fast-skeleton" />
                </div>
              </div>
              <div className="h-5 w-20 rounded fast-skeleton" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
