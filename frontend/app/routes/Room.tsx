import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import Button from "~/components/Button";
import { useAuth } from "~/hooks/useAuth";
import { useGame } from "~/hooks/useGame";
import { sounds } from "~/sounds";

interface Player        { id: number; nickname: string }
interface LocationState { roomName?: string; hostId?: number; maxPlayers?: number }

// Flip to false once the real backend is running
const IS_MOCK = true;

const Crown = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 19H22V21H2V19ZM2 17L5 8L9 13L12 5L15 13L19 8L22 17H2Z" fill="#FFD700"/>
  </svg>
);

export default function Room() {
  const navigate                 = useNavigate();
  const { id }                   = useParams();
  const { state }                = useLocation();
  const { user }                 = useAuth();
  const { startGame, leaveRoom } = useGame();

  const { roomName = "Room", hostId = user?.id, maxPlayers = 4 } = (state as LocationState) ?? {};
  const isHost = user?.id === hostId;

  const [players, setPlayers] = useState<Player[]>([]);
  const [closing, setClosing] = useState(false);

  const canStart   = players.length >= 2;
  const roomIsFull = players.length >= maxPlayers;

  // MOCK ONLY: add a fake player so the host can test the start flow
  const handleMockJoin = () => {
    const mockNames = ['CoolPlayer123', 'LeftHandedKing', 'xX_UnoMaster_Xx'];
    const next = mockNames[players.length - 1] ?? `Player ${players.length + 1}`;
    setPlayers(prev => [...prev, { id: prev.length + 100, nickname: next }]);
  };

  // Seed the local player on mount
  useEffect(() => {
    if (user) setPlayers([{ id: user.id, nickname: user.nickname }]);
  }, [user]);

  useEffect(() => {
    if (isHost) return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === `sss:start:${id}` && e.newValue === "1")
        navigate("/game", { state: { fromRoom: true } });
      if (e.key === `sss:roomClosed:${id}` && e.newValue === "1")
        navigate("/lobby");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [id, isHost]);

  const handleLeave = async () => {
    await leaveRoom(Number(id), isHost);
    navigate("/lobby");
  };

  const handleStart = async () => {
    sounds.gameStart();
    const ok = await startGame(Number(id));
    if (!ok) return;
    setClosing(true);
    // sessionId will come from game:start socket event once sockets are wired;
    // Number(id) is a placeholder so the prop threads through for now.
    setTimeout(() => navigate("/game", { state: { fromRoom: true, playerCount: players.length, sessionId: Number(id) } }), 750);
  };

  return (
    <div className="create">
      <div className="create-content">
        <h1>{roomName}</h1>
        <hr />

        {players.map((p) => (
          <div className="create-row" key={p.id}>
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "24px", display: "flex", justifyContent: "center" }}>
                {p.id === hostId && <Crown />}
              </span>
              {p.nickname}
            </span>
          </div>
        ))}

        {!isHost && (
          <p style={{ textAlign: "center", opacity: 0.6, marginTop: "12px", fontSize: "0.9rem" }}>
            Waiting for host to start...
          </p>
        )}

        {/* DEV ONLY — remove when sockets are wired */}
        {IS_MOCK && isHost && !roomIsFull && (
          <p
            onClick={handleMockJoin}
            style={{ textAlign: "center", opacity: 0.45, marginTop: "8px", fontSize: "0.8rem", cursor: "pointer", userSelect: "none" }}
          >
            + simulate player join ({players.length}/{maxPlayers})
          </p>
        )}

        <div className="create-actions">
          <Button text="Leave" variant="underline" onClick={handleLeave} />
          {isHost && (
            <Button
              text={canStart ? "Start game" : "Need more players"}
              variant="solid"
              onClick={canStart ? handleStart : undefined}
            />
          )}
        </div>
      </div>

      {closing && (
        <div className="curtain">
          <div className="curtain__left curtain__left--closing" />
          <div className="curtain__right curtain__right--closing" />
        </div>
      )}
    </div>
  );
}
