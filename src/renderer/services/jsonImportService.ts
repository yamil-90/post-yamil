/**
 * Validates and imports variables from a JSON file
 * @param fileContents The contents of the JSON file as a string
 * @returns Object with variables array or error message
 */
export const importVariablesFromJson = (
  fileContents: string
): { variables: Array<{ key: string; value: string }> | null; error: string | null } => {
  if (!fileContents) {
    return { variables: null, error: 'No file selected or file is empty' };
  }

  let jsonContents;
  try {
    jsonContents = JSON.parse(fileContents);
  } catch (parseError) {
    return { variables: null, error: 'Invalid JSON file format' };
  }

  if (!jsonContents.values || !Array.isArray(jsonContents.values)) {
    return { variables: null, error: 'JSON file must contain a "values" field (array)' };
  }

  // Validate array items have required structure
  const invalidItems = jsonContents.values.some(
    (item: any) => !item.key || typeof item.key !== 'string' || !item.value || typeof item.value !== 'string'
  );

  if (invalidItems) {
    return {
      variables: null,
      error: 'Each item in "values" must have "key" and "value" fields (both strings)',
    };
  }

  return { variables: jsonContents.values, error: null };
};

/**
 * Validates and imports environment data from a JSON file (with optional name)
 * @param fileContents The contents of the JSON file as a string
 * @returns Object with name, variables, and error
 */
export const importEnvironmentFromJson = (
  fileContents: string
): { name: string; variables: Array<{ key: string; value: string }> | null; error: string | null } => {
  if (!fileContents) {
    return { name: '', variables: null, error: 'No file selected or file is empty' };
  }

  let jsonContents;
  try {
    jsonContents = JSON.parse(fileContents);
  } catch (parseError) {
    return { name: '', variables: null, error: 'Invalid JSON file format' };
  }

  // Name is optional - leave blank if not provided
  if (jsonContents.name && typeof jsonContents.name !== 'string') {
    return { name: '', variables: null, error: '"name" field must be a string' };
  }

  if (!jsonContents.values || !Array.isArray(jsonContents.values)) {
    return { name: '', variables: null, error: 'JSON file must contain a "values" field (array)' };
  }

  // Validate array items have required structure
  const invalidItems = jsonContents.values.some(
    (item: any) => !item.key || typeof item.key !== 'string' || !item.value || typeof item.value !== 'string'
  );

  if (invalidItems) {
    return {
      name: '',
      variables: null,
      error: 'Each item in "values" must have "key" and "value" fields (both strings)',
    };
  }

  return { name: jsonContents.name || '', variables: jsonContents.values, error: null };
};
