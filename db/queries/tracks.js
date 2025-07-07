import db from "#db/client";

export async function createTrack(name, durationMs) {
  const sql = `
  INSERT INTO tracks
    (name, duration_ms)
  VALUES
    ($1, $2)
  RETURNING *
  `;
  const {
    rows: [track],
  } = await db.query(sql, [name, durationMs]);
  return track;
}

export async function getTracks() {
  const sql = `
  SELECT *
  FROM tracks
  `;
  const { rows: tracks } = await db.query(sql);
  return tracks;
}

export async function getTracksByPlaylistId(id) {
  const sql = `
  SELECT tracks.*
  FROM
    tracks
    JOIN playlists_tracks ON playlists_tracks.track_id = tracks.id
    JOIN playlists ON playlists.id = playlists_tracks.playlist_id
  WHERE playlists.id = $1
  `;
  const { rows: tracks } = await db.query(sql, [id]);
  return tracks;
}

export async function getTrackById(id) {
  const sql = `
  SELECT *
  FROM tracks
  WHERE id = $1
  `;
  const {
    rows: [track],
  } = await db.query(sql, [id]);
  return track;
}


// routes/tracks.js
const express = require('express');
const db = require('../db');
const authenticate = require('../middleware/auth');
const router = express.Router();

router.use(authenticate);

router.get('/:id/playlists', async (req, res) => {
  const trackId = req.params.id;
  const playlists = await db.query(`
    SELECT p.* FROM playlists p
    JOIN playlists_tracks pt ON pt.playlist_id = p.id
    WHERE pt.track_id = $1 AND p.user_id = $2
  `, [trackId, req.user.id]);

  res.json(playlists.rows);
});

module.exports = router;
