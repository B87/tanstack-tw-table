import { describe, expect, it } from "vitest";
import { FilterOperator, getOperatorsForType, getOperatorDefinition } from "../FilterOperators";

describe("FilterOperators", () => {
  describe("getOperatorsForType", () => {
    it("should return string operators", () => {
      const operators = getOperatorsForType("string");

      expect(operators.length).toBeGreaterThan(0);
      expect(operators.some(op => op.value === FilterOperator.CONTAINS)).toBe(true);
      expect(operators.some(op => op.value === FilterOperator.EQUALS)).toBe(true);
    });

    it("should return number operators", () => {
      const operators = getOperatorsForType("number");

      expect(operators.some(op => op.value === FilterOperator.GREATER_THAN)).toBe(true);
      expect(operators.some(op => op.value === FilterOperator.LESS_THAN)).toBe(true);
    });
  });

  describe("getOperatorDefinition", () => {
    it("should return correct definition for CONTAINS operator", () => {
      const definition = getOperatorDefinition(FilterOperator.CONTAINS);

      expect(definition.value).toBe(FilterOperator.CONTAINS);
      expect(definition.label).toBe("Contains");
      expect(definition.requiresValue).toBe(true);
      expect(definition.supportedTypes).toEqual(["string"]);
      expect(definition.icon).toBe("⊃");
    });

    it("should return correct definition for EQUALS operator", () => {
      const definition = getOperatorDefinition(FilterOperator.EQUALS);

      expect(definition.value).toBe(FilterOperator.EQUALS);
      expect(definition.label).toBe("Equals");
      expect(definition.requiresValue).toBe(true);
      expect(definition.supportedTypes).toEqual(["string", "number", "date", "boolean"]);
      expect(definition.icon).toBe("=");
    });

    it("should return correct definition for IS_EMPTY operator (no value required)", () => {
      const definition = getOperatorDefinition(FilterOperator.IS_EMPTY);

      expect(definition.value).toBe(FilterOperator.IS_EMPTY);
      expect(definition.label).toBe("Is empty");
      expect(definition.requiresValue).toBe(false);
      expect(definition.supportedTypes).toEqual(["string"]);
      expect(definition.icon).toBe("∅");
    });

    it("should return correct definition for BETWEEN operator (requires second value)", () => {
      const definition = getOperatorDefinition(FilterOperator.BETWEEN);

      expect(definition.value).toBe(FilterOperator.BETWEEN);
      expect(definition.label).toBe("Between");
      expect(definition.requiresValue).toBe(true);
      expect(definition.requiresSecondValue).toBe(true);
      expect(definition.supportedTypes).toEqual(["number", "date"]);
      expect(definition.icon).toBe("⟷");
    });

    it("should return correct definition for GREATER_THAN operator (numeric/date)", () => {
      const definition = getOperatorDefinition(FilterOperator.GREATER_THAN);

      expect(definition.value).toBe(FilterOperator.GREATER_THAN);
      expect(definition.label).toBe("Greater than");
      expect(definition.requiresValue).toBe(true);
      expect(definition.supportedTypes).toEqual(["number", "date"]);
      expect(definition.icon).toBe(">");
    });

    it("should return correct definition for IS_TRUE operator (boolean)", () => {
      const definition = getOperatorDefinition(FilterOperator.IS_TRUE);

      expect(definition.value).toBe(FilterOperator.IS_TRUE);
      expect(definition.label).toBe("Is true");
      expect(definition.requiresValue).toBe(false);
      expect(definition.supportedTypes).toEqual(["boolean"]);
      expect(definition.icon).toBe("✓");
    });
  });
});
