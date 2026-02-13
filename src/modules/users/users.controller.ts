import {
  Body,
  Controller,
  Patch,
  Post,
  Req,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from 'generated/prisma/enums';
import type { Request } from 'express';
type AuthReq = Request & { user?: { id: string; role: UserRole } };

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: AuthReq,
  ) {
    if (!req.user) throw new UnauthorizedException('No autorizado');

    const currentId = req.user.id;
    const isAdmin = req.user.role === UserRole.ADMIN;
    return this.usersService.update(id, updateUserDto, currentId, isAdmin);
  }
}
