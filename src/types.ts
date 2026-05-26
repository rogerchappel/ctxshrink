export type InputKind = "file" | "stdin";

export type ReductionAction = "kept" | "reduced" | "dropped";

export type ReducerName =
  | "markdown"
  | "json"
  | "source"
  | "log"
  | "lockfile"
  | "binary"
  | "none";

export interface LoadedFile {
  path: string;
  content: string;
  kind: InputKind;
  bytes: number;
}

export interface Estimate {
  bytes: number;
  chars: number;
  lines: number;
  tokens: number;
}

export interface ReductionResult {
  action: ReductionAction;
  reducer: ReducerName;
  content: string;
  reason: string;
  original: Estimate;
  reduced: Estimate;
}

export interface ManifestEntry {
  path: string;
  kind: InputKind;
  action: ReductionAction;
  reducer: ReducerName;
  reason: string;
  original: Estimate;
  reduced: Estimate;
}

export interface PackManifest {
  generatedAt: string;
  budget: number;
  requestedInputs: string[];
  ignoredPatterns: string[];
  totals: {
    files: number;
    kept: number;
    reduced: number;
    dropped: number;
    originalTokens: number;
    reducedTokens: number;
    savedTokens: number;
  };
  entries: ManifestEntry[];
}

export interface PackOptions {
  inputs: string[];
  budget: number;
  out?: string;
  manifestOut?: string;
  ignore: string[];
  cwd: string;
  stdin?: string;
}

export interface EstimateOptions {
  inputs: string[];
  ignore: string[];
  cwd: string;
  stdin?: string;
  json: boolean;
}
