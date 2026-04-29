import { useNavigate } from "react-router";
import Button from "~/components/Button";
import { useAuth } from "~/hooks/useAuth";
import { MOCK_ROOM } from "~/mockData";

const Crown = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 19H22V21H2V19ZM2 17L5 8L9 13L12 5L15 13L19 8L22 17H2Z" fill="#FFD700"/>
  </svg>
);

export default function Room() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isHost = user?.id === MOCK_ROOM.hostId;

  return (
    <div className="create">
      <div className="create-content">
        <h1>{MOCK_ROOM.name}</h1>
        <hr />

        {MOCK_ROOM.players.map((p) => (
          <div className="create-row" key={p.id}>
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "24px", display: "flex", justifyContent: "center" }}>
                {p.id === MOCK_ROOM.hostId && <Crown />}
              </span>
              {p.nickname}
            </span>
          </div>
        ))}

        <div className="create-actions">
          <Button text="Leave" variant="underline" onClick={() => navigate("/lobby")} />
          {isHost && (
            <Button text="Start game" variant="solid" onClick={() => navigate("/play")} />
          )}
        </div>
      </div>
    </div>
  );
}