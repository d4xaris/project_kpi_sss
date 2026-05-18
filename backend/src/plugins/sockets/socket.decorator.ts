import "reflect-metadata";

export const SOCKET_EVENT_METADATA = "socket_event_metadata";

export function OnSocketEvent(event: string) {
  return (target: any, propertyKey: string) => {
    Reflect.defineMetadata(SOCKET_EVENT_METADATA, event, target, propertyKey);
  };
}
