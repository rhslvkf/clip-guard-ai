/**
 * Type definitions for secret detection patterns
 */

export type PatternCategory =
  | 'cloud_keys'
  | 'api_tokens'
  | 'private_keys'
  | 'passwords'
  | 'database'
  | 'network'
  | 'pii';

export type Severity = 'high' | 'medium' | 'low';

export interface SecretPattern {
  name: string;
  regex: RegExp;
  replacement: string | ((match: string) => string);
  category: PatternCategory;
  severity: Severity;
  priority?: number;
  optional?: boolean;
}

export interface PatternMatch {
  type: string;
  value: string;
  index: number;
  replacement: string;
  severity: Severity;
  category: PatternCategory;
}

export interface DetectionResult {
  original: string;
  masked: string;
  matches: PatternMatch[];
}

export interface RestoreMap {
  [placeholder: string]: string;
}

export interface RestoreResult {
  masked: string;
  restoreMap: RestoreMap;
}

export type SecretPatterns = Record<string, SecretPattern>;
