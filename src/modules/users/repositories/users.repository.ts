import { Injectable } from '@nestjs/common';
import { Prisma, User } from 'generated/prisma/client';
import { PrismaService } from 'src/core/prisma.service';

type SafeUser = Prisma.UserGetPayload<{
  select: typeof UsersRepository.SAFE_USER_SELECT;
}>;

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  static readonly SAFE_USER_SELECT = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    role: true,
    createdAt: true,
    updatedAt: true,
  } as const;

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
