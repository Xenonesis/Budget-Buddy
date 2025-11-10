export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-4">The page you are looking for doesn't exist or has been moved.</p>
        <a href="/" className="text-primary underline underline-offset-4">Go back home</a>
      </div>
    </main>
  )
}
