import { useState, useEffect } from "react";
import { authHeaders } from "./useAuth";

// Set to false once the real backend is running.
const USE_MOCK = true;

export interface RoomSummary {
  id: number;
  sessionName: string;
  playerCount: number;
  maxPlayers: number;
  hostId: number;
}

const MOCK_ROOMS: RoomSummary[] = [
  { id: 1001, sessionName: "Cool Room",  playerCount: 2, maxPlayers: 4, hostId: 1 },
  { id: 1002, sessionName: "Fast Game",  playerCount: 4, maxPlayers: 4, hostId: 2 },
  { id: 1003, sessionName: "Chill Zone", playerCount: 1, maxPlayers: 3, hostId: 3 },
];

export function useLobby() {
  const [rooms, setRooms]     = useState<RoomSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // GET /game/sessions → { rooms: RoomSummary[] }
  // HONIKE: the list is currently fetched once on mount + manually via the Refresh button.
  //         Once sockets are wired, consider subscribing to a 'lobby:update' event instead
  //         so the room list stays live without manual refreshes:
  //
  //   socket.on('lobby:update', (rooms: RoomSummary[]) => setRooms(rooms));
  const fetchRooms = async () => {
    setLoading(true);
    if (USE_MOCK) {
      setRooms(MOCK_ROOMS);
      setLoading(false);
      return;
    }
    const res  = await fetch("/game/sessions", { headers: authHeaders() });
    const data = await res.json();
    if (res.ok) setRooms(data.rooms.filter((r: RoomSummary) => r.playerCount > 0));
    setLoading(false);
  };

  useEffect(() => { fetchRooms(); }, []);

  // POST /game/:id/join
  // HONIKE: after this REST call resolves, connect the room socket:
  //   connectToRoom(roomId, token)
  //   so the player starts receiving room events ('room:state', 'player:join', etc.)
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
