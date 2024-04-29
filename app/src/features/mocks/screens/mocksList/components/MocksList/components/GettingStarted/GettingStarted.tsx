import React from "react";
import { GettingStartedWithMocks } from "./GettingStartedWithMocks/GettingStartedWithMocks";
import { MockUploaderModalWrapper, NewFileModal } from "features/mocks/modals";
import { MockType } from "components/features/mocksV2/types";
import { useMocksActionContext } from "features/mocks/contexts/actions";

interface Props {
  mockType: MockType;
  handleCreateNew: () => void;
  fileModalVisibility: boolean;
  setFileModalVisibility: React.Dispatch<React.SetStateAction<boolean>>;
}

export const GettingStarted: React.FC<Props> = ({
  mockType,
  handleCreateNew,
  fileModalVisibility,
  setFileModalVisibility,
}) => {
  const { mockUploaderModalAction } = useMocksActionContext() ?? {};

  return (
    <>
      <GettingStartedWithMocks
        mockType={mockType}
        handleCreateNew={handleCreateNew}
        handleUploadAction={() => mockUploaderModalAction(mockType)}
      />

      <NewFileModal visible={fileModalVisibility} toggleModalVisiblity={(visible) => setFileModalVisibility(visible)} />

      {/* TODO: move this into container */}
      <MockUploaderModalWrapper />
    </>
  );
};
