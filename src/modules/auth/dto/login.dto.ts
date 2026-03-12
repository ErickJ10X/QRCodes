import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para autenticación de usuarios
 * @description Datos requeridos para iniciar sesión
 */
export class LoginDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'Password123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;
}
