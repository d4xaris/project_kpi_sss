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

Create a `.env` file in `/backend`:
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DB_NAME"
JWT_SECRET="your_secret_key"
```
Make sure to update the values to match your local environment.

### Database Setup (Prisma)

Once your environment variables are set, you need to sync your database schema and generate the Prisma Client:
```bash
cd backend

# Create the database tables
yarn prisma migrate dev --name init

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

# Programming fundumentals | 9 Lab Implementations 🚀


## Lab 1. Generators and Iterators · [@X0nexed](https://github.com/X0nexed)

## Lab 2. Project Setup · [@d4xaris](https://github.com/d4xaris) 

## Lab 3. Implementing a Memoization Function ·

## Lab 4. Implementing a Bi-Directional Priority Queue ·

## Lab 5. Async Array Function Variants · [@Honike-1](https://github.com/Honike-1)
For example:
**backend\src\routes\auth.ts**
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
## Lab 6. Large Data Processing with Streams or Async Iterators ·

## Lab 7. Reactive Communication with Observables or EventEmitters ·

## Lab 8. Implementing an Authentication Proxy for an API Service · [@Honike-1](https://github.com/Honike-1)
 
## Lab 9. Implementing a Logging Decorator with Configurable Log Levels · [@Honike-1](https://github.com/Honike-1)
For example: 
**backend\src\plugins\prisma.ts**
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
