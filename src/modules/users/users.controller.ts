import {
  Body,
  Controller,
  Patch,
  Post,
  Req,
  Param,
  UnauthorizedException,
  Get,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from 'src/common/enums/user-role.enum';
import { Request } from 'express';

type AuthReq = Request & { user?: { id: number; role: UserRole } };

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: AuthReq,
  ) {
    if (!req.user) throw new UnauthorizedException('No autorizado');

    const currentId = req.user.id;
    const isAdmin = req.user.role === UserRole.ADMIN;
    return this.usersService.update(id, updateUserDto, currentId, isAdmin);
  }

  @Delete(':id')
  async remove(@Param('id') id: number, @Req() req: AuthReq) {
    if (!req.user) throw new UnauthorizedException('No autorizado');
    const currentId = req.user.id;
    const isAdmin = req.user.role === UserRole.ADMIN;
    return this.usersService.remove(id, currentId, isAdmin);
  }
}
