import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Action, Filesystem } from './entities/filesystem.entity';
import { Repository } from 'typeorm';
import { CreateFilesystemDto } from './dto/create-filesystem.dto';

@Injectable()
export class FileSystemRepository {
  constructor(
    @InjectRepository(Filesystem)
    private fileSystemRepository: Repository<Filesystem>,
  ) {}

    async createFilesystem(filesystem: CreateFilesystemDto) {
    const newFilesystem = new Filesystem();

    newFilesystem.prompt = filesystem.name;
    newFilesystem.path = filesystem.path;
    newFilesystem.action = filesystem.action;
    return await this.fileSystemRepository.save(newFilesystem);
  }

  async getFilesystem(id: number) {
    return await this.fileSystemRepository.findOne({ where: { id } });
  }

  async getReadFile() {
    return await this.fileSystemRepository.find({
      where: { action: Action.READ },
    });
  }

  async getWriteFile() {
    return await this.fileSystemRepository.find({
      where: { action: Action.WRITE },
    });
  }

  async getAllFile() {
    return await this.fileSystemRepository.find();
  }
}
