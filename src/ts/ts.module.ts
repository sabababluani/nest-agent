import { Module } from '@nestjs/common';
import { TsService } from './ts.service';
import { TsController } from './ts.controller';

@Module({
  controllers: [TsController],
  providers: [TsService],
})
export class TsModule {}
