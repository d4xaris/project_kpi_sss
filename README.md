<p align="center">
  <img width="1281" height="336" alt="Image" src="https://github.com/user-attachments/assets/87072268-4888-46e0-ba04-317480d5a28e" />
</p>


<img width="1281" height="157" alt="Image" src="https://github.com/user-attachments/assets/c4aedc48-0d07-413e-9627-2b104b613222" />

---

<div align="center">

## tech stack

### Frontend Stack
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

### Backend 
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Fastify](https://img.shields.io/badge/fastify-%23000000.svg?style=for-the-badge&logo=fastify&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

👥 **Made by**  
[@d4xaris](https://github.com/d4xaris) · [@Honike-1](https://github.com/Honike-1) · [@X0nexed](https://github.com/X0nexed)

### Project SSS is a real-time multiplayer card game inspired by UNO. Create a room, invite friends, play cards, survive the chaos. Built with Fastify, Socket.IO, React, and PostgreSQL. Also has a troll card. You'll see.

</div>

---
## Getting the project running for the first time

### Prerequisites
- Node.js v22+
- PostgreSQL
- yarn

### Install dependencies

Backend:
```bash
cd backend
yarn install
```

Frontend:
```bash
cd frontend
yarn install
```

### Environment variables

1) Create a `.env` file in `/backend`:
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DB_NAME"
JWT_SECRET="your_secret_key"
FRONTEND_URL="http://localhost:5173"
```
2) Create a `.env` file in `/frontend`:
```env
VITE_API_URL=http://localhost:3000
```

Make sure to update the values to match your local environment.

### Database Setup (Prisma)

Once your environment variables are set, you need to sync your database schema and generate the Prisma Client:
```bash
cd backend

# Create the database tables
yarn prisma migrate dev --name init

# (Optional) Seed the database with test users
yarn prisma db seed

# (Optional) Generate the Prisma Client if not done automatically
yarn prisma generate
```
### Running the project

Backend:
```bash
cd backend
yarn dev
```

Frontend:
```bash
cd frontend
yarn dev
```
---

<img width="1281" height="157" alt="1 (5)" src="https://github.com/user-attachments/assets/9cf81bda-a018-4bd2-87d9-a03d17134d50" />

## Lab 1. Generators and Iterators · [@X0nexed](https://github.com/X0nexed)
For example:
**[backend\src\game\GameState.ts](https://github.com/d4xaris/project_kpi_sss/blob/main/backend/src/game/GameState.ts#L41-L44)**
```bash
            for (const ids of this.playerIds) {
            const hand = this.deck.splice(0, 7);
            this.playerHands.set(ids, hand);
        }
```

## Lab 2. Project Setup · [@d4xaris](https://github.com/d4xaris) 
```bash
project_kpi_sss
├── README.md
├── backend
│   ├── Dockerfile
│   ├── package-lock.json
│   ├── package.json
│   ├── prisma
│   │   ├── migrations
│   │   │   └── migration_lock.toml
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── prisma.config.ts
│   ├── src
│   │   ├── game
│   │   │   ├── BiDiPriorityQueue.ts
│   │   │   ├── Deck.ts
│   │   │   ├── GameRoom.ts
│   │   │   ├── GameState.ts
│   │   │   ├── logger
│   │   │   ├── memo.ts
│   │   │   ├── rules.ts
│   │   │   └── shared.ts
│   │   ├── generated
│   │   │   └── prisma
│   │   ├── index.ts
│   │   ├── plugins
│   │   │   ├── cors.ts
│   │   │   ├── errorHandler.ts
│   │   │   ├── jwt.ts
│   │   │   ├── prisma.ts
│   │   │   ├── socket.ts
│   │   │   └── sockets
│   │   ├── routes
│   │   │   ├── auth.ts
│   │   │   └── game.ts
│   │   └── services
│   │       ├── AuthService.ts
│   │       └── GameService.ts
│   ├── tsconfig.json
│   └── yarn.lock
└── frontend
    ├── Dockerfile
    ├── app
    │   ├── Layout.tsx
    │   ├── app.css
    │   ├── components
    │   │   ├── Button.tsx
    │   │   ├── CatchEffect.tsx
    │   │   ├── ColorPicker.tsx
    │   │   ├── FlyingCard.tsx
    │   │   ├── GameActions.tsx
    │   │   ├── GameCurtain.tsx
    │   │   ├── HowToPlayCard.tsx
    │   │   ├── OpponentHand.tsx
    │   │   ├── OpponentLayout.tsx
    │   │   ├── PlayerHand.tsx
    │   │   ├── ProtectedRoute.tsx
    │   │   ├── SSSCard.tsx
    │   │   ├── Slider.tsx
    │   │   ├── SoloEffects.tsx
    │   │   ├── TableCenter.tsx
    │   │   ├── TrollScreen.tsx
    │   │   └── WinScreen.tsx
    │   ├── hooks
    │   │   ├── authProxy.ts
    │   │   ├── useAuth.ts
    │   │   ├── useCatch.ts
    │   │   ├── useGame.ts
    │   │   ├── useLobby.ts
    │   │   ├── useSolo.ts
    │   │   └── useSounds.ts
    │   ├── mockData.ts
    │   ├── root.tsx
    │   ├── routes
    │   │   ├── Create.tsx
    │   │   ├── Game.tsx
    │   │   ├── HowToPlay.tsx
    │   │   ├── Lobby.tsx
    │   │   ├── Login.tsx
    │   │   ├── NotFound.tsx
    │   │   ├── Play.tsx
    │   │   ├── Room.tsx
    │   │   ├── Settings.tsx
    │   │   ├── Stats.tsx
    │   │   └── home.tsx
    │   ├── routes.ts
    │   ├── socket
    │   │   └── client.ts
    │   ├── sounds.ts
    │   └── types
    │       └── game.ts
    ├── package.json
    ├── public
    ├── react-router.config.ts
    ├── tsconfig.json
    ├── vite.config.ts
    └── yarn.lock
```
## Lab 3. Implementing a Memoization Function · [@X0nexed](https://github.com/X0nexed)
For example: 
**[backend\src\game\memo.ts](https://github.com/d4xaris/project_kpi_sss/blob/main/backend/src/game/memo.ts#L43-L104)**
```bash
export function memoize<A extends unknown[], R>(
  fn:   (...args: A) => R,
  opts: MemoOptions<R> = {},
): (...args: A) => R {
  const { maxSize, policy = 'lru', ttlMs, customEvict } = opts;
  const cache    = new Map<string, Entry<R>>();
  const ttlQueue = new Queue<string>();

  const key = (args: A) => JSON.stringify(args);

  const evict = () => {
    if (!maxSize || cache.size < maxSize) return;
    let victim: string | undefined;
    if (policy === 'lru') {
      let min = Infinity;
      for (const [k, e] of cache) if (e.lastUsed < min) { min = e.lastUsed; victim = k; }
    } else if (policy === 'lfu') {
      let min = Infinity;
      for (const [k, e] of cache) if (e.useCount < min) { min = e.useCount; victim = k; }
    } else if (policy === 'ttl') {
      victim = ttlQueue.dequeue();
    } else {
      if (!customEvict) throw new Error('customEvict required');
      victim = customEvict(cache);
    }
    if (victim) cache.delete(victim);
  };

  const pruneExpired = () => {
    if (policy !== 'ttl') return;
    const now = Date.now();
    while (ttlQueue.peek()) {
      const k = ttlQueue.peek()!;
      const e = cache.get(k);
      if (e && e.expiresAt !== undefined && e.expiresAt <= now) {
        cache.delete(k);
        ttlQueue.dequeue();
      } else break;
    }
  };

  return (...args: A): R => {
    pruneExpired();
    const k = key(args);
    if (cache.has(k)) {
      const e = cache.get(k)!;
      e.lastUsed = Date.now();
      e.useCount++;
      return e.value;
    }
    evict();
    const value = fn(...args);
    cache.set(k, {
      value,
      lastUsed:  Date.now(),
      useCount:  1,
      expiresAt: policy === 'ttl' && ttlMs ? Date.now() + ttlMs : undefined,
    });
    if (policy === 'ttl') ttlQueue.enqueue(k);
    return value;
  };
}
```
**[backend\src\game\rules.ts](https://github.com/d4xaris/project_kpi_sss/blob/main/backend/src/game/rules.ts#L1-L11)**
```bash
import { type Card } from "./shared.js";
import { memoize } from "./memo.js";

function _canPlayCards(topCard: Card, hand: Card): boolean {
    if (hand.color === topCard.color) return true;
    if (hand.color === "wild") return true;
    if (hand.value === topCard.value) return true;
    return false;
}

export const canPlayCards = memoize(_canPlayCards, { maxSize: 512, policy: 'lru' });
```
## Lab 4. Implementing a Bi-Directional Priority Queue · [@X0nexed](https://github.com/X0nexed)
For example: 
**[backend\src\game\BiDiPriorityQueue.ts](https://github.com/d4xaris/project_kpi_sss/blob/main/backend/src/game/BiDiPriorityQueue.ts#L16-L46)**
```bash
  enqueue(value: T, priority: number): void {
    this.items.push({ value, priority, insertedAt: this.counter++ });
  }

  peek(mode: Mode): T | undefined {
    if (this.isEmpty) return undefined;
    return this.items[this.findIndex(mode)]!.value;
  }

  dequeue(mode: Mode): T | undefined {
    if (this.isEmpty) return undefined;
    const idx = this.findIndex(mode);
    const [entry] = this.items.splice(idx, 1);
    return entry!.value;
  }

  private findIndex(mode: Mode): number {
    let target = 0;
    for (let i = 1; i < this.items.length; i++) {
      const curr = this.items[i]!;
      const best = this.items[target]!;
      switch (mode) {
        case 'highest': if (curr.priority   > best.priority)   target = i; break;
        case 'lowest':  if (curr.priority   < best.priority)   target = i; break;
        case 'oldest':  if (curr.insertedAt < best.insertedAt) target = i; break;
        case 'newest':  if (curr.insertedAt > best.insertedAt) target = i; break;
      }
    }
    return target;
  }
```
**[backend\src\game\GameRoom.ts](https://github.com/d4xaris/project_kpi_sss/blob/main/backend/src/game/GameRoom.ts#L16-L30)**
```bash
  pushDrawAction(targetId: number, amount: number): void {
    this.actionQueue.enqueue({ type: 'draw', targetId, amount }, amount);
  }

  resolveNext(): PendingAction | undefined {
    return this.actionQueue.dequeue('highest');
  }

  peekLowest(): PendingAction | undefined {
    return this.actionQueue.peek('lowest');
  }

  peekOldest(): PendingAction | undefined {
    return this.actionQueue.peek('oldest');
  }
```
## Lab 5. Async Array Function Variants · [@Honike-1](https://github.com/Honike-1)
For example:
**[backend\src\routes\auth.ts](https://github.com/d4xaris/project_kpi_sss/blob/main/backend/src/routes/auth.ts#L34-L68)**
```bash
  app.post(
    "/registration",
    { schema: registrationSchema },
    async (request, reply) => {
      //can change the path of this route if need
      const { login, nickname, password } = request.body as any;

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await app.prisma.user.create({
        data: {
          login: login,
          nickname: nickname,
          password: hashedPassword,
        },
      });

      const token = app.jwt.sign({
        id: user.id,
        nickname: user.nickname,
      });

      return reply.status(201).send({
        success: true,
        message: "User created",
        token: token,
        user: {
          id: user.id,
          nickname: user.nickname,
        },
      });
    },
```
## Lab 6. Large Data Processing with Streams or Async Iterators · [@Honike-1](https://github.com/Honike-1) & [@d4xaris](https://github.com/d4xaris) 
For example:
**[backend/src/game/logger/logger.ts](https://github.com/d4xaris/project_kpi_sss/blob/main/backend/src/game/logger/logger.ts#L18-L62)**
```bash
export class GameLogger {
  private formatter: LogFormatter;
  private fileStream: Writable;
  private gameId: number;

  constructor(gameId: number) {
    this.gameId = gameId;

    const logsDir = path.resolve("logs");
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    this.formatter = new LogFormatter();

    this.fileStream = fs.createWriteStream(
      path.join(logsDir, `game-${gameId}.log`),
      { flags: "a" },
    );

    this.formatter.pipe(this.fileStream);
  }

  log(player: string | number, action: LogAction, message: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      player: String(player),
      action,
      message,
    };

    this.formatter.write(entry);
  }

  system(action: LogAction, message: string) {
    this.log("SYSTEM", action, message);
  }

  close() {
    this.system("GAME_FINISHED", "Game finished. Closing log stream.");
    this.formatter.end(() => {
      this.fileStream.end();
    });
  }
}
```
## Lab 7. Reactive Communication with Observables or EventEmitters · [@Honike-1](https://github.com/Honike-1)
For example:
**[backend/src/plugins/sockets/controllers.ts](https://github.com/d4xaris/project_kpi_sss/blob/main/backend/src/plugins/sockets/controllers.ts#L93-L147)**
```bash
@OnSocketEvent("join_room")
  async handleJoinRoom(socket: Socket, data: any, app: any) {
    try {
      const { gameId, nickname, userId } = data;

      socket.join(`${gameId}`);
      socket.join(`user_${userId}`);
      socket.data.nickname = nickname;
      socket.data.userId = userId;
      socket.data.gameId = gameId;
      this.playerNicknames.set(userId, nickname);

      const session = await app.prisma.gameSession.findUnique({
        where: { id: gameId },
        include: {
          _count: {
            select: {
              players: true,
            },
          },
          players: true,
        },
      });

      if (!session) {
        return socket.emit("error_message", {
          code: "NOT_FOUND",
          message: "Game not found",
        });
      }

      socket
        .to(`${gameId}`)
        .emit("joined_player", { id: String(userId), nickname });

      app.io.emit("lobby_room_updated", {
        id: String(gameId),
        playerCount: session._count.players,
      });

      socket.emit("current_players", session.players);

      const logger = this.gameLoggers.get(gameId);
      logger?.log(
        userId,
        "PLAYER_JOINED",
        `Player ${nickname} joined game ${gameId}.`,
      );
    } catch (err) {
      app.log.error(err);
      socket.emit("error_message", {
        message: "An error has occured",
      });
    }
  }

```

## Lab 8. Implementing an Authentication Proxy for an API Service · [@d4xaris](https://github.com/d4xaris) 
For example:
**[frontend/app/hooks/authProxy.ts](https://github.com/d4xaris/project_kpi_sss/blob/main/frontend/app/hooks/authProxy.ts#L99-L129)**
```bash
export async function apiFetch(url: string, init: RequestInit = {}): Promise<Response> {
  if (!bucket.consume()) {
    throw new Error(`Rate limit exceeded (max ${cfg.rateLimitRpm} req/min)`);
  }

  const fullUrl = `${API_BASE}${url}`;
  const start   = Date.now();
  const method  = (init.method ?? 'GET').toUpperCase();
  const send    = () => fetch(fullUrl, { ...init, headers: buildHeaders(init.headers, init.body) });

  let res: Response;
  try {
    res = await send();
    if (res.status === 401 && cfg.strategy === 'jwt' && localStorage.getItem('token')) {
      const fresh = await refreshToken();
      if (fresh) res = await send();
    }
  } catch (err) {
    log.push({ timestamp: new Date().toISOString(), method, url: fullUrl, status: 'error', durationMs: Date.now() - start });
    throw err;
  }

  if (cfg.enableLogging) {
    const entry = { timestamp: new Date().toISOString(), method, url: fullUrl, status: res.status, durationMs: Date.now() - start };
    log.push(entry);
    console.log(`%c${res.ok ? '✓' : '✗'} ${method} ${fullUrl} → ${res.status} (${entry.durationMs}ms)`,
      `color:${res.ok ? '#4caf50' : '#f44336'}`);
  }

  return res;
}
```
**[frontend/app/hooks/authProxy.ts](https://github.com/d4xaris/project_kpi_sss/blob/main/frontend/app/hooks/authProxy.ts#L55-L67)**
```bash
function buildHeaders(init?: HeadersInit): Headers {
  const h = new Headers(init);
  if (cfg.strategy === 'jwt') {
    const token = localStorage.getItem('token');
    if (token) h.set('Authorization', `Bearer ${token}`);
  } else if (cfg.strategy === 'apiKey' && cfg.apiKey) {
    h.set('X-Api-Key', cfg.apiKey);
  }
  return h;
}
```
**[frontend/app/hooks/useAuth.ts](https://github.com/d4xaris/project_kpi_sss/blob/main/frontend/app/hooks/useAuth.ts#L15-L20)**
```bash
configureProxy({
  strategy:       'jwt',
  rateLimitRpm:   60,
  enableLogging:  true,
  onTokenExpired: () => setUser(null),
});
```
## Lab 9. Implementing a Logging Decorator with Configurable Log Levels · [@Honike-1](https://github.com/Honike-1)
For example: 
**[backend/src/plugins/sockets/socket.decorator.ts](https://github.com/d4xaris/project_kpi_sss/blob/dev/backend/src/plugins/sockets/socket.decorator.ts#L1-L9)**
```bash
import "reflect-metadata";

export const SOCKET_EVENT_METADATA = "socket_event_metadata";

export function OnSocketEvent(event: string) {
  return (target: any, propertyKey: string) => {
    Reflect.defineMetadata(SOCKET_EVENT_METADATA, event, target, propertyKey);
  };
}
```
**[backend/src/plugins/sockets/handler.ts](https://github.com/d4xaris/project_kpi_sss/blob/dev/backend/src/plugins/sockets/handler.ts#L4-L27)**
```bash
export function registerSocketHandlers(
  socket: any,
  app: any,
  controllers: any[],
) {
  controllers.forEach((controller) => {
    const prototype = Object.getPrototypeOf(controller);
    const methods = Object.getOwnPropertyNames(prototype);

    methods.forEach((methodName) => {
      const event = Reflect.getMetadata(
        SOCKET_EVENT_METADATA,
        prototype,
        methodName,
      );

      if (event) {
        socket.on(event, (data: any) => {
          controller[methodName](socket, data, app);
        });
      }
    });
  });
}
```
---
<img width="1281" height="157" alt="1 (2)" src="https://github.com/user-attachments/assets/3301452f-e1eb-473e-a06f-34407f59d813" />
