const getAIServiceBaseUrl = (): string => {
  return getAIServiceBaseUrlFromFunctions();
};

const getAIServiceBaseUrlFromHosting = (): string => {
  const backendBaseUrl = process.env.VITE_BACKEND_BASE_URL;

  if (!backendBaseUrl) {
    console.error("VITE_BACKEND_BASE_URL is not defined");
    return "";
  }

  return `${backendBaseUrl}/ai`;
};

const getAIServiceBaseUrlFromFunctions = (): string => {
  const backendFunctionBaseUrl = process.env.VITE_BACKEND_FUNCTION_BASE_URL;

  if (!backendFunctionBaseUrl) {
    console.error("VITE_BACKEND_FUNCTION_BASE_URL is not defined");
    return "";
  }

  return `${backendFunctionBaseUrl}/ai/ai`;
};

export const AI_ENDPOINTS = {
  TEST_GENERATION: "/test-cases/generate",
} as const;

export const getAIEndpointUrl = (endpoint: string): string => {
  return `${getAIServiceBaseUrl()}${endpoint}`;
};
