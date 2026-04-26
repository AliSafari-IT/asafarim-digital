import { describe, expect, it } from "vitest";

import {
  MAX_TAGS,
  MAX_TAG_LENGTH,
  isLikelyContentTypeSlug,
  sanitizeName,
  sanitizeOptionalText,
  sanitizeTags,
} from "../validation";

// Note: content-type validation is no longer a hard-coded whitelist. Whether a
// specific slug is *available* depends on system + user/tenant ownership and
// is checked via assertContentTypeAvailable. isLikelyContentTypeSlug only
// confirms the value can become a valid slug.
describe("isLikelyContentTypeSlug", () => {
  it("accepts well-formed slugs", () => {
    expect(isLikelyContentTypeSlug("blog")).toBe(true);
    expect(isLikelyContentTypeSlug("press-release")).toBe(true);
    expect(isLikelyContentTypeSlug("blog_post")).toBe(true);
    // Custom types like 'article' are now syntactically valid; availability is
    // enforced separately by assertContentTypeAvailable against the DB.
    expect(isLikelyContentTypeSlug("article")).toBe(true);
  });

  it("rejects invalid input", () => {
    expect(isLikelyContentTypeSlug("")).toBe(false);
    expect(isLikelyContentTypeSlug("   ")).toBe(false);
    expect(isLikelyContentTypeSlug("---")).toBe(false);
    expect(isLikelyContentTypeSlug(null)).toBe(false);
    expect(isLikelyContentTypeSlug(undefined)).toBe(false);
    expect(isLikelyContentTypeSlug(123)).toBe(false);
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
