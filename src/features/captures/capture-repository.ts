import type { SQLiteDatabase } from "expo-sqlite";
import type { Capture, CaptureRow } from "./capture";
import { mapDbRowToCapture } from "./capture";

/**
 * Insert a text-only capture. Trims input and rejects empty content.
 * Returns the created Capture.
 */
export async function createTextCapture(
  db: SQLiteDatabase,
  inputText: string,
): Promise<Capture> {
  const text = inputText.trim();
  if (text.length === 0) {
    throw new Error("text-empty");
  }

  const now = Date.now();

  const result = await db.runAsync(
    `INSERT INTO captures (text, classification, workflow_state, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
    text,
    "unsorted",
    "active",
    now,
    now,
  );

  const lastId = result.lastInsertRowId;

  const row = await db.getFirstAsync<CaptureRow>(
    "SELECT * FROM captures WHERE id = ?",
    lastId,
  );
  if (!row) {
    throw new Error("failed-to-read-created-capture");
  }

  return mapDbRowToCapture(row);
}

/**
 * List only active captures ordered newest-first. Deterministic ordering uses id DESC
 * as a tiebreaker when timestamps match.
 */
export async function listActiveCaptures(
  db: SQLiteDatabase,
): Promise<Capture[]> {
  const rows = await db.getAllAsync<CaptureRow>(
    `SELECT * FROM captures WHERE workflow_state = ? ORDER BY created_at DESC, id DESC`,
    "active",
  );
  return rows.map(mapDbRowToCapture);
}

export default {
  createTextCapture,
  listActiveCaptures,
};
