interface SoloEffectsProps {
  showEffects: boolean;
  showSplash:  boolean;
}

export default function SoloEffects({ showEffects, showSplash }: SoloEffectsProps) {
  return (
    <>
      {showEffects && (
        <div className="solo-effects" aria-hidden>
          <div className="solo-flash" />

          <div className="solo-confetti">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="solo-confetti-particle"
                style={{
                  '--dist':  `${200 + (i % 7) * 40}px`,
                  '--size':  `${4 + (i % 4) * 1.5}px`,
                  '--delay': `${(i * 23) % 160}ms`,
                  '--rot':   `${(i * 53) % 360}deg`,
                  '--angle': `${(i / 50) * 360 + (i % 5) * 8}deg`,
                } as React.CSSProperties}
              />
            ))}
          </div>

          {Array.from({ length: 80 }).map((_, i) => (
            <div
              key={i}
              className="solo-particle"
              style={{
                '--angle': `${(i / 30) * 360 + (i % 9) * 4}deg`,
                '--dist':  `${180 + (i % 6) * 40}px`,
                '--size':  `${6 + (i % 5) * 2}px`,
                '--delay': `${(i * 17) % 120}ms`,
                '--clr':   ['#9f00f5','#fff','#f5a800','#e040fb','#c77dff','#5ce1e6'][i % 6],
                '--rot':   `${(i * 61) % 360}deg`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {showSplash && (
        <img src="/solo.svg" className="solo-splash" draggable={false} />
      )}
    </>
  );
}
