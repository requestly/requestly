import React from "react";
import { useMockListType } from "../../MockListContext";
import MockUploaderModal from "../../MockUploaderModal";
import NewFileModal from "../../NewFileModal";
import { GettingStartedWithMocks } from "../GettingStartedWithMocks";

/* eslint-disable no-unused-vars */
export enum MockListSource {
  PICKER_MODAL,
}
/* eslint-enable no-unused-vars */

interface Props {
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

  fileModalVisibility,
  setFileModalVisibility,
  uploadModalVisibility,
  setUploadModalVisibility,
}) => {
  const type = useMockListType();
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
