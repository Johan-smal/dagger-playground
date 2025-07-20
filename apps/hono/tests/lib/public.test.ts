import { describe, it, expect } from "bun:test";
import { generateTailwind, generateJS } from "@/lib/public";

describe("generateTailwind", () => {
  it("should build Tailwind CSS", async () => {
    const artifact = await generateTailwind();
    expect(artifact).toBeDefined();
    expect(artifact.path).toMatch(/\.css$/);
    expect(artifact.kind).toBe("asset");
    expect(artifact.size).toBeGreaterThan(0);
  });
});

describe("generateJS", () => {
  it("should compile TypeScript using rspack", async () => {
    const outputMap = await generateJS();
    expect(outputMap).toBeInstanceOf(Map);
    expect(outputMap.has("/main.js")).toBe(true);

    const blob = outputMap.get("/main.js");
    expect(blob?.type).toBe("text/javascript;charset=utf-8");

    const text = await blob?.text();
    expect(text).toContain("console.log");
  });
});
