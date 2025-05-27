import axios from 'axios';
import { load } from 'cheerio';
import {
  USER_AGENTS,
  KUNMANGA_BASE_URL
} from '../config/constants.js';

export const getRandomUserAgent = () =>
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

    const $ = load(response.data);

    // Correct chapter parsing
    const chapters = [];
    $('.wp-manga-chapter').each((i, el) => {
      const chapterElement = $(el);
      const anchor = chapterElement.find('a');

      chapters.push({
        title: anchor.text().trim(),
        url: anchor.attr('href'),
        date: chapterElement.find('.chapter-release-date i').text().trim()
      });
    });

    const summary = $('.summary__content').find('p').eq(1).text().trim() 
    const ratingValue = $(".post-total-rating .score").first().text().trim() || null;

    const mangaData = {
      title: $('div.post-title h1').text().trim(),
      cover: $('.summary_image img').attr('src'), // Adjusted cover selector
      summary,
      chapters,
      ratingValue,
      lastUpdated: new Date()
    };

    return mangaData;
  } catch (error) {
    console.error('Scraping failed:', error.message);
    return null;
  }
};


export const scrapeHomePage = async (page = 1) => {
  try {
    const url = `${KUNMANGA_BASE_URL}/page/${page}/`;
    const response = await axios.get(url, {
      headers: { 'User-Agent': getRandomUserAgent() }
    });

    const $ = load(response.data);

    const mangas = [];

    // Example selector - adjust based on KunManga's actual layout
    // loop over each .page-listing-item inside #loop-content
    $('#loop-content .page-listing-item .row .col-6').each((_, section) => {
      const sectionEl = $(section);

      sectionEl.find('.page-item-detail').each((_, el) => {
        const element = $(el);
        const title = element.find('.post-title a').text().trim();
        const href = element.find('.post-title a').attr('href');
        const imgSlug = href?.split('/').filter(Boolean).pop();
        const cover = element.find('img').attr('src');
        const rating = element.find('.score').text().trim();
        const chapterAnchor = element.find('.chapter-item a').first();
        const latestChapter = chapterAnchor.text().trim();                    // "Chapter 52"
        const chapterUrl = chapterAnchor.attr('href');

        mangas.push({
          title,
          imgSlug,
          cover,
          latestChapter,
          rating,
          chapterUrl
        });
      });
    });


    // Get total pages (if available in pagination)
    const totalPagesText = $('.wp-pagenavi .pages').text(); // "Page 1 of 219"
    const totalPagesMatch = totalPagesText.match(/Page \d+ of (\d+)/);
    // [
    //   'Page 2 of 219',
    //   '219',
    //   index: 0,
    //   input: 'Page 2 of 219',
    //   groups: undefined
    // ]

    const totalPages = totalPagesMatch ? parseInt(totalPagesMatch[1], 10) : 1;
    const mangaLength = mangas.length;

    return {
      page,
      totalPages: parseInt(totalPages),
      mangas,
      mangaLength,
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error('Home scraping failed:', error);
    return null;
  }
};

export const scrapChapter = async (url) => {
  try {
    console.log("this is irl",url)
    const response = await axios.get(url, {
      headers: { 
        'User-Agent': getRandomUserAgent(),
        'Referer': KUNMANGA_BASE_URL
      }
    });
    // 👇 response.data is the HTML string
    const $ = load(response.data);

    const images = [];
    $(".reading-content img").each((_, el) => {
      const imgUrl = $(el).attr("src").trim();
      if (imgUrl) images.push(imgUrl);
    });

    return images;
  } catch (error) {
    console.log(error)
  }
}

