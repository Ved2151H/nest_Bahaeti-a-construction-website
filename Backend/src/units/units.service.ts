import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UnitsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.unit.findMany({
      include: {
        advisor: true,
        linkedLead: true,
      },
    });
  }

  async findOne(id: string) {
    const unit = await this.prisma.unit.findUnique({
      where: { id },
      include: {
        advisor: true,
        linkedLead: true,
      },
    });
    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }
    return unit;
  }

  async update(
    id: string,
    data: {
      status: string;
      unitNumber?: string;
      projectId?: string;
      type?: string;
      price?: number;
      bookedBy?: string;
      advisorId?: string;
      bookedAt?: string | Date;
      tokenAmount?: number;
      linkedLeadId?: string;
    },
  ) {
    const existing = await this.findOne(id);

    // If unit status is changed to Available, clear booking fields
    const updatedBookedBy = data.status === 'Available' ? null : (data.bookedBy ?? existing.bookedBy);
    const updatedAdvisorId = data.status === 'Available' ? null : (data.advisorId ?? existing.advisorId);
    const updatedTokenAmount = data.status === 'Available' ? null : (data.tokenAmount ?? existing.tokenAmount);
    const updatedBookedAt = data.status === 'Available' ? null : (data.bookedAt ? new Date(data.bookedAt) : existing.bookedAt);
    const updatedLinkedLeadId = data.status === 'Available' ? null : (data.linkedLeadId ?? existing.linkedLeadId);

    return this.prisma.unit.update({
      where: { id },
      data: {
        status: data.status,
        unitNumber: data.unitNumber,
        projectId: data.projectId,
        typeId: data.type,
        price: data.price,
        bookedBy: updatedBookedBy,
        advisorId: updatedAdvisorId,
        bookedAt: updatedBookedAt,
        tokenAmount: updatedTokenAmount,
        linkedLeadId: updatedLinkedLeadId,
      },
    });
  }
}
