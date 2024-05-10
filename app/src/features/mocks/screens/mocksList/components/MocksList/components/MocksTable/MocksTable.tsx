import React, { useCallback, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Empty } from "antd";
import APP_CONSTANTS from "config/constants";
import { getUserAuthDetails } from "store/selectors";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import { MockRecordType, MockType, RQMockMetadataSchema } from "components/features/mocksV2/types";
import { generateFinalUrl } from "components/features/mocksV2/utils";
import { ContentListTable, useContentListTableContext, withContentListTableContext } from "componentsV2/ContentList";
import { useMocksTableColumns } from "./hooks/useMocksTableColumns";
import { enhanceRecords, isRecordMockCollection, recordsToContentTableDataAdapter } from "./utils";
import { RiDeleteBin2Line } from "@react-icons/all-files/ri/RiDeleteBin2Line";
import { ImUngroup } from "@react-icons/all-files/im/ImUngroup";
import { RiFolderSharedLine } from "@react-icons/all-files/ri/RiFolderSharedLine";
import { useMocksActionContext } from "features/mocks/contexts/actions";
import PATHS from "config/constants/sub/paths";
import { trackMocksListBulkActionPerformed } from "modules/analytics/events/features/mocksV2";
import "./mocksTable.scss";

export interface MocksTableProps {
  isLoading?: boolean;
  records: RQMockMetadataSchema[];
  filteredRecords: RQMockMetadataSchema[];
  mockType?: MockType;
  handleNameClick: (mockId: string, isOldMock: boolean) => void;
  handleItemSelect: (mockId: string, url: string, isOldMock: boolean) => void;

  // actions
  handleEditAction?: (mockId: string, isOldMock: boolean) => void;
  handleSelectAction?: (url: string) => void;
  forceRender?: () => void;
}

export const MocksTable: React.FC<MocksTableProps> = ({
  records,
  filteredRecords,
  mockType,
  isLoading = false,
  handleNameClick,
  handleItemSelect,
  handleEditAction,
  handleSelectAction,
  forceRender = () => {},
}) => {
  const { clearSelectedRows } = useContentListTableContext();

  const { pathname } = useLocation();
  const isRuleEditor = pathname.includes(PATHS.RULE_EDITOR.RELATIVE);
  const user = useSelector(getUserAuthDetails);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);

  useEffect(() => {
    if (!isWorkspaceMode) {
      if (mockType === MockType.FILE) {
        submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_FILES, filteredRecords?.length);
      } else {
        submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_MOCKS, filteredRecords?.length);
      }
    }
  }, [mockType, filteredRecords?.length, isWorkspaceMode]);

  const contentTableAdaptedRecords = useMemo(() => {
    const enhancedRecords = enhanceRecords(filteredRecords, records);
    return recordsToContentTableDataAdapter(enhancedRecords);
  }, [filteredRecords]);

  // TODO: move all actions in a hook and use that
  const columns = useMocksTableColumns({
    mockType,
    handleNameClick,
    handleEditAction,
    handleSelectAction,
    forceRender,
  });

  const { deleteRecordsModalAction, updateMocksCollectionAction, removeMocksFromCollectionAction } =
    useMocksActionContext() ?? {};

  const getBulkActionBarInfoText = useCallback((selectedRows: RQMockMetadataSchema[]) => {
    let mocks = 0;
    let collections = 0;

    selectedRows.forEach((record) => {
      isRecordMockCollection(record) ? collections++ : mocks++;
    });

    const formatCount = (count: number, singular: string, plural: string) => {
      return count > 0 ? `${count} ${count > 1 ? plural : singular}` : "";
    };

    const recordType = mockType === MockType.API ? "Mock" : "File";
    const mockString = formatCount(mocks, recordType, recordType + "s");
    const collectionString = formatCount(collections, "Collection", "Collections");

    return `${collectionString}${collectionString && mockString ? " and " : ""}${mockString} selected`;
  }, []);

  return (
    <ContentListTable
      loading={isLoading}
      id="mock-list-table"
      pagination={false}
      size="middle"
      rowKey="id"
      className="rq-mocks-list-table"
      customRowClassName={(record) => {
        return `rq-mocks-list-table-row ${record.isFavourite ? "starred" : "unstarred"} ${
          record.recordType === MockRecordType.COLLECTION ? "collection-row" : "mock-row"
        }`;
      }}
      // @ts-ignore
      columns={columns}
      data={contentTableAdaptedRecords}
      locale={{
        emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No mock/file found!" />,
      }}
      onRow={(record) => {
        return {
          onClick: (e) => {
            e.preventDefault();

            if (isRecordMockCollection(record)) {
              return;
            }

            const url = record.isOldMock ? record.url : generateFinalUrl(record.endpoint, user?.details?.profile?.uid);
            handleItemSelect(record.id, url, record.isOldMock);
          },
        };
      }}
      bulkActionBarConfig={
        isRuleEditor
          ? null
          : {
              options: {
                infoText: (selectedRows) => getBulkActionBarInfoText(selectedRows),
                actionButtons: [
                  {
                    label: "Move",
                    icon: <RiFolderSharedLine />,
                    onClick: (selectedRows) => {
                      const onSuccess = () => {
                        trackMocksListBulkActionPerformed("move_mocks_into_collection", mockType);
                        clearSelectedRows();
                      };

                      updateMocksCollectionAction(selectedRows, onSuccess);
                    },
                  },
                  {
                    label: "Remove from Collection",
                    icon: <ImUngroup />,
                    hidden: (selectedRows) => !selectedRows.some((row) => row?.collectionId?.length > 0),
                    onClick: (selectedRows) => {
                      const onSuccess = () => {
                        trackMocksListBulkActionPerformed("remove_mocks_from_collections", mockType);
                        forceRender();
                        clearSelectedRows();
                      };

                      removeMocksFromCollectionAction(selectedRows, onSuccess);
                    },
                  },
                  {
                    danger: true,
                    label: "Delete",
                    icon: <RiDeleteBin2Line />,
                    onClick: (selectedRows) => {
                      const onSuccess = () => {
                        trackMocksListBulkActionPerformed("delete", mockType);
                        clearSelectedRows();
                      };

                      deleteRecordsModalAction(selectedRows, onSuccess);
                    },
                  },
                ],
              },
            }
      }
    />
  );
};

export default withContentListTableContext(MocksTable);
