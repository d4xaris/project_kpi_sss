import { authHeaders } from "./useAuth";

const USE_MOCK = true;

export function useGame() {

  const createRoom = async (sessionName: string, maxPlayers: number): Promise<number | null> => {
    if (USE_MOCK) {
      return Math.floor(Math.random() * 9000) + 1000;
    }
    const res = await fetch("/game/create", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ sessionName, maxPlayers }),
    });
    const data = await res.json();
    return res.ok ? data.game.id : null;
  };

  const leaveRoom = async (roomId: number, isHost: boolean): Promise<boolean> => {
    if (USE_MOCK) {
      if (isHost) {
        const key = `sss:roomClosed:${roomId}`;
        localStorage.setItem(key, "1");
        window.dispatchEvent(new StorageEvent("storage", { key, newValue: "1" }));
      }
      return true;
    }
    // TODO: also emit socket.emit('room:leave', { roomId }) to notify others in real-time
    const res = await fetch(`/game/${roomId}/leave`, {
      method: "POST",
      headers: authHeaders(),
    });
    return res.ok;
  };

  const startGame = async (roomId: number): Promise<boolean> => {
    if (USE_MOCK) {
      const key = `sss:start:${roomId}`;
      localStorage.setItem(key, "1");
      window.dispatchEvent(new StorageEvent("storage", { key, newValue: "1" }));
      return true;
    }
    // TODO: replace with socket.emit('game:start') and remove this REST call
    const res = await fetch(`/game/${roomId}/start`, {
      method: "POST",
      headers: authHeaders(),
    });
    return res.ok;
  };

  return { createRoom, leaveRoom, startGame };
}
