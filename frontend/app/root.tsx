import { Outlet, Scripts } from "react-router";
import "./app.css";

export default function Root() {
  return (
    <html>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}