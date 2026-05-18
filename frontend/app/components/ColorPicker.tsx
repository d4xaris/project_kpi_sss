import { useState } from 'react';
import { sounds } from '~/sounds';

export type CardColor = 'crimson' | 'yellow' | 'orange' | 'purple';

const COLOR_OPTIONS: { color: CardColor; hex: string; label: string; pos: 'tl' | 'tr' | 'bl' | 'br' }[] = [
  { color: 'crimson', hex: '#9B0000', label: 'Crimson', pos: 'tl' },
  { color: 'purple',  hex: '#9f00f5', label: 'Purple',  pos: 'tr' },
  { color: 'yellow',  hex: '#F5A800', label: 'Yellow',  pos: 'bl' },
  { color: 'orange',  hex: '#F56200', label: 'Orange',  pos: 'br' },
];

export default function ColorPicker({ onPick }: { onPick: (c: CardColor) => void }) {
  const [closing, setClosing] = useState(false);

  const handlePick = (color: CardColor) => {
    sounds.click();
    setClosing(true);
    setTimeout(() => onPick(color), 280);
  };

  return (
    <div className={`color-picker-backdrop${closing ? ' color-picker-backdrop--closing' : ''}`}>
      <p className="color-picker__title">Choose a color</p>
      <div className="color-picker">
        {COLOR_OPTIONS.map(({ color, hex, label, pos }) => (
          <button
            key={color}
            className={`color-picker__btn color-picker__btn--${pos}`}
            style={{ '--clr': hex } as React.CSSProperties}
            onClick={() => handlePick(color)}
            title={label}
          />
        ))}
      </div>
    </div>
  );
}
