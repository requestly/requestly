import React, { useState } from "react";
import { RQModal } from "lib/design-system/components";
import { FilePicker } from "components/common/FilePicker";

export const ImportFromCharlesModal: React.FC = () => {
  const [isDataProcessing, setIsDataProcessing] = useState(false);

  const onFilesDrop = async (files: File[]) => {
    const file = files[0];
    console.log({ file });
    const reader = new FileReader();

    reader.onload = () => {
      const fileContent = reader.result;
      console.log({ fileContent });
      setIsDataProcessing(true);
    };
    reader.readAsText(file);
  };

  // TODO: handle these cases
  //       // reader.onabort = () => toggleModal();
  //       // reader.onerror = () => toggleModal();

  return (
    <RQModal open={true} centered>
      <div className="rq-modal-content">
        <div className="header text-center">Import Charles settings</div>
        <div className="mt-16">
          <FilePicker
            title="Drop your Charles export file, or click to select"
            onFilesDrop={onFilesDrop}
            maxFiles={1}
            isProcessing={isDataProcessing}
          />
        </div>
      </div>
    </RQModal>
  );
};
