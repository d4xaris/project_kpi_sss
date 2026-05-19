import { useNavigate } from "react-router";
import Button from "~/components/Button";

export default function Play() {
  const navigate = useNavigate();

  return (
    <div className="play">
    <div className="play-content">
      <h1>Play</h1>
      <div className="button-grid">
        <Button
          text="Create"
          variant="solid"
          onClick={() => navigate("/create")}
        />
        <Button text="Join" 
          variant="solid" 
          onClick={() => navigate("/lobby")} 
        />
      </div>
        <Button
          text="Go back"
          variant="underline"
          onClick={() => navigate("/")}
        />
    </div>
  </div>
  );
}
