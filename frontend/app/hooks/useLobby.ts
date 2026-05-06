import { useState, useEffect } from "react";
import { authHeaders } from "./useAuth";

const USE_MOCK = true;

export interface RoomSummary {
  id: number;
  sessionName: string;
  playerCount: number;
  maxPlayers: number;
  hostId: number;
}

const MOCK: RoomSummary[] = [
  { id: 1001, sessionName: "Cool Room",  playerCount: 2, maxPlayers: 4, hostId: 1 },
  { id: 1002, sessionName: "Fast Game",  playerCount: 4, maxPlayers: 4, hostId: 2 },
  { id: 1003, sessionName: "Chill Zone", playerCount: 1, maxPlayers: 3, hostId: 3 },
];

export function useLobby() {
  const [rooms, setRooms]     = useState<RoomSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    setLoading(true);
    if (USE_MOCK) {
      setRooms(MOCK);
      setLoading(false);
      return;
    }
    const res  = await fetch("/game/sessions", { headers: authHeaders() });
    const data = await res.json();
    if (res.ok) setRooms(data.rooms.filter((r: RoomSummary) => r.playerCount > 0));
    setLoading(false);
  };

  useEffect(() => { fetchRooms(); }, []);

  const joinRoom = async (roomId: number): Promise<boolean> => {
    if (USE_MOCK) return true;
    const res = await fetch(`/game/${roomId}/join`, {
      method: "POST",
      headers: authHeaders(),
    });
    return res.ok;
  };

  return { rooms, loading, refresh: fetchRooms, joinRoom };
}
