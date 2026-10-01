import { Variable } from '../components/VariablesManager';


/**
 * Interpolates variables in a string using {{variable_name}} syntax
 * @param text The text containing variable placeholders
 * @param variables Array of variables to interpolate
 * @returns The text with variables replaced
 */
export const interpolateVariables = (text: string, variables: Variable[]): string => {
  let result = text;
  // Create a map for faster lookup
  const varMap = new Map(variables.map(v => [v.key, v.value]));

  // Find all {{variable_name}} patterns and replace them
  result = result?.replace(/\{\{([\w-]+)\}\}/g, (match, varName) => {
    const value = varMap.get(varName);
    return value !== undefined ? value : match; // If variable not found, keep the original
  });

  return result;
};

/**
 * Extracts variable placeholders from a string
 * @param text The text to search for variables
 * @returns Array of variable names found
 */
export const extractVariablesUsed = (text: string): string[] => {
  const matches = text.match(/\{\{(\w+)\}\}/g) || [];
  return matches.map(m => m.replace(/[{}]/g, ''));
};

/**
 * Validates if a variable name is valid (alphanumeric and underscores)
 * @param name The variable name to validate
 * @returns true if valid, false otherwise
 */
export const isValidVariableName = (name: string): boolean => {
  return /^\w+$/.test(name);
};

/**
 * Combines global and active local environment variables
 * @param globalVariables Array of global variables
 * @param localVariables Record of local environment variables
 * @param activeLocalEnv The currently active local environment name
 * @returns Combined array of all available variables
 */
export const getCombinedVariables = (
  globalVariables: Variable[],
  localVariables: Record<string, Variable[]>,
  activeLocalEnv: string
): Variable[] => {
  const combined = [...globalVariables];
  if (activeLocalEnv && localVariables[activeLocalEnv]) {
    combined.push(...localVariables[activeLocalEnv]);
  }
  return combined;
};
