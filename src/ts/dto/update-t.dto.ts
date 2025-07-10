import { PartialType } from '@nestjs/mapped-types';
import { CreateTDto } from './create-t.dto';

export class UpdateTDto extends PartialType(CreateTDto) {}
