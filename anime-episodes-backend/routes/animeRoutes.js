const router = require('express').Router();
const { searchOrCreateAnime, getEpisodes } = require('../controllers/animeController');
const { maybeAuth } = require('../middleware/maybeAuth');

// Search + Preload Episodes
router.get('/', searchOrCreateAnime);

// Get Episodes (optionally include watched status)
router.get('/:id/episodes', maybeAuth, getEpisodes);

module.exports = router;
