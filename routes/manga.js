import express from 'express';
import { scrapeManga } from '../services/scraper.js';
import { getCache, setCache } from '../services/cache.js';

const router = express.Router();

router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const cacheKey = `kunmanga:${slug}`;

    // Check cache first
    const cachedData = await getCache(cacheKey);
    if (cachedData) return res.json(cachedData);

    // Scrape fresh data
    const mangaData = await scrapeManga(slug);
    if (!mangaData) return res.status(404).json({ error: 'Manga not found' });

    // Update cache
    await setCache(cacheKey, mangaData);

    res.json(mangaData);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;