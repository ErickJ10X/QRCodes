import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

/**
 * DTO para actualización de usuarios
 * @description Todos los campos son opcionales
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}
