import { useState } from "react";
import { useAuth } from "~/hooks/useAuth";
import { useNavigate } from "react-router";
import Button from "~/components/Button";

export default function Login() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [login, setLogin] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");

  const { login: authLogin, register, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    await authLogin(login, password);
    navigate("/");
  };

  const handleRegister = async () => {
    await register(login, nickname, password);
    navigate("/");
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
                maxLength={20}
                onChange={(e) => setLogin(e.target.value)}
                className="login-input"
              />
              <input
                type="password"
                placeholder="Password..."
                value={password}
                maxLength={20}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
              />
            </div>
            {error && <p className="login-error">{error}</p>}
            <Button
              text={isLoading ? "..." : "Sign in"}
              variant="solid"
              onClick={handleLogin}
            />
            <div className="login-bottom">
              <Button 
                text="Create an account" 
                variant="underline" 
                onClick={() => setTab("register")} 
              />
              <Button 
                text="Go back" 
                variant="underline" 
                onClick={() => navigate("/")} 
              />
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
                maxLength={20}
                onChange={(e) => setNickname(e.target.value)}
                className="login-input"
              />
              <input
                type="text"
                placeholder="Login..."
                value={login}
                maxLength={20}
                onChange={(e) => setLogin(e.target.value)}
                className="login-input"
              />
              <input
                type="password"
                placeholder="Password..."
                value={password}
                maxLength={20}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
              />
            </div>
            {error && <p className="login-error">{error}</p>}
            <Button
              text={isLoading ? "..." : "Register"}
              variant="solid"
              onClick={handleRegister}
            />
            <div className="login-bottom">
              <Button text="Already have an account" variant="underline" onClick={() => setTab("login")} />
              <Button text="Go back" variant="underline" onClick={() => navigate("/")} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}