import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { Prisma, UserRole } from 'generated/prisma/client';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.usersRepository.findByEmail(
      createUserDto.email,
    );
    if (existingUser) throw new ConflictException('Email ya registrado');

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      parseInt(process.env['BCRYPT_SALT_ROUNDS'] || '10'),
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
    id: string,
    updateUserDto: UpdateUserDto,
    currentUserId: string,
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
      data.password = await bcrypt.hash(
        updateUserDto.password,
        parseInt(process.env['BCRYPT_SALT_ROUNDS'] || '10'),
      );
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
}
