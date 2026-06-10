import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BudgetService {
  constructor(private prisma: PrismaService) {}

  // --- PROJECT BUDGETS ---

  async findProjectBudget(projectId: string) {
    const budget = await this.prisma.projectBudget.findUnique({
      where: { projectId },
      include: {
        categories: true,
      },
    });
    if (!budget) {
      throw new NotFoundException(`Budget for project ID ${projectId} not found`);
    }
    return budget;
  }

  async saveProjectBudget(data: {
    projectId: string;
    totalCap: number;
    categories: {
      id?: string;
      name: string;
      allocated: number;
      color: string;
    }[];
  }) {
    const upsertBudget = this.prisma.projectBudget.upsert({
      where: { projectId: data.projectId },
      update: { totalCap: data.totalCap },
      create: {
        projectId: data.projectId,
        totalCap: data.totalCap,
      },
    });

    const deleteCategories = this.prisma.budgetCategory.deleteMany({
      where: { projectBudgetId: data.projectId },
    });

    const createCategories = this.prisma.budgetCategory.createMany({
      data: (data.categories || []).map((c) => ({
        id: c.id,
        name: c.name,
        allocated: c.allocated,
        color: c.color,
        projectBudgetId: data.projectId,
      })),
    });

    await this.prisma.$transaction([upsertBudget, deleteCategories, createCategories]);

    return this.prisma.projectBudget.findUnique({
      where: { projectId: data.projectId },
      include: {
        categories: true,
      },
    });
  }

  // --- EXPENSES ---

  async findExpenses(projectId: string) {
    return this.prisma.expense.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async logExpense(data: {
    projectId: string;
    categoryId: string;
    amount: number;
    date: string;
    vendor: string;
    notes?: string;
    status: string;
    loggedBy: string;
  }) {
    return this.prisma.expense.create({
      data: {
        projectId: data.projectId,
        categoryId: data.categoryId,
        amount: data.amount,
        date: data.date,
        vendor: data.vendor,
        notes: data.notes,
        status: data.status,
        loggedBy: data.loggedBy,
      },
    });
  }

  // --- BUDGET HISTORY ---

  async findBudgetHistory(projectId: string) {
    return this.prisma.budgetHistory.findMany({
      where: { projectId },
      orderBy: { timestamp: 'desc' },
    });
  }

  async logBudgetHistory(data: {
    projectId: string;
    action: string;
    description: string;
    performedBy: string;
    previousTotal?: number;
    newTotal?: number;
  }) {
    return this.prisma.budgetHistory.create({
      data: {
        projectId: data.projectId,
        action: data.action,
        description: data.description,
        performedBy: data.performedBy,
        previousTotal: data.previousTotal,
        newTotal: data.newTotal,
      },
    });
  }
}
