import { Module } from '@nestjs/common';
import { FilesystemService } from './filesystem.service';
import { FilesystemController } from './filesystem.controller';

@Module({
  providers: [FilesystemService],
  controllers: [FilesystemController],
})
export class FilesystemModule {}
