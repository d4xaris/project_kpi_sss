interface SSSCardProps {
  id: string;
  height?: number;
}

export default function SSSCard({ id, height = 120 }: SSSCardProps) {
  return (
    <img 
      src={`/cards/${id}.svg`} 
      height={height} 
      alt={id}
    />
  );
}