import { RequestTab } from '../App';
import { getCombinedVariables, interpolateVariables } from '../helpers/variables';

export const handleUrlChange = (newUrl: string, updateTab: (updates: Partial<RequestTab>) => void) => {
  // Extract base URL (without query params)
  if (newUrl === '') {
    updateTab({
      url: newUrl,
      baseUrl: newUrl,
      queryParams: [],
      name: 'empty request',
    });
    return;
  }

  const [base, paramsString] = newUrl.split('?', 2);
  let params: Array<{checked: boolean; key: string; value: string }> = [];
  const paramsArray = paramsString?.split('&') ?? [];
  
  paramsArray.forEach((value) => {
    const [key, val] = value.split('=', 2);
    params.push({ checked: true, key: key || '', value: val || '' });
  });

  // Update tab name based on URL
  let newName = 'New Request';
  if (base.trim()) {
    newName = base;
  }

  // Update tab once with all changes
  updateTab({
    url: newUrl,
    baseUrl: base,
    queryParams: params,
    name: newName,
  });
};

export const handleSendRequest = async (
  currentTab: RequestTab,
  globalVariables: any,
  localVariables: any,
  activeLocalEnv: string,
  updateTab: (updates: Partial<RequestTab>) => void
) => {
  if (!currentTab || !currentTab.baseUrl.trim()) {
    if (currentTab) {
      updateTab({ error: 'Please enter a URL' });
    }
    return;
  }

  updateTab({ loading: true, error: '', response: '', headers: {}, responseInfo: null });

  try {
    const combined = getCombinedVariables(globalVariables, localVariables, activeLocalEnv);
    // First interpolate the base URL
    let baseUrlInterpolated = interpolateVariables(currentTab.baseUrl, combined);
    console.log('Base URL interpolated:', baseUrlInterpolated);

    // Build full URL with interpolated base and params
    const urlObj = new URL(baseUrlInterpolated.startsWith('http') ? baseUrlInterpolated : `https://${baseUrlInterpolated}`);

    currentTab.queryParams.forEach(param => {
      if (param.checked) {
        let key = interpolateVariables(param.key, combined);
        let value = interpolateVariables(param.value, combined);

        console.log('Processing param:', { original: param, interpolated: { key, value } });

        // Check if this is a key=value pair (for variables that contain full param pairs)
        if (key.includes('=') && !value) {
          // Split the key into actual key and value
          const [actualKey, actualValue] = key.split('=');
          if (actualKey && actualValue) {
            urlObj.searchParams.append(actualKey, actualValue);
            console.log('Added param from key=value pair:', actualKey, '=', actualValue);
          }
        } else if (value !== undefined || param.key?.includes('{{') || param.value?.includes('{{')) {
          // Normal key=value param
          urlObj.searchParams.append(key, value);
          console.log('Added normal param to URL:', key, '=', value);
        } else {
          urlObj.searchParams.append(key, '');
        }
      }
    });
    let fullUrl = urlObj.toString();

    let body = currentTab.body;

    // Interpolate variables in body
    body = interpolateVariables(body, combined);

    // Build headers with interpolated variables
    const requestHeaders: Record<string, string> = {};
    currentTab.requestHeaders.forEach(header => {
      if (header.key) {
        const interpolatedKey = interpolateVariables(header.key, combined);
        const interpolatedValue = interpolateVariables(header.value, combined);
        requestHeaders[interpolatedKey] = interpolatedValue;
      }
    });

    // Decode URL for display (remove URL encoding)
    const displayUrl = decodeURIComponent(fullUrl);

    const result = await window.electron.sendHttpRequest(fullUrl, currentTab.method, body, requestHeaders);

    updateTab({
      loading: false,
      response: result.body,
      headers: result.headers,
      responseInfo: {
        status: result.status,
        statusText: result.statusText,
        size: result.size,
        time: result.time,
      },
      sentUrl: displayUrl,
      error: '',
    });
  } catch (err) {
    console.error('Request error:', err);
    updateTab({
      error: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      loading: false,
      response: '',
      headers: {},
      responseInfo: null,
    });
  }
};