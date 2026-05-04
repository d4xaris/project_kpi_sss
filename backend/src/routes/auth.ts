import type { FastifyInstance } from "fastify";
import bcrypt from "bcrypt";

const registrationSchema = {
  body: {
    type: "object",
    required: ["login", "nickname", "password"],
    properties: {
      login: { type: "string", minLength: 3, maxLength: 18 },
      nickname: { type: "string", minLength: 3, maxLength: 18 },
      password: { type: "string", minLength: 6, maxLength: 18 },
    },
  },
};

const loginSchema = {
  body: {
    type: "object",
    required: ["login", "password"],
    properties: {
      login: { type: "string", minLength: 3, maxLength: 18 },
      password: { type: "string", minLength: 3, maxLength: 18 },
    },
  },
};

export default async function authRoutes(app: FastifyInstance) {
  // route for registration
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
          totalWins: 0,
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
  );

  // route for login
  app.post("/login", { schema: loginSchema }, async (request, reply) => {
    const { login, password } = request.body as any;

    const user = await app.prisma.user.findUnique({
      where: { login: login },
    });

    if (!user) {
      return reply.status(401).send({
        success: false,
        error: "Unauthorized",
        message: "Incorrect login or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return reply.status(401).send({
        success: false,
        error: "Unauthorized",
        message: "Incorrect login or password",
      });
    }

    const token = app.jwt.sign({
      id: user.id,
      nickname: user.nickname,
    });

    return reply.status(200).send({
      success: true,
      message: "Loged in",
      token: token,
      user: {
        id: user.id,
        nickname: user.nickname,
      },
    });
  });

  app.post(
    // route doesn't log out the user, its just a signal for backend
    "/logout",
    { preValidation: [(app as any).authenticate] },
    async (request, reply) => {
      return reply.status(200).send({
        success: true,
        message: "Logged out succesfully",
      });
    },
  );

  app.get(
    "/me",
    { preValidation: [(app as any).authenticate] },
    async (request, reply) => {
      const user = request.user;
      return reply.send({
        success: true,
        user: user,
      });
    },
  );
}
