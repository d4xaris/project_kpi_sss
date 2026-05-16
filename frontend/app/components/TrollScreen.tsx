import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';

export default function TrollScreen() {
  const navigate      = useNavigate();
  const containerRef  = useRef<HTMLDivElement>(null);
  const videoRef      = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    containerRef.current?.requestFullscreen().catch(() => {});

    const onFsChange = () => {
      if (!document.fullscreenElement) navigate('/');
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, [navigate]);

  const handleEnded = () => {
    document.exitFullscreen().catch(() => {});
    navigate('/');
  };

  const handlePause = () => videoRef.current?.play();

  return (
    <div ref={containerRef} className="troll-screen">
      <h1 className="troll-text">GET SHREKED</h1>
      <video
        ref={videoRef}
        className="troll-video"
        src="/shreked.mp4"
        autoPlay
        onEnded={handleEnded}
        onPause={handlePause}
      />
    </div>
  );
}
