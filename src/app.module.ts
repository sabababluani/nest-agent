import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { McpModule } from './mcp/mcp.module';
import { FilesystemModule } from './filesystem/filesystem.module';

@Module({
  imports: [McpModule, FilesystemModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
