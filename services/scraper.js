import axios from 'axios';
import {load} from 'cheerio';
import { 
  USER_AGENTS,
  KUNMANGA_BASE_URL
} from '../config/constants.js';

const getRandomUserAgent = () => 
  USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

export const scrapeManga = async (mangaSlug) => {
  try {
    const url = `${KUNMANGA_BASE_URL}/manga/${mangaSlug}/`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Referer': KUNMANGA_BASE_URL
      },
      timeout: 5000
    });

    const $ = cheerio.load(response.data);
    
    // Example parsing - adjust based on KunManga's actual HTML
    const chapters = [];
    $('.chapter-list a').each((i, el) => {
      chapters.push({
        title: $(el).text().trim(),
        url: $(el).attr('href'),
        date: $(el).siblings('.chapter-date').text().trim()
      });
    });

    const mangaData = {
      title: $('h1.title').text().trim(),
      cover: $('.cover img').attr('src'),
      chapters,
      lastUpdated: new Date()
    };

    return mangaData;
  } catch (error) {
    console.error('Scraping failed:', error.message);
    return null;
  }
};