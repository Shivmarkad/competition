/**
 * Validation schemas for security-sensitive data from localStorage, URL params, and file uploads
 */

import { RuleConfig, CustomRule, Character } from "@/lib/types";

// Default config (exported for use in components)
export const DEFAULT_CONFIG: RuleConfig = {
  maxConsecutiveWins: 5,
  teamMode: false,
  teams: 2,
  targetScore: null,
  handicapMode: false,
  handicapScores: {},
  battleTimer: null,
  autoBattle: false,
  autoBattleInterval: 5000,
  soundEnabled: true,
  customRules: [],
};

// Allowed image MIME types for uploads
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

// RuleConfig validation schema
export const RULE_CONFIG_SCHEMA: Record<keyof RuleConfig, (value: unknown) => boolean> = {
  maxConsecutiveWins: (v): v is number => typeof v === "number" && v >= 1 && v <= 999,
  teamMode: (v): v is boolean => typeof v === "boolean",
  teams: (v): v is number => typeof v === "number" && v >= 2 && v <= 4,
  targetScore: (v): v is number | null => v === null || (typeof v === "number" && v >= 0 && v <= 100),
  handicapMode: (v): v is boolean => typeof v === "boolean",
  handicapScores: (v): v is Record<string, number> => {
    if (typeof v !== "object" || v === null) return false;
    return Object.entries(v).every(([k, val]) => typeof k === "string" && typeof val === "number" && val >= -10 && val <= 10);
  },
  battleTimer: (v): v is number | null => v === null || (typeof v === "number" && v >= 0 && v <= 3600),
  autoBattle: (v): v is boolean => typeof v === "boolean",
  autoBattleInterval: (v): v is number => typeof v === "number" && [1000, 2000, 3000, 5000, 10000].includes(v),
  soundEnabled: (v): v is boolean => typeof v === "boolean",
  customRules: (v): v is string[] => Array.isArray(v) && v.every((item) => typeof item === "string" && item.length <= 200),
};

/**
 * Validates a RuleConfig object against the schema
 * Returns sanitized config with only valid values, or null if invalid
 */
export function validateRuleConfig(config: unknown): RuleConfig | null {
  if (typeof config !== "object" || config === null) return null;

  const validated: Partial<RuleConfig> = {};

  for (const [key, validator] of Object.entries(RULE_CONFIG_SCHEMA)) {
    const value = (config as Record<string, unknown>)[key];
    if (validator(value)) {
      // Type narrowing ensures value matches the specific key's type
      // Use type assertion since validator is a type guard
      (validated as Record<string, unknown>)[key] = value;
    }
  }

  // Check all required fields are present
  const requiredKeys = Object.keys(RULE_CONFIG_SCHEMA) as (keyof RuleConfig)[];
  if (requiredKeys.every((k) => k in validated)) {
    return validated as RuleConfig;
  }

  return null;
}

/**
 * Validates and sanitizes a single localStorage item
 */
export function validateLocalStorageItem<T>(key: string, validator: (v: unknown) => v is T, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (validator(parsed)) return parsed;
    }
  } catch {}
  return fallback;
}

/**
 * Validates image file type
 */
export function isAllowedImageType(file: File): file is File & { type: AllowedImageType } {
  return ALLOWED_IMAGE_TYPES.includes(file.type as AllowedImageType);
}

/**
 * Safely loads an image from a URL using fetch + blob to avoid cross-origin issues
 * Returns object URL that should be revoked after use
 */
export async function loadImageSafely(url: string): Promise<string> {
  const response = await fetch(url, { mode: "cors", credentials: "omit" });
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);

  const contentType = response.headers.get("content-type");
  if (!contentType || !ALLOWED_IMAGE_TYPES.includes(contentType as AllowedImageType)) {
    throw new Error(`Invalid image type: ${contentType}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

/**
 * Sanitizes filename for safe download
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.{2,}/g, ".")
    .substring(0, 255);
}

/**
 * Validates imported rules JSON structure
 */
export function validateImportedRules(data: unknown): { rules: CustomRule[] } | null {
  if (typeof data !== "object" || data === null) return null;
  const obj = data as Record<string, unknown>;
  if (!Array.isArray(obj.rules)) return null;

  const validatedRules: CustomRule[] = [];
  for (const rule of obj.rules) {
    if (typeof rule === "object" && rule !== null) {
      const r = rule as Record<string, unknown>;
      if (
        typeof r.id === "string" &&
        typeof r.name === "string" &&
        typeof r.description === "string" &&
        typeof r.createdAt === "number" &&
        validateRuleConfig(r.config)
      ) {
        validatedRules.push({
          id: r.id,
          name: r.name.substring(0, 100),
          description: r.description.substring(0, 500),
          config: validateRuleConfig(r.config)!,
          createdAt: r.createdAt,
        });
      }
    }
  }
  return { rules: validatedRules };
}