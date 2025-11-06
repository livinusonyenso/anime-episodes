const { Schema, model } = require('mongoose');

const AnimeSchema = new Schema({
  title: { type:String, required:true, unique:true, trim:true },
  slug: { type:String, required:true, unique:true },
  sourceUrl: { type:String, default:'' },
  lastScrapedAt: { type:Date },
  episodeCount: { type:Number, default:0 }
}, { timestamps:true });

module.exports = model('Anime', AnimeSchema);
