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
**[backend\src\game\GameState.ts](https://github.com/d4xaris/project_kpi_sss/blob/dev/backend/src/game/GameState.ts#L41-L44)**
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
│   ├── package-lock.json                                                  
│   ├── package.json                                                                     
│   ├── prisma                                                                                                                       
│   │   ├── migrations                                              
│   │   │   └── migration_lock.toml                                               
│   │   │                               
│   │   ├── schema.prisma                                                                
│   │   └── seed.ts                                                  
│   ├── prisma.config.ts                                    
│   ├── src
│   │   ├── game                                                   
│   │   │   ├── Deck.ts                                             
│   │   │   ├── GameRoom.ts
│   │   │   ├── BiDiPriorityQueue.ts
│   │   │   ├── memo.ts                                        
│   │   │   ├── GameState.ts                       
│   │   │   ├── logger
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
│   │   └── routes
│   │       ├── auth.ts
│   │       └── game.ts
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
    │   ├── cards
    │   │   ├── back.svg
    │   │   ├── crimson_0.svg
    │   │   ├── crimson_1.svg
    │   │   ├── crimson_2.svg
    │   │   ├── crimson_3.svg
    │   │   ├── crimson_4.svg
    │   │   ├── crimson_5.svg
    │   │   ├── crimson_6.svg
    │   │   ├── crimson_7.svg
    │   │   ├── crimson_8.svg
    │   │   ├── crimson_9.svg
    │   │   ├── crimson_drawtwo.svg
    │   │   ├── crimson_reverse.svg
    │   │   ├── crimson_skip.svg
    │   │   ├── orange_0.svg
    │   │   ├── orange_1.svg
    │   │   ├── orange_2.svg
    │   │   ├── orange_3.svg
    │   │   ├── orange_4.svg
    │   │   ├── orange_5.svg
    │   │   ├── orange_6.svg
    │   │   ├── orange_7.svg
    │   │   ├── orange_8.svg
    │   │   ├── orange_9.svg
    │   │   ├── orange_drawtwo.svg
    │   │   ├── orange_reverse.svg
    │   │   ├── orange_skip.svg
    │   │   ├── purple_0.svg
    │   │   ├── purple_1.svg
    │   │   ├── purple_2.svg
    │   │   ├── purple_3.svg
    │   │   ├── purple_4.svg
    │   │   ├── purple_5.svg
    │   │   ├── purple_6.svg
    │   │   ├── purple_7.svg
    │   │   ├── purple_8.svg
    │   │   ├── purple_9.svg
    │   │   ├── purple_drawtwo.svg
    │   │   ├── purple_reverse.svg
    │   │   ├── purple_skip.svg
    │   │   ├── troll.svg
    │   │   ├── wild.svg
    │   │   ├── wild_draw4.svg
    │   │   ├── yellow_0.svg
    │   │   ├── yellow_1.svg
    │   │   ├── yellow_2.svg
    │   │   ├── yellow_3.svg
    │   │   ├── yellow_4.svg
    │   │   ├── yellow_5.svg
    │   │   ├── yellow_6.svg
    │   │   ├── yellow_7.svg
    │   │   ├── yellow_8.svg
    │   │   ├── yellow_9.svg
    │   │   ├── yellow_drawtwo.svg
    │   │   ├── yellow_reverse.svg
    │   │   └── yellow_skip.svg
    │   ├── catch.png
    │   ├── favicon.png
    │   ├── project_sss.png
    │   ├── shreked.mp4
    │   ├── solo.svg
    │   ├── sounds
    │   │   ├── catchsound.mp3
    │   │   ├── click.mp3
    │   │   ├── gamestart.mp3
    │   │   ├── solosound.mp3
    │   │   └── start.mp3
    │   └── table.jpg
    ├── react-router.config.ts
    ├── tsconfig.json
    ├── vite.config.ts
    └── yarn.lock
```
## Lab 3. Implementing a Memoization Function · [@Honike-1](https://github.com/Honike-1)
For example: 
**[backend\src\game\memo.ts](https://github.com/d4xaris/project_kpi_sss/blob/dev/backend/src/game/memo.ts#L1-L22)**
```bash
class QNode<T> { constructor(public value: T, public next: QNode<T> | null = null) {} }

class Queue<T> {
  private head: QNode<T> | null = null;
  private tail: QNode<T> | null = null;
  size = 0;

  enqueue(v: T): void {
    const n = new QNode(v);
    this.tail ? (this.tail.next = n) : (this.head = n);
    this.tail = n;
    this.size++;
  }

  dequeue(): T | undefined {
    if (!this.head) return undefined;
    const v = this.head.value;
    this.head = this.head.next;
    if (!this.head) this.tail = null;
    this.size--;
    return v;
  }
```
**[backend\src\game\rules.ts](https://github.com/d4xaris/project_kpi_sss/blob/dev/backend/src/game/rules.ts#L1-L11)**
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
## Lab 4. Implementing a Bi-Directional Priority Queue · [@Honike-1](https://github.com/Honike-1)
For example: 
**[backend\src\game\BiDiPriorityQueue.ts](https://github.com/d4xaris/project_kpi_sss/blob/dev/backend/src/game/BiDiPriorityQueue.ts#L17-L46)**
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
**[backend\src\game\GameRoom.ts](https://github.com/d4xaris/project_kpi_sss/blob/dev/backend/src/game/GameRoom.ts#L18-L31)**
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
**[backend\src\routes\auth.ts](https://github.com/d4xaris/project_kpi_sss/blob/dev/backend/src/routes/auth.ts#L29-L66)**
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
**[backend/src/game/logger/logger.ts](https://github.com/d4xaris/project_kpi_sss/blob/dev/backend/src/game/logger/logger.tss#L18-L62)**
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
**[backend/src/plugins/sockets/controllers.ts](https://github.com/d4xaris/project_kpi_sss/blob/dev/backend/src/plugins/sockets/controllers.ts#L8-L54)**
```bash
  @OnSocketEvent("join_room")
  async handleJoinRoom(socket: Socket, data: any, app: any) {
    try {
      const { gameId, nickname, userId } = data;

      socket.join(`${gameId}`);
      socket.data.nickname = nickname;
      socket.data.userId = userId;
      socket.data.gameId = gameId;

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

      app.io.to(`${gameId}`).emit("joined_player", {
        id: String(userId),
        nickname: nickname,
      });

      app.io.emit("lobby_room_updated", {
        id: String(gameId),
        playerCount: session._count.players,
      });

      socket.emit("current_players", session.players);
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
**[frontend/app/hooks/authProxy.ts](https://github.com/d4xaris/project_kpi_sss/blob/dev/frontend/app/hooks/authProxy.ts#L99-L120)**
```bash
// drop-in fetch replacement — injects auth, retries on 401, rate-limits, logs
export async function apiFetch(url: string, init: RequestInit = {}): Promise<Response> {
  if (!bucket.consume()) {
    throw new Error(`Rate limit exceeded (max ${cfg.rateLimitRpm} req/min)`);
  }
  const send = () => fetch(url, { ...init, headers: buildHeaders(init.headers) });
  let res = await send();
  if (res.status === 401 && cfg.strategy === 'jwt') {
    const fresh = await refreshToken();
    if (fresh) res = await send();
  }
  ...
}
```
**[frontend/app/hooks/authProxy.ts](https://github.com/d4xaris/project_kpi_sss/blob/dev/frontend/app/hooks/authProxy.ts#L55-L67)**, header injection per strategy
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
**[frontend/app/hooks/useAuth.ts](https://github.com/d4xaris/project_kpi_sss/blob/dev/frontend/app/hooks/useAuth.ts#L16-L21)**, proxy configured on app startup
```bash
configureProxy({
  strategy:       'jwt',
  rateLimitRpm:   60,
  enableLogging:  true,
  onTokenExpired: () => setUser(null),
});
```
**[frontend/app/hooks/useGame.ts](https://github.com/d4xaris/project_kpi_sss/blob/dev/frontend/app/hooks/useGame.ts#L12-L15)**, всі запити через проксі
```bash
const res = await apiFetch("/game/create", {
  method: "POST",
  body: JSON.stringify({ sessionName, maxPlayers }),
});
```
**[frontend/app/hooks/useLobby.ts](https://github.com/d4xaris/project_kpi_sss/blob/dev/frontend/app/hooks/useLobby.ts#L38-L52)**
```bash
const res = await apiFetch("/game/sessions");
const res = await apiFetch(`/game/${roomId}/join`, { method: "POST" });
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
