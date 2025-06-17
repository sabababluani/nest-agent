import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Filesystem } from './entities/filesystem.entity';
import { Repository } from 'typeorm';
import { CreateFilesystemDto } from './dto/create-filesystem.dto';

@Injectable()
export class FileSystemRepository {
  constructor(
    @InjectRepository(Filesystem)
    private fileSystemRepository: Repository<Filesystem>,
  ) {}

  async createFilesystem(filesystem: CreateFilesystemDto){
    const newAction = new FileSystem();

    // newAction.name = filesystem.name
    return await this.fileSystemRepository.save(filesystem);
  }
}
