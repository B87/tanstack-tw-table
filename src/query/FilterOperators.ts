export enum FilterOperator {
  // String operations
  EQUALS = "eq",
  NOT_EQUALS = "ne",
  CONTAINS = "contains",
  NOT_CONTAINS = "not_contains",
  STARTS_WITH = "starts_with",
  ENDS_WITH = "ends_with",
  IS_EMPTY = "is_empty",
  IS_NOT_EMPTY = "is_not_empty",

  // Numeric/Date operations
  GREATER_THAN = "gt",
  GREATER_THAN_OR_EQUAL = "gte",
  LESS_THAN = "lt",
  LESS_THAN_OR_EQUAL = "lte",
  BETWEEN = "between",
  NOT_BETWEEN = "not_between",

  // Array operations
  IN = "in",
  NOT_IN = "not_in",

  // Null operations
  IS_NULL = "is_null",
  IS_NOT_NULL = "is_not_null",

  // Boolean operations
  IS_TRUE = "is_true",
  IS_FALSE = "is_false",

  // Date-specific operations
  DATE_EQUALS = "date_equals",
  DATE_BEFORE = "date_before",
  DATE_AFTER = "date_after",
  DATE_BETWEEN = "date_between",
}

export interface FilterOperatorDefinition {
  value: FilterOperator;
  label: string;
  description: string;
  supportedTypes: ("string" | "number" | "date" | "boolean" | "array")[];
  requiresValue: boolean;
  requiresSecondValue?: boolean; // For BETWEEN operations
  icon?: string;
}

export const FILTER_OPERATOR_DEFINITIONS: Record<FilterOperator, FilterOperatorDefinition> = {
  [FilterOperator.EQUALS]: {
    value: FilterOperator.EQUALS,
    label: "Equals",
    description: "Exactly matches the value",
    supportedTypes: ["string", "number", "date", "boolean"],
    requiresValue: true,
    icon: "=",
  },
  [FilterOperator.NOT_EQUALS]: {
    value: FilterOperator.NOT_EQUALS,
    label: "Not equals",
    description: "Does not match the value",
    supportedTypes: ["string", "number", "date", "boolean"],
    requiresValue: true,
    icon: "≠",
  },
  [FilterOperator.CONTAINS]: {
    value: FilterOperator.CONTAINS,
    label: "Contains",
    description: "Contains the text (case-insensitive)",
    supportedTypes: ["string"],
    requiresValue: true,
    icon: "⊃",
  },
  [FilterOperator.NOT_CONTAINS]: {
    value: FilterOperator.NOT_CONTAINS,
    label: "Does not contain",
    description: "Does not contain the text",
    supportedTypes: ["string"],
    requiresValue: true,
    icon: "⊅",
  },
  [FilterOperator.STARTS_WITH]: {
    value: FilterOperator.STARTS_WITH,
    label: "Starts with",
    description: "Starts with the text",
    supportedTypes: ["string"],
    requiresValue: true,
    icon: "⟶",
  },
  [FilterOperator.ENDS_WITH]: {
    value: FilterOperator.ENDS_WITH,
    label: "Ends with",
    description: "Ends with the text",
    supportedTypes: ["string"],
    requiresValue: true,
    icon: "⟵",
  },
  [FilterOperator.IS_EMPTY]: {
    value: FilterOperator.IS_EMPTY,
    label: "Is empty",
    description: "Is empty or null",
    supportedTypes: ["string"],
    requiresValue: false,
    icon: "∅",
  },
  [FilterOperator.IS_NOT_EMPTY]: {
    value: FilterOperator.IS_NOT_EMPTY,
    label: "Is not empty",
    description: "Has a value",
    supportedTypes: ["string"],
    requiresValue: false,
    icon: "≠∅",
  },
  [FilterOperator.GREATER_THAN]: {
    value: FilterOperator.GREATER_THAN,
    label: "Greater than",
    description: "Greater than the value",
    supportedTypes: ["number", "date"],
    requiresValue: true,
    icon: ">",
  },
  [FilterOperator.GREATER_THAN_OR_EQUAL]: {
    value: FilterOperator.GREATER_THAN_OR_EQUAL,
    label: "Greater than or equal",
    description: "Greater than or equal to the value",
    supportedTypes: ["number", "date"],
    requiresValue: true,
    icon: "≥",
  },
  [FilterOperator.LESS_THAN]: {
    value: FilterOperator.LESS_THAN,
    label: "Less than",
    description: "Less than the value",
    supportedTypes: ["number", "date"],
    requiresValue: true,
    icon: "<",
  },
  [FilterOperator.LESS_THAN_OR_EQUAL]: {
    value: FilterOperator.LESS_THAN_OR_EQUAL,
    label: "Less than or equal",
    description: "Less than or equal to the value",
    supportedTypes: ["number", "date"],
    requiresValue: true,
    icon: "≤",
  },
  [FilterOperator.BETWEEN]: {
    value: FilterOperator.BETWEEN,
    label: "Between",
    description: "Between two values (inclusive)",
    supportedTypes: ["number", "date"],
    requiresValue: true,
    requiresSecondValue: true,
    icon: "⟷",
  },
  [FilterOperator.NOT_BETWEEN]: {
    value: FilterOperator.NOT_BETWEEN,
    label: "Not between",
    description: "Not between two values",
    supportedTypes: ["number", "date"],
    requiresValue: true,
    requiresSecondValue: true,
    icon: "⟷̸",
  },
  [FilterOperator.IN]: {
    value: FilterOperator.IN,
    label: "In list",
    description: "Matches any value in the list",
    supportedTypes: ["string", "number", "array"],
    requiresValue: true,
    icon: "∈",
  },
  [FilterOperator.NOT_IN]: {
    value: FilterOperator.NOT_IN,
    label: "Not in list",
    description: "Does not match any value in the list",
    supportedTypes: ["string", "number", "array"],
    requiresValue: true,
    icon: "∉",
  },
  [FilterOperator.IS_NULL]: {
    value: FilterOperator.IS_NULL,
    label: "Is null",
    description: "Is null or undefined",
    supportedTypes: ["string", "number", "date", "boolean"],
    requiresValue: false,
    icon: "ø",
  },
  [FilterOperator.IS_NOT_NULL]: {
    value: FilterOperator.IS_NOT_NULL,
    label: "Is not null",
    description: "Has a value (not null)",
    supportedTypes: ["string", "number", "date", "boolean"],
    requiresValue: false,
    icon: "≠ø",
  },
  [FilterOperator.IS_TRUE]: {
    value: FilterOperator.IS_TRUE,
    label: "Is true",
    description: "Is true",
    supportedTypes: ["boolean"],
    requiresValue: false,
    icon: "✓",
  },
  [FilterOperator.IS_FALSE]: {
    value: FilterOperator.IS_FALSE,
    label: "Is false",
    description: "Is false",
    supportedTypes: ["boolean"],
    requiresValue: false,
    icon: "✗",
  },
  [FilterOperator.DATE_EQUALS]: {
    value: FilterOperator.DATE_EQUALS,
    label: "On date",
    description: "Exactly matches the date",
    supportedTypes: ["date"],
    requiresValue: true,
    icon: "📅",
  },
  [FilterOperator.DATE_BEFORE]: {
    value: FilterOperator.DATE_BEFORE,
    label: "Before date",
    description: "Before the specified date",
    supportedTypes: ["date"],
    requiresValue: true,
    icon: "◀️",
  },
  [FilterOperator.DATE_AFTER]: {
    value: FilterOperator.DATE_AFTER,
    label: "After date",
    description: "After the specified date",
    supportedTypes: ["date"],
    requiresValue: true,
    icon: "▶️",
  },
  [FilterOperator.DATE_BETWEEN]: {
    value: FilterOperator.DATE_BETWEEN,
    label: "Between dates",
    description: "Between two dates (inclusive)",
    supportedTypes: ["date"],
    requiresValue: true,
    requiresSecondValue: true,
    icon: "📅📅",
  },
};

/**
 * Get available operators for a specific data type
 */
export function getOperatorsForType(
  type: "string" | "number" | "date" | "boolean" | "array"
): FilterOperatorDefinition[] {
  return Object.values(FILTER_OPERATOR_DEFINITIONS).filter(op => op.supportedTypes.includes(type));
}

/**
 * Get operator definition by value
 */
export function getOperatorDefinition(operator: FilterOperator): FilterOperatorDefinition {
  return FILTER_OPERATOR_DEFINITIONS[operator];
}

/**
 * Check if operator requires a value
 */
export function operatorRequiresValue(operator: FilterOperator): boolean {
  return FILTER_OPERATOR_DEFINITIONS[operator].requiresValue;
}

/**
 * Check if operator requires a second value (for BETWEEN operations)
 */
export function operatorRequiresSecondValue(operator: FilterOperator): boolean {
  return FILTER_OPERATOR_DEFINITIONS[operator].requiresSecondValue ?? false;
}
