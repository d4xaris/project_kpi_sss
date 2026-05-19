// Deterministic star data avoids position shifts on re-renders
const WIN_TWINKLE = Array.from({ length: 50 }, (_, i) => ({
  top:     `${(i * 7.31  + 5.2) % 100}%`,
  left:    `${(i * 13.73 + 2.9) % 100}%`,
  size:    `${1.5 + (i % 4) * 0.65}px`,
  delay:   `${(i * 0.27) % 4}s`,
  dur:     `${2 + (i % 5) * 0.38}s`,
  opacity: 0.2 + (i % 5) * 0.08,
}));

interface WinScreenProps {
  nickname: string;
  onHome:   () => void;
  exiting:  boolean;
}

export default function WinScreen({ nickname, onHome, exiting }: WinScreenProps) {
  return (
    <div className={`win-screen${exiting ? ' win-screen--exiting' : ''}`}>
      {/* Twinkling stars — same keyframe as the rest of the app */}
      {WIN_TWINKLE.map((s, i) => (
        <div
          key={i}
          aria-hidden
          style={{
            position:     'fixed',
            top:          s.top,
            left:         s.left,
            width:        s.size,
            height:       s.size,
            borderRadius: '50%',
            background:   'white',
            opacity:      s.opacity,
            animation:    `twinkle ${s.dur} ${s.delay} infinite ease-in-out`,
            pointerEvents:'none',
            zIndex:       1,
          }}
        />
      ))}

      <div className="win-content">
        <h1 className="win-nickname">{nickname}</h1>
        <h2 className="win-won">WON!</h2>
        <button className="btn--solid win-home-btn" onClick={onHome}>
          Back to Home
        </button>
      </div>
    </div>
  );
}
