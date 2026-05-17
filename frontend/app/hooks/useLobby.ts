import { useState, useEffect } from "react";
import { apiFetch } from "./useAuth";
import { getSocket, connectSocket } from "~/socket/client";

const USE_MOCK = true;

export interface RoomSummary {
  id: number;
  sessionName: string;
  playerCount: number;
  maxPlayers: number;
  hostId: number;
}

export function useLobby() {
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    setLoading(true);
    const res = await apiFetch("/game/sessions");
    const data = await res.json();
    if (res.ok)
      setRooms(data.rooms.filter((r: RoomSummary) => r.playerCount > 0));
    setLoading(false);
  };

  useEffect(() => {
    fetchRooms();

    const socket = getSocket();
    connectSocket();

    socket.on(
      "lobby_room_updated",
      (data: { id: string; playerCount: number }) => {
        setRooms((prev) =>
          prev.map((r) =>
            r.id === Number(data.id)
              ? { ...r, playerCount: data.playerCount }
              : r,
          ),
        );
      },
    );

    socket.on("lobby_room_removed", (data: { id: string }) => {
      setRooms((prev) => prev.filter((r) => r.id !== Number(data.id)));
    });

    socket.on("room_created", (data) => {
      setRooms((prev) => [
        ...prev,
        {
          id: Number(data.roomId),
          sessionName: data.roomName,
          playerCount: data.playerCount,
          maxPlayers: data.maxPlayers,
          hostId: 0,
        },
      ]);
    });

    return () => {
      socket.off("lobby_room_updated");
      socket.off("lobby_room_removed");
      socket.off("room_created");
    };
  }, []);

  const joinRoom = async (
    roomId: number,
    userId: number,
    nickname: string,
  ): Promise<boolean> => {
    const res = await apiFetch(`/game/${roomId}/join`, { method: "POST" });
    if (!res.ok) return false;

    getSocket().emit("join_room", {
      gameId: roomId,
      nickname: nickname,
      userId: userId,
    });
    return res.ok;
  };

  return { rooms, loading, refresh: fetchRooms, joinRoom };
}
