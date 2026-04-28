import { useNavigate } from "react-router";
import Button from "~/components/Button";
import { MOCK_ROOMS } from "~/mockData";

export default function Lobby() {
  const navigate = useNavigate();

  return (
    <div className="lobby">
      <div className="lobby-content">
        <h1>Join a room</h1>
        <hr />

        {MOCK_ROOMS.map((room, i) => {
          const full = room.players >= room.maxPlayers;
          return (
            <div className="lobby-row" key={room.id} style={{ animationDelay: `${i * 0.1}s` }}>
              <span className="lobby-name">{room.name}</span>
              <span className="lobby-count">{room.players}/{room.maxPlayers}</span>
              <button
                className={`btn--solid lobby-join-btn ${full ? "lobby-join--full" : ""}`}
                disabled={full}
                onClick={() => navigate(`/room/${room.id}`)}
              >
                {full ? "Full" : "Join"}
              </button>
            </div>
          );
        })}

        <div className="create-actions">
          <Button text="Go back" variant="underline" onClick={() => navigate("/play")} />
        </div>
      </div>
    </div>
  );
}