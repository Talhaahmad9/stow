import type { SQLiteDatabase } from "expo-sqlite";

export const DATABASE_NAME = "stow.db";
export const DATABASE_VERSION = 1;

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

    // Mark migration applied
    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
    current = DATABASE_VERSION;
  }

  // Future migrations go here
}

export default migrateIfNeeded;
