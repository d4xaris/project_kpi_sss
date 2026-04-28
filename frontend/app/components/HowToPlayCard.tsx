import type { ReactNode } from "react";

interface Props {
  title: string;
  description: ReactNode;
}

export default function HowToPlayCard({ title, description }: Props) {
  return (
    <div className="how-card">
      <span className="how-card-title">{title}</span>
      <p className="how-card-description">{description}</p>
    </div>
  );
}