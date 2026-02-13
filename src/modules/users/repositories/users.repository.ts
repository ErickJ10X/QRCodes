import { Injectable } from '@nestjs/common';
import { Prisma, User } from 'generated/prisma/client';
import { PrismaService } from 'src/core/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  private static readonly SAFE_USER_SELECT = {
    id: true,
    email: true,
    name: true,
    role: true,
    createdAt: true,
    updatedAt: true,
  } as const;

  async create(
    data: Prisma.UserCreateInput,
  ): Promise<
    Prisma.UserGetPayload<{ select: typeof UsersRepository.SAFE_USER_SELECT }>
  > {
    return this.prisma.user.create({
      data,
      select: UsersRepository.SAFE_USER_SELECT,
    });
  }

  async findById(id: string): Promise<Prisma.UserGetPayload<{
    select: typeof UsersRepository.SAFE_USER_SELECT;
  }> | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: UsersRepository.SAFE_USER_SELECT,
    });
  }

  async findByEmail(email: string): Promise<Prisma.UserGetPayload<{
    select: typeof UsersRepository.SAFE_USER_SELECT;
  }> | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: UsersRepository.SAFE_USER_SELECT,
    });
  }

  async findMany(
    args?: Omit<Prisma.UserFindManyArgs, 'select'>,
  ): Promise<
    Prisma.UserGetPayload<{ select: typeof UsersRepository.SAFE_USER_SELECT }>[]
  > {
    return this.prisma.user.findMany({
      ...(args ?? {}),
      select: UsersRepository.SAFE_USER_SELECT,
    });
  }

  async update(
    id: string,
    data: Prisma.UserUpdateInput,
  ): Promise<
    Prisma.UserGetPayload<{ select: typeof UsersRepository.SAFE_USER_SELECT }>
  > {
    return this.prisma.user.update({
      where: { id },
      data,
      select: UsersRepository.SAFE_USER_SELECT,
    });
  }

  async delete(
    id: string,
  ): Promise<
    Prisma.UserGetPayload<{ select: typeof UsersRepository.SAFE_USER_SELECT }>
  > {
    return this.prisma.user.delete({
      where: { id },
      select: UsersRepository.SAFE_USER_SELECT,
    });
  }
}
