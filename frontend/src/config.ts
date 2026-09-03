export const API_BASE_URL = ((import.meta as any).env?.VITE_API_URL as string) || '';

export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (API_BASE_URL) {
    return `${API_BASE_URL.replace(/\/$/, '')}/api${cleanPath}`;
  }
  const host = typeof window !== 'undefined' ? (window.location.hostname || '127.0.0.1') : '127.0.0.1';
  if (host === 'localhost' || host === '127.0.0.1') {
    return `http://${host}:8000/api${cleanPath}`;
  }
  return `/api${cleanPath}`;
};

export const getWsUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (API_BASE_URL) {
    const wsProto = API_BASE_URL.startsWith('https') ? 'wss:' : 'ws:';
    const host = API_BASE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return `${wsProto}//${host}/api${cleanPath}`;
  }
  const host = typeof window !== 'undefined' ? (window.location.hostname || '127.0.0.1') : '127.0.0.1';
  if (host === 'localhost' || host === '127.0.0.1') {
    return `ws://${host}:8000/api${cleanPath}`;
  }
  const wsProto = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const locationHost = typeof window !== 'undefined' ? window.location.host : 'localhost:3000';
  return `${wsProto}//${locationHost}/api${cleanPath}`;
};
