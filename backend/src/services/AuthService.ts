import bcrypt from "bcrypt";
import { PrismaClient } from "../generated/prisma/client.js";

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  async register(login: string, nickname: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { login, nickname, password: hashedPassword },
    });
    return { id: user.id, nickname: user.nickname };
  }

  async login(login: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { login } });
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    return { id: user.id, nickname: user.nickname };
  }

  async getMe(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, nickname: true, totalWins: true, gamesPlayed: true },
    });
  }
}
