"use client";

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error monitoring service (Sentry, etc.)
      console.error('Global error:', {
        message: error.message,
        digest: error.digest,
        stack: error.stack,
      });
    }
  }, [error]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Something went wrong - Budget Buddy</title>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
          }
          .error-container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            padding: 3rem 2rem;
            max-width: 500px;
            width: 100%;
            text-align: center;
          }
          .error-icon {
            width: 80px;
            height: 80px;
            background: #fee2e2;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
          }
          .error-icon svg {
            width: 40px;
            height: 40px;
            color: #dc2626;
          }
          h1 {
            font-size: 1.5rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 0.5rem;
          }
          p {
            color: #6b7280;
            margin-bottom: 1.5rem;
            line-height: 1.6;
          }
          .error-details {
            background: #f9fafb;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1.5rem;
            text-align: left;
            font-size: 0.875rem;
          }
          .error-details code {
            font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', monospace;
            color: #dc2626;
            word-break: break-all;
          }
          .error-details .digest {
            color: #9ca3af;
            font-size: 0.75rem;
            margin-top: 0.5rem;
          }
          .button-group {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
          }
          button, .home-link {
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }
          button {
            background: #4f46e5;
            color: white;
            border: none;
          }
          button:hover {
            background: #4338ca;
            transform: translateY(-1px);
          }
          button:active {
            transform: translateY(0);
          }
          .home-link {
            background: #f3f4f6;
            color: #374151;
            border: 1px solid #e5e7eb;
          }
          .home-link:hover {
            background: #e5e7eb;
          }
          @media (max-width: 480px) {
            .error-container {
              padding: 2rem 1.5rem;
            }
            .button-group {
              flex-direction: column;
            }
            button, .home-link {
              width: 100%;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="error-container">
          <div className="error-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h1>Something went wrong</h1>
          <p>
            We apologize for the inconvenience. An unexpected error has occurred.
            Please try again or return to the homepage.
          </p>
          
          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="error-details">
              <code>{error.message}</code>
              {error.digest && (
                <div className="digest">Error ID: {error.digest}</div>
              )}
            </div>
          )}
          
          <div className="button-group">
            <button onClick={() => reset()}>
              Try Again
            </button>
            <a href="/" className="home-link">
              Return Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
