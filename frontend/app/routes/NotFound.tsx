import { useNavigate } from "react-router";
import Button from "~/components/Button";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <img src="/project_sss.png" draggable="false" />
      <div className="home-content">
        <p style={{ fontSize: "3rem", margin: 0, lineHeight: 1 }}>404</p>
        <p>This page doesn't exist.</p>
        <div className="button-grid">
          <Button text="Go home" variant="solid" onClick={() => navigate("/")} />
        </div>
      </div>
    </div>
  );
}
