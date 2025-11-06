const Anime = require('../models/Anime');
const Episode = require('../models/Episode');
const { ensureAnimeCached, refreshEpisodesIfStale } = require('../services/scraper/animeScraper');

// Search or create anime + preload episodes
async function searchOrCreateAnime(req, res, next) {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success:false, message:'Missing q param' });

    const anime = await ensureAnimeCached(q, true);

    res.json({
      success: true,
      data: {
        id: anime._id,
        title: anime.title,
        slug: anime.slug,
        episodeCount: anime.episodeCount
      }
    });
  } catch (e) { next(e); }
}

// Get episodes with watched markings (if logged in)
async function getEpisodes(req, res, next) {
  try {
    const { id } = req.params;
    const anime = await Anime.findById(id);
    if (!anime) return res.status(404).json({ success:false, message:'Anime not found' });

    // Lazy refresh
    await refreshEpisodesIfStale(anime);

    // Fetch all episodes
    let eps = await Episode.find({ anime: id }).sort({ number: 1 }).lean();

    // If logged in, apply watched state
    if (req.user?.watchedEpisodes?.length) {
      const watchedSet = new Set(req.user.watchedEpisodes.map(String));
      eps = eps.map(ep => ({
        ...ep,
        __watched: watchedSet.has(String(ep._id))
      }));
    }

    res.json({ success:true, data: eps });
  } catch (e) { next(e); }
}

module.exports = { searchOrCreateAnime, getEpisodes };
