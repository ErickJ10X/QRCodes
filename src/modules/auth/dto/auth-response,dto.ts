import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../generated/prisma/enums';

/**
 * DTO para información básica del usuario autenticado
 */
export class AuthUserDto {
  @ApiProperty({ description: 'ID del usuario', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@example.com',
  })
  @Expose()
  email: string;

  @ApiProperty({ description: 'Nombre del usuario', example: 'Juan' })
  @Expose()
  firstName: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
    required: false,
  })
  @Expose()
  lastName?: string;

  @ApiProperty({
    description: 'Rol del usuario',
    enum: UserRole,
    example: UserRole.USER,
  })
  @Expose()
  role: UserRole;
}

/**
 * DTO de respuesta para autenticación exitosa
 * @description Contiene tokens JWT y datos del usuario
 */
export class AuthResponseDto {
  @ApiProperty({
    description: 'Token de acceso JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @Expose()
  accessToken: string;

  @ApiProperty({
    description: 'Token de refresco JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @Expose()
  refreshToken: string;

  @ApiProperty({
    description: 'Tiempo de expiración del access token en segundos',
    example: 900,
  })
  @Expose()
  expiresIn: number;

  @ApiProperty({
    description: 'Información del usuario autenticado',
    type: AuthUserDto,
  })
  @Expose()
  @Type(() => AuthUserDto)
  user: AuthUserDto;
}
