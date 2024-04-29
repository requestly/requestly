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
  const { mockUploaderModalAction, createNewMock } = useMocksActionContext() ?? {};

  return (
    <>
      <GettingStartedWithMocks
        mockType={mockType}
        handleCreateNew={() => createNewMock(mockType, source)}
        handleUploadAction={() => mockUploaderModalAction(mockType)}
      />

      {/* TODO: move this into container */}
      <NewFileModalWrapper />
      <MockUploaderModalWrapper />
    </>
  );
};
