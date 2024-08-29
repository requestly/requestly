import React from "react";
import { GettingStartedWithMocks } from "./GettingStartedWithMocks/GettingStartedWithMocks";
import { ImportMocksModalWrapper, MockUploaderModalWrapper, NewFileModalWrapper } from "features/mocks/modals";
import { MockListSource, MockType } from "components/features/mocksV2/types";
import { useMocksActionContext } from "features/mocks/contexts/actions";

interface Props {
  mockType: MockType;
  source: MockListSource;
  forceRender: () => void;
}

export const GettingStarted: React.FC<Props> = ({ mockType, source, forceRender = () => {} }) => {
  const { uploadMockAction, createNewMockAction, importMocksAction } = useMocksActionContext() ?? {};

  return (
    <>
      <GettingStartedWithMocks
        mockType={mockType}
        handleCreateNew={() => createNewMockAction(mockType, source)}
        handleUploadAction={() => uploadMockAction(mockType)}
        handleImportAction={() => importMocksAction(mockType)}
      />

      {/* TODO: move this into container */}
      <NewFileModalWrapper />
      <MockUploaderModalWrapper />
      <ImportMocksModalWrapper forceRender={forceRender} />
    </>
  );
};
