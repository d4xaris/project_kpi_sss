import { useNavigate } from "react-router";
import Button from "~/components/Button";
import { useAuth } from "~/hooks/useAuth";
import { useState } from "react";

export default function Home() {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout, isLoading } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);

  if (isLoading) return null;

  return (
    <div className="home">

      {isLoggedIn && (
        <div className="account-corner">
          <button className="account-btn" onClick={() => setAccountOpen(o => !o)}>
            Account
          </button>
          {accountOpen && (
            <div className="account-dropdown">
              <div className="account-avatar">
                {user?.nickname.charAt(0).toUpperCase()}
              </div>
              <span>{user?.nickname}</span>
              <button className="account-logout" onClick={logout}>
                Log out
              </button>
            </div>
          )}
        </div>
      )}

      <div className="relative inline-block"></div>
      <img src="/project_sss.png" draggable="false" />
      <div
        className="rickroll-zone"
        onClick={() =>
          window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank")
        }
      />

      <div className="home-content">
        <p>Welcome!</p>
        <p>{isLoggedIn ? "Play with friends in real time!" : "Login to start playing!"}</p>
        <div className="button-grid">
          {isLoggedIn ? (
            <>
              <Button text="Play" variant="solid" onClick={() => navigate("/play")} />
              <Button text="Settings" variant="solid" onClick={() => navigate("/settings")} />
              <Button text="How to play" variant="underline" onClick={() => navigate("/how-to-play")} />
              <Button text="Stats" variant="underline" onClick={() => navigate("/stats")} />
            </>
          ) : (
            <Button text="Login" variant="solid" onClick={() => navigate("/login")} />
          )}
        </div>
      </div>
    </div>
  );
}