import { Controller, Get, Param, Query, Post, Body } from '@nestjs/common';
import { DiscogsService } from './discogs.service';

@Controller('discogs')
export class DiscogsController {
  constructor(private readonly discogsService: DiscogsService) {}

  // 1️⃣ Search for vinyls (for migration or lookup)
  @Get('search')
  async search(@Query('q') q: string) {
    return this.discogsService.searchVinyls(q);
  }

  // 2️⃣ Get detailed vinyl info (includes rating)
  @Get('release/:id')
  async getVinyl(@Param('id') id: string) {
    return this.discogsService.getVinylDetails(Number(id));
  }

  // 3️⃣ Add vinyl to your DB (Admins only)
  @Post('add')
  async addVinyl(@Body('id') id: number, @Body('isAdmin') isAdmin: boolean) {
    return this.discogsService.addVinylFromDiscogs(id, isAdmin);
  }
}
