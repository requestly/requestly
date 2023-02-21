import SpinnerCard from "components/misc/SpinnerCard";
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  redirectToFileViewer,
  redirectToMockEditorEditMock,
  redirectToMocksList,
} from "utils/RedirectionUtils";
import { GettingStartedWithMocks } from "../GettingStartedWithMocks";
import MocksTable from "../MocksTable";
import { useFetchMocks } from "../useFetchMocks";

/* eslint-disable no-unused-vars */
export enum MockListSource {
  PICKER_MODAL,
}
/* eslint-enable no-unused-vars */

interface Props {
  mockSelectionCallback?: (url: string) => void;
}

const MocksModal: React.FC<Props> = ({ mockSelectionCallback }) => {
  const navigate = useNavigate();
  const { mocksList, isLoading } = useFetchMocks();
  const handleCreateNewMock = () => {
    return redirectToMocksList(navigate, true);
  };

  const handleNameClick = (mockId: string, isOldMock: boolean) => {
    handleEditAction(mockId, isOldMock);
  };

  const handleItemSelect = (mockId: string, url: string) => {
    return handleSelectAction(url);
  };

  const handleEditAction = (mockId: string, isOldMock: boolean) => {
    if (isOldMock) {
      return redirectToFileViewer(navigate, mockId);
    }
    return redirectToMockEditorEditMock(navigate, mockId);
  };

  const handleSelectAction = (url: string) => {
    mockSelectionCallback(url);
  };

  if (isLoading) {
    return <SpinnerCard customLoadingMessage="Loading Mocks" />;
  }

  if (mocksList.length === 0) {
    return (
      <GettingStartedWithMocks
        mockType={""}
        handleCreateNew={handleCreateNewMock}
        handleUploadAction={handleCreateNewMock}
      />
    );
  }

  return (
    <MocksTable
      mocks={mocksList}
      mockType={""}
      handleItemSelect={handleItemSelect}
      handleCreateNew={handleCreateNewMock}
      handleNameClick={handleNameClick}
      handleSelectAction={handleSelectAction}
    />
  );
};

export default MocksModal;
