// APIConfiguration component handles the first step of API translation process
// It collects basic API information and authentication details from users

import React, { useState } from "react";
import { Input, Select, Switch } from "antd";
import { RQButton } from "lib/design-system-v2/components";
import "./apiConfiguration.scss";

const APIConfiguration = ({ onNext }) => {
  // Main configuration state that holds all API-related information
  const [config, setConfig] = useState({
    baseURL: "",
    authType: "none",
    authDetails: {
      apiKey: "",
      headerName: "Authorization",
      prefix: "Bearer",
    },
    discoveryMode: "auto",
    customHeaders: {},
  });

  // Separate state for validation errors to handle form feedback
  const [validationError, setValidationError] = useState("");

  // Available authentication types that users can choose from
  const authTypes = [
    { value: "none", label: "No Authentication" },
    { value: "apiKey", label: "API Key" },
    { value: "bearer", label: "Bearer Token" },
    { value: "basic", label: "Basic Auth" },
  ];

  // Helper component for consistent form field rendering
  const FormField = ({ label, children, help, error, required }) => (
    <div className="form-field">
      <div className="field-label">
        {label}
        {required && <span className="required-mark">*</span>}
      </div>
      {children}
      {(help || error) && <div className={`field-message ${error ? "error" : ""}`}>{error || help}</div>}
    </div>
  );

  // Handler for base URL input changes
  const handleBaseURLChange = (e) => {
    const newURL = e.target.value;
    setConfig({
      ...config,
      baseURL: newURL,
    });

    // Validate URL as user types
    if (newURL) {
      try {
        new URL(newURL);
        setValidationError("");
      } catch {
        setValidationError("Please enter a valid URL");
      }
    } else {
      setValidationError("Base URL is required");
    }
  };

  // Handler for authentication type changes
  const handleAuthTypeChange = (value) => {
    setConfig({
      ...config,
      authType: value,
      // Reset auth details when changing type
      authDetails: {
        apiKey: "",
        headerName: "Authorization",
        prefix: "Bearer",
      },
    });
  };

  // Renders the appropriate authentication form based on selected type
  const renderAuthenticationForm = () => {
    switch (config.authType) {
      case "apiKey":
        return (
          <>
            <FormField label="API Key" required>
              <Input
                value={config.authDetails.apiKey}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    authDetails: {
                      ...config.authDetails,
                      apiKey: e.target.value,
                    },
                  })
                }
                placeholder="Enter your API key"
                className="api-input"
              />
            </FormField>
            <FormField label="Header Name">
              <Input
                value={config.authDetails.headerName}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    authDetails: {
                      ...config.authDetails,
                      headerName: e.target.value,
                    },
                  })
                }
                placeholder="X-API-Key"
                className="api-input"
              />
            </FormField>
          </>
        );

      case "bearer":
        return (
          <FormField label="Bearer Token" required>
            <Input
              value={config.authDetails.apiKey}
              onChange={(e) =>
                setConfig({
                  ...config,
                  authDetails: {
                    ...config.authDetails,
                    apiKey: e.target.value,
                  },
                })
              }
              placeholder="Enter your bearer token"
              className="api-input"
            />
          </FormField>
        );

      case "basic":
        return (
          <>
            <FormField label="Username" required>
              <Input
                value={config.authDetails.username}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    authDetails: {
                      ...config.authDetails,
                      username: e.target.value,
                    },
                  })
                }
                placeholder="Enter username"
                className="api-input"
              />
            </FormField>
            <FormField label="Password" required>
              <Input.Password
                value={config.authDetails.password}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    authDetails: {
                      ...config.authDetails,
                      password: e.target.value,
                    },
                  })
                }
                placeholder="Enter password"
                className="api-input"
              />
            </FormField>
          </>
        );

      default:
        return null;
    }
  };

  // Validates the entire form before submission
  const validateForm = () => {
    if (!config.baseURL) {
      setValidationError("Base URL is required");
      return false;
    }

    try {
      new URL(config.baseURL);
    } catch {
      setValidationError("Please enter a valid URL");
      return false;
    }

    // Validate auth details if authentication is required
    if (config.authType !== "none") {
      if (config.authType === "apiKey" && !config.authDetails.apiKey) {
        setValidationError("API key is required");
        return false;
      }
      if (config.authType === "bearer" && !config.authDetails.apiKey) {
        setValidationError("Bearer token is required");
        return false;
      }
      if (config.authType === "basic" && (!config.authDetails.username || !config.authDetails.password)) {
        setValidationError("Username and password are required");
        return false;
      }
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      onNext(config);
    }
  };

  return (
    <div className="api-configuration">
      {/* API Details Section */}
      <div className="section">
        <h2>API Details</h2>
        <p className="section-description">Enter your REST API details to begin the translation process.</p>

        <div className="form-group">
          <FormField label="Base URL" required help="The root URL of your REST API" error={validationError}>
            <Input
              value={config.baseURL}
              onChange={handleBaseURLChange}
              placeholder="https://api.example.com/v1"
              className="api-input"
              status={validationError ? "error" : ""}
            />
          </FormField>
        </div>
      </div>

      {/* Authentication Section */}
      <div className="section">
        <h2>Authentication</h2>
        <p className="section-description">Configure how to authenticate requests to your API.</p>

        <div className="form-group">
          <FormField label="Authentication Type">
            <Select
              value={config.authType}
              onChange={handleAuthTypeChange}
              options={authTypes}
              className="auth-type-select"
              style={{ width: "100%" }}
            />
          </FormField>
          {renderAuthenticationForm()}
        </div>
      </div>

      {/* Discovery Options Section */}
      <div className="section">
        <h2>Discovery Options</h2>
        <p className="section-description">Choose how to identify API endpoints.</p>

        <div className="form-group">
          <div className="switch-container">
            <div className="switch-label-group">
              <span className="switch-label">Automatic Discovery</span>
              <Switch
                checked={config.discoveryMode === "auto"}
                onChange={(checked) =>
                  setConfig({
                    ...config,
                    discoveryMode: checked ? "auto" : "manual",
                  })
                }
                className="discovery-mode-switch"
              />
            </div>
            <span className="switch-help-text">Automatically discover available endpoints</span>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="form-actions">
        <RQButton type="primary" onClick={handleSubmit} disabled={!config.baseURL || !!validationError}>
          Next: Analyze Endpoints
        </RQButton>
      </div>
    </div>
  );
};

export default APIConfiguration;
