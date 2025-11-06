const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const { setWatched } = require('../controllers/episodeController');

// Save watch status (auth required)
router.post('/watch', authRequired, setWatched);

module.exports = router;
