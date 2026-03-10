function createJsonResponse(body, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

function installFetchMock(handler) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation((input, options) => {
    const url = typeof input === 'string' ? input : input.toString();
    return handler(url, options ?? {});
  });
}

export { createJsonResponse, installFetchMock };
