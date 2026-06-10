import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { LeadsService } from './leads.service';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  findAll(@Query('assignedTo') assignedTo?: string) {
    return this.leadsService.findAll(assignedTo);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Post()
  create(
    @Body()
    data: {
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
    },
  ) {
    return this.leadsService.create(data);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body()
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
    return this.leadsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }

  @Post(':id/history')
  addHistory(
    @Param('id') id: string,
    @Body()
    data: {
      date: string;
      note: string;
      author: string;
    },
  ) {
    return this.leadsService.addHistory(id, data);
  }

  @Post(':id/documents')
  addOrUpdateDocument(
    @Param('id') id: string,
    @Body()
    data: {
      id?: string;
      name: string;
      type: string;
      status: string;
      updatedAt: string;
      required: boolean;
    },
  ) {
    return this.leadsService.addOrUpdateDocument(id, data);
  }
}
