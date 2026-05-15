import { apiFetch } from "./useAuth";

// Set to false once the real backend is running — this bypasses all fetch calls.
const USE_MOCK = true;

export function useGame() {

  // POST /game/create → { game: { id } }
  // HONIKE: no socket needed here, REST is fine for room creation
  const createRoom = async (sessionName: string, maxPlayers: number): Promise<number | null> => {
    if (USE_MOCK) return Math.floor(Math.random() * 9000) + 1000;
    const res  = await apiFetch("/game/create", {
      method: "POST",
      body: JSON.stringify({ sessionName, maxPlayers }),
    });
    const data = await res.json();
    return res.ok ? data.game.id : null;
  };

  // POST /game/:id/leave
  // HONIKE: after this resolves, also emit socket.emit('room:leave', { roomId })
  //         so the server can broadcast 'player:leave' to remaining players in real-time
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

  // HONIKE: replace this entirely with socket.emit('game:start', { roomId })
  //         no REST call needed — server validates that sender is host,
  //         then broadcasts 'game:start' to all players in the room
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
