export type Classification =
  | "unsorted"
  | "note"
  | "task"
  | "idea"
  | "reference";

export type WorkflowState = "active" | "archived";

export interface Capture {
  id: number;
  text: string | null;
  classification: Classification;
  workflowState: WorkflowState;
  createdAt: number;
  updatedAt: number;
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
}

export function mapDbRowToCapture(row: CaptureRow): Capture {
  return {
    id: Number(row.id),
    text: row.text === null ? null : String(row.text),
    classification: row.classification,
    workflowState: row.workflow_state,
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}
