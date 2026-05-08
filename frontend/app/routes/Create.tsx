import { useState } from "react";
import { useNavigate } from "react-router";
import Button from "~/components/Button";
import { useAuth } from "~/hooks/useAuth";
import { useGame } from "~/hooks/useGame";

export default function Create() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createRoom } = useGame();
  const [roomName, setRoomName] = useState("");
  const [players, setPlayers] = useState(2);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!roomName.trim()) return;
    setLoading(true);
    const id = await createRoom(roomName.trim(), players);
    if (id) navigate(`/room/${id}`, { state: { roomName: roomName.trim(), maxPlayers: players, hostId: user?.id } });
    setLoading(false);
  };

  return (
    <div className="create">
      <div className="create-content">
        <h1>Create a room</h1>
        <hr />

        <div className="create-row">
          <span>Name</span>
          <input
            type="text"
            value={roomName}
            maxLength={20}
            onChange={(e) => setRoomName(e.target.value)}
            className="create-input"
          />
        </div>

        <div className="create-row">
          <span>Players</span>
          <div className="create-stepper">
            {players}
            <div className="create-stepper-buttons">
              <button onClick={() => setPlayers(p => Math.min(4, p + 1))}>▲</button>
              <button onClick={() => setPlayers(p => Math.max(2, p - 1))}>▼</button>
            </div>
          </div>
        </div>

        <div className="create-actions">
          <Button text="Go back" variant="underline" onClick={() => navigate("/play")} />
          <Button
            text={loading ? "Creating..." : "Create"}
            variant="solid"
            onClick={handleCreate}
          />
        </div>
      </div>
    </div>
  );
}
