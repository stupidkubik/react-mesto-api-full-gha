const DEFAULT_API_BASE_URL = 'http://localhost:3000';

function getApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  const baseUrl = configuredBaseUrl || DEFAULT_API_BASE_URL;

  return baseUrl.replace(/\/+$/, '');
}

const runtimeConfig = {
  apiBaseUrl: getApiBaseUrl(),
};

export default runtimeConfig;
