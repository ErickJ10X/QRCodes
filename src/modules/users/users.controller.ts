import {
  Body,
  Controller,
  Patch,
  Post,
  Param,
  Get,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserRole } from '../../common/enums/user-role.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { IAuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Crea un nuevo usuario' })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Email ya registrado' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtiene todos los usuarios (Solo Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios obtenida',
    type: [UserResponseDto],
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Solo admins pueden acceder' })
  async findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: 'ID del usuario', type: 'number' })
  @ApiOperation({ summary: 'Obtiene un usuario por ID' })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: 'ID del usuario', type: 'number' })
  @ApiOperation({
    summary:
      'Actualiza un usuario (El usuario solo puede actualizar su propia info)',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tienes permiso' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: IAuthenticatedUser,
  ): Promise<UserResponseDto> {
    const currentId = user.id;
    const isAdmin = user.role === UserRole.ADMIN;
    return this.usersService.update(id, updateUserDto, currentId, isAdmin);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: 'ID del usuario', type: 'number' })
  @ApiOperation({
    summary:
      'Elimina un usuario (El usuario solo puede eliminar su propia cuenta)',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario eliminado',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Usuario eliminado exitosamente' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tienes permiso' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: IAuthenticatedUser,
  ) {
    const currentId = user.id;
    const isAdmin = user.role === UserRole.ADMIN;
    return this.usersService.remove(id, currentId, isAdmin);
  }
}
