import React, { useCallback, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Empty } from "antd";
import APP_CONSTANTS from "config/constants";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import {
  MockListSource,
  MockRecordType,
  MockType,
  RQMockCollection,
  RQMockMetadataSchema,
} from "components/features/mocksV2/types";
import { generateFinalUrl } from "components/features/mocksV2/utils";
import {
  ContentListTable,
  ContentListTableProps,
  useContentListTableContext,
  withContentListTableContext,
} from "componentsV2/ContentList";
import { useMocksTableColumns } from "./hooks/useMocksTableColumns";
import { enhanceRecords, isCollection, recordsToContentTableDataAdapter } from "./utils";
import { RiDeleteBin2Line } from "@react-icons/all-files/ri/RiDeleteBin2Line";
import { ImUngroup } from "@react-icons/all-files/im/ImUngroup";
import { RiFolderSharedLine } from "@react-icons/all-files/ri/RiFolderSharedLine";
import { MdDownload } from "@react-icons/all-files/md/MdDownload";
import { useMocksActionContext } from "features/mocks/contexts/actions";
import PATHS from "config/constants/sub/paths";
import { trackMocksListBulkActionPerformed } from "modules/analytics/events/features/mocksV2";
import "./mocksTable.scss";
import { updateMocksCollection } from "backend/mocks/updateMocksCollection";
import { getActiveWorkspaceId, isActiveWorkspaceShared } from "store/slices/workspaces/selectors";
import { useRBAC } from "features/rbac";

export interface MocksTableProps {
  source: MockListSource;
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
  source,
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
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("mock_api", "create");

  const { pathname } = useLocation();
  const isRuleEditor = pathname.includes(PATHS.RULE_EDITOR.RELATIVE);
  const user = useSelector(getUserAuthDetails);
  const isSharedWorkspaceMode = useSelector(isActiveWorkspaceShared);
  const uid = user?.details?.profile?.uid;
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);

  useEffect(() => {
    if (!isSharedWorkspaceMode) {
      if (mockType === MockType.FILE) {
        submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_FILES, filteredRecords?.length);
      } else {
        submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_MOCKS, filteredRecords?.length);
      }
    }
  }, [mockType, filteredRecords?.length, isSharedWorkspaceMode]);

  const allRecordsMap = useMemo(() => {
    const recordsMap: { [id: string]: RQMockMetadataSchema } = {};

    records.forEach((record) => {
      recordsMap[record.id] = record;
    });

    return recordsMap;
  }, [records]);

  const contentTableAdaptedRecords = useMemo(() => {
    const enhancedRecords = enhanceRecords(filteredRecords, allRecordsMap).filter(Boolean);
    return recordsToContentTableDataAdapter(enhancedRecords);
  }, [filteredRecords, allRecordsMap]);

  // TODO: move all actions in a hook and use that
  const columns = useMocksTableColumns({
    source,
    mockType,
    handleNameClick,
    handleEditAction,
    handleSelectAction,
    forceRender,
    allRecordsMap,
  });

  const { deleteRecordsAction, updateMocksCollectionAction, removeMocksFromCollectionAction, exportMocksAction } =
    useMocksActionContext() ?? {};

  const getBulkActionBarInfoText = useCallback(
    (selectedRows: RQMockMetadataSchema[]) => {
      let mocks = 0;
      let collections = 0;

      selectedRows.forEach((record) => {
        isCollection(record) ? collections++ : mocks++;
      });

      const formatCount = (count: number, singular: string, plural: string) => {
        return count > 0 ? `${count} ${count > 1 ? plural : singular}` : "";
      };

      const recordType = mockType === MockType.API ? "Mock" : "File";
      const mockString = formatCount(mocks, recordType, recordType + "s");
      const collectionString = formatCount(collections, "Collection", "Collections");

      return `${collectionString}${collectionString && mockString ? " and " : ""}${mockString} selected`;
    },
    [mockType]
  );

  // TODO: move into actions
  const updateCollectionOnDrop = useCallback(
    (mockId: string, collectionId: string) => {
      const mockIds = [mockId];
      const collectionPath = ((allRecordsMap[collectionId] as unknown) as RQMockCollection)?.path ?? "";

      updateMocksCollection(uid, mockIds, collectionId, collectionPath, activeWorkspaceId).then(() => {
        forceRender();
      });
    },
    [uid, activeWorkspaceId, forceRender, allRecordsMap]
  );

  const onRowDropped: ContentListTableProps<RQMockMetadataSchema>["onRowDropped"] = useCallback(
    (dragRecordId, targetRecordId) => {
      if (!dragRecordId || !targetRecordId) {
        return;
      }

      const dragRecord = allRecordsMap[dragRecordId];
      const targetRecord = allRecordsMap[targetRecordId];

      if (dragRecord?.recordType === MockRecordType.COLLECTION) {
        return;
      }

      if (dragRecord?.recordType === MockRecordType.MOCK) {
        if (targetRecord?.recordType === MockRecordType.COLLECTION) {
          if (dragRecord?.collectionId !== targetRecord?.id) {
            updateCollectionOnDrop(dragRecord.id, targetRecord?.id);
          }
        } else if (targetRecord?.recordType === MockRecordType.MOCK) {
          if ((dragRecord?.collectionId !== targetRecord?.collectionId, dragRecord)) {
            updateCollectionOnDrop(dragRecord.id, targetRecord?.collectionId);
          }
        }
      }
    },
    [allRecordsMap, updateCollectionOnDrop]
  );

  return (
    <ContentListTable
      isRowSelectable={isValidPermission}
      dragAndDrop={isValidPermission}
      onRowDropped={onRowDropped}
      loading={isLoading}
      id="mock-list-table"
      pagination={false}
      size="middle"
      rowKey="id"
      className={`rq-mocks-list-table ${!isValidPermission ? "read-only" : ""}`}
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

            if (isCollection(record)) {
              return;
            }

            const url = record.isOldMock
              ? record.url
              : generateFinalUrl({ endpoint: record.endpoint, uid: user?.details?.profile?.uid });
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
                    label: "Export",
                    icon: <MdDownload />,
                    onClick: (selectedRows) => {
                      const onSuccess = () => {
                        trackMocksListBulkActionPerformed("export", mockType);
                        clearSelectedRows();
                      };

                      exportMocksAction(selectedRows, onSuccess);
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

                      deleteRecordsAction(selectedRows, onSuccess);
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
