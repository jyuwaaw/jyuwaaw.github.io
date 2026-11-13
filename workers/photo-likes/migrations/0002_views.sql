-- One row per item per UTC day. No visitor identifiers are stored.
CREATE TABLE IF NOT EXISTS views (
  item_id TEXT NOT NULL,
  day TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (item_id, day)
) WITHOUT ROWID;
