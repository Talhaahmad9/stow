import type { SQLiteDatabase } from "expo-sqlite";

export const DATABASE_NAME = "stow.db";
export const DATABASE_VERSION = 2;

export async function migrateIfNeeded(db: SQLiteDatabase): Promise<void> {
  // Enable recommended PRAGMAs
  await db.execAsync("PRAGMA foreign_keys = ON;");
  await db.execAsync("PRAGMA journal_mode = WAL;");

  const res = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  let current = res?.user_version ?? 0;
  if (current >= DATABASE_VERSION) {
    return;
  }

  // Apply version 1 migration if needed
  if (current === 0) {
    // Static schema statements only. No user data interpolation.
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS captures (
        id INTEGER PRIMARY KEY NOT NULL,
        text TEXT NULL,
        classification TEXT NOT NULL DEFAULT 'unsorted',
        workflow_state TEXT NOT NULL DEFAULT 'active',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        -- Enforce allowed values for classification and workflow_state
        CHECK (classification IN ('unsorted','note','task','idea','reference')),
        CHECK (workflow_state IN ('active','archived'))
      );

      CREATE INDEX IF NOT EXISTS captures_workflow_created_idx
        ON captures (workflow_state, created_at);
    `);

    current = 1;
  }

  // Apply version 2 migration if needed
  if (current === 1) {
    await db.execAsync(`
      ALTER TABLE captures ADD COLUMN reminder_at INTEGER NULL;
      ALTER TABLE captures ADD COLUMN notification_id TEXT NULL;

      CREATE TABLE IF NOT EXISTS capture_images (
        id INTEGER PRIMARY KEY NOT NULL,
        capture_id INTEGER NOT NULL,
        uri TEXT NOT NULL,
        width INTEGER NOT NULL,
        height INTEGER NOT NULL,
        mime_type TEXT NOT NULL DEFAULT 'image/jpeg',
        position INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (capture_id) REFERENCES captures (id) ON DELETE CASCADE,
        UNIQUE (capture_id, position)
      );

      CREATE INDEX IF NOT EXISTS capture_images_capture_idx
        ON capture_images (capture_id);
    `);

    // Mark migration applied
    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
    current = DATABASE_VERSION;
  }

  // Future migrations go here
}

export default migrateIfNeeded;
