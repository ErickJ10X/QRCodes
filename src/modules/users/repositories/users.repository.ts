import { Injectable } from '@nestjs/common';
import { UserRole } from '../../../generated/prisma/enums';
import { PrismaService } from '@core/prisma.service';
import { Prisma } from '../../../generated/prisma/client';

export type SafeUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UserWithPassword = SafeUser & {
  password: string;
};

@Injectable()
export class UsersRepository {
  static readonly SAFE_USER_SELECT = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    role: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
  } as const;

  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<SafeUser> {
    return this.prisma.user.create({
      data,
      select: UsersRepository.SAFE_USER_SELECT,
    });
  }

  async findById(id: number): Promise<SafeUser | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: UsersRepository.SAFE_USER_SELECT,
    });
  }

  async findByEmail(email: string): Promise<SafeUser | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: UsersRepository.SAFE_USER_SELECT,
    });
  }

  async findByEmailWithPassword(
    email: string,
  ): Promise<UserWithPassword | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role as UserRole,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      password: user.password,
    };
  }

  async findMany(
    args?: Omit<Prisma.UserFindManyArgs, 'select'>,
  ): Promise<SafeUser[]> {
    return this.prisma.user.findMany({
      ...(args ?? {}),
      select: UsersRepository.SAFE_USER_SELECT,
    });
  }

  async update(id: number, data: Prisma.UserUpdateInput): Promise<SafeUser> {
    return this.prisma.user.update({
      where: { id },
      data,
      select: UsersRepository.SAFE_USER_SELECT,
    });
  }

  async delete(id: number): Promise<SafeUser> {
    return this.prisma.user.delete({
      where: { id },
      select: UsersRepository.SAFE_USER_SELECT,
    });
  }
}
