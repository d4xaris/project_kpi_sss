import { Outlet, useLocation } from "react-router";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";

function Stars() {
  const [stars, setStars] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setStars(Array.from({ length: 60 }, (_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 3 + 1.5}px`,
      delay: `${Math.random() * 4}s`,
      duration: `${Math.random() * 2 + 2}s`,
      opacity: Math.random() * 0.5 + 0.2,
    })));
  }, []);

  useEffect(() => {
  const handleContextMenu = (e: MouseEvent) => {
    if (location.pathname.startsWith("/game") || location.pathname.startsWith("/room")) return;
    e.preventDefault();
    navigate(-1);
  };

  window.addEventListener("contextmenu", handleContextMenu);
  return () => window.removeEventListener("contextmenu", handleContextMenu);
}, [location.pathname]);

  return (
    <>
      {stars.map(s => (
        <div key={s.id} style={{
          position: "fixed",
          top: s.top,
          left: s.left,
          width: s.size,
          height: s.size,
          borderRadius: "50%",
          background: "white",
          opacity: s.opacity,
          animation: `twinkle ${s.duration} ${s.delay} infinite ease-in-out`,
          pointerEvents: "none",
          zIndex: 0,
        }} />
      ))}
    </>
  );
}

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const angleRef = useRef(90);
  const noStars = ["/game", "/room"].includes(location.pathname);

  useEffect(() => {
    angleRef.current += 45;
    document.body.style.setProperty("--bg-angle", `${angleRef.current}deg`);
  }, [location.pathname]);

  return (
    <>
      {!noStars && <Stars />}
      <Outlet />
    </>
  );
}