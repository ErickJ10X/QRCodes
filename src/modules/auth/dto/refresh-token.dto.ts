import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para renovar tokens de acceso
 * @description Enviar el refresh token para obtener un nuevo access token
 */
export class RefreshTokenDto {
  @ApiProperty({
    description: 'Token de refresco JWT válido',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty({ message: 'El refresh token es obligatorio' })
  refreshToken: string;
}
