interface CatchEffectProps {
  show: boolean;
}

export default function CatchEffect({ show }: CatchEffectProps) {
  if (!show) return null;
  return (
    <div className="catch-effect" aria-hidden>
      <div className="catch-effect__ring" />
      <div className="catch-effect__ring catch-effect__ring--outer" />
      <img src="/catch.png" className="catch-effect__splash" draggable={false} />
    </div>
  );
}
