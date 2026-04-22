export const MOCK_ROOMS = [
  { id: "1", name: "Name1", players: 2, maxPlayers: 4 },
  { id: "2", name: "Name2", players: 4, maxPlayers: 4 },
  { id: "3", name: "Name3", players: 1, maxPlayers: 4 },
];

export const MOCK_HAND = [
  { color: 'crimson', value: '3' },
  { color: 'purple', value: 'skip' },
  { color: 'yellow', value: 'drawtwo' },
  { color: 'orange', value: '4' },
  { color: 'wild', value: 'wild' },
  { color: 'crimson', value: 'reverse' },
];

export const MOCK_ROOM = {
  id: "1",
  name: "Name 1",
  players: [
    { id: 1, nickname: "Player 1" },
    { id: 2, nickname: "Player 2" },
    { id: 3, nickname: "Player 3" },
    { id: 4, nickname: "Player 4" },
  ],
  hostId: 1,
};