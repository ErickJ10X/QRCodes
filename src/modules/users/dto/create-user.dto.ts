import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { UserRole } from 'src/common/enums/user-role.enum';

export class CreateUserDto {
  @IsEmail(undefined, { message: 'El email debe ser válido' })
  @IsNotEmpty()
  @MaxLength(254, { message: 'El email no puede exceder 254 caracteres' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(128, { message: 'La contraseña no puede exceder 128 caracteres' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Length(1, 50, { message: 'El nombre debe tener entre 1 y 50 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-']+$/, {
    message: 'El nombre solo puede contener letras, espacios, guiones y apóstrofes',
  })
  firstName: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'El apellido no puede exceder 50 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-']*$/, {
    message: 'El apellido solo puede contener letras, espacios, guiones y apóstrofes',
  })
  lastName?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
