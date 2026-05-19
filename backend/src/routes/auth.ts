import type { FastifyInstance } from "fastify";
import { AuthService } from "../services/AuthService.js";

// Validation schemas

const registrationSchema = {
  body: {
    type: "object",
    required: ["login", "nickname", "password"],
    properties: {
      login:    { type: "string", minLength: 3, maxLength: 18 },
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
      login:    { type: "string", minLength: 3, maxLength: 18 },
      password: { type: "string", minLength: 3, maxLength: 18 },
    },
  },
};

// Routes

export default async function authRoutes(app: FastifyInstance) {
  const authService = new AuthService(app.prisma);

  app.post("/registration", { schema: registrationSchema }, async (request, reply) => {
    const { login, nickname, password } = request.body as any;

    const user = await authService.register(login, nickname, password);
    const token = app.jwt.sign({ id: user.id, nickname: user.nickname });

    return reply.status(201).send({
      success: true,
      message: "User created",
      token,
      user,
    });
  });

  app.post("/login", { schema: loginSchema }, async (request, reply) => {
    const { login, password } = request.body as any;

    const user = await authService.login(login, password);
    if (!user) {
      return reply.status(401).send({
        success: false,
        error: "Unauthorized",
        message: "Incorrect login or password",
      });
    }

    const token = app.jwt.sign({ id: user.id, nickname: user.nickname });

    return reply.status(200).send({
      success: true,
      message: "Logged in",
      token,
      user,
    });
  });

  app.post(
    "/logout",
    { preValidation: [(app as any).authenticate] },
    async (_request, reply) => {
      return reply.status(200).send({ success: true, message: "Logged out successfully" });
    },
  );

  app.get(
    "/me",
    { preValidation: [(app as any).authenticate] },
    async (request, reply) => {
      const { id } = request.user as { id: number };

      const user = await authService.getMe(id);
      if (!user) {
        return reply.status(404).send({ success: false, message: "User not found" });
      }

      return reply.send({ success: true, user });
    },
  );
}
