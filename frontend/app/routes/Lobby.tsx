import { useState } from "react";
import { useNavigate } from "react-router";
import Button from "~/components/Button";
import { useLobby } from "~/hooks/useLobby";
import { useAuth } from "~/hooks/useAuth";
import type { RoomSummary } from "~/hooks/useLobby";

export default function Lobby() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { rooms, loading, refresh, joinRoom } = useLobby();
  const [joiningId, setJoiningId] = useState<number | null>(null);

  const handleJoin = async (room: RoomSummary) => {
    if (joiningId !== null) return;
    setJoiningId(room.id);
    const ok = await joinRoom(room.id, user?.id ?? 0, user?.nickname ?? '');
    if (ok) {
      navigate(`/room/${room.id}`, {
        state: { roomName: room.sessionName, hostId: room.hostId, maxPlayers: room.maxPlayers },
      });
    } else {
      setJoiningId(null);
    }
  };

  return (
    <div className="lobby">
      <div className="lobby-content">
        <h1>Join a room</h1>
        <hr />

        {loading ? (
          <p style={{ textAlign: "center", opacity: 0.6, marginTop: "40px" }}>Loading rooms...</p>
        ) : rooms.length === 0 ? (
          <p style={{ textAlign: "center", opacity: 0.6, marginTop: "40px" }}>No rooms available</p>
        ) : rooms.map((room, i) => {
          const full = room.playerCount >= room.maxPlayers;
          return (
            <div className="lobby-row" key={room.id} style={{ animationDelay: `${i * 0.1}s` }}>
              <span className="lobby-name">{room.sessionName}</span>
              <span className="lobby-count">{room.playerCount}/{room.maxPlayers}</span>
              <button
                className={`btn--solid lobby-join-btn ${full ? "lobby-join--full" : ""}`}
                disabled={full || joiningId !== null}
                onClick={() => handleJoin(room)}
              >
                {joiningId === room.id ? "Joining..." : full ? "Full" : "Join"}
              </button>
            </div>
          );
        })}

        <div className="create-actions">
          <Button text="Go back" variant="underline" onClick={() => navigate("/play")} />
          <Button text="Refresh" variant="underline" onClick={refresh} />
        </div>
      </div>
    </div>
  );
}
