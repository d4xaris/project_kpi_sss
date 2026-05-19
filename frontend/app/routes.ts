import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  layout("Layout.tsx", [
    index("routes/home.tsx"),
    route("login", "routes/Login.tsx"),
    route("settings", "routes/Settings.tsx"),
    route("how-to-play", "routes/HowToPlay.tsx"),
    layout("components/ProtectedRoute.tsx", [
      route("lobby", "routes/Lobby.tsx"),
      route("play", "routes/Play.tsx"),
      route("stats", "routes/Stats.tsx"),
      route("create", "routes/Create.tsx"),
      route("game", "routes/Game.tsx"),
      route("room/:id", "routes/Room.tsx"),
    ]),
    route("*", "routes/NotFound.tsx"),
  ]),
] satisfies RouteConfig;