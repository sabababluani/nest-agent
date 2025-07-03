import { PartialType } from '@nestjs/mapped-types';
import { CreateVectorSearchDto } from './create-vector-search.dto';

export class UpdateVectorSearchDto extends PartialType(CreateVectorSearchDto) {}
