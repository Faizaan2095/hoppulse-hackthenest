async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.error || `Request failed (${res.status})`);
  }
  return body;
}

export const api = {
  shop: (code) => request(`/shops/${encodeURIComponent(code)}`),
  calls: (code) => request(`/shops/${encodeURIComponent(code)}/calls`),
  setDone: (code, id, isDone) =>
    request(`/shops/${code}/calls/${id}`, { method: 'PATCH', body: JSON.stringify({ is_done: isDone }) }),
  pickUp: (code, id) => request(`/shops/${code}/calls/${id}/pickup`, { method: 'POST' }),
  system: () => request('/system'),
};
