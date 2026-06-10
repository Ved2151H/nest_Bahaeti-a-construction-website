import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { UnitsModule } from './units/units.module';
import { LeadsModule } from './leads/leads.module';
import { BudgetModule } from './budget/budget.module';

@Module({
  imports: [PrismaModule, UsersModule, UnitsModule, LeadsModule, BudgetModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

