// This module handles all validation logic for API configuration
// It returns both validation status and helpful error messages

export const validateBaseURL = (url) => {
  // If URL is empty, return error
  if (!url?.trim()) {
    return {
      isValid: false,
      message: "Base URL is required",
    };
  }

  try {
    // Try to construct a URL object to validate format
    const urlObject = new URL(url);

    // Check if it's using HTTP/HTTPS protocol
    if (!["http:", "https:"].includes(urlObject.protocol)) {
      return {
        isValid: false,
        message: "URL must use HTTP or HTTPS protocol",
      };
    }

    // Check if URL has a valid domain
    if (!urlObject.hostname) {
      return {
        isValid: false,
        message: "URL must include a valid domain",
      };
    }

    return {
      isValid: true,
      message: "",
    };
  } catch (error) {
    return {
      isValid: false,
      message: "Please enter a valid URL",
    };
  }
};

export const validateAuthDetails = (authType, authDetails) => {
  switch (authType) {
    case "apiKey":
      if (!authDetails.apiKey?.trim()) {
        return {
          isValid: false,
          message: "API key is required",
        };
      }
      if (!authDetails.headerName?.trim()) {
        return {
          isValid: false,
          message: "Header name is required",
        };
      }
      break;

    case "bearer":
      if (!authDetails.apiKey?.trim()) {
        return {
          isValid: false,
          message: "Bearer token is required",
        };
      }
      break;

    case "basic":
      if (!authDetails.username?.trim() || !authDetails.password?.trim()) {
        return {
          isValid: false,
          message: "Username and password are required",
        };
      }
      break;

    case "none":
      return { isValid: true, message: "" };

    default:
      return {
        isValid: false,
        message: "Invalid authentication type",
      };
  }

  return { isValid: true, message: "" };
};

export const validateAPIConfiguration = (config) => {
  // Validate base URL first
  const baseURLValidation = validateBaseURL(config.baseURL);
  if (!baseURLValidation.isValid) {
    return baseURLValidation;
  }

  // Then validate authentication if needed
  const authValidation = validateAuthDetails(config.authType, config.authDetails);
  if (!authValidation.isValid) {
    return authValidation;
  }

  return { isValid: true, message: "" };
};
