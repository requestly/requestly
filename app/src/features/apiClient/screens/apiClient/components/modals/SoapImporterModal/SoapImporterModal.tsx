import React, { useCallback } from "react";
import { Modal, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { CommonApiClientImporter, ImportFile } from "../../CommonApiClientImporter/CommonApiClientImporter";
import { ApiClientImporterMethod } from "@requestly/alternative-importers";
import { ApiClientImporterType } from "@requestly/shared/types/entities/apiClient";
import { useWsdlFetcher } from "../../../../../hooks/useWsdlFetcher";
import { WsdlFetchError } from "../../../../../errors/SoapImportError/SoapImportError";
import { SoapSuccessfulParseView } from "./SoapSuccessfulParseView";

interface SoapImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  importer: ApiClientImporterMethod<any>;
  importerType?: ApiClientImporterType;
}

export const SoapImporterModal: React.FC<SoapImporterModalProps> = ({
  isOpen,
  onClose,
  importer,
  importerType = ApiClientImporterType.SOAP,
}) => {
  const { fetchWsdlFromUrl } = useWsdlFetcher();
  const handleFetchWsdl = useCallback(
    async (url: string): Promise<ImportFile | null> => {
      return fetchWsdlFromUrl(url);
    },
    [fetchWsdlFromUrl]
  );

  const isSoapUi = (importerType as string) === "SOAPUI";
  const productName = isSoapUi ? "SoapUI Project" : "WSDL";

  return (
    <Modal destroyOnClose className="soap-importer-modal" open={isOpen} onCancel={onClose} footer={null} width={600}>
      <CommonApiClientImporter
        productName={productName}
        supportedFileTypes={isSoapUi ? [".xml"] : [".wsdl", ".xml"]}
        importer={importer}
        importerType={importerType}
        onImportSuccess={onClose}
        renderSuccessView={(props) => <SoapSuccessfulParseView {...props} />}
        renderLoadingView={() => (
          <div className="soap-parsing-loading-view">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
            <div className="loading-text">{isSoapUi ? "Parsing SoapUI Project" : "Fetching WSDL"}</div>
            <div className="loading-subtext">
              This may take a moment for larger files. Please keep this window open.
            </div>
          </div>
        )}
        linkView={
          isSoapUi
            ? undefined
            : {
                enabled: true,
                placeholder: "Paste or type URL to import",
                onFetchFromUrl: handleFetchWsdl,
                urlValidationRegex: /^https?:\/\//i,
                urlValidationErrorMessage: WsdlFetchError.invalidUrl().message,
              }
        }
      />
    </Modal>
  );
};
