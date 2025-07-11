const express = require('express');
const db = require('../db');
const authenticate = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const result = await db.query('SELECT * FROM playlists WHERE user_id = $1', [req.user.id]);
  res.json(result.rows);
});

router.post('/', async (req, res) => {
  const { name, description } = req.body;
  const result = await db.query(
    'INSERT INTO playlists (name, description, user_id) VALUES ($1, $2, $3) RETURNING *',
    [name, description, req.user.id]
  );
  res.status(201).json(result.rows[0]);
});

router.get('/:id', async (req, res) => {
  const result = await db.query('SELECT * FROM playlists WHERE id = $1', [req.params.id]);
  const playlist = result.rows[0];
  if (!playlist) return res.status(404).json({ error: 'Not found' });
  if (playlist.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  res.json(playlist);
});

router.get('/:id/tracks', async (req, res) => {
  const pl = await db.query('SELECT * FROM playlists WHERE id = $1', [req.params.id]);
  const playlist = pl.rows[0];
  if (!playlist) return res.status(404).json({ error: 'Not found' });
  if (playlist.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  const tracks = await db.query(`
    SELECT t.* FROM tracks t
    JOIN playlists_tracks pt ON pt.track_id = t.id
    WHERE pt.playlist_id = $1
  `, [req.params.id]);
  res.json(tracks.rows);
});

module.exports = router;


// routes/playlists.js
const express = require('express');
const db = require('../db');
const authenticate = require('../middleware/auth');
const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  const playlists = await db.query('SELECT * FROM playlists WHERE user_id = $1', [req.user.id]);
  res.json(playlists.rows);
});

router.post('/', async (req, res) => {
  const { name, description } = req.body;
  const playlist = await db.query(
    'INSERT INTO playlists (name, description, user_id) VALUES ($1, $2, $3) RETURNING *',
    [name, description, req.user.id]
  );
  res.status(201).json(playlist.rows[0]);
});

router.get('/:id', async (req, res) => {
  const playlist = await db.query('SELECT * FROM playlists WHERE id = $1', [req.params.id]);
  if (!playlist.rows.length) return res.status(404).json({ error: 'Not found' });
  if (playlist.rows[0].user_id !== req.user.id)
    return res.status(403).json({ error: 'Forbidden' });

  res.json(playlist.rows[0]);
});

router.get('/:id/tracks', async (req, res) => {
  const playlist = await db.query('SELECT * FROM playlists WHERE id = $1', [req.params.id]);
  if (!playlist.rows.length) return res.status(404).json({ error: 'Not found' });
  if (playlist.rows[0].user_id !== req.user.id)
    return res.status(403).json({ error: 'Forbidden' });

  const tracks = await db.query(
    `SELECT t.* FROM tracks t
     JOIN playlists_tracks pt ON pt.track_id = t.id
     WHERE pt.playlist_id = $1`, [req.params.id]);

  res.json(tracks.rows);
});

module.exports = router;
