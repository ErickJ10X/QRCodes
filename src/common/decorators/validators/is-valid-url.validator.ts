import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidUrl', async: false })
export class IsValidUrlConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  defaultMessage(): string {
    return 'El valor $value no es una URL válida';
  }
}

export function IsValidUrl(validationOptions?: ValidationOptions) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidUrlConstraint,
    });
  };
}
