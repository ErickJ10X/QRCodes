import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PasswordService } from '../../core/password.service';
import { UserRole } from '../../generated/prisma/enums';
import { Prisma } from '../../generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private passwordService: PasswordService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.usersRepository.findByEmail(
      createUserDto.email,
    );
    if (existingUser) throw new ConflictException('Email ya registrado');

    const hashedPassword = await this.passwordService.hash(
      createUserDto.password,
    );

    const userdata: Prisma.UserCreateInput = {
      email: createUserDto.email,
      password: hashedPassword,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName ?? '',
      role: createUserDto.role ?? UserRole.USER,
    };

    try {
      const user = await this.usersRepository.create(userdata);
      return plainToInstance(UserResponseDto, user, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email ya registrado');
      }
      throw error;
    }
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    currentUserId: number,
    isAdmin = false,
  ) {
    if (!isAdmin && currentUserId !== id) {
      throw new ForbiddenException(
        'No tienes permiso para actualizar este usuario',
      );
    }

    const data: Prisma.UserUpdateInput = {};
    if (updateUserDto.firstName !== undefined)
      data.firstName = updateUserDto.firstName;
    if (updateUserDto.lastName !== undefined)
      data.lastName = updateUserDto.lastName;
    if (isAdmin && updateUserDto.email !== undefined)
      data.email = updateUserDto.email;
    if (updateUserDto.password) {
      data.password = await this.passwordService.hash(updateUserDto.password);
    }

    try {
      const updateUser = await this.usersRepository.update(id, data);
      return plainToInstance(UserResponseDto, updateUser, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Campo único ya existe');
      }
      throw error;
    }
  }

  async findAll(args?: Omit<Prisma.UserFindManyArgs, 'select'>) {
    const users = await this.usersRepository.findMany(args);
    return plainToInstance(UserResponseDto, users, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  async remove(id: number, currentUserId: number, isAdmin = false) {
    if (!isAdmin && currentUserId !== id) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar este usuario',
      );
    }

    const deleted = await this.usersRepository.delete(id);
    return plainToInstance(UserResponseDto, deleted, {
      excludeExtraneousValues: true,
    });
  }
}
