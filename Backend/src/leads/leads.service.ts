import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async findAll(assignedTo?: string) {
    return this.prisma.lead.findMany({
      where: assignedTo ? { assignedTo } : {},
      include: {
        assignee: true,
        history: true,
        documents: true,
      },
    });
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        assignee: true,
        history: true,
        documents: true,
      },
    });
    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }
    return lead;
  }

  async create(data: {
    name: string;
    phone?: string;
    email?: string;
    source?: string;
    status?: string;
    assignedTo: string;
    budget: number;
    notes?: string;
    temperature?: string;
    probability?: number;
    timeline?: string;
    projectId?: string;
    unitId?: string;
    unitName?: string;
    buyerId?: string;
    buyerProfile?: string;
    amount?: string;
  }) {
    return this.prisma.lead.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        source: data.source ?? 'Website',
        status: data.status ?? 'Lead',
        assignedTo: data.assignedTo,
        budget: data.budget,
        notes: data.notes,
        temperature: data.temperature ?? 'Warm',
        probability: data.probability ?? 50,
        timeline: data.timeline ?? '1-3 Months',
        projectId: data.projectId,
        unitId: data.unitId,
        unitName: data.unitName,
        buyerId: data.buyerId,
        buyerProfile: data.buyerProfile,
        amount: data.amount,
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      phone?: string;
      email?: string;
      source?: string;
      status?: string;
      assignedTo?: string;
      budget?: number;
      notes?: string;
      temperature?: string;
      daysInStage?: number;
      probability?: number;
      verification?: string;
      nextAction?: string;
      timeline?: string;
      projectId?: string;
      unitId?: string;
      unitName?: string;
      buyerId?: string;
      buyerProfile?: string;
      amount?: string;
    },
  ) {
    await this.findOne(id); // Check existence
    return this.prisma.lead.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        source: data.source,
        status: data.status,
        assignedTo: data.assignedTo,
        budget: data.budget,
        notes: data.notes,
        temperature: data.temperature,
        daysInStage: data.daysInStage,
        probability: data.probability,
        verification: data.verification,
        nextAction: data.nextAction,
        timeline: data.timeline,
        projectId: data.projectId,
        unitId: data.unitId,
        unitName: data.unitName,
        buyerId: data.buyerId,
        buyerProfile: data.buyerProfile,
        amount: data.amount,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.lead.delete({
      where: { id },
    });
  }

  // --- HISTORY LOGS ---

  async addHistory(
    leadId: string,
    data: {
      date: string;
      note: string;
      author: string;
    },
  ) {
    await this.findOne(leadId); // Check existence
    return this.prisma.leadHistory.create({
      data: {
        leadId,
        date: data.date,
        note: data.note,
        author: data.author,
      },
    });
  }

  // --- DOCUMENTS ---

  async addOrUpdateDocument(
    leadId: string,
    data: {
      id?: string;
      name: string;
      type: string;
      status: string;
      updatedAt: string;
      required: boolean;
    },
  ) {
    await this.findOne(leadId); // Check existence
    if (data.id) {
      return this.prisma.leadDocument.upsert({
        where: { id: data.id },
        update: {
          name: data.name,
          type: data.type,
          status: data.status,
          updatedAt: data.updatedAt,
          required: data.required,
        },
        create: {
          id: data.id,
          leadId,
          name: data.name,
          type: data.type,
          status: data.status,
          updatedAt: data.updatedAt,
          required: data.required,
        },
      });
    } else {
      return this.prisma.leadDocument.create({
        data: {
          leadId,
          name: data.name,
          type: data.type,
          status: data.status,
          updatedAt: data.updatedAt,
          required: data.required,
        },
      });
    }
  }
}
