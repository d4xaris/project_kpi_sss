import { apiFetch } from "./useAuth";
import { getSocket } from "~/socket/client";

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export function useGame() {
  const createRoom = async (
    sessionName: string,
    maxPlayers: number,
  ): Promise<Result<{ id: number }>> => {
    const res = await apiFetch("/game/create", {
      method: "POST",
      body: JSON.stringify({ sessionName, maxPlayers }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.message ?? "Failed to create room" };
    return { ok: true, data: { id: data.game.id } };
  };

  const leaveRoom = async (roomId: number): Promise<Result<void>> => {
    const res = await apiFetch(`/game/${roomId}/leave`, { method: "POST" });
    if (!res.ok) return { ok: false, error: "Failed to leave room" };
    const user = JSON.parse(localStorage.getItem("user") ?? "{}");
    getSocket().emit("leave_room", {
      gameId: roomId,
      userId: user.id,
      nickname: user.nickname,
    });
    return { ok: true, data: undefined };
  };

  const startGame = async (roomId: number): Promise<Result<void>> => {
    const res = await apiFetch(`/game/${roomId}/start`, { method: "POST" });
    if (!res.ok) return { ok: false, error: "Failed to start game" };
    getSocket().emit("game_start_request", { gameId: roomId });
    return { ok: true, data: undefined };
  };

  return { createRoom, leaveRoom, startGame };
}
