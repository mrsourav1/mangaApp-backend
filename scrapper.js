const axios = require("axios");
const cheerio = require("cheerio");

const scrapeChapterImages = async (url) => {
  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0", // mimic browser
      },
    });

    const $ = cheerio.load(data);
    const images = [];

    $("div.page-break img").each((i, el) => {
      const src = $(el).attr("src");
      if (src && !src.includes("placeholder")) {
        images.push(src);
      }
    });

    console.log("Images found:", images.length);
    console.log(images);
  } catch (err) {
    console.error("Error scraping:", err.message);
  }
};

const url = "https://kunmanga.com/manga/solo-leveling/chapter-58/";
scrapeChapterImages(url);
