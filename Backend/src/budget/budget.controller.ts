import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { BudgetService } from './budget.service';

@Controller('budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Get('project/:projectId')
  async findProjectBudget(@Param('projectId') projectId: string) {
    try {
      return await this.budgetService.findProjectBudget(projectId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        // Return a default empty budget or rethrow
        throw error;
      }
      throw error;
    }
  }

  @Post('project')
  saveProjectBudget(
    @Body()
    data: {
      projectId: string;
      totalCap: number;
      categories: {
        id?: string;
        name: string;
        allocated: number;
        color: string;
      }[];
    },
  ) {
    return this.budgetService.saveProjectBudget(data);
  }

  @Get('expenses/:projectId')
  findExpenses(@Param('projectId') projectId: string) {
    return this.budgetService.findExpenses(projectId);
  }

  @Post('expenses')
  logExpense(
    @Body()
    data: {
      projectId: string;
      categoryId: string;
      amount: number;
      date: string;
      vendor: string;
      notes?: string;
      status: string;
      loggedBy: string;
    },
  ) {
    return this.budgetService.logExpense(data);
  }

  @Get('history/:projectId')
  findBudgetHistory(@Param('projectId') projectId: string) {
    return this.budgetService.findBudgetHistory(projectId);
  }

  @Post('history')
  logBudgetHistory(
    @Body()
    data: {
      projectId: string;
      action: string;
      description: string;
      performedBy: string;
      previousTotal?: number;
      newTotal?: number;
    },
  ) {
    return this.budgetService.logBudgetHistory(data);
  }
}
