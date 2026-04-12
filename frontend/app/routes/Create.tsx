import { useState } from "react";
import { useNavigate } from "react-router";
import Button from "~/components/Button";

export default function Create() {
    const navigate = useNavigate();
    const [roomName, setRoomName] = useState("");
    const [players, setPlayers] = useState(2);

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
          <Button text="Create" variant="solid" onClick={() => {}} />
        </div>
      </div> 
    </div>      
    );
}