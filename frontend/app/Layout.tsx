import { Outlet, useLocation } from "react-router";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";

function Stars() {
  const [stars, setStars] = useState<any[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

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

function SoundCloudPlayer() {
  const iframeRef  = useRef<HTMLIFrameElement>(null);
  const widgetRef  = useRef<any>(null);
  const isReadyRef = useRef(false);
  const location   = useLocation();
  const isGame     = location.pathname.startsWith("/game");
  const isGameRef  = useRef(isGame);
  isGameRef.current = isGame;

  const getVol = () => parseFloat(localStorage.getItem('musicVolume') ?? '0.5') * 100;

  useEffect(() => {
    const bindWidget = () => {
      const SC = (window as any).SC;
      if (!SC || !iframeRef.current) return;

      const widget = SC.Widget(iframeRef.current);
      widgetRef.current = widget;

      widget.bind(SC.Widget.Events.READY, () => {
        isReadyRef.current = true;
        widget.setVolume(getVol());
        if (!isGameRef.current) widget.play();
      });
    };

    if ((window as any).SC) {
      bindWidget();
      return;
    }

    if (document.getElementById('sc-widget-api')) return;

    const script = document.createElement('script');
    script.id    = 'sc-widget-api';
    script.src   = 'https://w.soundcloud.com/player/api.js';
    script.onload = bindWidget;
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    const start = () => {
      if (isReadyRef.current && !isGameRef.current) {
        widgetRef.current?.setVolume(getVol());
        widgetRef.current?.play();
      }
    };
    document.addEventListener('click', start, { once: true });
    return () => document.removeEventListener('click', start);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      widgetRef.current?.setVolume((e as CustomEvent<number>).detail * 100);
    };
    window.addEventListener('sss:musicVolume', handler);
    return () => window.removeEventListener('sss:musicVolume', handler);
  }, []);

  // Pause on /game, resume everywhere else
  useEffect(() => {
    if (!widgetRef.current || !isReadyRef.current) return;
    if (isGame) {
      widgetRef.current.pause();
    } else {
      widgetRef.current.setVolume(getVol());
      widgetRef.current.play();
    }
  }, [isGame]);

  return (
    <iframe
      ref={iframeRef}
      id="sc-player"
      src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/indexforpara/c418-alpha&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false"
      style={{
        position: 'fixed',
        bottom: '-200px',
        left:   '-200px',
        width:  '1px',
        height: '1px',
        opacity: 0,
        pointerEvents: 'none',
      }}
      allow="autoplay"
    />
  );
}

export default function Layout() {
  const location = useLocation();
  const angleRef = useRef(90);
  const noStars  = location.pathname.startsWith("/game") || location.pathname.startsWith("/room");

  useEffect(() => {
    angleRef.current += 45;
    document.body.style.setProperty("--bg-angle", `${angleRef.current}deg`);
  }, [location.pathname]);

  return (
    <>
      {!noStars && <Stars />}
      <SoundCloudPlayer />
      <Outlet />
    </>
  );
}
