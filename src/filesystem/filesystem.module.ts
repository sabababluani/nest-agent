import { Module } from '@nestjs/common';
import { FilesystemService } from './filesystem.service';
import { FilesystemController } from './filesystem.controller';
import { Filesystem } from './entities/filesystem.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileSystemRepository } from './filesystem.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Filesystem])],
  providers: [FilesystemService, FileSystemRepository],
  controllers: [FilesystemController],
})
export class FilesystemModule {}
