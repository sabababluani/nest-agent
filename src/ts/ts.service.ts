import { Injectable } from '@nestjs/common';
import { CreateTDto } from './dto/create-t.dto';
import { UpdateTDto } from './dto/update-t.dto';

@Injectable()
export class TsService {
  create(createTDto: CreateTDto) {
    return 'This action adds a new t';
  }

  findAll() {
    return `This action returns all ts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} t`;
  }

  update(id: number, updateTDto: UpdateTDto) {
    return `This action updates a #${id} t`;
  }

  remove(id: number) {
    return `This action removes a #${id} t`;
  }
}
