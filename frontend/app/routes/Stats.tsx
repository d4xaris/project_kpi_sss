import { useNavigate } from "react-router";
import Button from "~/components/Button";
import { useAuth } from "~/hooks/useAuth";

// Mock stats — replace with real API call later
const MOCK_STATS = {
  gamesPlayed: 100,
  gamesWon: 67,
};

export default function Stats() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  return (
    <div className="settings">
      <div className="settings-content">
        <h1>
          {isLoading ? "Loading..." : `${user?.nickname ?? "Guest"}'s stats`}
        </h1>

        <div className="settings-row">
          <span>Games Played</span>
          <span>{MOCK_STATS.gamesPlayed}</span>
        </div>

        <div className="settings-row">
          <span>Games Won</span>
          <span className="stat-wins">{MOCK_STATS.gamesWon}</span>
        </div>

        <div className="settings-actions">
          <Button
            text="Go back"
            variant="underline"
            onClick={() => navigate("/")}
          />
        </div>
      </div>
    </div>
  );
}