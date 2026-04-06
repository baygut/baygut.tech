import { revalidateTag } from 'next/cache';
import { CACHE_TAG_PORTFOLIO } from './cache-tags';

export function bumpPortfolioCache() {
  revalidateTag(CACHE_TAG_PORTFOLIO);
}
