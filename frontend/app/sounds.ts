const getVolume = () =>
  parseFloat(localStorage.getItem('soundVolume') ?? '0.7');

const play = (name: string, volumeMultiplier = 1) => {
  const audio = new Audio(`/sounds/${name}.mp3`);
  audio.volume = Math.min(1, getVolume() * volumeMultiplier);
  audio.play().catch(() => {});
};

export const sounds = {
  click:     () => play('click'),
  gameStart: () => play('gamestart'),
  start:     () => play('start'),
  solo:      () => play('solosound', 2),
  catch:     () => play('catchsound', 1.5),
};
