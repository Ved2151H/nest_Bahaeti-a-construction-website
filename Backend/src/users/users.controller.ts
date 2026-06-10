import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  create(
    @Body()
    data: {
      id: string;
      name: string;
      email: string;
      role: string;
      status?: string;
      avatar?: string;
      assignedAgentId?: string;
      reportsTo?: string;
    },
  ) {
    return this.usersService.create(data);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body()
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
    return this.usersService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
