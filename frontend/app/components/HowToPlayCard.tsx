interface HowToPlayCardProps {
  title: string;
  description: string;
}

export default function HowToPlayCard({ title, description }: HowToPlayCardProps) {
  return (
    <div className="how-card">
      <span className="how-card-title">{title}</span>
      <p className="how-card-description">{description}</p>
    </div>
  );
}