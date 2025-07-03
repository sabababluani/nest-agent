import { Controller, Post, Body } from '@nestjs/common';
import { VectorSearchService } from './vector-search.service';

@Controller('vector-search')
export class VectorSearchController {
  constructor(private readonly vectorSearchService: VectorSearchService) {}

  @Post('search')
  search(@Body() body: { query: string }) {
    return this.vectorSearchService.search(body.query);
  }
}
