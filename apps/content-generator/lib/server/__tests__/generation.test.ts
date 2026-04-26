import { describe, expect, it } from "vitest";

import { buildSystemPrompt, buildUserPrompt } from "../generation";

describe("buildSystemPrompt", () => {
  it("returns the brand-safe default when no context is supplied", () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain("expert SaaS content writer");
    expect(prompt).not.toContain("Additional guidance");
  });

  it("appends the type's systemPrompt as additional guidance", () => {
    const prompt = buildSystemPrompt({
      slug: "press-release",
      label: "Press Release",
      systemPrompt: "Always lead with the news angle.",
    });
    expect(prompt).toContain("expert SaaS content writer");
    expect(prompt).toContain("Additional guidance for Press Release");
    expect(prompt).toContain("Always lead with the news angle.");
  });
});

describe("buildUserPrompt", () => {
  it("works with a plain slug for backwards compatibility", () => {
    const prompt = buildUserPrompt("blog", "Write something useful.");
    expect(prompt).toContain("Content type: blog (blog)");
    expect(prompt).toContain("Write something useful.");
  });

  it("includes label, description and instructions when provided", () => {
    const prompt = buildUserPrompt(
      {
        slug: "press-release",
        label: "Press Release",
        description: "Newsworthy short-form announcement",
        promptInstructions: "Lead with the headline.",
      },
      "Announce v2 launch.",
    );
    expect(prompt).toContain("Content type: Press Release (press-release)");
    expect(prompt).toContain("Description: Newsworthy short-form announcement");
    expect(prompt).toContain("Instructions: Lead with the headline.");
    expect(prompt).toContain("Announce v2 launch.");
  });
});
