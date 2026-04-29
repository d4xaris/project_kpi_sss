import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  layout("Layout.tsx", [
    index("routes/Home.tsx"),
    route("login", "routes/Login.tsx"),
    route("lobby", "routes/Lobby.tsx"),
    route("settings", "routes/Settings.tsx"),
    route("how-to-play", "routes/HowToPlay.tsx"),
    route("play", "routes/Play.tsx"),
    route("stats", "routes/Stats.tsx"),
    route("create", "routes/Create.tsx"),
    route("game", "routes/Game.tsx"),
    route("room/:id", "routes/Room.tsx"),
  ]),
] satisfies RouteConfig;