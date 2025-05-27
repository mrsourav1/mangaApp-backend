import express from 'express';
import { scrapeManga } from '../services/scraper.js';
import { getCache, setCache } from '../services/cache.js';
import { getHomePageMangas, getMangaDetails, readChapter, searchManga } from '../controllers/mangaControllers.js';

const router = express.Router();

router.get('/:slug',getMangaDetails);
router.get('/',getHomePageMangas);
router.post('/search',searchManga);
router.post('/chapter',readChapter);
// router.get('/:slug',);

export default router;