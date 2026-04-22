import { useNavigate } from "react-router";
import Button from "~/components/Button";
import HowToPlayCard from "~/components/HowToPlayCard";

const CARDS = [
  {
    title: "The goal",
    description: "Be the first player to get rid of all your cards!",
  },
  {
    title: "Your turn",
    description: "Play a card that matches the color or number on the pile. Can't go? Draw one.",
  },
  {
    title: "Special cards",
    description: "Skip, Reverse, Draw Two/Four and even Wild cards! Watch out for our secret card...",
  },
  {
    title: "Last card!",
    description: "One card left? Don't forget to call it SOLO — or draw two as a penalty.",
  },
];

export default function HowToPlay() {
  const navigate = useNavigate();

  return (
    <div className="how">
      <div className="how-content">
        <h1>How to play</h1>
        <p className="how-subtitle">it's basically like UNO...</p>

        <div className="how-cards">
          {CARDS.map((card, i) => (
            <HowToPlayCard key={i} title={card.title} description={card.description} />
          ))}
        </div>

        <div className="settings-actions">
          <Button text="Go back" variant="underline" onClick={() => navigate("/")} />
        </div>
      </div>
    </div>
  );
}