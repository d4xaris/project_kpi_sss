import { useNavigate } from "react-router";
import Button from "~/components/Button";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
        <img src="/project_sss.png" draggable="false"></img>
        <div className="home-content">
          <p>Welcome!</p>
          <p>Play with friends in real time!</p>
          <div className="button-grid">
            <Button text="Play" variant="solid" onClick={() => navigate("/play")} />
            <Button text="Settings" variant="solid" onClick={() => navigate("/settings")} />
            <Button text="How to play" variant="underline" onClick={() => navigate("/how-to-play")} />
            <Button text="Stats" variant="underline" onClick={() => navigate("/stats")} />
          </div>
      </div>
    </div>
  );
}