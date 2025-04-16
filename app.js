const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const https = require("https");
const { JSDOM } = require("jsdom");
const NodeCache = require("node-cache");

const app = express();
const PORT = 8099;
const cache = new NodeCache({ stdTTL: 3600 }); // Cache expires in 1 hour (3600 seconds)

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 15_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.5 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (iPad; CPU OS 15_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.2 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Linux; Android 11; Pixel 4a) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_4_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/91.0.864.67",
];


// Endpoint to scrape "Home"
app.get('/home', async (req, res) => {
  const cacheKey = 'home_page'; // Unique cache key

  // Check if data is in cache
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log(`Serving from cache: ${cacheKey}`);
    return res.json(cachedData);
  }

  const url = 'https://anime.cat';

  try {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    const newestDrops = [];
    const onAirShow = [];
    const mostWatchedShows = [];
    const newAnimeArrivals = [];
    const cartoonSeries = [];
    const MostWatchedFilms = [];
    const latestAnimeMovies = [];
    const freshCartoonFilms = [];

    // Scrape "Newest Drops" section
    $('#widget_list_episodes-5 .swiper-slide').each((index, element) => {
      const title = $(element).find('.entry-title').text().trim();
      const season = $(element).find('.post-ql').text().trim();
      const episode = $(element).find('.year').text().trim();
      const imageUrl = $(element).find('img').attr('src');
      const link = $(element).find('a.lnk-blk').attr('href');

      if (title && link) {
        const id = link.split('/').filter(Boolean).pop();
        newestDrops.push({ id, title, season, episode, imageUrl: imageUrl ? `https:${imageUrl}` : null, link });
      }
    });

    // Scrape "On-Air Shows" section
    $('#widget_list_movies_series-13 .swiper-slide').each((index, element) => {
      const title = $(element).find('.entry-title').text().trim();
      const rating = $(element).find('.vote').text().trim();
      const year = $(element).find('.year').text().trim();
      const imageUrl = $(element).find('img').attr('src');
      const link = $(element).find('a.lnk-blk').attr('href');

      if (title && link) {
        const id = link.split('/').filter(Boolean).pop();
        onAirShow.push({ id, title, rating, year, imageUrl: imageUrl ? `https:${imageUrl}` : null, link });
      }
    });

    // Scrape "Most-Watched Shows" section
    $('#torofilm_wdgt_popular-3 .top-picks__item').each((index, element) => {
      const link = $(element).find('a.lnk-blk').attr('href');
      const imageUrl = $(element).find('img').attr('src');
      const title = $(element).find('img').attr('alt')?.replace('Image ', '').trim();

      if (title && link) {
        const id = link.split('/').filter(Boolean).pop();
        mostWatchedShows.push({ id, title, imageUrl: imageUrl ? `https:${imageUrl}` : null, link });
      }
    });

    // Scrape "New Anime Arrivals" section
    $('#widget_list_movies_series-2 .swiper-slide').each((index, element) => {
      const title = $(element).find('.entry-title').text().trim();
      const rating = $(element).find('.vote').text().trim();
      const year = $(element).find('.year').text().trim();
      const imageUrl = $(element).find('img').attr('src');
      const link = $(element).find('a.lnk-blk').attr('href');

      if (title && link) {
        const id = link.split('/').filter(Boolean).pop();
        newAnimeArrivals.push({ id, title, rating, year, imageUrl: imageUrl ? `https:${imageUrl}` : null, link });
      }
    });

    // Scrape "Cartoon Series" section
    $('#widget_list_movies_series-8 .swiper-slide').each((index, element) => {
      const title = $(element).find('.entry-title').text().trim();
      const rating = $(element).find('.vote').text().trim();
      const year = $(element).find('.year').text().trim();
      const imageUrl = $(element).find('img').attr('src');
      const link = $(element).find('a.lnk-blk').attr('href');

      if (title && link) {
        const id = link.split('/').filter(Boolean).pop();
        cartoonSeries.push({ id, title, rating, year, imageUrl: imageUrl ? `https:${imageUrl}` : null, link });
      }
    });

    // Scrape "Most-Watched Films" section
    $('#torofilm_wdgt_popular-5 .top-picks__item').each((index, element) => {
      const link = $(element).find('a.lnk-blk').attr('href');
      const imageUrl = $(element).find('img').attr('src');
      const title = $(element).find('img').attr('alt')?.replace('Image ', '').trim();

      if (title && link) {
        const id = link.split('/').filter(Boolean).pop();
        MostWatchedFilms.push({ id, title, imageUrl: imageUrl ? `https:${imageUrl}` : null, link });
      }
    });

    // Scrape "Latest Anime Movies" section
    $('#widget_list_movies_series-4 .swiper-slide').each((index, element) => {
      const title = $(element).find('.entry-title').text().trim();
      const rating = $(element).find('.vote').text().trim();
      const year = $(element).find('.year').text().trim();
      const imageUrl = $(element).find('img').attr('src');
      const link = $(element).find('a.lnk-blk').attr('href');

      if (title && link) {
        const id = link.split('/').filter(Boolean).pop();
        latestAnimeMovies.push({ id, title, rating, year, imageUrl: imageUrl ? `https:${imageUrl}` : null, link });
      }
    });

    // Scrape "Fresh Cartoon Films" section
    $('#widget_list_movies_series-11 .swiper-slide').each((index, element) => {
      const title = $(element).find('.entry-title').text().trim();
      const rating = $(element).find('.vote').text().trim();
      const year = $(element).find('.year').text().trim();
      const imageUrl = $(element).find('img').attr('src');
      const link = $(element).find('a.lnk-blk').attr('href');

      if (title && link) {
        const id = link.split('/').filter(Boolean).pop();
        freshCartoonFilms.push({ id, title, rating, year, imageUrl: imageUrl ? `https:${imageUrl}` : null, link });
      }
    });

    const result = {
      status: 'success',
      newestDrops,
      onAirShow,
      mostWatchedShows,
      newAnimeArrivals,
      cartoonSeries,
      MostWatchedFilms,
      latestAnimeMovies,
      freshCartoonFilms
    };

    // Store in cache
    cache.set(cacheKey, result);

    res.json(result);
  } catch (error) {
    console.error(`Error scraping the home page: ${error.message}`);
    res.status(500).json({ status: 'error', message: error.message });
  }
});


// Endpoint to scrape "Movie"
app.get('/movies/:slug', async (req, res) => {
  const { slug } = req.params;
  const cacheKey = `movies_${slug}`;
  
  // Check if data is in cache
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log(`Serving from cache: ${cacheKey}`);
    return res.json(cachedData);
  }

  const url = `https://anime.cat/movies/${slug}/`;
  console.log(`Scraping Movie Page: ${url}`);

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const moviesData = {
      title: $('h1.entry-title').text(),
      image: $('img').eq(1).attr('src'),
      overview: $('div.description p').text(),
      genres: [],
      languages: [],
      duration: $('span.duration .overviewCss').text(),
      year: $('span.year .overviewCss').text(),
      network: $('span.network a').attr('href'),
      rating: $('span.vote .num').text(),
    };

    // Extract genres
    $('p.genres a').each((i, element) => {
      moviesData.genres.push($(element).text());
    });

    // Extract languages
    $('p.loadactor a').each((i, element) => {
      moviesData.languages.push($(element).text());
    });

    // Extract streaming server options
    const serverOptions = {};
    $('.aa-tbs-video[data-tbs="aa-options"]').each((index, ulElement) => {
      let serverName = $(ulElement).find('li a .server').text().trim();
      const iframeUrl = $(`#options-${index} iframe`).attr('data-src');
      if (serverName && iframeUrl) {
        serverOptions[serverName] = iframeUrl;
      }
    });

    // Extract recommended series
    const recommendedSeries = [];
    $('section.episodes .owl-carousel .post').each((index, element) => {
      const title = $(element).find('.entry-title').text().trim();
      const imageUrl = $(element).find('img').attr('src').startsWith('http')
        ? $(element).find('img').attr('src')
        : `https:${$(element).find('img').attr('src')}`;
      const year = $(element).find('.year').text().trim();
      const rating = $(element).find('.vote').text().trim();
      const link = $(element).find('a.lnk-blk').attr('href');
      const id = link.split('/').filter(Boolean).pop();
      recommendedSeries.push({
        id,
        title,
        imageUrl,
        year,
        rating,
        link,
      });
    });

    // Extract download links
    const downloadLinks = [];
    $('.mdl-bd .download-links tbody tr').each((index, row) => {
      const server = $(row).find('td:nth-child(1)').text().trim();
      const language = $(row).find('td:nth-child(2)').text().trim();
      const quality = $(row).find('td:nth-child(3)').text().trim();
      const link = $(row).find('td:nth-child(4) a').attr('href');

      if (server && link) {
        downloadLinks.push({
          server,
          language,
          quality,
          link,
        });
      }
    });

    // Combine all data
    const result = {
      moviesData,
      iframes: serverOptions,
      recommendedSeries,
      downloadLinks,
    };

    // Store in cache for 1 hour
    cache.set(cacheKey, result);

    console.log(`Scraped and cached result for ${cacheKey}`);
    res.json(result);
  } catch (error) {
    console.error(`Error scraping movie data: ${error.message}`);
    res.status(500).json({ error: 'Failed to scrape movie data' });
  }
});


// Endpoint to scrape "Series"
app.get('/series/:slug', async (req, res) => {
  const { slug } = req.params;
  const cacheKey = `series_${slug}`; // Unique cache key

  // Check if data is in cache
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log(`Serving from cache: ${cacheKey}`);
    return res.json(cachedData);
  }

  const url = `https://anime.cat/series/${slug}/`;
  console.log(`Scraping Series Page: ${url}`);

  try {
    // Fetch the HTML of the page
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const seriesData = {
      title: $('h1.entry-title').text(),
      image: $('img').eq(1).attr('src'),
      overview: $('div.description p').text(),
      genres: [],
      languages: [],
      duration: $('span.duration .overviewCss').text(),
      year: $('span.year .overviewCss').text(),
      network: $('span.network a').attr('href'),
      rating: $('span.vote .num').text(),
      seasonsAnsEpisods: $('.entry-title + span').text(),
    };

    // Extract genres
    $('p.genres a').each((i, element) => {
      seriesData.genres.push($(element).text());
    });

    // Extract languages
    $('p.loadactor a').each((i, element) => {
      seriesData.languages.push($(element).text());
    });

    // Extract seasons
    const seasons = [];
    $('ul.aa-cnt.sub-menu > li.sel-temp > a').each((index, element) => {
      const seasonNumber = $(element).data('season');
      const postId = $(element).data('post');
      const seasonName = $(element).text().trim();
      seasons.push({ seasonNumber, postId, seasonName });
    });

    // Extract episodes
    const episodes = [];
    $('#episode_by_temp .post').each((index, post) => {
      const title = $(post).find('.entry-title').text().trim();
      const episodeNumber = $(post).find('.num-epi').text().trim();
      const imageUrl = $(post).find('.post-thumbnail img').attr('src');
      const link = $(post).find('a.lnk-blk').attr('href');
      const id = link.split('/').filter(Boolean).pop();

      episodes.push({ id, episodeNumber, title, imageUrl, link });
    });

    // Extract recommended series
    const recommendedSeries = [];
    $('section.episodes .owl-carousel .post').each((index, element) => {
      const title = $(element).find('.entry-title').text().trim();
      const imageUrl = $(element).find('img').attr('src').startsWith('http')
        ? $(element).find('img').attr('src')
        : `https:${$(element).find('img').attr('src')}`;
      const year = $(element).find('.year').text().trim();
      const rating = $(element).find('.vote').text().trim();
      const link = $(element).find('a.lnk-blk').attr('href');
      const id = link.split('/').filter(Boolean).pop();

      recommendedSeries.push({ id, title, imageUrl, year, rating, link });
    });

    // Combine all data
    const result = { seriesData, seasons, episodes, recommendedSeries };

    // Store in cache
    cache.set(cacheKey, result);

    console.log("Scraped result:", result);
    res.json(result);
  } catch (error) {
    console.error("Error scraping data:", error);
    res.status(500).json({ error: "Failed to scrape series data" });
  }
});



app.get('/s=:slug', async (req, res) => {
  const { slug } = req.params;
  const cacheKey = `search_${slug}`; // Unique cache key for this request

  // Check if data is cached
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log(`Serving from cache: ${cacheKey}`);
    return res.json(cachedData);
  }

  const url = `https://anime.cat/?s=${encodeURIComponent(slug)}`;
  console.log(`Scraping Series Page: ${url}`);

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const results = [];
    $('ul.post-lst > li').each((index, element) => {
      const title = $(element).find('h2.entry-title').text().trim();
      const rating = $(element).find('div.entry-meta > span.vote').text().replace(/[^0-9.]/g, '').trim();
      const year = $(element).find('span.year').text().trim();
      const type = $(element).find('span.watch').text().replace('View ', '').trim();
      const imageUrl = $(element).find('img').attr('src');
      const link = $(element).find('a.lnk-blk').attr('href');
      const id = link.split('/').filter(Boolean).pop();

      results.push({ id, title, rating, year, type, imageUrl: `https:${imageUrl}`, link });
    });

    // Store in cache
    cache.set(cacheKey, results);

    console.log("Scraped results:", results);
    res.json(results);
  } catch (error) {
    console.error('Error scraping data:', error);
    res.status(500).json({ error: 'Failed to scrape series data' });
  }
});


app.get('/category/network/:slug/:page?', async (req, res) => {
  const { slug, page = 1 } = req.params;
  const cacheKey = `network_${slug}_${page}`;

  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log(`Serving from cache: ${cacheKey}`);
    return res.json(cachedData);
  }

  const url = `https://anime.cat/category/network/${slug}/page/${page}`;
  console.log(`Scraping Series Page: ${url}`);

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const results = [];
    $('ul.post-lst > li').each((index, element) => {
      const title = $(element).find('h2.entry-title').text().trim();
      const rating = $(element).find('div.entry-meta > span.vote').text().replace(/[^0-9.]/g, '').trim();
      const year = $(element).find('span.year').text().trim();
      const type = $(element).find('span.watch').text().replace('View ', '').trim();
      const imageUrl = $(element).find('img').attr('src');
      const link = $(element).find('a.lnk-blk').attr('href');
      const id = link.split('/').filter(Boolean).pop();

      results.push({ id, title, rating, year, type, imageUrl: `https:${imageUrl}`, link });
    });

    const currentPage = parseInt($('.nav-links .page-link.current').text().trim()) || 1;
    const lastPage = parseInt($('.nav-links .page-link').last().text().trim()) || currentPage;
    const pagination = { currentPage, lastPage };

    const responseData = { results, pagination };

    // Store in cache
    cache.set(cacheKey, responseData);

    console.log("Scraped results:", responseData);
    res.json(responseData);
  } catch (error) {
    console.error('Error scraping data:', error);
    res.status(500).json({ error: 'Failed to scrape series data' });
  }
});




// Endpoint to scrape "Language Category"
app.get('/category/language/:slug/:page?', async (req, res) => {
  const { slug, page = 1 } = req.params; // Default to page 1 if no page is provided
  const url = `https://anime.cat/category/language/${slug}/page/${page}`;

  console.log(`Scraping Series Page: ${url}`);

  try {
    // Fetch the HTML of the page
    const response = await axios.get(url);

    // Load the HTML with cheerio
    const $ = cheerio.load(response.data);

    // Extract relevant information
    const results = [];
    $('ul.post-lst > li').each((index, element) => {
      const title = $(element)
        .find('h2.entry-title')
        .text()
        .trim();
      const rating = $(element)
        .find('div.entry-meta > span.vote')
        .text()
        .replace(/[^0-9.]/g, '') // Remove non-numeric characters like the star icon
        .trim();
      const year = $(element)
        .find('span.year')
        .text()
        .trim();
      const type = $(element)
        .find('span.watch')
        .text()
        .replace('View ', '')
        .trim();
      const imageUrl = $(element)
        .find('img')
        .attr('src');
      const link = $(element)
        .find('a.lnk-blk')
        .attr('href');
      const id = link.split('/').filter(Boolean).pop();

      // Push each item into the results array
      results.push({
        id,
        title,
        rating,
        year,
        type,
        imageUrl: `https:${imageUrl}`,
        link,
      });
    });

    // Handle pagination
    const currentPage = parseInt($('.nav-links .page-link.current').text().trim()) || 1;
    const lastPage = parseInt($('.nav-links .page-link').last().text().trim()) || currentPage;

    const pagination = {
      currentPage,
      lastPage,
    };

    // Return the scraped results with pagination data
    console.log("Scraped results:", { results, pagination });
    res.json({ results, pagination });
  } catch (error) {
    console.error('Error scraping data:', error);
    res.status(500).json({ error: 'Failed to scrape series data' });
  }
});



// http://localhost:4000/episode/blue-lock-2x5/
async function scrapeAndConvertToJSON(url) {
  try {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    const currentTitle = $('#aa-options > div').first().text().trim();
    const seasonNumber = $('.btn.lnk.npd.aa-lnk .n_s').text().trim();
    const $epsdsnv = $('.epsdsnv');

    const seriesURL = $epsdsnv.find('> div:first-child a').attr('href') || null;
    const seriesURLid = seriesURL ? seriesURL.split('/').filter(Boolean).pop() : null;
    let prevLink = null;
    let prevLinkid = null;
    let nextLink = null;
    let nextLinkid = null;

    $epsdsnv.find('> div:last-child a').each((index, element) => {
      const pathData = $(element).find('path').attr('d');
      const link = $(element).attr('href');

      if (pathData && pathData.startsWith('M11')) {
        prevLink = link;
        prevLinkid = prevLink ? prevLink.split('/').filter(Boolean).pop() : null;
      } else if (pathData && pathData.startsWith('M5.58')) {
        nextLink = link;
        nextLinkid = nextLink ? nextLink.split('/').filter(Boolean).pop() : null;
      }
    });

    const seasons = [];
    $('ul.aa-cnt.sub-menu > li.sel-temp > a').each((index, element) => {
      const seasonNumber = $(element).data('season');
      const postId = $(element).data('post');
      const seasonName = $(element).text().trim();
      seasons.push({
        seasonNumber,
        postId,
        seasonName,
      });
    });

    const episodes = [];
    $('#episode_by_temp .post').each((index, post) => {
      const title = $(post).find('.entry-title').text().trim();
      const episodeNumber = $(post).find('.num-epi').text().trim();
      const imageUrl = $(post).find('.post-thumbnail img').attr('src');
      const link = $(post).find('a.lnk-blk').attr('href');
      const id = link ? link.split('/').filter(Boolean).pop() : null;

      episodes.push({
        id,
        episodeNumber,
        title,
        imageUrl,
        link,
      });
    });

    const serverOptions = {};
    $('.aa-tbs-video[data-tbs="aa-options"] li').each((index, liElement) => {
      const $link = $(liElement).find('a');
      const serverName = $link.find('.server').text().trim();
      const optionId = $link.attr('href').replace('#', '');

      if (serverName && optionId) {
        const iframeUrl = $(`#${optionId} iframe`).attr('data-src');
        if (iframeUrl) {
          serverOptions[serverName] = iframeUrl;
        }
      }
    });

    const recommendedSeries = [];
    $('section.episodes .owl-carousel .post').each((index, element) => {
      const title = $(element).find('.entry-title').text().trim();
      const imageUrl = $(element).find('img').attr('src');
      const formattedImageUrl = imageUrl && !imageUrl.startsWith('http') ? `https:${imageUrl}` : imageUrl;
      const year = $(element).find('.year').text().trim();
      const rating = $(element).find('.vote').text().trim();
      const link = $(element).find('a.lnk-blk').attr('href');
      const id = link ? link.split('/').filter(Boolean).pop() : null;

      recommendedSeries.push({
        id,
        title,
        imageUrl: formattedImageUrl,
        year,
        rating,
        link,
      });
    });

    const downloadLinks = [];
    $('.mdl-bd .download-links tbody tr').each((index, row) => {
      const server = $(row).find('td:nth-child(1)').text().trim();
      const language = $(row).find('td:nth-child(2)').text().trim();
      const quality = $(row).find('td:nth-child(3)').text().trim();
      const link = $(row).find('td:nth-child(4) a').attr('href');

      if (server && link) {
        downloadLinks.push({
          server,
          language,
          quality,
          link,
        });
      }
    });

    return {
      currentTitle,
      seriesURLid,
      seriesURL,
      prevLinkid,
      prevLink,
      nextLinkid,
      nextLink,
      iframeCount: Object.keys(serverOptions).length,
      iframes: serverOptions,
      season: seasonNumber,
      seasons,
      episodeCount: episodes.length,
      episodes,
      recommendedSeries,
      downloadLinkCount: downloadLinks.length,
      downloadLinks,
    };
  } catch (error) {
    console.error(`Error fetching the URL: ${error.message}`);
    return { error: `Failed to fetch the URL: ${error.message}` };
  }
}
app.get('/episode/:slug', async (req, res) => {
  const { slug } = req.params;
  const cacheKey = `episode_${slug}`;

  // Check if data is in cache
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log(`Serving from cache: ${cacheKey}`);
    return res.json(cachedData);
  }

  const url = `https://anime.cat/episode/${slug}/`;
  console.log(`Scraping Episode Page: ${url}`);

  const result = await scrapeAndConvertToJSON(url);

  if (result.error) {
    return res.status(500).json(result);
  }

  // Store in cache for 1 hour
  cache.set(cacheKey, result);

  console.log(`Scraped and cached result for ${cacheKey}`);
  res.json(result);
});






// http://localhost:4000/seasons?season=1&post=284
function fetchSeasonData(season, post, callback) {
  const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
  const data = `action=action_select_season&season=${season}&post=${post}`; // Dynamic request data

  const options = {
    hostname: "anime.cat",
    port: 443,
    path: "/wp-admin/admin-ajax.php",
    method: "POST",
    headers: {
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.8",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "user-agent": randomUserAgent,
      "cookie": "_ga=GA1.1.2091186600.1740557128; _ga_Z7FVL7BF9G=GS1.1.1740557127.1.1.1740557193.0.0.0",
      "origin": "https://anime.cat",
      "x-requested-with": "XMLHttpRequest",
    },
  };

  const req = https.request(options, (res) => {
    let response = "";

    res.on("data", (chunk) => {
      response += chunk;
    });

    res.on("end", () => {
      if (res.statusCode === 429) {
        callback({ error: "Rate limited! Please try again later." });
      } else {
        const parsedData = parseHTMLToJSON(response);
        callback(parsedData);
      }
    });
  });

  req.on("error", (e) => {
    callback({ error: e.message });
  });

  req.write(data);
  req.end();
}
function parseHTMLToJSON(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const episodes = document.querySelectorAll("li article.post");

  const seasonData = Array.from(episodes).map((episode) => {
    const episodeNumber = episode.querySelector(".num-epi")?.textContent.trim();
    const title = episode.querySelector(".entry-title")?.textContent.trim();
    const image = episode.querySelector("figure img")?.src;
    const link = episode.querySelector(".lnk-blk")?.href;
    const id = link.split("/").filter(Boolean).pop();

    return {
      id,
      episode: episodeNumber,
      title,
      image,
      link,
    };
  });

  return { seasons: seasonData };
}
app.get("/seasons", (req, res) => {
  const { season, post } = req.query;
  const cacheKey = `season_${season}_post_${post}`;

  if (!season || !post) {
    return res.status(400).json({ error: "Please provide both season and post parameters." });
  }

  // Check if data is in cache
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log(`Serving from cache: ${cacheKey}`);
    return res.json(cachedData);
  }

  fetchSeasonData(season, post, (data) => {
    if (data.error) {
      return res.status(500).json(data);
    }

    // Store in cache for 1 hour
    cache.set(cacheKey, data);

    console.log(`Scraped and cached result for ${cacheKey}`);
    res.json(data);
  });
});



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});