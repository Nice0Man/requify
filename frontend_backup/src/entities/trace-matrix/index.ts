// === UI exports ===
export * from './ui';

// === Model exports ===
export * from './model';

// === API exports ===
export { traceMatrixDAO } from './api/traceMatrixDAO';

// === Re-exports with aliases to avoid conflicts ===
export type {
  TraceMatrix as TraceMatrixEntity,
} from './model';