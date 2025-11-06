/**
 * Episode scraper based on the public Anime Filler JSON dataset.
 * Source: https://github.com/Anime-Filler-List/anime-filler-list
 */
const axios = require('axios');
const crypto = require('crypto');
const Anime = require('../../models/Anime');
const Episode = require('../../models/Episode');

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function hash(obj) {
  return crypto.createHash('sha1').update(JSON.stringify(obj)).digest('hex');
}

/**
 * Fetch filler guide JSON for an anime
 * Example: https://raw.githubusercontent.com/Anime-Filler-List/anime-filler-list/master/anime/naruto.json
 */
async function fetchFillerJSON(slug) {
  const url = `https://raw.githubusercontent.com/Anime-Filler-List/anime-filler-list/master/anime/${slug}.json`;
  try {
    const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }});
    return data;
  } catch {
    return null; // anime not found in dataset
  }
}

/**
 * Convert filler list JSON into our episode structure
 */
function extractEpisodesFromData(data) {
  const parsed = [];
  let number = 1;

  const pushRange = (eps, type) => {
    for (const ep of eps) {
      parsed.push({ number, title: ep.title || `Episode ${number}`, type });
      number++;
    }
  };

  if (data.total) {
    // Data contains filler categorization arrays
    pushRange(data.canon || [], 'canon');
    pushRange(data.mixed || [], 'mixed');
    pushRange(data.filler || [], 'filler');
  }

  return parsed;
}

/**
 * Ensure anime exists + optionally prefetch episodes
 */
async function ensureAnimeCached(title, prefetch = true) {
  const slug = slugify(title);
  let anime = await Anime.findOne({ slug });

  if (!anime) {
    anime = await Anime.create({
      title,
      slug,
      sourceUrl: `https://animefillerlist.com/shows/${slug}`,
      lastScrapedAt: null,
      episodeCount: 0
    });
  }

  if (prefetch) {
    await refreshEpisodesIfStale(anime);
  }

  return anime;
}

/**
 * Refresh episodes only when needed (lazy update)
 */
async function refreshEpisodesIfStale(anime) {
  const data = await fetchFillerJSON(anime.slug);
  if (!data) {
    console.log(`⚠️ No filler data found for: ${anime.slug}`);
    return { changed: false, count: anime.episodeCount };
  }

  const episodes = extractEpisodesFromData(data);
  const newHash = hash(episodes);

  const latest = await Episode.findOne({ anime: anime._id }).sort({ updatedAt: -1 });
  const lastHash = latest?.sourceHash || '';

  if (newHash === lastHash && anime.lastScrapedAt) {
    return { changed: false, count: episodes.length };
  }

  // Upsert all episodes
  for (const ep of episodes) {
    await Episode.findOneAndUpdate(
      { anime: anime._id, number: ep.number },
      { title: ep.title, type: ep.type, sourceHash: newHash, anime: anime._id },
      { upsert: true }
    );
  }

  anime.episodeCount = episodes.length;
  anime.lastScrapedAt = new Date();
  await anime.save();

  return { changed: true, count: episodes.length };
}

module.exports = { ensureAnimeCached, refreshEpisodesIfStale };
