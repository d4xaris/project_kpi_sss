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

      return reply.status(201).send(user);
    } catch (error: any) {
      if (error.code === "P2002P") {
        return reply.status(400).send({ error: "Login already exist" });
        //this error heppens when you send already existing login into DB
      }
      return reply.status(500).send({ error: "Server error" });
      //this error heppens when you have server error, litteraly
    }
  });
}
