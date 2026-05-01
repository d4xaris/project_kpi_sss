const getVolume = () =>
  parseFloat(localStorage.getItem('soundVolume') ?? '0.7');

const play = (name: string) => {
  const audio = new Audio(`/sounds/${name}.mp3`);
  audio.volume = getVolume();
  audio.play().catch(() => {});
};

export const sounds = {
  click:     () => play('click'),
  gameStart: () => play('gamestart'),
  start:     () => play('start'),
};
