const { Schema, model } = require('mongoose');

const EpisodeSchema = new Schema({
  anime: { type: Schema.Types.ObjectId, ref: 'Anime', index:true, required:true },
  number: { type:Number, required:true, index:true },
  title: { type:String, default:'' },
  type: { type:String, enum:['canon','filler','mixed','unknown'], default:'unknown' },
  sourceHash: { type:String, default:'' } // for lazy update diffing
}, { timestamps:true });

EpisodeSchema.index({ anime:1, number:1 }, { unique:true });

module.exports = model('Episode', EpisodeSchema);
