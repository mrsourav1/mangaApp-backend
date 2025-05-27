import { getCache, setCache } from "../services/cache.js";
import { getRandomUserAgent, scrapChapter, scrapeHomePage, scrapeManga } from "../services/scraper.js";

export const getMangaDetails = async (req, res) => {
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
}

export const getHomePageMangas = async (req, res) => {
    try {
        console.log("hree")
        const page = parseInt(req.query.page) || 1;
        const cacheKey = `kunmanga:home:page-${page}`;

        // Check cache first
        const cachedData = await getCache(cacheKey);
        if (cachedData) return res.json(cachedData);

        // Scrape home page with pagination
        const homeData = await scrapeHomePage(page);

        if (!homeData || homeData.mangas.length === 0) {
            return res.status(404).json({ error: 'Page not found' });
        }

        // Cache for 6 hours (adjust as needed)
        await setCache(cacheKey, homeData, 21600);

        res.json(homeData);
    } catch (error) {
        console.error('Home API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const searchManga = async (req, res) => {
    try {
        const { title } = req.body;

        const formData = new URLSearchParams();
        formData.append('action', 'wp-manga-search-manga');
        formData.append('title', title);

        const response = await axios.post(
            `${KUNMANGA_BASE_URL}/wp-admin/admin-ajax.php`,
            formData,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Referer': `${KUNMANGA_BASE_URL}/`,
                    'User-Agent': getRandomUserAgent(),
                },
            }
        );

        return res.status(200).json(response.data); // ✅ Only send the safe part
    } catch (error) {
        console.error(error?.response?.data || error.message);
        return res.status(error.response?.status || 500).json({
            error: error?.response?.statusText || 'Internal server error',
        });
    }
};


export const readChapter = async (req,res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ message: "URL rquired" })
        const data = await scrapChapter(url)
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
    }
}