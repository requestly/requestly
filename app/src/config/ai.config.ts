const getAIServiceBaseUrl = (): string => {
  const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

  if (!backendBaseUrl) {
    console.error("VITE_BACKEND_BASE_URL is not defined");
    return "";
  }

  return `${backendBaseUrl}/ai`;
};

export const AI_ENDPOINTS = {
  TEST_GENERATION: "/test-cases/generate",
} as const;

export const getAIEndpointUrl = (endpoint: string): string => {
  return `${getAIServiceBaseUrl()}${endpoint}`;
};
