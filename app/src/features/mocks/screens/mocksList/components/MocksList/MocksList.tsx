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
  RQMockMetadataSchema,
} from "components/features/mocksV2/types";
import { useFetchMocks } from "./hooks/useFetchMocks";
import { GettingStarted, MocksListContentHeader, MocksTable } from "./components";
import MockPickerIndex from "features/mocks/modals/MockPickerModal/MockPickerIndex";
import {
  MockUploaderModal,
  NewFileModal,
  CreateCollectionModalWrapper,
  DeleteCollectionModalWrapper,
  DeleteMockModalWrapper,
  UpdateMockCollectionModalWrapper,
} from "features/mocks/modals";
import "./mocksList.scss";
import { getQuickFilteredRecords } from "./utils";

interface Props {
  source?: MockListSource;
  type?: MockType;
  mockSelectionCallback?: (url: string) => void;
}

const MockList: React.FC<Props> = ({ source, mockSelectionCallback, type }) => {
  const navigate = useNavigate();

  // TODO: Move all the actions and local state in context
  const [fileModalVisibility, setFileModalVisibility] = useState<boolean>(false);
  const [uploadModalVisibility, setUploadModalVisibility] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [filteredMocks, setFilteredMocks] = useState<RQMockMetadataSchema[]>([]);
  const [filter, setFilter] = useState<MockTableHeaderFilter>("all");

  // TODO: Remove force render and maintain the mocks in context
  // TODO: Remove this after actions refactor
  const [forceRender, setForceRender] = useState(false);

  const { isLoading, mocks } = useFetchMocks(type, forceRender);

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
          allrecords={mocks}
          mocks={filteredMocks}
          mockType={type}
          searchValue={searchValue}
          setSearchValue={handleSearch}
          handleCreateNew={handleCreateNewMock}
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
            forceRender={_forceRender}
          />
        </div>
      </div>

      <NewFileModal visible={fileModalVisibility} toggleModalVisiblity={(visible) => setFileModalVisibility(visible)} />

      <MockUploaderModal
        mockType={type}
        visible={uploadModalVisibility}
        toggleModalVisibility={(visible) => setUploadModalVisibility(visible)}
      />

      {/* FIXME: Remove force re-render and instead update the local state */}
      <CreateCollectionModalWrapper forceRender={_forceRender} />
      <DeleteCollectionModalWrapper forceRender={_forceRender} />

      {/* keep this at top level, below modals will be used at multiple places */}
      <DeleteMockModalWrapper forceRender={_forceRender} />
      <UpdateMockCollectionModalWrapper forceRender={_forceRender} mocks={mocks} />
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
