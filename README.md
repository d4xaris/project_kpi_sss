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

## Lab 3. Implementing a Memoization Function ·

## Lab 4. Implementing a Bi-Directional Priority Queue ·

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
**[backend\src\plugins\prisma.ts](https://github.com/d4xaris/project_kpi_sss/blob/dev/backend/src/plugins/prisma.ts#L13-L31)**
```bash
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$connect();

    app.log.info("Database connected successfully");
  } catch (error) {
    app.log.info("Failed to connect to database during startup");

    process.exit(1);
  }

  app.decorate("prisma", prisma);

  app.addHook("onClose", async (server) => {
    await server.prisma.$disconnect();
  });
```
---
<img width="1281" height="157" alt="1 (2)" src="https://github.com/user-attachments/assets/3301452f-e1eb-473e-a06f-34407f59d813" />
