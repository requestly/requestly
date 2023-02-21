import React from "react";
import MockUploaderModal from "../../MockUploaderModal";
import NewFileModal from "../../NewFileModal";
import { MockType } from "../../types";
import { GettingStartedWithMocks } from "../GettingStartedWithMocks";

/* eslint-disable no-unused-vars */
export enum MockListSource {
  PICKER_MODAL,
}
/* eslint-enable no-unused-vars */

interface Props {
  type?: MockType;
  handleCreateNewMock: () => void;
  handleUploadAction: () => void;
  fileModalVisibility: boolean;
  setFileModalVisibility: (visible: boolean) => void;
  uploadModalVisibility: boolean;
  setUploadModalVisibility: (visible: boolean) => void;
}

const MocksEmptyState: React.FC<Props> = ({
  handleCreateNewMock,
  handleUploadAction,
  type,
  fileModalVisibility,
  setFileModalVisibility,
  uploadModalVisibility,
  setUploadModalVisibility,
}) => {
  return (
    <>
      <GettingStartedWithMocks
        mockType={type}
        handleCreateNew={handleCreateNewMock}
        handleUploadAction={handleUploadAction}
      />
      <NewFileModal
        visible={fileModalVisibility}
        toggleModalVisiblity={(visible) => setFileModalVisibility(visible)}
      />
      <MockUploaderModal
        mockType={type}
        visible={uploadModalVisibility}
        toggleModalVisibility={(visible) => setUploadModalVisibility(visible)}
      />
    </>
  );
};

export default MocksEmptyState;
