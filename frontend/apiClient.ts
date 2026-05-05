const API_URL = '/api';

// Convert Date sang ISO string local (giữ đúng giờ user nhập, không convert UTC)
function toLocalISO(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// Deep replace Date objects thành local ISO string trước khi JSON.stringify
function convertDates(obj: any): any {
  if (obj instanceof Date) return toLocalISO(obj);
  if (Array.isArray(obj)) return obj.map(convertDates);
  if (obj && typeof obj === 'object') {
    const result: any = {};
    for (const key of Object.keys(obj)) {
      result[key] = convertDates(obj[key]);
    }
    return result;
  }
  return obj;
}

export const apiClient = {
  async get(endpoint: string, params: Record<string, any> = {}) {
    const url = new URL(`${window.location.origin}${API_URL}${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
  },

  async post(endpoint: string, body: any) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(convertDates(body))
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
  }
};
