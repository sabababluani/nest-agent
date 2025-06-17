import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { McpModule } from './mcp/mcp.module';
import { FilesystemModule } from './filesystem/filesystem.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [McpModule, FilesystemModule, 
    TypeOrmModule.forRoot({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'Mamasheni123',
    database: 'filesystem_database',
    autoLoadEntities: true,
    synchronize: true,
  }),],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
