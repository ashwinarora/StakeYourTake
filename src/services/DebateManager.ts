import { SupportedChainId } from '@/config/wagmi';
import { prisma } from '@/lib/prisma'

type CreateDebateParams = {
  title: string;
  description: string;
  debateId: number;
  chainId: SupportedChainId;
  creationTxHash: string;
}

class DebateManager {
  private static instance: DebateManager;

  private constructor() {}

  public static getInstance(): DebateManager {
    if (!DebateManager.instance) {
      DebateManager.instance = new DebateManager();
    }
    return DebateManager.instance;
  }

  async createDebate({ title, description, debateId, chainId, creationTxHash }: CreateDebateParams) {
    return await prisma.debate.create({
      data: { title, description, debateId, chainId, creationTxHash },
    });
  }

  async getDebateById(id: number) {
    return await prisma.debate.findUnique({
      where: { id },
      include: { Evidence: true },
    });
  }

  async getAllDebates() {
    return await prisma.debate.findMany({
      include: { Evidence: false },
    });
  }

  async updateDebate(id: number, data: { title?: string; description?: string }) {
    return await prisma.debate.update({
      where: { id },
      data,
    });
  }

  async deleteDebate(id: number) {
    return await prisma.debate.delete({
      where: { id },
    });
  }
}

export default DebateManager;
