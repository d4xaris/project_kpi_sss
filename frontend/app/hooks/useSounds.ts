const play = (name: string, volume = 0.7) => {
  const audio = new Audio(`/sounds/${name}.mp3`);
  audio.volume = volume;
  audio.play().catch(() => {});
};

export function useSounds() {
  return {
    click:     () => play('click',     0.5),
    gameStart: () => play('gamestart', 0.8),
    start:     () => play('start',     0.8),
  };
}
