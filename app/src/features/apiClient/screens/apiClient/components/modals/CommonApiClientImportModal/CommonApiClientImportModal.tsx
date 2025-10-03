import React from "react";
import { Modal } from "antd";
import { CommonApiClientImporter } from "../../CommonApiClientImporter/CommonApiClientImporter";
import { ApiClientImporterMethod } from "../../../../../../../../../../alternative-importers/dist/importers/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  supportedFileTypes: string[];
  importer: ApiClientImporterMethod<any>;
  docsLink?: string;
}
export const CommonApiClientImportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  productName,
  supportedFileTypes,
  importer,
  docsLink,
}) => {
  return (
    <Modal className="common-api-client-import-modal" open={isOpen} onCancel={onClose} footer={null} width={600}>
      <CommonApiClientImporter
        productName={productName}
        supportedFileTypes={supportedFileTypes}
        importer={importer}
        docsLink={docsLink}
        onImportSuccess={onClose}
      />
    </Modal>
  );
};
