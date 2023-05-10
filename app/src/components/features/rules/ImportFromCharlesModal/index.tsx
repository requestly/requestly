import React, { useState } from "react";
import { Row } from "antd";
import { RQModal } from "lib/design-system/components";
import { useDropzone } from "react-dropzone";

export const ImportFromCharlesModal: React.FC = () => {
  const [isDataProcessing, setIsDataProcessing] = useState(false);
  const FilePicker = () => {
    const onDrop = (acceptedFile: File[]) => {
      const file = acceptedFile[0];
      console.log({ file });
      const reader = new FileReader();

      // TODO: handle these cases
      // reader.onabort = () => toggleModal();
      // reader.onerror = () => toggleModal();

      reader.onload = () => {
        const fileContent = reader.result;
        console.log({ fileContent });
        setIsDataProcessing(true);
      };
      reader.readAsText(file);
    };
    const { getRootProps, getInputProps, isFocused } = useDropzone({ onDrop, maxFiles: 1 });

    return (
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {isFocused ? "FOCUS" : "BLUR"}
        <p>Drag 'n' drop some files here, or click to select files</p>
      </div>
    );
  };

  return (
    <RQModal open={true}>
      <Row className="rq-modal-content">{isDataProcessing ? <>Processing...</> : <FilePicker />}</Row>
    </RQModal>
  );
};
