import type { Phase } from '~/types/game';

export default function GameCurtain({ phase, exit = false }: { phase: Phase; exit?: boolean }) {
  if (exit) return (
    <div className="curtain">
      <div className="curtain__left  curtain__left--closing" />
      <div className="curtain__right curtain__right--closing" />
    </div>
  );

  return (
    <div className="curtain">
      <div className={`curtain__left  curtain__left--${phase}`} />
      <div className={`curtain__right curtain__right--${phase}`} />
      <img
        src="/project_sss.png"
        className={`curtain__logo${
          phase === 'closed'  ? ' curtain__logo--visible' :
          phase === 'opening' ? ' curtain__logo--hiding'  : ''
        }`}
        draggable={false}
      />
    </div>
  );
}
