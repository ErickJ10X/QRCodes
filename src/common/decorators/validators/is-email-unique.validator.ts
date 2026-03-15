import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../../modules/users/repositories/users.repository';

@ValidatorConstraint({ name: 'isEmailUnique', async: true })
@Injectable()
export class IsEmailUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private usersRepository: UsersRepository) {}

  async validate(email: string, args?: ValidationArguments): Promise<boolean> {
    try {
      const user = await this.usersRepository.findByEmail(email);
      return !user; // true si NO existe (es único)
    } catch {
      return true; // Si hay error, considerar como válido
    }
  }

  defaultMessage(): string {
    return 'El correo electrónico ya está en uso';
  }
}

export function IsEmailUnique(validationOptions?: ValidationOptions) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEmailUniqueConstraint,
    });
  };
}
