export class GameService {
  constructor(private prisma: any) {}

  async findActiveSession(userId: number) {
    return this.prisma.gameSession.findFirst({
      where: {
        players: { some: { id: userId } },
        status: { in: ["LOBBY", "PLAYING"] },
      },
    });
  }
  async createSession(sessionName: string, maxPlayers: number, hostId: number) {
    return this.prisma.gameSession.create({
      data: {
        sessionName,
        maxPlayers,
        hostId,
        players: { connect: { id: hostId } },
      },
    });
  }

  async getSession(id: number) {
    return this.prisma.gameSession.findUnique({
      where: { id },
      include: {
        players: true,
        _count: { select: { players: true } },
      },
    });
  }

  async getLobbySessions() {
    const sessions = await this.prisma.gameSession.findMany({
      where: { status: "LOBBY" },
      include: { _count: { select: { players: true } } },
      orderBy: { createdAt: "desc" },
    });

    return sessions.map((s: any) => ({
      id: s.id,
      sessionName: s.sessionName,
      playerCount: s._count.players,
      maxPlayers: s.maxPlayers,
      hostId: s.hostId,
    }));
  }

  async joinSession(sessionId: number, userId: number) {
    await this.prisma.gameSession.update({
      where: { id: sessionId },
      data: { players: { connect: { id: userId } } },
    });
  }
  async leaveSession(sessionId: number, userId: number) {
    await this.prisma.gameSession.update({
      where: { id: sessionId },
      data: { players: { disconnect: { id: userId } } },
    });
  }

  async deleteSession(sessionId: number) {
    await this.prisma.gameSession.delete({ where: { id: sessionId } });
  }

  async startSession(sessionId: number) {
    await this.prisma.gameSession.update({
      where: { id: sessionId },
      data: { status: "PLAYING" },
    });
  }

  async finishSession(sessionId: number, winnerId: number, playerIds: number[]) {
    await this.prisma.$transaction([
      this.prisma.user.updateMany({
        where: { id: { in: playerIds } },
        data: { gamesPlayed: { increment: 1 } },
      }),
      this.prisma.user.update({
        where: { id: winnerId },
        data: { totalWins: { increment: 1 } },
      }),
      this.prisma.gameSession.update({
        where: { id: sessionId },
        data: { status: "ENDED" },
      }),
    ]);
  }
}
