import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Button from "~/components/Button";
import { useAuth, apiFetch } from "~/hooks/useAuth";

interface Stats {
  gamesPlayed: number;
  gamesWon: number;
}

export default function Stats() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    apiFetch("/auth/me")
      .then(r => r.json())
      .then(data => setStats({ gamesPlayed: data.user.gamesPlayed, gamesWon: data.user.totalWins }))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

  const loading = isLoading || statsLoading;

  return (
    <div className="settings">
      <div className="settings-content">
        <h1>
          {isLoading ? "Loading..." : `${user?.nickname ?? "Guest"}'s stats`}
        </h1>

        <div className="settings-row">
          <span>Games Played</span>
          <span>{loading ? "—" : (stats?.gamesPlayed ?? 0)}</span>
        </div>

        <div className="settings-row">
          <span>Games Won</span>
          <span className="stat-wins">{loading ? "—" : (stats?.gamesWon ?? 0)}</span>
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