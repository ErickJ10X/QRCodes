import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums/user-role.enum';

/**
 * DTO de respuesta para usuarios
 * @description Representa la información pública de un usuario
 */
export class UserResponseDto {
  @ApiProperty({ description: 'ID único del usuario', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Email del usuario', example: 'usuario@example.com' })
  @Expose()
  email: string;

  @ApiProperty({ description: 'Nombre del usuario', example: 'Juan' })
  @Expose()
  firstName: string;

  @ApiPropertyOptional({ description: 'Apellido del usuario', example: 'Pérez' })
  @Expose()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Rol del usuario en el sistema',
    enum: UserRole,
    example: UserRole.USER,
  })
  @Expose()
  role?: UserRole;

  @ApiProperty({ description: 'Indica si el usuario está activo', example: true })
  @Expose()
  isActive: boolean;

  @ApiProperty({ description: 'Fecha de creación del usuario', example: '2026-03-12T10:00:00.000Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización', example: '2026-03-12T10:00:00.000Z' })
  @Expose()
  updatedAt: Date;
}
