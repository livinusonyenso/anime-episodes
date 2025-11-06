const Episode = require('../models/Episode');
const User = require('../models/User');

// Save watch status per user
async function setWatched(req, res, next) {
  try {
    const { episodeId, watched } = req.body;
    if (typeof watched !== 'boolean') return res.status(400).json({ success:false, message:'watched must be boolean' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(401).json({ success:false, message:'Unauthorized' });

    if (watched) {
      if (!user.watchedEpisodes.includes(episodeId)) {
        user.watchedEpisodes.push(episodeId);
      }
    } else {
      user.watchedEpisodes = user.watchedEpisodes.filter(id => id.toString() !== episodeId);
    }
    await user.save();
    res.json({ success:true, data:{ watchedEpisodes: user.watchedEpisodes }});
  } catch (e) { next(e); }
}

module.exports = { setWatched };
