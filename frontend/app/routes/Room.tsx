import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import Button from "~/components/Button";
import { useAuth } from "~/hooks/useAuth";
import { useGame } from "~/hooks/useGame";
import { sounds } from "~/sounds";

interface Player {
  id: number;
  nickname: string;
}

const Crown = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 19H22V21H2V19ZM2 17L5 8L9 13L12 5L15 13L19 8L22 17H2Z" fill="#FFD700"/>
  </svg>
);

export default function Room() {
  const navigate                   = useNavigate();
  const { id }                     = useParams();
  const { state }                  = useLocation();
  const { user }                   = useAuth();
  const { startGame, leaveRoom }   = useGame();

  const roomName = (state as any)?.roomName ?? "Room";
  const hostId   = (state as any)?.hostId   ?? user?.id;
  const isHost   = user?.id === hostId;

  // TODO: WebSocket will replace this with the real player list via 'room:state'
  const [players, setPlayers] = useState<Player[]>([]);
  const [closing, setClosing] = useState(false);

  const canStart = players.length >= 2;

  useEffect(() => {
    if (user) setPlayers([{ id: user.id, nickname: user.nickname }]);
  }, [user]);

  useEffect(() => {
    // TODO: WebSocket setup
    // const socket = connectToRoom(id, token);
    // socket.on('room:state',   ({ players }) => setPlayers(players));
    // socket.on('player:join',  (player)     => setPlayers(prev => [...prev, player]));
    // socket.on('player:leave', (playerId)   => setPlayers(prev => prev.filter(p => p.id !== playerId)));
    // socket.on('game:start',   ()           => navigate('/game', { state: { fromRoom: true } }));
    // socket.on('room:closed',  ()           => navigate('/lobby'));
    // return () => socket.disconnect();

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
    // TODO: replace with socket.emit('room:leave', { roomId: id })
    await leaveRoom(Number(id), isHost);
    navigate("/lobby");
  };

  const handleStart = async () => {
    sounds.gameStart();
    // TODO: replace with socket.emit('game:start', { roomId: id })
    const ok = await startGame(Number(id));
    if (!ok) return;
    setClosing(true);
    setTimeout(() => navigate("/game", { state: { fromRoom: true } }), 750);
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
