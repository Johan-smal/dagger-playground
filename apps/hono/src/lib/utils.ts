type FilterOperator = "eq" | "gt" | "lt" | "gte" | "lte" | "in" | "between" | "contains";

type FilterValue = string | number | [string, string] | string[];

type NormalizedFilters = Record<string, Partial<Record<FilterOperator, FilterValue>>>;

export const normalizeFilters = (input: Record<string, string | string[]>): NormalizedFilters & Record<string, any> => {
  const output: any = {};

  for (const [key, rawValue] of Object.entries(input)) {
    const match = key.match(/^(.+)\[(.+)\]$/);
    if (!match) {
      // Copy keys without operator brackets as-is
      output[key] = !isNaN(Number(rawValue)) && typeof rawValue === "string" ? Number(rawValue) : rawValue;
      continue;
    }

    const [, field, op] = match;
    const operator = op as FilterOperator;

    let value: FilterValue;

    // Handle special cases
    if (operator === "in") {
      value = Array.isArray(rawValue) ? rawValue : rawValue.split(",");
    } else if (operator === "between") {
      const parts = Array.isArray(rawValue) ? rawValue : rawValue.split(",");
      if (parts.length !== 2) {
        throw new Error(`'between' requires exactly 2 values: ${rawValue}`);
      }
      value = [parts[0], parts[1]];
    } else if (!isNaN(Number(rawValue))) {
      value = Number(rawValue);
    } else {
      value = rawValue;
    }

    if (!output[field]) output[field] = {};
    output[field][operator] = value;
  }

  return output;
}
