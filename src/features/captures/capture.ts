export type Classification =
  | "unsorted"
  | "note"
  | "task"
  | "idea"
  | "reference";

export type WorkflowState = "active" | "archived";

export interface CaptureImage {
  id: number;
  captureId: number;
  uri: string;
  width: number;
  height: number;
  mimeType: string;
  position: number;
  createdAt: number;
}

export interface CaptureImageRow {
  id: number;
  capture_id: number;
  uri: string;
  width: number;
  height: number;
  mime_type: string;
  position: number;
  created_at: number;
}

export interface Capture {
  id: number;
  text: string | null;
  classification: Classification;
  workflowState: WorkflowState;
  createdAt: number;
  updatedAt: number;
  images: CaptureImage[];
  reminderAt: number | null;
  notificationId: string | null;
}

// Shape of the SQLite row as returned by queries. This is intentionally
// distinct from the app `Capture` domain type to allow mapping and naming
// normalization (snake_case -> camelCase).
export interface CaptureRow {
  id: number;
  text: string | null;
  classification: Classification;
  workflow_state: WorkflowState;
  created_at: number;
  updated_at: number;
  reminder_at: number | null;
  notification_id: string | null;
}

export function mapDbRowToCapture(row: CaptureRow, images: CaptureImage[] = []): Capture {
  return {
    id: Number(row.id),
    text: row.text === null ? null : String(row.text),
    classification: row.classification,
    workflowState: row.workflow_state,
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
    images,
    reminderAt: row.reminder_at === null ? null : Number(row.reminder_at),
    notificationId: row.notification_id === null ? null : String(row.notification_id),
  };
}

export function mapDbImageRowToCaptureImage(row: CaptureImageRow): CaptureImage {
  return {
    id: Number(row.id),
    captureId: Number(row.capture_id),
    uri: String(row.uri),
    width: Number(row.width),
    height: Number(row.height),
    mimeType: String(row.mime_type),
    position: Number(row.position),
    createdAt: Number(row.created_at),
  };
}
