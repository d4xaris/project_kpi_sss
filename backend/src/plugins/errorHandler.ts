import fp from "fastify-plugin";
import type { FastifyInstance, FastifyError } from "fastify";

export default fp(async (app: FastifyInstance) => {
  app.setErrorHandler((error: FastifyError, request, reply) => {
    app.log.error(error);

    if (error.validation) {
      return reply.status(400).send({
        success: false,
        error: "Validation error",
        message: "Incorrect data inputted",
        details: error.validation,
      });
    }

    if (error.code === "P2002") {
      return reply.status(409).send({
        success: false,
        error: "Conflict",
        message: "Login already exist",
      });
    }

    if (error.statusCode === 401) {
      return reply.status(401).send({
        success: false,
        error: "Unauthorized",
        message: error.message || "Not loged in",
      });
    }

    if (error.statusCode === 403) {
      return reply.status(403).send({
        success: false,
        error: "Forbidden",
        message:
          error.message || "You don't have permission to perform this action",
      });
    }

    if (error.statusCode === 404 || error.code === "P2025") {
      return reply.status(404).send({
        success: false,
        error: "NotFound",
        message: "Resource not found in database",
      });
    }

    if (error.statusCode === 429) {
      return reply.status(429).send({
        success: false,
        error: "TooManyRequests",
        message: "Yu are doing it too much, please try again later",
      });
    }

    if (error.code?.startsWith("P")) {
      return reply.status(400).send({
        success: false,
        error: "DatabaseError",
        message: "Database error occurred",
        details: error.code,
      });
    }

    const statusCode = error.statusCode || 500;
    reply.status(statusCode).send({
      success: false,
      error: error.name || "InternalError",
      message: statusCode >= 500 ? "Internal server error" : error.message,
    });
  });
});
