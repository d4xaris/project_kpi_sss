# SSS Project — Task Breakdown by Person
> Due: May 11 · Generated from codebase review on May 1

---

## 🎨 KATY — Frontend

### 🚨 BUG — Hardcoded test user must be removed before deploy
`useAuth.ts` has a block that forcibly logs in as `TestUser67` (id: 1) on every page load — it's uncommented and running right now. This means nobody can actually log in as themselves. Remove these two lines:
```ts
// DELETE THESE:
setUser({ id: 1, nickname: "TestUser67" });
setIsLoading(false);
```
The real logic right below (reading from `localStorage`) is already correct.

---

### 🚨 BUG — File casing will break in Docker/Linux
`routes.ts` imports `index("routes/Home.tsx")` but the actual file is `app/routes/home.tsx` (lowercase h). On Windows this works fine (case-insensitive filesystem), but inside a Docker container (Linux) it will crash with "module not found". Rename the file:
```
frontend/app/routes/home.tsx  →  frontend/app/routes/Home.tsx
```

---

### K-1 — Wire up `useGame.ts` hook
`useGame.ts` is currently just a comment. This is the most important frontend task — everything else in Game.tsx depends on it.

It needs to connect to the WebSocket endpoint Honike will build (`/game/:id/ws`), keep a local copy of game state, and expose actions for the UI:

```ts
export function useGame(gameId: number) {
  const [state, setState] = useState<GameStateSnapshot | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:3000/game/${gameId}/ws`);
    ws.current.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "STATE_UPDATE") setState(msg.state);
      if (msg.type === "GAME_OVER") { /* show result screen */ }
    };
    return () => ws.current?.close();
  }, [gameId]);

  const playCard = (card: Card, chosenColor?: CardColor) =>
    ws.current?.send(JSON.stringify({ action: "PLAY_CARD", card, chosenColor }));

  const drawCard = () =>
    ws.current?.send(JSON.stringify({ action: "DRAW_CARD" }));

  return { state, playCard, drawCard };
}
```

`GameStateSnapshot` and `CardColor` come from Xonex's shared types file — import, don't redefine.

---

### K-2 — Wire up `useLobby.ts` hook and connect Lobby.tsx / Create.tsx
`useLobby.ts` is currently just a comment, and both `Lobby.tsx` (shows mock rooms) and `Create.tsx` (Create button does nothing) need real API calls.

```ts
// app/hooks/useLobby.ts
export function useLobby() {
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    fetch("/game/sessions")
      .then(r => r.json())
      .then(setRooms);
  }, []);

  const createRoom = async (sessionName: string, maxPlayers: number) => {
    const res = await fetch("/game/create", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ sessionName, maxPlayers }),
    });
    const data = await res.json();
    return data; // { id, sessionName, ... }
  };

  const joinRoom = async (gameId: number) => {
    await fetch(`/game/${gameId}/join`, {
      method: "POST",
      headers: authHeaders(),
    });
  };

  return { rooms, createRoom, joinRoom };
}
```

In `Create.tsx`, the "Create" button should call `createRoom(roomName, players)` and then navigate to `/room/:newId`.

In `Lobby.tsx`, replace `MOCK_ROOMS` with `rooms` from `useLobby()`.

---

### K-3 — Wire up Room.tsx to real data
`Room.tsx` uses `MOCK_ROOM` instead of real data. It should fetch the room by ID from the URL params and poll (or listen via WS) for player joins:

```ts
const { id } = useParams();
const [room, setRoom] = useState<Room | null>(null);

useEffect(() => {
  fetch(`/game/${id}/status`)
    .then(r => r.json())
    .then(setRoom);
}, [id]);
```

The "Start game" button should call `POST /game/:id/start` and navigate to `/game`.

---

### K-4 — Wild color picker modal
When a player plays a Wild or Wild Draw 4 card, they need to pick a color. There is zero UI for this right now.

Add a modal that appears when `card.value === 'wild' || card.value === 'wild_draw4'`:
```tsx
function ColorPicker({ onPick }: { onPick: (color: CardColor) => void }) {
  const colors: CardColor[] = ['crimson', 'yellow', 'orange', 'purple'];
  return (
    <div className="color-picker-overlay">
      <div className="color-picker">
        <p>Choose a color</p>
        {colors.map(c => (
          <button
            key={c}
            className={`color-btn color-btn--${c}`}
            onClick={() => onPick(c)}
          />
        ))}
      </div>
    </div>
  );
}
```

When the player clicks a Wild, show the picker first, then call `playCard(card, chosenColor)` once they've picked.

---

### K-5 — Game over / winner screen
There is no screen for when the game ends. When the WS sends `{ type: "GAME_OVER", winner: playerId }`, show a result screen:

```tsx
if (gameOver) {
  return (
    <div className="game-over">
      <h1>{gameOver.winner === user?.id ? "You won! 🎉" : `${gameOver.winnerNickname} wins!`}</h1>
      <Button text="Play again" variant="solid" onClick={handleRematch} />
      <Button text="Leave" variant="underline" onClick={() => navigate("/play")} />
    </div>
  );
}
```

---

### K-6 — Protected routes (redirect to login)
Right now anyone can navigate to `/play`, `/create`, `/lobby` etc. without being logged in. Add a guard:

```tsx
// app/components/ProtectedRoute.tsx
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) navigate("/login");
  }, [isLoggedIn, isLoading]);

  if (isLoading || !isLoggedIn) return null;
  return <>{children}</>;
}
```

Wrap `/play`, `/create`, `/lobby`, `/room/:id`, `/game`, `/stats` in `routes.ts`.

---

### K-7 — Card hand rendering with fan layout
`SSSCard.tsx` is just a bare `<img>`. The hand needs to visually fan out like real cards in `Game.tsx`.

```tsx
{hand.map((card, i) => {
  const total = hand.length;
  const mid = (total - 1) / 2;
  const rotate = (i - mid) * 5;
  const translateY = Math.abs(i - mid) * 6;
  return (
    <div
      key={i}
      style={{
        transform: `rotate(${rotate}deg) translateY(${translateY}px)`,
        transition: "transform 0.2s",
        zIndex: i,
        marginLeft: i === 0 ? 0 : -40,
        cursor: "pointer",
      }}
      onClick={() => onCardClick(card)}
    >
      <SSSCard id={`${card.color}_${card.value}`} height={120} />
    </div>
  );
})}
```

Add CSS hover: card lifts upward on hover. Card ID format (`crimson_3`, `wild_wild`) already matches files in `public/cards/`.

---

### K-8 — Animate card plays
When a card is played, animate it flying toward the discard pile instead of just vanishing.

1. When player clicks a card, add `.card--playing` CSS class to it.
2. CSS animates it toward the table center.
3. After `transitionend`, remove it from hand state.

```css
.card--playing {
  transition: transform 0.3s ease-in, opacity 0.3s;
  transform: translate(var(--table-x), var(--table-y)) scale(0.8);
  opacity: 0;
}
```

Use `useRef` on the discard pile element to calculate the offset before triggering the animation.

---

### K-9 — Show other players' card counts
Other players' hands should be face-down stacks with a count badge, not their actual cards.

```tsx
function OtherPlayer({ nickname, cardCount }: { nickname: string; cardCount: number }) {
  return (
    <div className="other-player">
      <div className="card-stack">
        {Array.from({ length: Math.min(cardCount, 5) }).map((_, i) => (
          <img key={i} src="/cards/back.svg" height={80}
            style={{ marginLeft: i === 0 ? 0 : -30, zIndex: i }} />
        ))}
      </div>
      <span>{nickname} · {cardCount} cards</span>
    </div>
  );
}
```

`cardCount` comes from `state.playerCardCounts[playerId]` in `GameStateSnapshot`.

---

### K-10 — Turn indicator
```tsx
{isMyTurn && <div className="turn-banner">Your turn!</div>}
```
```css
.turn-banner { animation: pulse 1s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
```
Also highlight the active `OtherPlayer` with a glowing border. `isMyTurn` = `state.currentPlayerId === user?.id`.

---

### K-11 — Direction indicator
```tsx
<div style={{
  transform: direction === 1 ? "scaleX(1)" : "scaleX(-1)",
  transition: "transform 0.4s ease",
  fontSize: "2rem",
}}>↻</div>
```
`direction` comes from `state.direction` (1 = clockwise, -1 = counter-clockwise).

---

### K-12 — Wire Stats page to real API
`Stats.tsx` uses `MOCK_STATS`. Replace with a real fetch from `/auth/me` (which Honike will extend to include `totalWins`):

```ts
useEffect(() => {
  fetch("/auth/me", { headers: authHeaders() })
    .then(r => r.json())
    .then(data => setStats({ gamesPlayed: data.gamesPlayed, gamesWon: data.totalWins }));
}, []);
```

---

### K-13 — Proper 404 page
Create `frontend/app/routes/NotFound.tsx` and register it in `routes.ts` as a catch-all:
```ts
route("*", "./routes/NotFound.tsx")
```

---

---

## 🔌 HONIKE — Backend (connections, routes, infrastructure)

### 🚨 BUG-1 — Double route prefix (breaks every route right now)
`index.ts` registers `gameRoutes` with `prefix: "/game"`, but `game.ts` routes are already prefixed `/game/...`. Every game route resolves to `/game/game/create` etc. Same for auth.

**Fix — remove prefixes in `index.ts`:**
```ts
app.register(gameRoutes);
app.register(authRoutes);
```

---

### 🚨 BUG-2 — Prisma plugin never registered
`src/plugins/prisma.ts` exists but is never imported in `index.ts`. Every DB call will crash.

**Fix:**
```ts
import prismaPlugin from "./plugins/prisma.js";
await app.register(prismaPlugin); // before gameRoutes and authRoutes
```

---

### 🚨 BUG-3 — `/game/:id/status` never sends a response
```ts
// Add this after the null check:
return reply.send(game);
```

---

### 🚨 BUG-4 — Passwords stored in plain text
```bash
yarn add bcrypt && yarn add -D @types/bcrypt
```
```ts
import bcrypt from "bcrypt";
// register: const hashed = await bcrypt.hash(password, 10);
// login: const valid = await bcrypt.compare(password, user.password);
```

---

### H-1 — Add missing game routes

**GET /game/sessions** — list lobby rooms for the Lobby page:
```ts
app.get("/game/sessions", async (request, reply) => {
  const sessions = await app.prisma.GameSession.findMany({
    where: { status: "LOBBY" },
    include: { players: { select: { id: true, nickname: true } } },
  });
  return reply.send(sessions);
});
```

**POST /game/:id/join** — player joins an existing room:
```ts
app.post("/game/:id/join", async (request, reply) => {
  const user = request.user as { id: number };
  const gameId = Number((request.params as any).id);
  const game = await app.prisma.GameSession.findUnique({
    where: { id: gameId },
    include: { players: true },
  });
  if (!game) return reply.status(404).send({ error: "Game not found" });
  if (game.status !== "LOBBY") return reply.status(400).send({ error: "Game already started" });
  if (game.players.length >= game.maxPlayers) return reply.status(400).send({ error: "Room is full" });
  const updated = await app.prisma.GameSession.update({
    where: { id: gameId },
    data: { players: { connect: { id: user.id } } },
    include: { players: true },
  });
  return reply.send(updated);
});
```

**POST /game/:id/leave** — player leaves the lobby:
```ts
app.post("/game/:id/leave", async (request, reply) => {
  const user = request.user as { id: number };
  const gameId = Number((request.params as any).id);
  await app.prisma.GameSession.update({
    where: { id: gameId },
    data: { players: { disconnect: { id: user.id } } },
  });
  return reply.send({ message: "Left the room" });
});
```

Also add PATCH and DELETE to CORS `methods` in `plugins/cors.ts` — you'll need them eventually.

---

### H-2 — Extend /auth/me to include stats
The Stats page needs `totalWins` and eventually `gamesPlayed`. Extend `/auth/me`:
```ts
app.get("/auth/me", { preValidation: [(app as any).authenticate] }, async (request, reply) => {
  const { id } = request.user as { id: number };
  const user = await app.prisma.User.findUnique({
    where: { id },
    select: { id: true, nickname: true, totalWins: true },
  });
  return reply.send(user);
});
```

Note: the schema has `totalWins` but not a `gamesPlayed` count. Either add that column, or compute it as the number of `GameSession` entries the user is in.

---

### H-3 — Consistent error shape across all routes
```ts
// src/types/errors.ts
export interface ApiError { error: string; message: string; }
```
Add global error handler in `index.ts`. Use `fastify-sensible` for clean 404/400 helpers.

---

### H-4 — Run DB migrations
1. Fill in `DATABASE_URL` in `.env`
2. Run: `yarn prisma migrate dev --name init`
3. Commit `prisma/migrations/` to git

Also fix: `prisma.config.ts` imports from `"@prisma/client/extension"` — should be `"@prisma/client"`.

---

### H-5 — Wire game routes to GameRoom / GameState
Create in-memory store, then use it in `/game/:id/start`:
```ts
// src/game/store.ts
export const activeGames = new Map<number, GameState>();
```
```ts
// In start route:
const deck = new Deck();
deck.shuffle();
const state = new GameState(players, deck.getCards());
activeGames.set(gameId, state);
```

---

### H-6 — WebSocket endpoint for real-time state push
```bash
yarn add @fastify/websocket
```
```ts
// index.ts
import fastifyWs from "@fastify/websocket";
await app.register(fastifyWs);
```
```ts
// game.ts — new route
const roomSockets = new Map<number, Set<any>>();

app.get("/game/:id/ws", { websocket: true }, (socket, req) => {
  const gameId = Number((req.params as any).id);
  if (!roomSockets.has(gameId)) roomSockets.set(gameId, new Set());
  roomSockets.get(gameId)!.add(socket);

  socket.on("message", (raw: Buffer) => {
    const msg = JSON.parse(raw.toString());
    const state = activeGames.get(gameId);
    const userId = (req as any).user?.id;
    if (!state) return;

    let result;
    if (msg.action === "PLAY_CARD") result = state.playCard(userId, msg.card, msg.chosenColor);
    if (msg.action === "DRAW_CARD") result = state.drawCard(userId);

    if (result?.success === false) {
      socket.send(JSON.stringify({ type: "ERROR", reason: result.reason }));
      return;
    }

    // broadcast updated snapshot to each player individually
    for (const s of roomSockets.get(gameId)!) {
      s.send(JSON.stringify({ type: "STATE_UPDATE", state: state.getSnapshot(userId) }));
    }

    if (state.isGameOver()) {
      const result = state.getResult();
      broadcast(gameId, { type: "GAME_OVER", winner: result?.winner });
      // update DB: set status to ENDED, increment winner totalWins
      activeGames.delete(gameId);
    }
  });

  socket.on("close", () => {
    roomSockets.get(gameId)?.delete(socket);
    const state = activeGames.get(gameId);
    if (state) state.removePlayer(/* userId */);
  });
});

function broadcast(gameId: number, data: object) {
  const msg = JSON.stringify(data);
  for (const s of roomSockets.get(gameId) ?? []) s.send(msg);
}
```

---

### H-7 — Environment validation on startup
```ts
const REQUIRED_ENV = ["DATABASE_URL", "JWT_SECRET"];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) { console.error(`❌ Missing: ${key}`); process.exit(1); }
}
```

---

### H-8 — Logging
```bash
yarn add -D pino-pretty
```
```ts
const app = Fastify({
  logger: process.env.NODE_ENV === "production"
    ? true
    : { transport: { target: "pino-pretty" } }
});
```

---

### H-9 — Rate limiting on auth routes
```bash
yarn add @fastify/rate-limit
```
```ts
await app.register(import("@fastify/rate-limit"), { max: 10, timeWindow: "1 minute" });
```

---

### H-10 — Database connection error handling
In `src/plugins/prisma.ts`, wrap `$connect()`:
```ts
try {
  await prisma.$connect();
  app.log.info("✅ Database connected");
} catch (err) {
  app.log.error("❌ Could not connect to database.");
  process.exit(1);
}
```

---

### H-11 — Seed data / test room
Create `prisma/seed.ts` with test users (alice, bob) and a test game session. Add `"prisma": { "seed": "ts-node prisma/seed.ts" }` to `package.json`. Run with `yarn prisma db seed`.

---

### H-12 — Tests for routes and auth
Use `vitest` + `supertest`. Cover: registration (201), duplicate login (400), wrong password (401), correct login (200), unauthenticated game create (401), missing game status (404).

---

---

## 🧠 XONEX — Backend (game logic)

### X-1 — Finish `GameState.ts` — add all missing fields
Add to the class:
```ts
private topCard: Card;
private discardPile: Card[];
private currentPlayerIndex: number;
private direction: 1 | -1;
private drawBuffer: number;
```
On construction: take first card from deck as `topCard`, init `discardPile`, set `currentPlayerIndex = 0`, `direction = 1`.

---

### X-2 — Export shared types to `src/types/shared.ts`
Create this file with `CardColor`, `CardValue`, `Card`, `Player`, `ActionResult`, `GameStateSnapshot`, `Room`. Re-export from `Deck.ts` instead of redefining. Katy imports `GameStateSnapshot` and `CardColor` from here.

```ts
export type ActionResult =
  | { success: true }
  | { success: false; reason: "NOT_YOUR_TURN" | "INVALID_CARD" | "CARD_NOT_IN_HAND" | "GAME_OVER" };

export interface GameStateSnapshot {
  topCard: Card;
  currentPlayerId: number;
  direction: 1 | -1;
  playerCardCounts: Record<number, number>;
  myHand: Card[];
}
```

---

### X-3 — Implement `canPlayCard` in `src/game/rules.ts`
```ts
export function canPlayCard(card: Card, topCard: Card): boolean {
  if (card.color === 'wild') return true;
  if (card.color === topCard.color) return true;
  if (card.value === topCard.value) return true;
  return false;
}
```
Write unit tests for this — it's the core rule of the whole game.

---

### X-4 — Implement `playCard()` in `GameState.ts`
Validate turn, validate card is in hand, call `canPlayCard`, remove from hand, update discard pile and top card, call `applyCardEffect`. Return `ActionResult`.

---

### X-5 — Implement `applyCardEffect()` — all special cards
- `skip` → advance twice (skip next player)
- `reverse` → flip `direction *= -1`, advance once
- `drawtwo` → advance once, give next player 2 cards, advance again (they lose turn)
- `wild` → advance once (color already set from `chosenColor`)
- `wild_draw4` → advance once, give next player 4 cards, advance again
- numbers → advance once

`advanceTurn()`:
```ts
private advanceTurn(): void {
  this.currentPlayerIndex =
    (this.currentPlayerIndex + this.direction + this.playerIds.length) % this.playerIds.length;
}
```

---

### X-6 — Implement `drawCard()` with reshuffle
If deck is empty, reshuffle the discard pile (keep top card) back into the deck. Advance turn after drawing.

---

### X-7 — Implement `isGameOver()` and `getResult()`
```ts
isGameOver(): boolean {
  for (const [, hand] of this.playerHands) {
    if (hand.length === 0) return true;
  }
  return false;
}

getResult(): { winner: number } | null {
  for (const [playerId, hand] of this.playerHands) {
    if (hand.length === 0) return { winner: playerId };
  }
  return null;
}
```

---

### X-8 — Implement `getSnapshot(requestingPlayerId)` — per-player view
```ts
getSnapshot(requestingPlayerId: number): GameStateSnapshot {
  const counts: Record<number, number> = {};
  for (const [id, hand] of this.playerHands) counts[id] = hand.length;
  return {
    topCard: this.topCard,
    currentPlayerId: this.playerIds[this.currentPlayerIndex]!,
    direction: this.direction,
    playerCardCounts: counts,
    myHand: this.playerHands.get(requestingPlayerId) ?? [],
  };
}
```

---

### X-9 — Implement `removePlayer()` for disconnects
```ts
removePlayer(playerId: number): void {
  const idx = this.playerIds.indexOf(playerId);
  if (idx === -1) return;
  this.playerIds.splice(idx, 1);
  this.playerHands.delete(playerId);
  if (this.currentPlayerIndex >= this.playerIds.length) this.currentPlayerIndex = 0;
}
```
If `playerIds.length < 2` after removal, the game should end.

---

### X-10 — Decide: throw vs result objects
Use result objects throughout (already shown above). Document this at the top of `GameState.ts`.

---

### X-11 — Handle rematches (state side)
`GameState` is already cleanly constructable from scratch with new player IDs, so this is mostly Honike's routing task. Just make sure the constructor can be called multiple times independently.

---

### X-12 — Tests for game logic
Use `vitest`. Cover: deck generates 108 cards, shuffle changes order, `canPlayCard` all cases, dealing gives 7 cards each, `playCard` on wrong turn returns `NOT_YOUR_TURN`, `applyCardEffect` for each card type, `isGameOver` detects empty hand.

---

---

## 🐳 DOCKER + DEPLOYMENT (Honike leads, everyone reviews)

### D-1 — Backend Dockerfile
The frontend already has a Dockerfile. The backend needs one:

```dockerfile
# backend/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM node:20-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated ./src/generated

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

Note: the Prisma generated client (`src/generated/prisma`) needs to be present at runtime — make sure it's copied in.

---

### D-2 — `docker-compose.yml` tying everything together
Create in the project root:

```yaml
version: "3.9"
services:
  db:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: sss
      POSTGRES_PASSWORD: sss_secret
      POSTGRES_DB: sss_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    restart: always
    depends_on:
      - db
    environment:
      DATABASE_URL: postgresql://sss:sss_secret@db:5432/sss_db
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
      FRONTEND_URL: ${FRONTEND_URL}
    ports:
      - "3000:3000"
    command: >
      sh -c "npx prisma migrate deploy && node dist/index.js"

  frontend:
    build: ./frontend
    restart: always
    depends_on:
      - backend
    environment:
      NODE_ENV: production
    ports:
      - "80:3000"

volumes:
  postgres_data:
```

`prisma migrate deploy` (not `dev`) runs existing migrations in production without prompting.

---

### D-3 — `.env.example` file
Create in the project root so anyone can get started:

```env
# backend/.env.example
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/sss_db"
JWT_SECRET="replace_with_a_long_random_string"
FRONTEND_URL="https://your-deployed-frontend-url.com"
NODE_ENV="development"
```

---

### D-4 — Choose a deployment platform and deploy
Recommended: **Railway** (free tier, supports Docker Compose, Postgres add-on, easy env vars UI).

Steps for Railway:
1. Push the project to GitHub
2. Go to railway.app → New Project → Deploy from GitHub repo
3. Railway detects `docker-compose.yml` automatically
4. Add environment variables in the Railway UI: `JWT_SECRET`, `FRONTEND_URL`
5. Railway will give you a public URL for both frontend and backend

Alternatives if Railway doesn't work: **Render** (similar free tier), **Fly.io** (more control, slightly more setup).

---

### D-5 — CORS for production
`plugins/cors.ts` already reads `FRONTEND_URL` from env when `NODE_ENV === "production"` — this is already done correctly ✅. Just make sure `FRONTEND_URL` is set in the deployment environment variables.

Also add `"PATCH"` and `"DELETE"` to the CORS methods array for future-proofing:
```ts
methods: ["GET", "POST", "PATCH", "DELETE"],
```

---

### D-6 — Fix frontend Dockerfile to use yarn (not npm)
The existing frontend Dockerfile uses `npm ci` and `npm run build`, but the project uses `yarn`. This will fail because there's no `package-lock.json`:

```dockerfile
# Replace all npm commands in frontend/Dockerfile with:
RUN yarn install --frozen-lockfile
# ...
RUN yarn build
# ...
CMD ["yarn", "start"]
```

---

## ✅ Completion Checklist

**Before the game is actually playable:**
- [ ] BUG-1: Fix double route prefix (Honike)
- [ ] BUG-2: Register Prisma plugin (Honike)
- [ ] BUG-3: Fix status route missing reply.send (Honike)
- [ ] BUG-4: Hash passwords (Honike)
- [ ] Katy bug: Remove hardcoded TestUser (Katy)
- [ ] Katy bug: Fix home.tsx casing (Katy)
- [ ] H-4: Run DB migrations
- [ ] X-1 through X-8: Game logic (Xonex)
- [ ] H-5 + H-6: Wire routes to game state + WebSocket (Honike)
- [ ] K-1: useGame.ts hook (Katy)
- [ ] K-4: Wild color picker (Katy)

**Before shipping:**
- [ ] K-2, K-3: Wire Lobby + Create to real API (Katy)
- [ ] H-1: Missing routes (join, leave, sessions list) (Honike)
- [ ] K-6: Protected routes (Katy)
- [ ] K-5: Game over screen (Katy)
- [ ] H-9: Seed data (Honike)
- [ ] IMP-2 through IMP-5: Env validation, logging, rate limiting, DB error handling (Honike)
- [ ] Tests (everyone)

**For deployment:**
- [ ] D-1: Backend Dockerfile (Honike)
- [ ] D-2: docker-compose.yml (Honike)
- [ ] D-3: .env.example (Honike)
- [ ] D-6: Fix frontend Dockerfile to use yarn (Honike)
- [ ] D-4: Deploy to Railway/Render
