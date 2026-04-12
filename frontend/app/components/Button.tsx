type ButtonParam = {
  text: string;
  variant: "solid" | "underline";
  onClick?: () => void;
};

export default function Button({ text, variant, onClick }: ButtonParam) {
  return (
    <button className={`btn btn--${variant}`} onClick={onClick}>
      {text}
    </button>
  );
}
