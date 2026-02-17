import React, { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import * as Sentry from "@sentry/react";
import { SPAN_STATUS_ERROR, SPAN_STATUS_OK } from "@sentry/core";
import { Input, Button, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { toast } from "utils/Toast";
import { wrapWithCustomSpan } from "utils/sentry";
import { FilePicker } from "components/common/FilePicker";
import { ImportErrorView } from "./ImporterErrorView";
import { getAppMode } from "store/selectors";
import { isExtensionInstalled, isExtensionEnabled } from "actions/ExtensionActions";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { trackImportParsed, trackImportParseFailed } from "modules/analytics/events/features/apiClient";
import { RQAPI, EnvironmentData, ApiClientImporterType } from "@requestly/shared/types/entities/apiClient";
import { ApiClientImporterMethod } from "@requestly/alternative-importers";

export interface ImportFile {
  content: string;
  name: string;
  type: string;
}

export interface LinkViewConfig {
  enabled: boolean;
  placeholder: string;
  fetchButtonText?: string;
  onFetchFromUrl?: (url: string) => Promise<ImportFile | null>;
  urlValidationRegex?: RegExp;
  urlValidationErrorMessage?: string;
}

interface ImportInputViewProps {
  productName: string;
  supportedFileTypes: string[];
  linkView?: LinkViewConfig;
  importer: ApiClientImporterMethod<ImportFile>;
  importerType: ApiClientImporterType;
  onDataProcessed: (data: { collections: RQAPI.CollectionRecord[]; environments: EnvironmentData[] }) => void;
}

export const ImportInputView: React.FC<ImportInputViewProps> = ({
  productName,
  supportedFileTypes,
  linkView,
  importer,
  importerType,
  onDataProcessed,
}) => {
  const [isDataProcessing, setIsDataProcessing] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [isFetchingFromUrl, setIsFetchingFromUrl] = useState<boolean>(false);
  const [linkUrl, setLinkUrl] = useState<string>("");
  const [isLinkViewExpanded, setIsLinkViewExpanded] = useState<boolean>(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  const appMode = useSelector(getAppMode);

  const handleResetInput = () => {
    setImportError(null);
    setLinkUrl("");
    setLinkError(null);
  };

  const handleBackFromLinkView = () => {
    setIsLinkViewExpanded(false);
    handleResetInput();
  };

  const handleLinkInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLinkUrl(value);
    if (value && !isLinkViewExpanded) {
      setIsLinkViewExpanded(true);
    }
    if (linkError) {
      setLinkError(null);
    }
  };

  const processImportFiles = useCallback(
    async (files: ImportFile[]) => {
      return wrapWithCustomSpan(
        {
          name: `[Transaction] api_client.${importerType.toLowerCase()}_import.process_files`,
          op: `api_client.${importerType.toLowerCase()}_import.process_files`,
          forceTransaction: true,
          attributes: {},
        },
        async (filesToProcess: ImportFile[]) => {
          setIsDataProcessing(true);
          try {
            const processPromises = filesToProcess.map((file) => importer(file));
            const results = await Promise.allSettled(processPromises);

            const hasAllFilesFailed = !results.some((result) => result.status === "fulfilled");

            if (hasAllFilesFailed) {
              const firstFailure = results.find((r) => r.status === "rejected") as PromiseRejectedResult;
              const errorMessage =
                firstFailure?.reason?.message || "Could not process the data! Please check if the content is valid.";
              throw new Error(errorMessage);
            }

            const processedResults: { collections: RQAPI.CollectionRecord[]; environments: EnvironmentData[] } = {
              collections: [],
              environments: [],
            };

            results.forEach((result) => {
              if (result.status === "fulfilled") {
                if (result.value.data?.collection) {
                  processedResults.collections.push(result.value.data.collection);
                }
                if (result.value.data?.environments) {
                  processedResults.environments.push(...result.value.data.environments);
                }
              }
            });

            if (processedResults.collections.length === 0 && processedResults.environments.length === 0) {
              throw new Error("Data doesn't contain any collections or environments");
            }

            trackImportParsed(importerType, processedResults.collections.length, null);
            Sentry.getActiveSpan()?.setStatus({ code: SPAN_STATUS_OK });
            onDataProcessed(processedResults);
          } catch (error: any) {
            const message = error.message || "Could not process the selected data! Try again.";

            if (linkUrl) {
              if (isLinkViewExpanded) {
                setLinkError(message);
              } else {
                toast.error(message);
              }
            } else {
              setImportError(message);
            }

            trackImportParseFailed(importerType, message);
            Sentry.captureException(error);
            Sentry.getActiveSpan()?.setStatus({ code: SPAN_STATUS_ERROR });
          } finally {
            setIsDataProcessing(false);
          }
        }
      )(files);
    },
    [importer, importerType, linkUrl, isLinkViewExpanded, onDataProcessed]
  );

  const handleFileDrop = useCallback(
    async (files: File[]) => {
      setIsDataProcessing(true);
      try {
        const fileReadPromises = files.map((file) => {
          return new Promise<ImportFile>((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => {
              reject(new Error(`Could not read file: ${file.name}`));
            };
            reader.onload = () => {
              const fileContent = reader.result as string;
              resolve({ content: fileContent, name: file.name, type: file.type });
            };
            reader.readAsText(file);
          });
        });

        const importFiles = await Promise.all(fileReadPromises);
        await processImportFiles(importFiles);
      } catch (error: any) {
        setImportError(error.message || "Could not process the selected files!");
        setIsDataProcessing(false);
      }
    },
    [processImportFiles]
  );

  const handleFetchAndImport = useCallback(async () => {
    if (!linkView?.onFetchFromUrl) {
      return;
    }

    // Extension Checks
    if (appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
      if (!isExtensionInstalled()) {
        setLinkError("Extension is not installed. Please install the extension to use this feature.");
        return;
      }
      if (!isExtensionEnabled()) {
        setLinkError("Extension is not enabled. Please enable the extension to use this feature.");
        return;
      }
    }

    if (!linkUrl.trim()) {
      setLinkError("Please enter a URL");
      return;
    }

    if (linkView.urlValidationRegex && !linkView.urlValidationRegex.test(linkUrl)) {
      setLinkError(linkView.urlValidationErrorMessage || "Invalid URL format");
      return;
    }

    try {
      setIsFetchingFromUrl(true);
      setLinkError(null);
      const importFile = await linkView.onFetchFromUrl(linkUrl);

      if (!importFile) {
        throw new Error("Failed to fetch from URL");
      }

      await processImportFiles([importFile]);
    } catch (err: any) {
      const errorMsg = err.message || "Failed to fetch from URL";
      setLinkError(errorMsg);
    } finally {
      setIsFetchingFromUrl(false);
    }
  }, [linkUrl, linkView, processImportFiles, appMode]);

  if ((isDataProcessing || isFetchingFromUrl) && importerType === ApiClientImporterType.SOAP) {
    return (
      <div className="soap-parsing-loading-view">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        <div className="loading-text">Parsing WSDL</div>
        <div className="loading-subtext">This may take a moment for larger files. Please keep this window open.</div>
      </div>
    );
  }

  return (
    <>
      {linkView?.enabled && (
        <div className={`link-import-section ${isLinkViewExpanded ? "expanded" : ""}`}>
          <div className="link-import-input-group">
            <Input.TextArea
              placeholder={linkView.placeholder}
              value={linkUrl}
              onChange={handleLinkInputChange}
              disabled={isFetchingFromUrl}
              className="link-input"
              status={linkError ? "error" : ""}
              onPressEnter={(e) => {
                e.preventDefault();
                handleFetchAndImport();
              }}
              autoSize={!isLinkViewExpanded ? { minRows: 1 } : false}
            />
          </div>
          {linkError && <div className="link-import-error">{linkError}</div>}
        </div>
      )}

      {isLinkViewExpanded && linkView?.enabled ? (
        <div className="link-expanded-actions">
          {isFetchingFromUrl && (
            <div className="link-import-status">
              <Spin tip="Fetching..." />
            </div>
          )}
          <div className="link-expanded-buttons">
            <Button onClick={handleBackFromLinkView}>Back</Button>
            <Button type="primary" loading={isFetchingFromUrl} onClick={handleFetchAndImport}>
              Continue
            </Button>
          </div>
        </div>
      ) : (
        <>
          {linkView?.enabled && (
            <div className="link-divider">
              <span>OR</span>
            </div>
          )}

          <FilePicker
            maxFiles={5}
            onFilesDrop={(files) => {
              handleResetInput();
              handleFileDrop(files);
            }}
            isProcessing={isDataProcessing}
            title={`Drag and drop your ${productName} export file to upload`}
            subtitle={`Accepted file formats: ${supportedFileTypes.join(", ")}`}
            selectorButtonTitle={importError ? "Try another file" : "Select file"}
          />
          {importError ? <ImportErrorView importError={importError} /> : null}
        </>
      )}
    </>
  );
};
