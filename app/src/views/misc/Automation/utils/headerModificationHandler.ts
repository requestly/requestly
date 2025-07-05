import { useEffect, useState } from "react";
import { getConfigfromApi } from "./getConfigfromApi";
import { saveRulesToExtension, clearExtensionStorage } from "./extensionRuleSync";
import { getHeaderModificationConfig } from "./getHeaderModificationConfig";
import { isEnvAutomation } from "utils/EnvUtils";

interface ReturnProps {
  success: boolean;
  error?: string;
  isLoading: boolean;
}

export const useHeaderModification = (
  headers: { header: string; value: string }[],
  headerType: "Request" | "Response",
  operation: "add" | "remove"
): ReturnProps => {
  const [result, setResult] = useState<ReturnProps>({
    success: false,
    isLoading: false,
  });

  useEffect(() => {
    if (!isEnvAutomation()) return;

    if (!headers || headers.length === 0) {
      setResult({
        success: false,
        error: "No headers provided",
        isLoading: false,
      });
      return;
    }

    const isRemoveOperation = operation === "remove";
    for (const header of headers) {
      const isValidForRemove = isRemoveOperation && header.header;
      const isValidForAdd = !isRemoveOperation && header.header && header.value;

      if (!isValidForRemove && !isValidForAdd) {
        const missingField = !header.header ? "Header name" : "Header value";
        setResult({
          success: false,
          error: `${missingField} is required for ${operation} operation in header: ${header.header || "unnamed"}`,
          isLoading: false,
        });
        return;
      }
    }

    setResult({ success: false, error: undefined, isLoading: true });
    getHeaderModificationConfig(headers, headerType, operation)
      .then((rules) => clearExtensionStorage().then(() => rules))
      .then((rules) => saveRulesToExtension(rules))
      .then(() => {
        setResult({
          success: true,
          isLoading: false,
        });
      })
      .catch((error) => {
        setResult({
          success: false,
          error: error.message || "Failed to apply header modification",
          isLoading: false,
        });
      });
  }, [headers, headerType, operation]);

  return result;
};

export const useImportedRules = (apiKey: string): ReturnProps => {
  const [result, setResult] = useState<ReturnProps>({
    success: false,
    isLoading: false,
  });

  useEffect(() => {
    if (!isEnvAutomation()) return;

    if (!apiKey) {
      setResult({
        success: false,
        error: "No API key provided",
        isLoading: false,
      });
      return;
    }

    setResult((prev) => ({ ...prev, isLoading: true }));
    getConfigfromApi(apiKey)
      .then((rules) => clearExtensionStorage().then(() => rules))
      .then((rules) => saveRulesToExtension(rules))
      .then(() => {
        setResult({
          success: true,
          isLoading: false,
        });
      })
      .catch((error) => {
        setResult({
          success: false,
          error: error.message || "Failed to apply header modification",
          isLoading: false,
        });
      });
  }, [apiKey]);

  return result;
};
