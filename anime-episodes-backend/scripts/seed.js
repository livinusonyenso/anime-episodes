#!/usr/bin/env node
require('dotenv').config();
const crypto = require('crypto');
const mongoose = require('mongoose');
const Anime = require('../models/Anime');
const Episode = require('../models/Episode');
const User = require('../models/User');

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
function sha1(obj) {
  return crypto.createHash('sha1').update(JSON.stringify(obj)).digest('hex');
}

/**
 * Upsert an anime + its episodes with a single sourceHash so your lazy-update
 * logic sees a consistent snapshot (like a real “scraped batch”).
 */
async function upsertAnimeWithEpisodes(title, episodes, opts = {}) {
  const slug = slugify(title);
  let anime = await Anime.findOne({ slug });

  if (!anime) {
    anime = await Anime.create({
      title,
      slug,
      sourceUrl: opts.sourceUrl || `https://animefillerlist.com/shows/${slug}`,
      lastScrapedAt: null,
      episodeCount: 0,
    });
    console.log(`🆕 Created anime: ${title}`);
  } else {
    console.log(`ℹ️ Anime exists: ${title}`);
  }

  // Build a stable hash representing the scraped dataset
  const sourceHash = sha1(episodes.map(e => ({ n: e.number, t: e.title, ty: e.type })));

  // Upsert episodes
  for (const ep of episodes) {
    await Episode.findOneAndUpdate(
      { anime: anime._id, number: ep.number },
      {
        anime: anime._id,
        number: ep.number,
        title: ep.title,
        type: ep.type,          // 'canon' | 'filler' | 'mixed' | 'unknown'
        sourceHash,             // cached snapshot id
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  // Update anime cache meta
  const count = await Episode.countDocuments({ anime: anime._id });
  anime.episodeCount = count;
  anime.lastScrapedAt = new Date(); // simulate “scraped just now”
  await anime.save();

  console.log(`✅ ${title}: ${count} eps (slug: ${slug})`);
  return anime;
}

async function seed() {
  try {
    console.log('🌱 Connecting to MongoDB…');
    await mongoose.connect(process.env.MONGO_URI);

    // Optionally clear only what you want:
    // await Anime.deleteMany({});
    // await Episode.deleteMany({});
    // await User.deleteMany({ email: 'test@example.com' });

    // 1) Naruto — 3 episodes
    const naruto = await upsertAnimeWithEpisodes('Naruto', [
      { number: 1, title: 'Enter: Naruto Uzumaki!', type: 'canon' },
      { number: 2, title: 'My Name is Konohamaru!', type: 'canon' },
      { number: 3, title: 'Sasuke and Sakura: Friends or Foes?', type: 'mixed' },
    ]);

    // 2) Bleach — 4 episodes
    const bleach = await upsertAnimeWithEpisodes('Bleach', [
      { number: 1, title: 'The Day I Became a Shinigami', type: 'canon' },
      { number: 2, title: 'A Shinigami’s Work', type: 'canon' },
      { number: 3, title: 'The Older Brother’s Wish…', type: 'mixed' },
      { number: 4, title: 'Cursed Parakeet', type: 'filler' },
    ]);

    // 3) One Piece — 5 episodes
    const onePiece = await upsertAnimeWithEpisodes('One Piece', [
      { number: 1, title: 'I’m Luffy! The Man Who Will Become Pirate King!', type: 'canon' },
      { number: 2, title: 'Enter the Great Swordsman! Roronoa Zoro!', type: 'canon' },
      { number: 3, title: 'Morgan vs. Luffy! Who’s This Girl?', type: 'filler' },
      { number: 4, title: 'Luffy’s Past! Red-Haired Shanks Appears!', type: 'filler' },
      { number: 5, title: 'Fear, Mysterious Power! Captain Buggy!', type: 'mixed' },
    ]);

    // Create a test user + mark some watched episodes
    const testEmail = 'test@example.com';
    const existing = await User.findOne({ email: testEmail });
    if (!existing) {
      // Grab a few episode ids to mark as watched
      const [nEps, bEps, oEps] = await Promise.all([
        Episode.find({ anime: naruto._id }).sort({ number: 1 }).lean(),
        Episode.find({ anime: bleach._id }).sort({ number: 1 }).lean(),
        Episode.find({ anime: onePiece._id }).sort({ number: 1 }).lean(),
      ]);

      const watchedIds = [
        nEps[0]?._id, // Naruto #1
        bEps[1]?._id, // Bleach #2
        oEps[3]?._id, // One Piece #4
      ].filter(Boolean);

      const user = await User.create({
        email: testEmail,
        password: 'pass1234', // will hash via pre-save hook
        name: 'Test User',
        watchedEpisodes: watchedIds,
      });

      console.log('👤 Test user created:');
      console.log(`    Email: ${user.email}`);
      console.log('    Password: pass1234');
    } else {
      console.log('ℹ️ Test user already exists:', testEmail);
    }

    // Print IDs & test URLs
    console.log('\n🔎 Quick Test (backend):');
    console.log(`GET /api/anime?q=naruto -> id: ${naruto._id}`);
    console.log(`GET /api/anime/${naruto._id}/episodes`);
    console.log(`GET /api/anime?q=bleach -> id: ${bleach._id}`);
    console.log(`GET /api/anime/${bleach._id}/episodes`);
    console.log(`GET /api/anime?q=one piece -> id: ${onePiece._id}`);
    console.log(`GET /api/anime/${onePiece._id}/episodes`);

    console.log('\n🖥️  Quick Test (frontend routes):');
    console.log(`http://localhost:3000/anime?id=${naruto._id}`);
    console.log(`http://localhost:3000/anime?id=${bleach._id}`);
    console.log(`http://localhost:3000/anime?id=${onePiece._id}`);

    console.log('\n✅ Seed complete!');
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  }
}

seed();
