import { RequestTab } from '../App';

interface ParsedCurl {
  url: string;
  method: string;
  headers: Array<{ checked: boolean; key: string; value: string }>;
  body?: string;
  queryParams: Array<{ checked: boolean; key: string; value: string }>;
}

/**
 * Detects if a string is a cURL command
 */
export const isCurlCommand = (input: string): boolean => {
  return input.trim().toLowerCase().startsWith('curl');
};

/**
 * Parses a cURL command and extracts method, URL, headers, body, and query params
 */
export const parseCurl = (curlCommand: string): ParsedCurl | null => {
  try {
    const trimmed = curlCommand.trim();
    if (!trimmed.toLowerCase().startsWith('curl')) {
      return null;
    }

    let url = '';
    let method = 'GET';
    const headers: Array<{ checked: boolean; key: string; value: string }> = [];
    let body = '';
    const queryParams: Array<{ checked: boolean; key: string; value: string }> = [];

    // Remove 'curl ' from the beginning
    let remaining = trimmed.substring(4).trim();

    // Handle line continuations (backslash at end of line)
    remaining = remaining.replace(/\\\s*\n\s*/g, ' ');

    // Tokenize the command, respecting quoted strings
    const tokens = tokenizeCurl(remaining);

    let i = 0;
    while (i < tokens.length) {
      const token = tokens[i];

      if (token === '-X' || token === '--request') {
        i++;
        method = tokens[i]?.toUpperCase() || 'GET';
      } else if (token === '-H' || token === '--header') {
        i++;
        const headerValue = tokens[i];
        if (headerValue) {
          const [key, ...valueParts] = headerValue.split(':');
          const value = valueParts.join(':').trim();
          if (key && value) {
            headers.push({ checked: true, key: key.trim(), value });
          }
        }
      } else if (token === '-d' || token === '--data' || token === '--data-raw') {
        i++;
        body = tokens[i] || '';
      } else if (token === '-G' || token === '--get') {
        method = 'GET';
      } else if (token === '-b' || token === '--cookie') {
        i++;
        const cookieValue = tokens[i];
        if (cookieValue) {
          headers.push({ checked: true, key: 'Cookie', value: cookieValue });
        }
      } else if (token === '-u' || token === '--user') {
        i++;
        const credentials = tokens[i];
        if (credentials) {
          const base64 = Buffer.from(credentials).toString('base64');
          headers.push({ checked: true, key: 'Authorization', value: `Basic ${base64}` });
        }
      } else if (!token.startsWith('-')) {
        // This is the URL (first non-flag argument)
        if (!url) {
          url = token;
        }
      }

      i++;
    }

    // Parse URL to extract query parameters
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      const baseUrl = url.startsWith('http') 
        ? urlObj.origin + urlObj.pathname 
        : urlObj.pathname;
      
      // Extract query params
      urlObj.searchParams.forEach((value, key) => {
        queryParams.push({ checked: true, key, value });
      });

      return {
        url: baseUrl || url,
        method,
        headers,
        body: body || undefined,
        queryParams,
      };
    } catch {
      // If URL parsing fails, return what we have
      return {
        url,
        method,
        headers,
        body: body || undefined,
        queryParams,
      };
    }
  } catch (error) {
    console.error('Error parsing cURL:', error);
    return null;
  }
};

/**
 * Tokenizes a cURL command, respecting quoted strings
 */
function tokenizeCurl(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let i = 0;

  while (i < input.length) {
    const char = input[i];
    const nextChar = input[i + 1];

    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      i++;
      continue;
    }

    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      i++;
      continue;
    }

    if ((char === ' ' || char === '\t') && !inSingleQuote && !inDoubleQuote) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      i++;
      continue;
    }

    current += char;
    i++;
  }

  if (current) {
    tokens.push(current);
  }

  return tokens;
}

/**
 * Applies parsed cURL data to a request tab
 */
export const applyCurlToTab = (tab: RequestTab, parsed: ParsedCurl): Partial<RequestTab> => {
  return {
    url: parsed.url,
    baseUrl: parsed.url,
    method: parsed.method,
    requestHeaders: parsed.headers,
    queryParams: parsed.queryParams,
    body: parsed.body || '',
    name: new URL(parsed.url.startsWith('http') ? parsed.url : `https://${parsed.url}`).hostname || 'Request',
  };
};
