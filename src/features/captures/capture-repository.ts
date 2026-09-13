import type { SQLiteDatabase } from "expo-sqlite";
import type { Capture, CaptureImage, CaptureImageRow, CaptureRow } from "./capture";
import { mapDbRowToCapture, mapDbImageRowToCaptureImage } from "./capture";

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

  return mapDbRowToCapture(row, []);
}

/**
 * Insert a capture with text and/or images, and optional reminder.
 * At least one of text or images must be provided.
 */
export async function createCapture(
  db: SQLiteDatabase,
  inputText: string | null,
  imageUris: Array<{ uri: string; width: number; height: number; mimeType: string }>,
  reminderAt: number | null = null,
  notificationId: string | null = null,
): Promise<Capture> {
  const text = inputText ? inputText.trim() : null;
  const hasText = text && text.length > 0;
  const hasImages = imageUris.length > 0;

  if (!hasText && !hasImages) {
    throw new Error("capture-empty");
  }

  const now = Date.now();

  let createdRow: CaptureRow | null = null;
  const images: CaptureImage[] = [];
  await db.withExclusiveTransactionAsync(async (txn) => {
    const result = await txn.runAsync(
      `INSERT INTO captures (text, classification, workflow_state, reminder_at, notification_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      hasText ? text : null,
      "unsorted",
      "active",
      reminderAt,
      notificationId,
      now,
      now,
    );
    const captureId = result.lastInsertRowId;

    for (let i = 0; i < imageUris.length; i++) {
      const imageUri = imageUris[i];
      const imageResult = await txn.runAsync(
        `INSERT INTO capture_images (capture_id, uri, width, height, mime_type, position, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        captureId,
        imageUri.uri,
        imageUri.width,
        imageUri.height,
        imageUri.mimeType,
        i,
        now,
      );
      images.push({
        id: imageResult.lastInsertRowId,
        captureId,
        uri: imageUri.uri,
        width: imageUri.width,
        height: imageUri.height,
        mimeType: imageUri.mimeType,
        position: i,
        createdAt: now,
      });
    }

    createdRow = await txn.getFirstAsync<CaptureRow>(
      "SELECT * FROM captures WHERE id = ?",
      captureId,
    );
    if (!createdRow) {
      throw new Error("failed-to-read-created-capture");
    }
  });

  if (!createdRow) {
    throw new Error("failed-to-read-created-capture");
  }

  return mapDbRowToCapture(createdRow, images);
}

/**
 * List only active captures ordered newest-first, including their images.
 */
export async function listActiveCaptures(
  db: SQLiteDatabase,
): Promise<Capture[]> {
  const rows = await db.getAllAsync<CaptureRow>(
    `SELECT * FROM captures WHERE workflow_state = ? ORDER BY created_at DESC, id DESC`,
    "active",
  );

  const captures: Capture[] = [];
  for (const row of rows) {
    const imageRows = await db.getAllAsync<CaptureImageRow>(
      `SELECT * FROM capture_images WHERE capture_id = ? ORDER BY position ASC`,
      row.id,
    );
    const images = imageRows.map(mapDbImageRowToCaptureImage);
    captures.push(mapDbRowToCapture(row, images));
  }

  return captures;
}

/**
 * Update capture reminder and notification ID.
 */
export async function updateCaptureReminder(
  db: SQLiteDatabase,
  captureId: number,
  reminderAt: number | null,
  notificationId: string | null,
): Promise<void> {
  await db.runAsync(
    `UPDATE captures SET reminder_at = ?, notification_id = ?, updated_at = ? WHERE id = ?`,
    reminderAt,
    notificationId,
    Date.now(),
    captureId,
  );
}

async function readCaptureById(
  db: SQLiteDatabase,
  captureId: number,
): Promise<Capture | null> {
  const row = await db.getFirstAsync<CaptureRow>(
    "SELECT * FROM captures WHERE id = ?",
    captureId,
  );
  if (!row) return null;
  const imageRows = await db.getAllAsync<CaptureImageRow>(
    "SELECT * FROM capture_images WHERE capture_id = ? ORDER BY position ASC",
    captureId,
  );
  return mapDbRowToCapture(row, imageRows.map(mapDbImageRowToCaptureImage));
}

export async function getCaptureById(
  db: SQLiteDatabase,
  captureId: number,
): Promise<Capture | null> {
  return readCaptureById(db, captureId);
}

export interface UpdateCaptureInput {
  text: string | null;
  images: Array<{
    uri: string;
    width: number;
    height: number;
    mimeType: string;
  }>;
  reminderAt: number | null;
  notificationId: string | null;
}

export interface UpdateCaptureResult {
  capture: Capture;
  removedImageUris: string[];
}

export async function updateCapture(
  db: SQLiteDatabase,
  captureId: number,
  input: UpdateCaptureInput,
): Promise<UpdateCaptureResult> {
  const text = input.text?.trim() || null;
  if (!text && input.images.length === 0) throw new Error("capture-empty");

  let updated: Capture | null = null;
  let removedImageUris: string[] = [];
  await db.withExclusiveTransactionAsync(async (txn) => {
    const before = await readCaptureById(txn, captureId);
    if (!before) throw new Error("capture-not-found");
    const retainedUris = new Set(input.images.map((image) => image.uri));
    removedImageUris = before.images
      .map((image) => image.uri)
      .filter((uri) => !retainedUris.has(uri));
    await txn.runAsync(
      "UPDATE captures SET text = ?, reminder_at = ?, notification_id = ?, updated_at = ? WHERE id = ?",
      text,
      input.reminderAt,
      input.notificationId,
      Date.now(),
      captureId,
    );
    await txn.runAsync("DELETE FROM capture_images WHERE capture_id = ?", captureId);
    for (const [position, image] of input.images.entries()) {
      await txn.runAsync(
        "INSERT INTO capture_images (capture_id, uri, width, height, mime_type, position, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        captureId,
        image.uri,
        image.width,
        image.height,
        image.mimeType,
        position,
        Date.now(),
      );
    }
    updated = await readCaptureById(txn, captureId);
    if (!updated) throw new Error("failed-to-read-updated-capture");
  });
  if (!updated) throw new Error("failed-to-read-updated-capture");
  return { capture: updated, removedImageUris };
}

export interface DeletedCaptureData {
  imageUris: string[];
  notificationId: string | null;
}

export async function deleteCapture(
  db: SQLiteDatabase,
  captureId: number,
): Promise<DeletedCaptureData> {
  let deleted: DeletedCaptureData | null = null;
  await db.withExclusiveTransactionAsync(async (txn) => {
    const capture = await readCaptureById(txn, captureId);
    if (!capture) throw new Error("capture-not-found");
    const result = await txn.runAsync("DELETE FROM captures WHERE id = ?", captureId);
    if (result.changes !== 1) throw new Error("capture-delete-failed");
    deleted = {
      imageUris: capture.images.map((image) => image.uri),
      notificationId: capture.notificationId,
    };
  });
  if (!deleted) throw new Error("capture-delete-failed");
  return deleted;
}

export default {
  createTextCapture,
  createCapture,
  listActiveCaptures,
  updateCaptureReminder,
  getCaptureById,
  updateCapture,
  deleteCapture,
};
