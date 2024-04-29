import SpinnerCard from "components/misc/SpinnerCard";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  redirectToFileMockEditorEditMock,
  redirectToFileViewer,
  redirectToMockEditorCreateMock,
  redirectToMockEditorEditMock,
} from "utils/RedirectionUtils";
import { trackMockUploadWorkflowStarted, trackNewMockButtonClicked } from "modules/analytics/events/features/mocksV2";
import {
  MockListSource,
  MockTableHeaderFilter,
  MockType,
  RQMockCollection,
  RQMockMetadataSchema,
  RQMockSchema,
} from "components/features/mocksV2/types";
import { useFetchMocks } from "./hooks/useFetchMocks";
import { GettingStarted, MocksListContentHeader, MocksTable } from "./components";
import MockPickerIndex from "features/mocks/modals/MockPickerModal/MockPickerIndex";
import {
  DeleteMockModal,
  CreateCollectionModal,
  MockUploaderModal,
  NewFileModal,
  DeleteCollectionModal,
  UpdateMockCollectionModal,
} from "features/mocks/modals";
import "./mocksList.scss";
import { message } from "antd";
import { updateMock } from "backend/mocks/updateMock";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { getQuickFilteredRecords } from "./utils";
import { isRecordMockCollection } from "./components/MocksTable/utils";

interface Props {
  source?: MockListSource;
  type?: MockType;
  mockSelectionCallback?: (url: string) => void;
}

const MockList: React.FC<Props> = ({ source, mockSelectionCallback, type }) => {
  const navigate = useNavigate();
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const teamId = workspace?.id;

  // TODO: Move all the actions and local state in context
  const [selectedMock, setSelectedMock] = useState<RQMockMetadataSchema>(null);
  const [deleteModalVisibility, setDeleteModalVisibility] = useState<boolean>(false);
  const [fileModalVisibility, setFileModalVisibility] = useState<boolean>(false);
  const [uploadModalVisibility, setUploadModalVisibility] = useState<boolean>(false);
  const [collectionModalVisibility, setCollectionModalVisibility] = useState<boolean>(false);
  const [deleteCollectionModalVisibility, setDeleteCollectionModalVisibility] = useState<boolean>(false);
  const [updateMockCollectionModalVisibility, setUpdateMockCollectionModalVisibility] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [filteredMocks, setFilteredMocks] = useState<RQMockMetadataSchema[]>([]);
  const [filter, setFilter] = useState<MockTableHeaderFilter>("all");

  // TODO: Remove force render and maintain the mocks in context
  // TODO: Remove this after actions refactor
  const [forceRender, setForceRender] = useState(false);

  const { isLoading, mocks, fetchOldMocks, fetchMocks } = useFetchMocks(type, forceRender);

  useEffect(() => {
    const filteredRecords = getQuickFilteredRecords(mocks, filter);
    setFilteredMocks(filteredRecords);
  }, [filter, mocks]);

  const _forceRender = useCallback(() => {
    setForceRender((prev) => !prev);
  }, []);

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

  const handleUpdateMockCollectionAction = (mock: RQMockMetadataSchema) => {
    setSelectedMock(mock);
    setUpdateMockCollectionModalVisibility(true);
  };

  const handleStarMockAction = (record: RQMockSchema) => {
    const isStarred = record.isFavourite;

    message.loading(isStarred ? "Removing from starred mocks" : "Adding into starred mocks", 3);
    updateMock(uid, record.id, { ...record, isFavourite: !record.isFavourite }, teamId).then(() => {
      message.success(isStarred ? "Mock unstarred!" : "Mock starred!");
      _forceRender();
    });
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

  const collections = (mocks.filter((mock) => isRecordMockCollection(mock)) as unknown) as RQMockCollection[];

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
          allrecords={mocks}
          mocks={filteredMocks}
          mockType={type}
          searchValue={searchValue}
          setSearchValue={handleSearch}
          handleCreateNew={handleCreateNewMock}
          handleCreateNewCollection={handleCreateNewCollection}
          handleUploadAction={handleUploadAction}
          filter={filter}
          setFilter={setFilter}
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
            handleUpdateMockCollectionAction={handleUpdateMockCollectionAction}
            handleStarMockAction={handleStarMockAction}
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

      <CreateCollectionModal
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
          _forceRender();
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
          _forceRender();
          setSelectedMock(null);
        }}
      />

      <UpdateMockCollectionModal
        mock={selectedMock}
        collections={collections}
        visible={updateMockCollectionModalVisibility}
        toggleModalVisibility={(visible: boolean) => {
          setUpdateMockCollectionModalVisibility(visible);

          if (!visible) {
            setSelectedMock(null);
          }
        }}
        onSuccess={() => {
          _forceRender();
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
