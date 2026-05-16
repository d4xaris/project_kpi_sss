import { apiFetch } from "./useAuth";

const USE_MOCK = true;

export function useGame() {

  const createRoom = async (sessionName: string, maxPlayers: number): Promise<number | null> => {
    if (USE_MOCK) return Math.floor(Math.random() * 9000) + 1000;
    const res  = await apiFetch("/game/create", {
      method: "POST",
      body: JSON.stringify({ sessionName, maxPlayers }),
    });
    const data = await res.json();
    return res.ok ? data.game.id : null;
  };

  const leaveRoom = async (roomId: number, isHost: boolean): Promise<boolean> => {
    if (USE_MOCK) {
      if (isHost) {
        // Simulate 'room:closed' broadcast to other mock players
        const key = `sss:roomClosed:${roomId}`;
        localStorage.setItem(key, "1");
        window.dispatchEvent(new StorageEvent("storage", { key, newValue: "1" }));
      }
      return true;
    }
    const res = await apiFetch(`/game/${roomId}/leave`, { method: "POST" });
    return res.ok;
  };

  const startGame = async (roomId: number): Promise<boolean> => {
    if (USE_MOCK) {
      // Simulate 'game:start' broadcast to other mock players
      const key = `sss:start:${roomId}`;
      localStorage.setItem(key, "1");
      window.dispatchEvent(new StorageEvent("storage", { key, newValue: "1" }));
      return true;
    }
    const res = await apiFetch(`/game/${roomId}/start`, { method: "POST" });
    return res.ok;
  };

  return { createRoom, leaveRoom, startGame };
}
