import type { FastifyInstance } from "fastify";

export default async function authRoutes(app: FastifyInstance) {
  app.post("/auth/registration", async (request, reply) => {
    //can change the path of this route if need
    const { login, nickname, password } = request.body as {
      login: string;
      nickname: string;
      password: string;
    };

    try {
      const user = await app.prisma.User.create({
        data: {
          login: login,
          nickname: nickname,
          password: password,
          totalWins: 0,
        },
      });

      const token = app.jwt.sign({
        id: user.id,
        nickname: user.nickname,
      });

      return reply.status(201).send({
        message: "User created",
        token: token,
        user: {
          id: user.id,
          nickname: user.nickname,
        },
      });
    } catch (error: any) {
      if (error.code === "P2002P") {
        return reply.status(400).send({ error: "Login already exist" });
        //this error heppens when you send already existing login into DB
      }

      return reply.status(500).send({ error: "Server error" });
      //this error heppens when you have server error, litteraly
    }
  });

  app.post("/auth/login", async (request, reply) => {
    const { login, password } = request.body as {
      login: string;
      password: string;
    };

    const user = await app.prisma.User.findUnique({
      where: { login: login },
    });

    if (!user) {
      //if there is no such user
      return reply.status(401).send({ error: "Incorrect login or password" });
    }

    if (user.password !== password) {
      //if password is incorrect
      return reply.status(401).send({ error: "Incorrect login or password" });
    }

    const token = app.jwt.sign({
      id: user.id,
      nickname: user.nickname,
    });

    return reply.status(200).send({
      message: "success",
      token: token,
      user: {
        id: user.id,
        nickname: user.nickname,
      },
    });
  });
}
