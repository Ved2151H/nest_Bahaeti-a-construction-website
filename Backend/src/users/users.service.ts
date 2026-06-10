import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      include: {
        agent: true,
        manager: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        agent: true,
        manager: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async create(data: {
    id: string;
    name: string;
    email: string;
    role: string;
    status?: string;
    avatar?: string;
    assignedAgentId?: string;
    reportsTo?: string;
  }) {
    return this.prisma.user.create({
      data: {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status ?? 'active',
        avatar: data.avatar,
        assignedAgentId: data.assignedAgentId || null,
        reportsTo: data.reportsTo || null,
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      email?: string;
      role?: string;
      status?: string;
      avatar?: string;
      assignedAgentId?: string;
      reportsTo?: string;
    },
  ) {
    await this.findOne(id); // Check existence
    return this.prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        avatar: data.avatar,
        assignedAgentId: data.assignedAgentId !== undefined ? (data.assignedAgentId || null) : undefined,
        reportsTo: data.reportsTo !== undefined ? (data.reportsTo || null) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check existence
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
