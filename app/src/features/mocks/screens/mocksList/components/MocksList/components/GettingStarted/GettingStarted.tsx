import React from "react";
import { GettingStartedWithMocks } from "./GettingStartedWithMocks/GettingStartedWithMocks";
import { MockUploaderModalWrapper, NewFileModalWrapper } from "features/mocks/modals";
import { MockListSource, MockType } from "components/features/mocksV2/types";
import { useMocksActionContext } from "features/mocks/contexts/actions";

interface Props {
  mockType: MockType;
  source: MockListSource;
}

export const GettingStarted: React.FC<Props> = ({ mockType, source }) => {
  const { uploadMockAction, createNewMockAction } = useMocksActionContext() ?? {};

  return (
    <>
      <GettingStartedWithMocks
        mockType={mockType}
        handleCreateNew={() => createNewMockAction(mockType, source)}
        handleUploadAction={() => uploadMockAction(mockType)}
      />

      {/* TODO: move this into container */}
      <NewFileModalWrapper />
      <MockUploaderModalWrapper />
    </>
  );
};
