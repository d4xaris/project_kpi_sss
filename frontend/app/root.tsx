import { Outlet, Scripts, Links } from "react-router";
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