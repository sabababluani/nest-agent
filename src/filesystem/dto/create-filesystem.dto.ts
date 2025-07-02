import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Action } from '../enums/action.enum';

export class CreateFilesystemDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  path?: string;

  @IsEnum(Action)
  action: Action;
}
