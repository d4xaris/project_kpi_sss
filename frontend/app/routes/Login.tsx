import { useState } from "react";
import { useAuth } from "~/hooks/useAuth";
import { useNavigate } from "react-router";
import Button from "~/components/Button";

export default function Login() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [login, setLogin] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const { login: authLogin, register, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const switchTab = (t: "login" | "register") => {
    setTab(t);
    setLocalError(null);
    clearError();
    setPassword("");
  };

  const displayError = localError || error;

  const handleLogin = async () => {
    setLocalError(null);
    if (!login.trim()) { setLocalError("Please enter your login"); return; }
    if (!password) { setLocalError("Please enter your password"); return; }

    const ok = await authLogin(login, password);
    if (ok) navigate("/");
  };

  const handleRegister = async () => {
    setLocalError(null);
    if (!nickname.trim()) { setLocalError("Please enter a nickname"); return; }
    if (nickname.trim().length < 3) { setLocalError("Nickname must be at least 3 characters"); return; }
    if (!login.trim()) { setLocalError("Please enter a login"); return; }
    if (login.trim().length < 3) { setLocalError("Login must be at least 3 characters"); return; }
    if (password.length < 6) { setLocalError("Password must be at least 6 characters"); return; }

    const ok = await register(login, nickname, password);
    if (ok) navigate("/");
  };

  const onKey = (e: React.KeyboardEvent, handler: () => void) => {
    if (e.key === "Enter" && !isLoading) handler();
  };

  return (
    <div className="login">
      <div className="login-content">
        {tab === "login" ? (
          <>
            <h1>Welcome back</h1>
            <p>Sign in to start playing</p>
            <div className="login-fields">
              <input
                type="text"
                placeholder="Login..."
                value={login}
                maxLength={18}
                onChange={(e) => setLogin(e.target.value)}
                onKeyDown={(e) => onKey(e, handleLogin)}
                className="login-input"
              />
              <input
                type="password"
                placeholder="Password..."
                value={password}
                maxLength={18}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => onKey(e, handleLogin)}
                className="login-input"
              />
            </div>
            {displayError && <p className="login-error">{displayError}</p>}
            <Button
              text={isLoading ? "..." : "Sign in"}
              variant="solid"
              onClick={handleLogin}
            />
            <div className="login-bottom">
              <Button text="Create an account" variant="underline" onClick={() => switchTab("register")} />
              <Button text="Go back" variant="underline" onClick={() => navigate("/")} />
            </div>
          </>
        ) : (
          <>
            <h1>Create account</h1>
            <p>Join and start playing</p>
            <div className="login-fields">
              <input
                type="text"
                placeholder="Nickname..."
                value={nickname}
                maxLength={18}
                onChange={(e) => setNickname(e.target.value)}
                onKeyDown={(e) => onKey(e, handleRegister)}
                className="login-input"
              />
              <input
                type="text"
                              placeholder="Login..."
                value={login}
                maxLength={18}
                onChange={(e) => setLogin(e.target.value)}
                onKeyDown={(e) => onKey(e, handleRegister)}
                className="login-input"
              />
              <input
                type="password"
                placeholder="Password... (min. 6 characters)"
                value={password}
                maxLength={18}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => onKey(e, handleRegister)}
                className="login-input"
              />
            </div>
            {displayError && <p className="login-error">{displayError}</p>}
            <Button
              text={isLoading ? "..." : "Register"}
              variant="solid"
              onClick={handleRegister}
            />
            <div className="login-bottom">
              <Button text="Already have an account" variant="underline" onClick={() => switchTab("login")} />
              <Button text="Go back" variant="underline" onClick={() => navigate("/")} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
