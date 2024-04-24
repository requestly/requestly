import React from "react";
import { GettingStartedWithMocks } from "./GettingStartedWithMocks/GettingStartedWithMocks";
import { MockUploaderModal, NewFileModal } from "features/mocks/modals";
import { MockType } from "components/features/mocksV2/types";

interface Props {
  mockType: MockType;
  handleCreateNew: () => void;
  handleUploadAction: () => void;
  fileModalVisibility: boolean;
  uploadModalVisibility: boolean;
  setFileModalVisibility: React.Dispatch<React.SetStateAction<boolean>>;
  setUploadModalVisibility: React.Dispatch<React.SetStateAction<boolean>>;
}

export const GettingStarted: React.FC<Props> = ({
  mockType,
  handleCreateNew,
  handleUploadAction,
  fileModalVisibility,
  setFileModalVisibility,
  uploadModalVisibility,
  setUploadModalVisibility,
}) => {
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
