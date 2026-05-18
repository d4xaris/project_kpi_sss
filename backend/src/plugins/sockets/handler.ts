import "reflect-metadata";
import { SOCKET_EVENT_METADATA } from "./socket.decorator.js";

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
