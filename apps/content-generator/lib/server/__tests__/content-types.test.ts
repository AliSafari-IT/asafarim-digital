import { describe, expect, it } from "vitest";

import { normalizeContentTypeSlug } from "../validation";

describe("normalizeContentTypeSlug", () => {
  it("lowercases and trims", () => {
    expect(normalizeContentTypeSlug("  Blog  ")).toBe("blog");
    expect(normalizeContentTypeSlug("PRODUCT")).toBe("product");
  });

  it("converts whitespace to hyphens", () => {
    expect(normalizeContentTypeSlug("press release")).toBe("press-release");
    expect(normalizeContentTypeSlug("Long  Form  Article")).toBe("long-form-article");
  });

  it("strips disallowed characters", () => {
    expect(normalizeContentTypeSlug("press, release!")).toBe("press-release");
    expect(normalizeContentTypeSlug("hello@world")).toBe("helloworld");
  });

  it("preserves underscores and hyphens", () => {
    expect(normalizeContentTypeSlug("blog_post")).toBe("blog_post");
    expect(normalizeContentTypeSlug("blog-post")).toBe("blog-post");
  });

  it("trims leading/trailing separators", () => {
    expect(normalizeContentTypeSlug("--blog--")).toBe("blog");
    expect(normalizeContentTypeSlug("__blog__")).toBe("blog");
  });

  it("returns null for empty/invalid values", () => {
    expect(normalizeContentTypeSlug("")).toBeNull();
    expect(normalizeContentTypeSlug("   ")).toBeNull();
    expect(normalizeContentTypeSlug("---")).toBeNull();
    expect(normalizeContentTypeSlug("!!!")).toBeNull();
    expect(normalizeContentTypeSlug(null)).toBeNull();
    expect(normalizeContentTypeSlug(123)).toBeNull();
  });

  it("enforces max length (64 chars)", () => {
    const long = "a".repeat(80);
    const slug = normalizeContentTypeSlug(long);
    expect(slug?.length).toBe(64);
  });

  it("requires alphanumeric start", () => {
    expect(normalizeContentTypeSlug("-blog")).toBe("blog");
    expect(normalizeContentTypeSlug("_blog")).toBe("blog");
  });
});
