import React, { useState } from "react";
import { GettingStartedWithMocks } from "./GettingStartedWithMocks/GettingStartedWithMocks";
import { MockUploaderModal, NewFileModal } from "features/mocks/modals";
import { MockType } from "features/mocks/types";

interface Props {
  mockType: MockType;
  handleCreateNew: () => void;
  handleUploadAction: () => void;
}

export const GettingStarted: React.FC<Props> = ({ mockType, handleCreateNew, handleUploadAction }) => {
  const [fileModalVisibility, setFileModalVisibility] = useState<boolean>(false);
  const [uploadModalVisibility, setUploadModalVisibility] = useState<boolean>(false);

  return (
    <>
      <GettingStartedWithMocks
        mockType={mockType}
        handleCreateNew={handleCreateNew}
        handleUploadAction={handleUploadAction}
      />

      <NewFileModal visible={fileModalVisibility} toggleModalVisiblity={(visible) => setFileModalVisibility(visible)} />

      <MockUploaderModal
        mockType={mockType}
        visible={uploadModalVisibility}
        toggleModalVisibility={(visible) => setUploadModalVisibility(visible)}
      />
    </>
  );
};
