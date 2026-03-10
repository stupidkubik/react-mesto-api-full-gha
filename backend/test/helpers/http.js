async function requestJson(baseUrl, path, {
  method = 'GET',
  token,
  body,
} = {}) {
  const headers = {};

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();

  return {
    response,
    status: response.status,
    body: text ? JSON.parse(text) : null,
  };
}

module.exports = {
  requestJson,
};
