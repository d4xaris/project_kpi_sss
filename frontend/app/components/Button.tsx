import { sounds } from '~/sounds';

type ButtonParam = {
  text: string;
  variant: "solid" | "underline";
  onClick?: () => void;
  disabled?: boolean;
};

export default function Button({ text, variant, onClick, disabled }: ButtonParam) {
  const handleClick = () => {
    if (disabled) return;
    sounds.click();
    onClick?.();
  };

  return (
    <button
      className={`btn btn--${variant}`}
      onClick={handleClick}
      disabled={disabled}
      style={disabled ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
    >
      {text}
    </button>
  );
}
