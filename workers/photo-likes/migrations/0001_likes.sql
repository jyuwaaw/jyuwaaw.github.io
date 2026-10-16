CREATE TABLE IF NOT EXISTS likes (
  photo_id TEXT NOT NULL,
  visitor_hash TEXT NOT NULL,
  PRIMARY KEY (photo_id, visitor_hash)
) WITHOUT ROWID;
