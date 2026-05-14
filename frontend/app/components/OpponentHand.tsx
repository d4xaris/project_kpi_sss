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
  const mid    = (count - 1) / 2; // centre index for symmetric spread

  return (
    <div className={`opponent-hand opponent-hand--${position}`}>
      {Array.from({ length: count }).map((_, i) => {
        let wrapperStyle: React.CSSProperties;

        if (isLR) {
          // Left/right containers are rotated ±90°, so local X = vertical screen axis.
          // We spread via translateX centred on the middle card so the group never
          // shifts as a whole — it fans open symmetrically (some go up, some go down).
          // margin-left stays at –30 to keep the base overlap constant.
          const offset = fanned ? (i - mid) * 33 : 0;
          wrapperStyle = {
            marginLeft: i === 0 ? 0 : -30,
            transform:  `translateX(${offset}px)`,
          };
        } else {
          // Top: local X is effectively horizontal — plain margin-left fan is fine.
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
