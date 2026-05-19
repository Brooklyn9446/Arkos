export type Severity = "Critical" | "High" | "Medium" | "Low" | "Info";

export interface Finding {
  vulnerability_type: string;
  description: string;
  file: string;
  line_range: string;
  severity: Severity;
  reasoning: string;
  suggested_fix: string;
}

export interface AnalysisState {
  code: string;
  findings: Finding[];
  report: string | null;
  status: "idle" | "analyzing" | "completed" | "error";
  progress: number;
  currentStep?: string;
}
