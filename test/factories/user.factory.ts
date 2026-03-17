import { faker } from '@faker-js/faker';
import { UserRole } from '@/generated/prisma/enums';
import { RegisterDto } from '@/modules/auth/dto/register.dto';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { UserResponseDto } from '@/modules/users/dto/user-response.dto';

export class UserFactory {
  static createRegisterDto(overrides?: Partial<RegisterDto>): RegisterDto {
    return {
      email: faker.internet.email(),
      password: 'Password123!@#',
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      ...overrides,
    };
  }

  static create(overrides?: Partial<CreateUserDto>): CreateUserDto {
    return {
      email: faker.internet.email(),
      password: 'Password123!@#',
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      role: UserRole.USER,
      ...overrides,
    };
  }

  static createAdmin(overrides?: Partial<CreateUserDto>): CreateUserDto {
    return this.create({
      role: UserRole.ADMIN,
      ...overrides,
    });
  }
  static toResponseDto(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static createBatch(count: number): CreateUserDto[] {
    return Array.from({ length: count }, () => this.create());
  }
}
