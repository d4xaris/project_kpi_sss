import { Outlet, useLocation } from "react-router";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";

const PLAYLIST_ID   = 'PLgmyWt4cSVPzWgohWEqsPr1yUAVLzU3VC';
const GAME_VIDEO_ID = 'oUI_tVU77cw';

function Stars() {
  const [stars, setStars] = useState<any[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setStars(Array.from({ length: 60 }, (_, i) => ({
      id: i,
      top:      `${Math.random() * 100}%`,
      left:     `${Math.random() * 100}%`,
      size:     `${Math.random() * 3 + 1.5}px`,
      delay:    `${Math.random() * 4}s`,
      duration: `${Math.random() * 2 + 2}s`,
      opacity:  Math.random() * 0.5 + 0.2,
    })));
  }, []);

  useEffect(() => {
    const onContextMenu = (e: MouseEvent) => {
      if (location.pathname.startsWith("/game") || location.pathname.startsWith("/room")) return;
      e.preventDefault();
      navigate(-1);
    };
    window.addEventListener("contextmenu", onContextMenu);
    return () => window.removeEventListener("contextmenu", onContextMenu);
  }, [location.pathname]);

  return (
    <>
      {stars.map(s => (
        <div key={s.id} style={{
          position: "fixed", top: s.top, left: s.left,
          width: s.size, height: s.size, borderRadius: "50%",
          background: "white", opacity: s.opacity,
          animation: `twinkle ${s.duration} ${s.delay} infinite ease-in-out`,
          pointerEvents: "none", zIndex: 0,
        }} />
      ))}
    </>
  );
}

function YouTubePlayer() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const player    = useRef<any>(null);
  const ready     = useRef(false);
  const isGameRef = useRef(false);
  const location  = useLocation();

  const isGame = location.pathname.startsWith("/game");
  isGameRef.current = isGame;

  const hasClicked   = useRef(false);
  const musicDelayId = useRef<ReturnType<typeof setTimeout> | null>(null);
  const vol = () => parseFloat(localStorage.getItem('musicVolume') ?? '0.3') * 100;

  const unmute = (p: any) => { p.unMute(); p.setVolume(vol()); };

  useEffect(() => {
    const init = () => {
      const YT = (window as any).YT;
      if (!YT?.Player || !iframeRef.current || player.current) return;

      player.current = new YT.Player(iframeRef.current, {
        events: {
          onReady: (e: any) => {
            ready.current = true;
            if (isGameRef.current) {
              e.target.setVolume(0);
              e.target.unMute();
              e.target.loadVideoById(GAME_VIDEO_ID);
              if (hasClicked.current) {
                musicDelayId.current = setTimeout(() => {
                  if (isGameRef.current) e.target.setVolume(vol());
                  musicDelayId.current = null;
                }, 3500);
              }
            } else {
              e.target.setVolume(0);
              e.target.setLoop(true);
              e.target.playVideo();
              if (hasClicked.current) unmute(e.target);
            }
          },
          onStateChange: (e: any) => {
            if (e.data === (window as any).YT.PlayerState.ENDED && isGameRef.current) {
              e.target.seekTo(0);
              e.target.playVideo();
            }
          },
        },
      });
    };

    const prev = (window as any).onYouTubeIframeAPIReady;
    (window as any).onYouTubeIframeAPIReady = () => { if (prev) prev(); init(); };

    if ((window as any).YT?.Player) init();
    else if (!document.getElementById('yt-api')) {
      const s = document.createElement('script');
      s.id = 'yt-api'; s.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    const onClick = () => {
      hasClicked.current = true;
      if (ready.current) unmute(player.current);
    };
    document.addEventListener('click', onClick, { once: true });
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    if (!ready.current) return;

    if (musicDelayId.current) {
      clearTimeout(musicDelayId.current);
      musicDelayId.current = null;
    }

    if (isGame) {
      player.current.setVolume(0);
      player.current.unMute();
      player.current.loadVideoById(GAME_VIDEO_ID);
      musicDelayId.current = setTimeout(() => {
        if (isGameRef.current) player.current.setVolume(vol());
        musicDelayId.current = null;
      }, 3500);
    } else {
      player.current.loadPlaylist({ listType: 'playlist', list: PLAYLIST_ID });
      player.current.setLoop(true);
      player.current.playVideo();
    }
  }, [isGame]);

  useEffect(() => {
    const onVol = (e: Event) => player.current?.setVolume((e as CustomEvent).detail * 100);
    window.addEventListener('sss:musicVolume', onVol);
    return () => window.removeEventListener('sss:musicVolume', onVol);
  }, []);

  const src = `https://www.youtube.com/embed/videoseries?list=${PLAYLIST_ID}&enablejsapi=1&autoplay=1&mute=1&controls=0&loop=1&rel=0&playsinline=1&origin=${window.location.origin}`;

  return (
    <div style={{ position: 'fixed', bottom: -300, left: -300, opacity: 0, pointerEvents: 'none' }}>
      <iframe
        ref={iframeRef}
        src={src}
        allow="autoplay"
        style={{ width: 1, height: 1, border: 'none' }}
      />
    </div>
  );
}


export default function Layout() {
  const location = useLocation();
  const angleRef = useRef(90);
  const noStars  = location.pathname.startsWith("/game");

  useEffect(() => {
    angleRef.current += 45;
    document.body.style.setProperty("--bg-angle", `${angleRef.current}deg`);
  }, [location.pathname]);

  return (
    <>
      {!noStars && <Stars />}
      <YouTubePlayer />
      <Outlet />
    </>
  );
}
