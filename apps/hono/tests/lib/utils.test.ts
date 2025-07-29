import { describe, it, expect } from "bun:test";
import { normalizeFilters } from "@/lib/utils";

describe("normalizeFilters", () => {
  it("should handle eq, gt, lt, gte, lte, contains", () => {
    const input = {
      "age[eq]": "30",
      "score[gt]": "100",
      "name[contains]": "John",
      "height[lte]": "180"
    };
    const result = normalizeFilters(input);
    expect(result.age.eq).toBe(30);
    expect(result.score.gt).toBe(100);
    expect(result.name.contains).toBe("John");
    expect(result.height.lte).toBe(180);
  });

  it("should handle 'in' operator with string and array", () => {
    const input1 = { "status[in]": "active,inactive" };
    const input2 = { "status[in]": ["active", "inactive"] };
    expect(normalizeFilters(input1).status.in).toEqual(["active", "inactive"]);
    expect(normalizeFilters(input2).status.in).toEqual(["active", "inactive"]);
  });

  it("should handle 'between' operator with string and array", () => {
    const input1 = { "date[between]": "2020-01-01,2020-12-31" };
    const input2 = { "date[between]": ["2020-01-01", "2020-12-31"] };
    expect(normalizeFilters(input1).date.between).toEqual(["2020-01-01", "2020-12-31"]);
    expect(normalizeFilters(input2).date.between).toEqual(["2020-01-01", "2020-12-31"]);
  });

  it("should throw on invalid 'between' values", () => {
    const input = { "date[between]": "2020-01-01" };
    expect(() => normalizeFilters(input)).toThrow();
  });

  it("should not ignore keys without operator brackets", () => {
    const input = { "foo": "bar", "age[eq]": "42" };
    const result = normalizeFilters(input);
    expect(result.foo).toBe("bar");
    expect(result.age.eq).toBe(42);
  });

  it("should handle numeric and string values correctly", () => {
    const input = { "id[eq]": "123", "name[eq]": "Alice" };
    const result = normalizeFilters(input);
    expect(result.id.eq).toBe(123);
    expect(result.name.eq).toBe("Alice");
  });
});
