import SpinnerCard from "components/misc/SpinnerCard";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  redirectToFileMockEditorEditMock,
  redirectToFileViewer,
  redirectToMockEditorCreateMock,
  redirectToMockEditorEditMock,
} from "utils/RedirectionUtils";
import MockUploaderModal from "../MockUploaderModal";
import { DeleteMockModal } from "../DeleteMockModal";
import { MockType, RQMockMetadataSchema } from "../types";
import MocksTable from "./MocksTable";
import NewFileModal from "../NewFileModal";
import MocksEmptyState from "./MocksEmptyState";
import { useFetchMocks } from "./useFetchMocks";
import { useMockListType } from "../MockListContext";

const MockListIndex: React.FC = () => {
  const navigate = useNavigate();

  const [selectedMock, setSelectedMock] = useState<RQMockMetadataSchema>(null);
  const [deleteModalVisibility, setDeleteModalVisibility] = useState<boolean>(
    false
  );

  const [fileModalVisibility, setFileModalVisibility] = useState<boolean>(
    false
  );

  const [uploadModalVisibility, setUploadModalVisibility] = useState<boolean>(
    false
  );

  const type = useMockListType();
  const { fetchOldMocks, fetchMocks, mocksList, isLoading } = useFetchMocks();

  const handleCreateNewMock = () => {
    // TODO: Change this to a constant
    if (type === MockType.FILE) {
      return setFileModalVisibility(true);
    }
    return redirectToMockEditorCreateMock(navigate);
  };

  const handleNameClick = (mockId: string, isOldMock: boolean) => {
    handleEditAction(mockId, isOldMock);
  };

  const handleItemSelect = (
    mockId: string,
    url: string,
    isOldMock: boolean
  ) => {
    return handleEditAction(mockId, isOldMock);
  };

  const handleEditAction = (mockId: string, isOldMock: boolean) => {
    if (isOldMock) {
      return redirectToFileViewer(navigate, mockId);
    }
    if (type === MockType.FILE) {
      return redirectToFileMockEditorEditMock(navigate, mockId);
    }
    return redirectToMockEditorEditMock(navigate, mockId);
  };

  const handleUploadAction = () => {
    setUploadModalVisibility(true);
  };

  const handleDeleteAction = (mock: RQMockMetadataSchema) => {
    setSelectedMock(mock);
    setDeleteModalVisibility(true);
  };

  if (isLoading) {
    return <SpinnerCard customLoadingMessage="Loading Mocks" />;
  }

  if (mocksList.length === 0) {
    return (
      <MocksEmptyState
        handleCreateNewMock={handleCreateNewMock}
        handleUploadAction={handleUploadAction}
        fileModalVisibility={fileModalVisibility}
        setFileModalVisibility={setFileModalVisibility}
        uploadModalVisibility={uploadModalVisibility}
        setUploadModalVisibility={setUploadModalVisibility}
      />
    );
  }

  return (
    <>
      <MocksTable
        handleCreateNew={handleCreateNewMock}
        mocks={mocksList}
        mockType={type}
        handleItemSelect={handleItemSelect}
        handleNameClick={handleNameClick}
        handleEditAction={handleEditAction}
        handleUploadAction={handleUploadAction}
        handleDeleteAction={handleDeleteAction}
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
      <DeleteMockModal
        visible={deleteModalVisibility}
        toggleDeleteModalVisibility={(visible: boolean) =>
          setDeleteModalVisibility(visible)
        }
        mock={selectedMock}
        callbackOnSuccess={selectedMock?.isOldMock ? fetchOldMocks : fetchMocks}
      />
    </>
  );
};

export default MockListIndex;
