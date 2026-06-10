import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { UnitsService } from './units.service';

@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Get()
  findAll() {
    return this.unitsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.unitsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body()
    data: {
      status: string;
      unitNumber?: string;
      projectId?: string;
      type?: string;
      price?: number;
      bookedBy?: string;
      advisorId?: string;
      bookedAt?: string;
      tokenAmount?: number;
      linkedLeadId?: string;
    },
  ) {
    return this.unitsService.update(id, data);
  }
}
