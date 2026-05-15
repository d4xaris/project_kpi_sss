import { Outlet, Scripts, Links, isRouteErrorResponse, useRouteError, useNavigate } from "react-router";
import "./app.css";

export default function Root() {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Project SSS</title>
        <meta name="description" content="A multiplayer card game." />
        <Links />
        <link rel="icon" type="image/png" href="/favicon.png?v2" />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}

function ErrorPage({ code, title, message }: { code: number; title: string; message: string }) {
  const navigate = useNavigate();
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{code} — Project SSS</title>
        <Links />
        <link rel="icon" type="image/png" href="/favicon.png?v2" />
      </head>
      <body>
        <div className="home">
          <div className="home-content">
            <p style={{ fontSize: '3.5rem', margin: 0, lineHeight: 1, fontFamily: '"Hammersmith One", sans-serif' }}>
              {code}
            </p>
            <p style={{ fontSize: '1.1rem', opacity: 0.8, margin: '0.25rem 0 1.5rem' }}>{title}</p>
            <p style={{ fontSize: '0.9rem', opacity: 0.5, marginBottom: '1.5rem' }}>{message}</p>
            <button
              onClick={() => navigate('/')}
              style={{
                fontFamily: '"Hammersmith One", sans-serif',
                fontSize: '1rem',
                padding: '10px 28px',
                borderRadius: '12px',
                border: 'none',
                background: '#9f00f5',
                color: '#fff',
                cursor: 'pointer',
                letterSpacing: '0.05em',
              }}
            >
              Go home
            </button>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    const titles: Record<number, string> = {
      404: 'Page not found',
      403: 'Access denied',
      401: 'Unauthorized',
      500: 'Server error',
    };
    return (
      <ErrorPage
        code={error.status}
        title={titles[error.status] ?? error.statusText}
        message={error.data ?? 'Something went wrong on our end.'}
      />
    );
  }

  const msg = error instanceof Error ? error.message : 'An unexpected error occurred.';
  return <ErrorPage code={500} title="Something went wrong" message={msg} />;
}