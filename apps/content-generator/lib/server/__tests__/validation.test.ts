import { describe, expect, it } from "vitest";

import {
  MAX_TAGS,
  MAX_TAG_LENGTH,
  isValidContentType,
  sanitizeName,
  sanitizeOptionalText,
  sanitizeTags,
} from "../validation";

describe("isValidContentType", () => {
  it("accepts all whitelisted content types", () => {
    expect(isValidContentType("blog")).toBe(true);
    expect(isValidContentType("product")).toBe(true);
    expect(isValidContentType("email")).toBe(true);
    expect(isValidContentType("social")).toBe(true);
    expect(isValidContentType("summary")).toBe(true);
  });

  it("rejects unknown values", () => {
    expect(isValidContentType("blog ")).toBe(false);
    expect(isValidContentType("BLOG")).toBe(false);
    expect(isValidContentType("article")).toBe(false);
    expect(isValidContentType("")).toBe(false);
    expect(isValidContentType(null)).toBe(false);
    expect(isValidContentType(undefined)).toBe(false);
    expect(isValidContentType(123)).toBe(false);
  });
});

describe("sanitizeName", () => {
  it("trims whitespace and enforces max length", () => {
    expect(sanitizeName("  hello world  ")).toBe("hello world");
    expect(sanitizeName("a".repeat(200), 50)?.length).toBe(50);
  });

  it("returns null for blank or non-string input", () => {
    expect(sanitizeName("")).toBeNull();
    expect(sanitizeName("   ")).toBeNull();
    expect(sanitizeName(null)).toBeNull();
    expect(sanitizeName(123)).toBeNull();
  });
});

describe("sanitizeOptionalText", () => {
  it("returns null for null/undefined/empty", () => {
    expect(sanitizeOptionalText(null, 100)).toBeNull();
    expect(sanitizeOptionalText(undefined, 100)).toBeNull();
    expect(sanitizeOptionalText("   ", 100)).toBeNull();
  });

  it("trims and truncates", () => {
    expect(sanitizeOptionalText("  hi  ", 100)).toBe("hi");
    expect(sanitizeOptionalText("a".repeat(200), 10)?.length).toBe(10);
  });

  it("rejects non-string values that are not nullish", () => {
    expect(sanitizeOptionalText(42, 100)).toBeNull();
  });
});

describe("sanitizeTags", () => {
  it("deduplicates, trims, and truncates", () => {
    const tags = sanitizeTags(["alpha", " alpha ", "beta", "", null, "gamma"]);
    expect(tags).toEqual(["alpha", "beta", "gamma"]);
  });

  it("enforces max tag count and length", () => {
    const overflow = Array.from({ length: MAX_TAGS + 5 }, (_, idx) => `t${idx}`);
    expect(sanitizeTags(overflow)).toHaveLength(MAX_TAGS);

    const long = "x".repeat(MAX_TAG_LENGTH + 20);
    expect(sanitizeTags([long])[0]).toHaveLength(MAX_TAG_LENGTH);
  });

  it("returns empty array for non-array input", () => {
    expect(sanitizeTags(null)).toEqual([]);
    expect(sanitizeTags("alpha,beta")).toEqual([]);
    expect(sanitizeTags(undefined)).toEqual([]);
  });
});
