import db from "#db/client";

import { createPlaylist } from "#db/queries/playlists";
import { createPlaylistTrack } from "#db/queries/playlists_tracks";
import { createTrack } from "#db/queries/tracks";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  for (let i = 1; i <= 20; i++) {
    await createPlaylist("Playlist " + i, "lorem ipsum playlist description");
    await createTrack("Track " + i, i * 50000);
  }
  for (let i = 1; i <= 15; i++) {
    const playlistId = 1 + Math.floor(i / 2);
    await createPlaylistTrack(playlistId, i);
  }
}

const db = require('./db');
const bcrypt = require('bcrypt');

async function seed() {
  await db.query('DELETE FROM playlists_tracks');
  await db.query('DELETE FROM playlists');
  await db.query('DELETE FROM tracks');
  await db.query('DELETE FROM "user"');

  const password1 = await bcrypt.hash('password123', 10);
  const password2 = await bcrypt.hash('secret456', 10);

  const users = await db.query(`
    INSERT INTO "user" (username, password)
    VALUES ('alice', $1), ('bob', $2)
    RETURNING id
  `, [password1, password2]);

  const [aliceId, bobId] = users.rows.map(u => u.id);

  const tracks = await db.query(`
    INSERT INTO tracks (name, duration_ms)
    VALUES 
      ('Song A', 210000),
      ('Song B', 180000),
      ('Song C', 240000),
      ('Song D', 200000),
      ('Song E', 230000),
      ('Song F', 260000)
    RETURNING id
  `);

  const trackIds = tracks.rows.map(t => t.id);

  const playlists = await db.query(`
    INSERT INTO playlists (name, description, user_id)
    VALUES 
      ('Alice Playlist', 'Alice\'s mix', $1),
      ('Bob Playlist', 'Bob\'s mix', $2)
    RETURNING id
  `, [aliceId, bobId]);

  const [alicePlaylistId, bobPlaylistId] = playlists.rows.map(p => p.id);

  for (let i = 0; i < 5; i++) {
    await db.query(
      'INSERT INTO playlists_tracks (playlist_id, track_id) VALUES ($1, $2)',
      [alicePlaylistId, trackIds[i]]
    );
    await db.query(
      'INSERT INTO playlists_tracks (playlist_id, track_id) VALUES ($1, $2)',
      [bobPlaylistId, trackIds[(i + 1) % trackIds.length]]
    );
  }

  console.log('Seed complete');
}

seed();
