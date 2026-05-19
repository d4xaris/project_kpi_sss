import SSSCard from '~/components/SSSCard';

export default function OpponentHand({
  position,
  count = 6,
  isActive = false,
}: {
  position: 'top' | 'left' | 'right';
  count?: number;
  isActive?: boolean;
}) {
  const fanned = isActive;
  const isLR   = position === 'left' || position === 'right';

  return (
    <div className={`opponent-hand opponent-hand--${position}`}>
      {Array.from({ length: count }).map((_, i) => {
        let wrapperStyle: React.CSSProperties;

        if (isLR) {
          wrapperStyle = { marginLeft: i === 0 ? 0 : isActive ? -15 : -30 };
        } else {
          wrapperStyle = {
            marginLeft: i === 0 ? 0 : fanned ? 3 : -30,
          };
        }

        return (
          <div key={i} className="opponent-card-fan" style={wrapperStyle}>
            <div className="opponent-card" style={{ animationDelay: `${i * 90}ms` }}>
              <SSSCard id="back" height={110} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
