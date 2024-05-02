import SpinnerCard from "components/misc/SpinnerCard";
import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  redirectToFileMockEditorEditMock,
  redirectToFileViewer,
  redirectToMockEditorEditMock,
} from "utils/RedirectionUtils";
import {
  MockListSource,
  MockTableHeaderFilter,
  MockType,
  RQMockMetadataSchema,
} from "components/features/mocksV2/types";
import { useFetchMockRecords } from "./hooks/useFetchMockRecords";
import { GettingStarted, MocksListContentHeader, MocksTable } from "./components";
import MockPickerIndex from "features/mocks/modals/MockPickerModal/MockPickerIndex";
import {
  CreateOrUpdateCollectionModalWrapper,
  DeleteCollectionModalWrapper,
  DeleteMockModalWrapper,
  UpdateMockCollectionModalWrapper,
  MockUploaderModalWrapper,
  NewFileModalWrapper,
} from "features/mocks/modals";
import "./mocksList.scss";

interface Props {
  source?: MockListSource;
  type?: MockType;
  mockSelectionCallback?: (url: string) => void;
}

const MockList: React.FC<Props> = ({ source, mockSelectionCallback, type }) => {
  const navigate = useNavigate();

  // TODO: Move all the actions and local state in context
  const [searchValue, setSearchValue] = useState<string>("");
  const [filteredMocks, setFilteredMocks] = useState<RQMockMetadataSchema[]>([]);
  const [filter, setFilter] = useState<MockTableHeaderFilter>("all");

  const [forceRender, setForceRender] = useState(false);

  const { isLoading, mocks } = useFetchMockRecords(type, forceRender);

  const _forceRender = useCallback(() => {
    setForceRender((prev) => !prev);
  }, []);

  // TODO: move into actions
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
        handleItemSelect={handleItemSelect}
        handleSelectAction={handleSelectAction}
        handleNameClick={handleNameClick}
      />

      <MockUploaderModalWrapper selectMockOnUpload={handleSelectAction} />
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
          source={source}
          records={mocks}
          mockType={type}
          searchValue={searchValue}
          setSearchValue={handleSearch}
          filter={filter}
          setFilter={setFilter}
          setFilteredMocks={setFilteredMocks}
        />

        <div className="mocks-table-container">
          <MocksTable
            isLoading={isLoading}
            mockType={type}
            mocks={filteredMocks}
            handleItemSelect={handleItemSelect}
            handleNameClick={handleNameClick}
            handleEditAction={handleEditAction}
            forceRender={_forceRender}
          />
        </div>
      </div>

      <NewFileModalWrapper />

      <MockUploaderModalWrapper />

      {/* FIXME: Remove force re-render and instead update the local state */}
      <CreateOrUpdateCollectionModalWrapper forceRender={_forceRender} />
      <DeleteCollectionModalWrapper forceRender={_forceRender} />

      {/* keep this at top level, below modals will be used at multiple places */}
      <DeleteMockModalWrapper forceRender={_forceRender} />
      <UpdateMockCollectionModalWrapper forceRender={_forceRender} mocks={mocks} />
    </>
  ) : (
    <GettingStarted mockType={type} source={source} />
  );
};

export default MockList;
