import { apiFetch } from "./useAuth";
import { getSocket } from "~/socket/client";

export function useGame() {
  const createRoom = async (
    sessionName: string,
    maxPlayers: number,
  ): Promise<number | null> => {
    const res = await apiFetch("/game/create", {
      method: "POST",
      body: JSON.stringify({ sessionName, maxPlayers }),
    });
    const data = await res.json();
    return res.ok ? data.game.id : null;
  };

  const leaveRoom = async (roomId: number): Promise<boolean> => {
    const res = await apiFetch(`/game/${roomId}/leave`, { method: "POST" });
    if (!res.ok) return false;
    const user = JSON.parse(localStorage.getItem("user") ?? "{}");
    getSocket().emit("leave_room", {
      gameId: roomId,
      userId: user.id,
      nickname: user.nickname,
    });
    return true;
  };

  const startGame = async (roomId: number): Promise<boolean> => {
    const res = await apiFetch(`/game/${roomId}/start`, { method: "POST" });
    if (!res.ok) return false;
    getSocket().emit("game_start_request", { gameId: roomId });
    return true;
  };

  return { createRoom, leaveRoom, startGame };
}
