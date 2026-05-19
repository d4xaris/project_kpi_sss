const getVolume = () =>
  parseFloat(localStorage.getItem('soundVolume') ?? '0.1');

const play = (name: string, volumeMultiplier = 1) => {
  const audio = new Audio(`/sounds/${name}.mp3`);
  audio.volume = Math.min(1, getVolume() * volumeMultiplier);
  audio.play().catch(() => {});
};

export function useSounds() {
  return {
    click:     () => play('click'),
    gameStart: () => play('gamestart'),
    start:     () => play('start'),
  };
}
