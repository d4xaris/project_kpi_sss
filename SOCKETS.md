# Socket Integration Reference

All socket work goes to Roma (Honike). This file lists every event, where to wire it, and what state it drives.

---

## 1. Lobby

**File:** `frontend/app/hooks/useLobby.ts`

| Event | Direction | Payload | Action |
|---|---|---|---|
| `lobby:update` | receive | `{ rooms: RoomSummary[] }` | `setRooms(rooms)` — replaces manual polling |

Connect to lobby socket after user logs in. Disconnect on leave.

---

## 2. Room (pre-game)

**File:** `frontend/app/routes/Room.tsx`  
**File:** `frontend/app/hooks/useGame.ts`  
**File:** `frontend/app/hooks/useLobby.ts`

Connect to room socket **after** `POST /game/:id/join` resolves:
```ts
connectToRoom(roomId, localStorage.getItem('token'))
```

| Event | Direction | Payload | Action |
|---|---|---|---|
| `room:state` | receive | `{ players: Player[] }` | `setPlayers(players)` |
| `player:join` | receive | `Player` | `setPlayers(prev => [...prev, player])` |
| `player:leave` | receive | `{ playerId: number }` | `setPlayers(prev => prev.filter(p => p.id !== playerId))` |
| `room:closed` | receive | — | `navigate('/lobby')` |
| `game:start` | receive | `{ playerCount, sessionId }` | `navigate('/game', { state: { fromRoom: true, playerCount, sessionId } })` |
| `room:leave` | emit | `{ roomId }` | after `POST /game/:id/leave` resolves |
| `game:start` | emit | `{ roomId }` | replaces `POST /game/:id/start` entirely |

> `startGame()` in `useGame.ts` should become `socket.emit('game:start', { roomId })` — no REST call needed, server validates host.

---

## 3. In-game

**File:** `frontend/app/routes/Game.tsx`  
**File:** `frontend/app/hooks/useSolo.ts`  
**File:** `frontend/app/hooks/useCatch.ts`

### 3a. Initial state

```ts
socket.on('game:state', (snapshot) => {
  setHand(snapshot.yourHand.map(c => ({ ...c, uid: mkUid() })));
  setTopCard(snapshot.topCard);
  setCurrentTurn(snapshot.currentTurn);
  setDirection(snapshot.direction);
  setOppCounts({
    top:   snapshot.opponents.top?.cardCount   ?? 0,
    left:  snapshot.opponents.left?.cardCount  ?? 0,
    right: snapshot.opponents.right?.cardCount ?? 0,
  });
  // snapshot.opponents[slot].nickname → feed into MOCK_OPPONENTS replacement
})
```

Expected snapshot shape (`GameStateSnapshot` from Xonex):
```ts
{
  yourHand:    Card[];
  topCard:     Card;
  currentTurn: 'player' | 'top' | 'left' | 'right';
  direction:   1 | -1;
  opponents: {
    top?:   { nickname: string; cardCount: number };
    left?:  { nickname: string; cardCount: number };
    right?: { nickname: string; cardCount: number };
  };
}
```

### 3b. Receive events (replace entire mock turn system)

| Event | Payload | Action |
|---|---|---|
| `game:turn` | `{ turn: Turn }` | `setCurrentTurn(turn)` |
| `game:cardPlayed` | `{ slot: Slot, card: Card }` | `setOppCounts(prev => ({...prev, [slot]: prev[slot]-1}))` + `setTopCard(card)` |
| `game:draw` | `{ target: 'you' \| Slot, cards: Card[] }` | if `'you'`: add cards to hand with new uids; else: `setOppCounts` |
| `game:colorSelected` | `{ color: CardColor }` | `setActiveWildColor(color)` |
| `game:winner` | `{ userId: number, nickname: string }` | `setWinner(nickname)` + `apiFetch('/game/:sessionId/finish', { method:'POST', body: { winnerId: userId } })` |
| `game:solo` | `{ playerId: number }` | `triggerSolo()` in `useSolo.ts` — replaces localStorage listener |

### 3c. Emit events (player actions)

| Where | Event | Payload | Replaces |
|---|---|---|---|
| `handleCardClick` | `game:playCard` | `{ card: Card }` | mock turn scheduling |
| `handleDeckClick` | `game:draw` | — | mock draw + turn scheduling |
| `handleColorPick` | `game:colorSelected` | `{ color: CardColor }` | nothing (just add emit) |
| `useSolo.handleSolo` | `game:solo` | — | localStorage mock broadcast |
| `useCatch.handleCatch` | `game:catch` | `{ slot: Slot }` | mock `onCatch` callback |

### 3d. Mock code to DELETE when sockets are wired

In `Game.tsx`:
- `MOCK_OPP_CARDS` array and `mockOppIdx` ref
- `OPPONENT_ORDER` constant and all the `turnTimers` scheduling logic inside `handleCardClick`
- The entire `opponents.forEach` block inside `handleDeckClick`
- The `hand.length === 0` win check (replaced by `game:winner` event)

In `useSolo.ts`:
- The `localStorage.setItem` block in `handleSolo`
- The entire `useEffect` with the `storage` event listener

---

## 4. REST calls that stay as-is

These don't need sockets:

| Call | When |
|---|---|
| `POST /auth/login` | login |
| `POST /auth/registration` | register |
| `GET /auth/me` | stats page |
| `POST /game/create` | creating a room |
| `POST /game/:id/join` | joining a room |
| `POST /game/:id/leave` | leaving a room |
| `POST /game/:id/finish` | called after `game:winner` received |
