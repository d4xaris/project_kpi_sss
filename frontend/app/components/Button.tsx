import { sounds } from '~/sounds';

type ButtonParam = {
  text: string;
  variant: "solid" | "underline";
  onClick?: () => void;
};

export default function Button({ text, variant, onClick }: ButtonParam) {
  const handleClick = () => {
    sounds.click();
    onClick?.();
  };

  return (
    <button className={`btn btn--${variant}`} onClick={handleClick}>
      {text}
    </button>
  );
}
