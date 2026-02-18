import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './repositories/users.repository';
import { PrismaService } from 'src/core/prisma.service';
import { PasswordService } from 'src/core/password.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, PrismaService, PasswordService],
  exports: [UsersService],
})
export class UsersModule {}
