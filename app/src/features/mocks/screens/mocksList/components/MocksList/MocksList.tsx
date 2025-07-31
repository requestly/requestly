import React, { useCallback, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SpinnerCard from "components/misc/SpinnerCard";
import {
  redirectToFileMockEditorEditMock,
  redirectToFileViewer,
  redirectToMockEditorEditMock,
} from "utils/RedirectionUtils";
import { MockListSource, MockTableHeaderFilter, MockType } from "components/features/mocksV2/types";
import { useFetchMockRecords } from "./hooks/useFetchMockRecords";
import { GettingStarted, MocksListContentHeader, MocksTable } from "./components";
import MockPickerIndex from "features/mocks/modals/MockPickerModal/MockPickerIndex";
import {
  CreateOrUpdateCollectionModalWrapper,
  DeleteCollectionModalWrapper,
  DeleteRecordsModalWrapper,
  UpdateMocksCollectionModalWrapper,
  MockUploaderModalWrapper,
  NewFileModalWrapper,
  ExportMocksModalWrapper,
  ImportMocksModalWrapper,
} from "features/mocks/modals";
import { getFilteredRecords } from "./components/MocksListContentHeader/utils";
import { RBACEmptyState, RoleBasedComponent } from "features/rbac";
import { RQBreadcrumb } from "lib/design-system-v2/components";
import "./mocksList.scss";

interface Props {
  source?: MockListSource;
  type?: MockType;
  mockSelectionCallback?: (url: string) => void;
}

const MockList: React.FC<Props> = ({ source, mockSelectionCallback, type }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState<string>("");
  const [forceRender, setForceRender] = useState(false);
  const filter = (searchParams.get("filter") as MockTableHeaderFilter) || "all";

  const { isLoading, mockRecords } = useFetchMockRecords(type, forceRender);

  const filteredRecords = useMemo(() => {
    return getFilteredRecords(searchValue, filter, mockRecords);
  }, [filter, searchValue, mockRecords]);

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
  };

  return isLoading ? (
    <SpinnerCard customLoadingMessage="Loading Mocks" />
  ) : source === MockListSource.PICKER_MODAL ? (
    <>
      <MockPickerIndex
        records={mockRecords}
        mockRecords={filteredRecords}
        handleItemSelect={handleItemSelect}
        handleSelectAction={handleSelectAction}
        handleNameClick={handleNameClick}
      />

      <MockUploaderModalWrapper selectMockOnUpload={handleSelectAction} />
      <ImportMocksModalWrapper />
    </>
  ) : mockRecords.length > 0 ? (
    <>
      <div className="rq-mocks-list-container">
        <RQBreadcrumb />

        <MocksListContentHeader
          source={source}
          records={mockRecords}
          mockRecords={filteredRecords}
          mockType={type}
          searchValue={searchValue}
          setSearchValue={handleSearch}
          filter={filter}
        />

        <div className="mocks-table-container">
          <MocksTable
            source={source}
            isLoading={isLoading}
            mockType={type}
            records={mockRecords}
            filteredRecords={filteredRecords}
            handleItemSelect={handleItemSelect}
            handleNameClick={handleNameClick}
            handleEditAction={handleEditAction}
            forceRender={_forceRender}
          />
        </div>
      </div>

      <NewFileModalWrapper />

      <MockUploaderModalWrapper />
      <ExportMocksModalWrapper />
      <ImportMocksModalWrapper forceRender={_forceRender} />

      {/* FIXME: Remove force re-render and instead update the local state */}
      <CreateOrUpdateCollectionModalWrapper forceRender={_forceRender} />
      <DeleteCollectionModalWrapper forceRender={_forceRender} />

      {/* keep this at top level, below modals will be used at multiple places */}
      <DeleteRecordsModalWrapper forceRender={_forceRender} />
      <UpdateMocksCollectionModalWrapper mockType={type} forceRender={_forceRender} mocks={mockRecords} />
    </>
  ) : (
    <RoleBasedComponent
      resource="mock_api"
      permission="create"
      fallback={
        <RBACEmptyState
          title="No mocks created yet."
          description="As a viewer, you will be able to view and test mocks once someone from your team creates them. You can contact your workspace admin to update your role."
        />
      }
    >
      <GettingStarted mockType={type} source={source} forceRender={_forceRender} />
    </RoleBasedComponent>
  );
};

export default MockList;
