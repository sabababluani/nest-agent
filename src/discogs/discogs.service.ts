import { Injectable, ForbiddenException } from '@nestjs/common';
import * as Discogs from 'disconnect';

@Injectable()
export class DiscogsService {
  private discogs: any;

  constructor() {
    this.discogs = new Discogs.Client({
      consumerKey: process.env.DISCOGS_CONSUMER_KEY,
      consumerSecret: process.env.DISCOGS_CONSUMER_SECRET,
      userToken: process.env.DISCOGS_USER_TOKEN, // optional
    });
  }

  // 🔹 1. Fetch vinyl data (initial migration)
  async searchVinyls(query: string) {
    const db = this.discogs.database();
    const results = await db.search(query, { type: 'release', per_page: 10 });
    return results.results;
  }

  // 🔹 2. Get detailed vinyl data + Discogs score
  async getVinylDetails(releaseId: number) {
    const db = this.discogs.database();
    const release = await db.getRelease(releaseId);
    return {
      id: release.id,
      title: release.title,
      artist: release.artists?.map(a => a.name).join(', '),
      year: release.year,
      country: release.country,
      genres: release.genres,
      cover_image: release.images?.[0]?.uri,
      rating: release.community?.rating?.average,
      num_ratings: release.community?.rating?.count,
    };
  }

  // 🔹 3. Add vinyl record (Admins only)
  async addVinylFromDiscogs(releaseId: number, isAdmin: boolean) {
    if (!isAdmin) throw new ForbiddenException('Admins only');

    const vinyl = await this.getVinylDetails(releaseId);
    // Save to your DB (example)
    // await this.vinylRepository.create(vinyl);

    return {
      message: 'Vinyl added successfully',
      vinyl,
    };
  }
}
