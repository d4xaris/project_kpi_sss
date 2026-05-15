import SSSCard from '~/components/SSSCard';

// HONIKE: replace `count` with the real card count from:
//   game:state      → snapshot.opponents[position].cardCount   (initial)
//   game:draw       → update the matching opponent's count      (on draw)
//   game:cardPlayed → decrement matching opponent's count       (on play)
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
    <div className={[
      `opponent-hand opponent-hand--${position}`,
      isActive && isLR ? 'opponent-hand--lr-active' : '',
    ].join(' ')}>
      {Array.from({ length: count }).map((_, i) => {
        let wrapperStyle: React.CSSProperties;

        if (isLR) {
          // Left/right: no margin fan (it maps to vertical on screen — looks bad).
          // Active state is handled by CSS class on the container instead.
          wrapperStyle = { marginLeft: i === 0 ? 0 : -30 };
        } else {
          // Top: fan out horizontally when active.
          wrapperStyle = {
            marginLeft: i === 0 ? 0 : fanned ? 3 : -30,
          };
        }

        return (
          // outer wrapper handles position — inner .opponent-card handles deal animation
          // (two divs prevent the CSS animation from fighting the inline transform)
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
