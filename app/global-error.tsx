"use client";

export default function GlobalError() {
  return (
    <html>
      <body>
        <main style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Something went wrong</h2>
            <a href="/" style={{ color: '#4f46e5', textDecoration: 'underline' }}>Return home</a>
          </div>
        </main>
      </body>
    </html>
  );
}
