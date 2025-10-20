import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GmailService } from './gmail.service';
import { CreateGmailDto } from './dto/create-gmail.dto';
import { UpdateGmailDto } from './dto/update-gmail.dto';

@Controller('gmail')
export class GmailController {
  constructor(private readonly gmailService: GmailService) { }

  @Post()
  create(@Body() createGmailDto: CreateGmailDto) {
    return this.gmailService.create();
  }

  @Post('telegram')
  createTelegram() {
    return this.gmailService.createTelegram();
  }
  @Get('verify-channel')
async verifyChannel() {
  return await this.gmailService.verifyChannelAccess();
}
}
