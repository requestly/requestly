import SpinnerCard from "components/misc/SpinnerCard";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  redirectToFileMockEditorEditMock,
  redirectToFileViewer,
  redirectToMockEditorCreateMock,
  redirectToMockEditorEditMock,
} from "utils/RedirectionUtils";
import { trackMockUploadWorkflowStarted, trackNewMockButtonClicked } from "modules/analytics/events/features/mocksV2";
import { MockListSource, MockType, RQMockCollection, RQMockMetadataSchema } from "components/features/mocksV2/types";
import { useFetchMocks } from "./hooks/useFetchMocks";
import { GettingStarted, MocksListContentHeader, MocksTable } from "./components";
import MockPickerIndex from "features/mocks/modals/MockPickerModal/MockPickerIndex";
import {
  DeleteMockModal,
  CreateMockCollectionModal,
  MockUploaderModal,
  NewFileModal,
  DeleteCollectionModal,
} from "features/mocks/modals";
import "./mocksList.scss";

interface Props {
  source?: MockListSource;
  type?: MockType;
  mockSelectionCallback?: (url: string) => void;
}

const MockList: React.FC<Props> = ({ source, mockSelectionCallback, type }) => {
  const navigate = useNavigate();
  const [selectedMock, setSelectedMock] = useState<RQMockMetadataSchema>(null);
  const [deleteModalVisibility, setDeleteModalVisibility] = useState<boolean>(false);
  const [fileModalVisibility, setFileModalVisibility] = useState<boolean>(false);
  const [uploadModalVisibility, setUploadModalVisibility] = useState<boolean>(false);
  const [collectionModalVisibility, setCollectionModalVisibility] = useState<boolean>(false);
  const [deleteCollectionModalVisibility, setDeleteCollectionModalVisibility] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [filteredMocks, setFilteredMocks] = useState<RQMockMetadataSchema[]>([]);

  // TODO: Remove force render and maintain the mocks in context
  const [forceRender, setForceRender] = useState(false);

  const { isLoading, mocks, fetchOldMocks, fetchMocks } = useFetchMocks(type, forceRender);

  useEffect(() => {
    // TODO: check for rerenders
    setFilteredMocks([...mocks]);
  }, [mocks]);

  const handleCreateNewMock = () => {
    if (source === MockListSource.PICKER_MODAL) {
      trackNewMockButtonClicked(type, "picker_modal");
      return redirectToMockEditorCreateMock(navigate, true);
    }
    // TODO: Change this to a constant
    if (type === MockType.FILE) {
      return setFileModalVisibility(true);
    }
    trackNewMockButtonClicked(type, "mock_list");
    return redirectToMockEditorCreateMock(navigate);
  };

  const handleCreateNewCollection = () => {
    setCollectionModalVisibility(true);
  };

  const handleNameClick = (mockId: string, isOldMock: boolean) => {
    handleEditAction(mockId, isOldMock);
  };

  const handleItemSelect = (mockId: string, url: string, isOldMock: boolean) => {
    if (source === MockListSource.PICKER_MODAL) {
      return handleSelectAction(url);
    }

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

  const handleSelectAction = (url: string) => {
    mockSelectionCallback(url);
  };

  const handleUploadAction = () => {
    trackMockUploadWorkflowStarted(type);
    setUploadModalVisibility(true);
  };

  const handleDeleteAction = (mock: RQMockMetadataSchema) => {
    setSelectedMock(mock);
    setDeleteModalVisibility(true);
  };

  const handleUpdateCollectionAction = (collection: RQMockMetadataSchema) => {
    setSelectedMock(collection);
    setCollectionModalVisibility(true);
  };

  const handleDeleteCollectionAction = (collection: RQMockMetadataSchema) => {
    setSelectedMock(collection);
    setDeleteCollectionModalVisibility(true);
  };

  const handleSearch = (searchQuery: string) => {
    setSearchValue(searchQuery);

    if (searchQuery) {
      const searchedMocks = mocks.filter((mock: RQMockMetadataSchema) => {
        return mock.name.toLowerCase().includes(searchQuery.toLowerCase());
      });
      setFilteredMocks([...searchedMocks]);
    } else {
      setFilteredMocks([...mocks]);
    }
  };

  return isLoading ? (
    <SpinnerCard customLoadingMessage="Loading Mocks" />
  ) : source === MockListSource.PICKER_MODAL ? (
    <>
      <MockPickerIndex
        mocks={mocks}
        handleUploadAction={handleUploadAction}
        handleItemSelect={handleItemSelect}
        handleSelectAction={handleSelectAction}
        handleNameClick={handleNameClick}
      />

      <MockUploaderModal
        mockType={type}
        visible={uploadModalVisibility}
        toggleModalVisibility={(visible) => setUploadModalVisibility(visible)}
        selectMockOnUpload={handleSelectAction}
      />
    </>
  ) : mocks.length > 0 ? (
    <>
      <div className="rq-mocks-list-container">
        {/* TODO: Temp Breadcrumb */}
        <div className="rq-mocks-table-breadcrumb">
          <span className="breadcrumb-1"> {type === MockType.API ? "Mocks" : "Files"}</span> {" > "}{" "}
          <span className="breadcrumb-2">All</span>
        </div>

        <MocksListContentHeader
          mockType={type}
          searchValue={searchValue}
          setSearchValue={handleSearch}
          handleCreateNew={handleCreateNewMock}
          handleCreateNewCollection={handleCreateNewCollection}
          handleUploadAction={handleUploadAction}
        />

        <div className="mocks-table-container">
          <MocksTable
            isLoading={isLoading}
            mockType={type}
            mocks={filteredMocks}
            handleItemSelect={handleItemSelect}
            handleNameClick={handleNameClick}
            handleEditAction={handleEditAction}
            handleUploadAction={handleUploadAction}
            handleDeleteAction={handleDeleteAction}
            handleUpdateCollectionAction={handleUpdateCollectionAction}
            handleDeleteCollectionAction={handleDeleteCollectionAction}
          />
        </div>
      </div>

      <NewFileModal visible={fileModalVisibility} toggleModalVisiblity={(visible) => setFileModalVisibility(visible)} />

      <MockUploaderModal
        mockType={type}
        visible={uploadModalVisibility}
        toggleModalVisibility={(visible) => setUploadModalVisibility(visible)}
      />

      <DeleteMockModal
        mock={selectedMock}
        visible={deleteModalVisibility}
        toggleModalVisibility={(visible: boolean) => {
          setDeleteModalVisibility(visible);

          if (!visible) {
            setSelectedMock(null);
          }
        }}
        onSuccess={selectedMock?.isOldMock ? fetchOldMocks : fetchMocks}
      />

      <CreateMockCollectionModal
        id={selectedMock?.id}
        name={selectedMock?.name}
        description={selectedMock?.desc}
        mockType={type}
        visible={collectionModalVisibility}
        toggleModalVisibility={(visible: boolean) => {
          setCollectionModalVisibility(visible);

          if (!visible) {
            setSelectedMock(null);
          }
        }}
        onSuccess={() => {
          setForceRender((prev) => !prev);
          setSelectedMock(null);
        }}
      />

      <DeleteCollectionModal
        collection={(selectedMock as unknown) as RQMockCollection}
        visible={deleteCollectionModalVisibility}
        toggleModalVisibility={(visible: boolean) => {
          setDeleteCollectionModalVisibility(visible);

          if (!visible) {
            setSelectedMock(null);
          }
        }}
        onSuccess={() => {
          setForceRender((prev) => !prev);
          setSelectedMock(null);
        }}
      />
    </>
  ) : (
    <GettingStarted
      mockType={type}
      handleCreateNew={handleCreateNewMock}
      handleUploadAction={handleUploadAction}
      fileModalVisibility={fileModalVisibility}
      setFileModalVisibility={setFileModalVisibility}
      uploadModalVisibility={uploadModalVisibility}
      setUploadModalVisibility={setUploadModalVisibility}
    />
  );
};

export default MockList;
