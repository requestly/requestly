import { RQModal } from "lib/design-system/components";
import { MdOutlineClose } from "@react-icons/all-files/md/MdOutlineClose";
import { MdOutlineOpenInNew } from "@react-icons/all-files/md/MdOutlineOpenInNew";
import React from "react";
import { FooterButtons, ModalHeader, ModalProps } from "../DataFileModalWrapper";

export const ErroredModal: React.FC<ModalProps> = ({ buttonOptions, onClose, dataFileMetadata }) => {
  return (
    <RQModal
      width={680}
      open={true}
      closable={true}
      closeIcon={<MdOutlineClose />}
      onCancel={() => {
        onClose();
        // removeDataFile();
      }}
      className="preview-modal"
    >
      <ModalHeader dataFileMetadata={dataFileMetadata} />
      <div className="error-state-messaging-container">
        <div>
          <img src={"/assets/media/apiClient/file-error.svg"} alt="Error card" width={80} height={80} />
        </div>
        <div>Invalid JSON file uploaded</div>
        <div className="detail-label">
          Oops! We couldn't parse your file — it must be a valid JSON array of key-value objects.
        </div>

        <div className="error-state-fix-suggestion">
          <div className="example-label">EXAMPLE FORMAT:</div>
          <pre className="code-example">
            <code>
              <span className="punctuation">[</span>
              {"\n  "}
              <span className="punctuation">{"{"}</span>
              <span className="key">"name"</span>
              <span className="punctuation">: </span>
              <span className="value">"Alice"</span>
              <span className="punctuation">, </span>
              <span className="key">"age"</span>
              <span className="punctuation">: </span>
              <span className="value">30</span>
              <span className="punctuation">{"}"}</span>
              <span className="punctuation">,</span>
              {"\n  "}
              <span className="punctuation">{"{"}</span>
              <span className="key">"name"</span>
              <span className="punctuation">: </span>
              <span className="value">"Bob"</span>
              <span className="punctuation">, </span>
              <span className="key">"age"</span>
              <span className="punctuation">: </span>
              <span className="value">25</span>
              <span className="punctuation">{"}"}</span>
              {"\n"}
              <span className="punctuation">]</span>
            </code>
          </pre>
        </div>

        <FooterButtons buttonOptions={buttonOptions} primaryIcon={<MdOutlineOpenInNew />} />
      </div>
    </RQModal>
  );
};
