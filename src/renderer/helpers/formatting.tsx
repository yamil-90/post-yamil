export const JsonHighlight = ({ json }: { json: string }) => {
  const colorize = (str: string) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
        let cls = 'number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'key';
          } else {
            cls = 'string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'boolean';
        } else if (/null/.test(match)) {
          cls = 'null';
        }
        return `<span class="json-${cls}">${match}</span>`;
      });
  };

  return (
    <pre
      className="json-response"
      dangerouslySetInnerHTML={{ __html: colorize(json) }}
    />
  );
};

export const getMethodColor = (method: string) => {
  switch (method) {
    case 'GET':
      return '#28a745';
    case 'POST':
      return '#007acc';
    case 'PUT':
      return '#ffc107';
    case 'DELETE':
      return '#dc3545';
    case 'PATCH':
      return '#6f42c1';
    case 'OPTIONS':
      return '#17a2b8';
    case 'HEAD':
      return '#6c757d';
    default:
      return '#6c757d';
  }
};


export const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  };
