import { getCombinedVariables, interpolateVariables } from "./variables";
import { Variable } from "../components/VariablesManager";
import { RequestTab } from "../App";

export const getDisplayUrl = (currentTab: RequestTab, globalVariables: Variable[], localVariables: Record<string, Variable[]>, activeLocalEnv: string): string => {
    if (!currentTab || !currentTab.baseUrl) return '';

    try {
      const combined = getCombinedVariables(globalVariables, localVariables, activeLocalEnv);
      let result = currentTab.baseUrl;

      // Build query string manually to handle key=value pairs correctly
      const queryParts: string[] = [];
      currentTab.queryParams.forEach(param => {
        if (param.key && param.checked) {
          // Include param if it has a value OR if the key/value contains a variable placeholder
          if (param.value != undefined || param.key.includes('{{') || param.value?.includes('{{')) {
            // Interpolate to get the actual value
            let interpolatedKey = interpolateVariables(param.key, combined);
            let interpolatedValue = interpolateVariables(param.value, combined);
            if (interpolatedKey.includes('=') && !interpolatedValue) {
              // Interpolated key already contains "=", add it as-is (don't add extra "=")
              queryParts.push(interpolatedKey);
            } else {
              // Normal key-value pair
              queryParts.push(`${interpolatedKey}=${interpolatedValue}`);
            }
          }
        } else if (!param.key && param.checked){
            queryParts.push(``);
        }
      });

      // Append query string if there are params
      if (queryParts.length > 0) {
        result += '?' + queryParts.join('&');
      }

      // Only remove protocol if the original baseUrl didn't have one
      if (!result.startsWith('http')) {
        result = result.replace(/^https?:\/\//, '');
      }

      // Remove trailing slash only if there are no query params
      if (!result.includes('?') && result.endsWith('/')) {
        result = result.slice(0, -1);
      }

      // Decode URL for display (remove URL encoding)
      return decodeURIComponent(result);
    } catch {
      return currentTab?.url || '';
    }
  };