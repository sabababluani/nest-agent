import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TsService } from './ts.service';
import { CreateTDto } from './dto/create-t.dto';
import { UpdateTDto } from './dto/update-t.dto';

@Controller('ts')
export class TsController {
  constructor(private readonly tsService: TsService) {}

  @Post()
  create(@Body() createTDto: CreateTDto) {
    return this.tsService.create(createTDto);
  }

  @Get()
  findAll() {
    return this.tsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTDto: UpdateTDto) {
    return this.tsService.update(+id, updateTDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tsService.remove(+id);
  }
}
