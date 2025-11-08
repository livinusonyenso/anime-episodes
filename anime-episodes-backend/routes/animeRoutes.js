const router = require('express').Router();
const { listAllAnime, searchOrCreateAnime, getEpisodes } = require('../controllers/animeController');
const { maybeAuth } = require('../middleware/maybeAuth');

// List all anime (if no q param) or search/create (if q param provided)
router.get('/', (req, res, next) => {
  if (req.query.q) {
    return searchOrCreateAnime(req, res, next);
  }
  return listAllAnime(req, res, next);
});

// Get Episodes (optionally include watched status)
router.get('/:id/episodes', maybeAuth, getEpisodes);

module.exports = router;
