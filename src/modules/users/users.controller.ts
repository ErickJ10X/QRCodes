import {
  Body,
  Controller,
  Patch,
  Post,
  Param,
  Get,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from 'src/common/enums/user-role.enum';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { IAuthenticatedUser } from 'src/common/interfaces/authenticated-user.interface';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('users')
@UseGuards(JwtGuard)
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @Public()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
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
    @CurrentUser() user: IAuthenticatedUser,
  ) {
    const currentId = user.id;
    const isAdmin = user.role === UserRole.ADMIN;
    return this.usersService.update(id, updateUserDto, currentId, isAdmin);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: number,
    @CurrentUser() user: IAuthenticatedUser,
  ) {
    const currentId = user.id;
    const isAdmin = user.role === UserRole.ADMIN;
    return this.usersService.remove(id, currentId, isAdmin);
  }
}
