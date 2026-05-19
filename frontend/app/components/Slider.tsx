import { useRef, useState } from "react";

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function Slider({ value, onChange }: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const getPercentage = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.min(100, Math.max(0, (x / rect.width) * 100));
    onChange(Math.round(percentage));
  };

  return (
    <div
      className="slider-track"
      ref={trackRef}
      onMouseDown={(e) => { setDragging(true); getPercentage(e); }}
      onMouseMove={(e) => { if (dragging) getPercentage(e); }}
      onMouseUp={() => setDragging(false)}
      onMouseLeave={() => setDragging(false)}
    >
      <div
        className="slider-fill"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}