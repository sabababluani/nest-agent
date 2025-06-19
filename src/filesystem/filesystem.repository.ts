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
  ) { }

  async createFilesystem(filesystem: CreateFilesystemDto) {
    const newFilesystem = new Filesystem();

    newFilesystem.prompt = filesystem.name;
    newFilesystem.path = filesystem.path;
    return await this.fileSystemRepository.save(newFilesystem);
  }

  async getFilesystem(id: number) {
    return await this.fileSystemRepository.findOne({ where: { id } });
  }

  async getAllFile() {
    return await this.fileSystemRepository.find()
  }
}
