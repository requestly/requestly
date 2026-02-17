import React, { useCallback } from "react";
import { Modal } from "antd";
import { CommonApiClientImporter, ImportFile } from "../../CommonApiClientImporter/CommonApiClientImporter";
import { ApiClientImporterMethod } from "@requestly/alternative-importers";
import { ApiClientImporterType } from "@requestly/shared/types/entities/apiClient";
import { useWsdlFetcher } from "../../../../../hooks/useWsdlFetcher";
import { SoapImportError } from "../../../../../errors/SoapImportError/SoapImportError";
import { SoapSuccessfulParseView } from "./SoapSuccessfulParseView";

interface SoapImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  importer: ApiClientImporterMethod<any>;
}

export const SoapImporterModal: React.FC<SoapImporterModalProps> = ({ isOpen, onClose, importer }) => {
  const { fetchWsdlFromUrl } = useWsdlFetcher();

  const handleFetchWsdl = useCallback(
    async (url: string): Promise<ImportFile | null> => {
      return fetchWsdlFromUrl(url);
    },
    [fetchWsdlFromUrl]
  );

  return (
    <Modal destroyOnClose className="soap-importer-modal" open={isOpen} onCancel={onClose} footer={null} width={600}>
      <CommonApiClientImporter
        productName="SOAP"
        supportedFileTypes={[".xml", ".wsdl"]}
        importer={importer}
        importerType={ApiClientImporterType.SOAP}
        onImportSuccess={onClose}
        docsLink="" // TBD: Add documentation link when available
        renderSuccessView={(props) => <SoapSuccessfulParseView {...props} />}
        linkView={{
          enabled: true,
          placeholder: "Paste or type URL to import",
          onFetchFromUrl: handleFetchWsdl,
          urlValidationRegex: /^https?:\/\/.+(?:\?WSDL)$/i,
          urlValidationErrorMessage: SoapImportError.invalidUrl().message,
        }}
      />
    </Modal>
  );
};
