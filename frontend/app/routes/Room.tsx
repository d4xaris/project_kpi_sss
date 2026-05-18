import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import Button from "~/components/Button";
import { useAuth } from "~/hooks/useAuth";
import { useGame } from "~/hooks/useGame";
import { getSocket } from "~/socket/client";
import { sounds } from "~/sounds";

interface Player {
  id: number;
  nickname: string;
}

interface LocationState {
  roomName?: string;
  hostId?: number;
  maxPlayers?: number;
}

const Crown = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2 19H22V21H2V19ZM2 17L5 8L9 13L12 5L15 13L19 8L22 17H2Z"
      fill="#FFD700"
    />
  </svg>
);

export default function Room() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();
  const { user } = useAuth();
  const { startGame, leaveRoom } = useGame();

  const {
    roomName = "Room",
    hostId = user?.id,
    maxPlayers = 4,
  } = (state as LocationState) ?? {};

  const isHost = user?.id === hostId;

  const [players, setPlayers] = useState<Player[]>([]);
  const [closing, setClosing] = useState(false);

  const canStart = players.length >= 2;

  useEffect(() => {
    if (user) setPlayers([{ id: user.id, nickname: user.nickname }]);
  }, [user]);

  useEffect(() => {
    const socket = getSocket();

    socket.on("current_players", (data: { players: Player[] }) => {
      setPlayers(data.players);
    });

    socket.on("joined_player", (data: { id: string; nickname: string }) => {
      setPlayers((prev) => {
        if (prev.some((p) => String(p.id) === data.id)) return prev;
        return [...prev, { id: Number(data.id), nickname: data.nickname }];
      });
    });

    socket.on("player_left", (data: { socketId: string }) => {
      setPlayers((prev) => prev.filter((p) => String(p.id) !== data.socketId));
    });

    socket.on("game_deleted", () => {
      navigate("/lobby");
    });

    socket.on(
      "game_start_settings",
      (data: { sessionId: number; playerCount: number }) => {
        setClosing(true);
        setTimeout(
          () =>
            navigate("/game", {
              state: {
                fromRoom: true,
                playerCount: data.playerCount,
                sessionId: data.sessionId,
              },
            }),
          750,
        );
      },
    );

    return () => {
      socket.off("current_players");
      socket.off("joined_player");
      socket.off("player_left");
      socket.off("game_deleted");
      socket.off("game_start_settings");
    };
  }, [navigate]);

  const handleLeave = async () => {
    await leaveRoom(Number(id));
    navigate("/lobby");
  };

  const handleStart = async () => {
    sounds.gameStart();
    if (!canStart) return;
    startGame(Number(id));
  };

  return (
    <div className="create">
      <div className="create-content">
        <h1>{roomName}</h1>
        <hr />

        {players.map((p) => (
          <div className="create-row" key={p.id}>
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "24px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {p.id === hostId && <Crown />}
              </span>
              {p.nickname}
            </span>
          </div>
        ))}

        {!isHost && (
          <p
            style={{
              textAlign: "center",
              opacity: 0.6,
              marginTop: "12px",
              fontSize: "0.9rem",
            }}
          >
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
