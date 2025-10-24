import { MdOutlineOpenInNew } from "@react-icons/all-files/md/MdOutlineOpenInNew";
import React from "react";
import { FooterButtons, ModalHeader, ModalProps } from "./DataFileModalWrapper";
import { getFileExtension } from "features/apiClient/screens/apiClient/utils";

export const ErroredModal: React.FC<ModalProps> = ({ buttonOptions, onClose, dataFileMetadata }) => {
  const fileExtension = getFileExtension(dataFileMetadata.path)?.toUpperCase()?.split(".")?.pop() ?? "JSON";
  const isJSON = fileExtension === "JSON";

  const jsonExample = (
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
  );

  const csvExample = (
    <pre className="code-example">
      <code>
        <span className="key">name,age</span>
        {"\n"}
        <span className="value">Alice,30</span>
        {"\n"}
        <span className="value">Bob,25</span>
      </code>
    </pre>
  );

  return (
    <>
      <ModalHeader dataFileMetadata={dataFileMetadata} />
      <div className="error-state-messaging-container">
        <div>
          <img src={"/assets/media/apiClient/file-error.svg"} alt="Error card" width={80} height={80} />
        </div>
        <div>Invalid {fileExtension} file uploaded</div>
        <div className="detail-label">
          Oops! We couldn't parse your file — it must be a valid{" "}
          {fileExtension === "JSON" ? "JSON array of key-value objects." : "CSV format with headers."}
        </div>

        <div className="error-state-fix-suggestion">
          <div className="example-label">EXAMPLE FORMAT:</div>
          {isJSON ? jsonExample : csvExample}
        </div>

        <FooterButtons buttonOptions={buttonOptions} secondaryIcon={<MdOutlineOpenInNew />} />
      </div>
    </>
  );
};
