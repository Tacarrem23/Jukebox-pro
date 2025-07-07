DROP TABLE IF EXISTS playlists_tracks;
DROP TABLE IF EXISTS playlists;
DROP TABLE IF EXISTS tracks;

CREATE TABLE tracks (
  id serial PRIMARY KEY,
  name text NOT NULL,
  duration_ms integer NOT NULL
 );

CREATE TABLE playlists (
  id serial PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL
);

CREATE TABLE playlists_tracks (
  id serial PRIMARY KEY,
  playlist_id integer NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  track_id integer NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  UNIQUE (playlist_id, track_id)
);

-- schema.sql

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

CREATE TABLE tracks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  duration_ms INTEGER NOT NULL
);

CREATE TABLE playlists (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE playlists_tracks (
  id SERIAL PRIMARY KEY,
  playlist_id INTEGER NOT NULL REFERENCES playlists(id),
  track_id INTEGER NOT NULL REFERENCES tracks(id),
  UNIQUE (playlist_id, track_id)
);
