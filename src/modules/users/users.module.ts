import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './repositories/users.repository';
import { PasswordService } from '../../core/password.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, PasswordService],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
