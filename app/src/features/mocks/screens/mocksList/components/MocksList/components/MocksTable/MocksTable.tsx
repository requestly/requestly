import React, { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { Empty } from "antd";
import APP_CONSTANTS from "config/constants";
import { getUserAuthDetails } from "store/selectors";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import { RQMockMetadataSchema } from "components/features/mocksV2/types";
import { generateFinalUrl } from "components/features/mocksV2/utils";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { ContentListTable } from "componentsV2/ContentList";
import { useMocksTableColumns } from "./hooks/useMocksTableColumns";
import { isRecordMockCollection, mocksToContentTableDataAdapter } from "./utils";
import "./mocksTable.scss";

export interface MocksTableProps {
  isLoading?: boolean;
  mocks: RQMockMetadataSchema[];
  mockType?: string;
  handleNameClick: (mockId: string, isOldMock: boolean) => void;
  handleItemSelect: (mockId: string, url: string, isOldMock: boolean) => void;
  handleDeleteAction?: (mock: RQMockMetadataSchema) => void;

  // actions
  handleEditAction?: (mockId: string, isOldMock: boolean) => void;
  handleSelectAction?: (url: string) => void;
  handleUploadAction?: () => void;
  handleUpdateCollectionAction?: (collection: RQMockMetadataSchema) => void;
  handleDeleteCollectionAction?: (collection: RQMockMetadataSchema) => void;
  handleUpdateMockCollectionAction?: (mock: RQMockMetadataSchema) => void;
}

export const MocksTable: React.FC<MocksTableProps> = ({
  mocks,
  mockType,
  isLoading = false,
  handleNameClick,
  handleItemSelect,
  handleEditAction,
  handleSelectAction,
  handleDeleteAction,
  handleUpdateCollectionAction,
  handleDeleteCollectionAction,
  handleUpdateMockCollectionAction,
}) => {
  const user = useSelector(getUserAuthDetails);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);

  useEffect(() => {
    if (!isWorkspaceMode) {
      if (mockType === "FILE") {
        submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_FILES, mocks?.length);
      } else {
        submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_MOCKS, mocks?.length);
      }
    }
  }, [mockType, mocks?.length, isWorkspaceMode]);

  const contentTableAdaptedMocks = useMemo(() => mocksToContentTableDataAdapter(mocks), [mocks]);

  // TODO: move all actions in a hook and use that
  const columns = useMocksTableColumns({
    mockType,
    handleNameClick,
    handleEditAction,
    handleDeleteAction,
    handleSelectAction,
    handleUpdateCollectionAction,
    handleDeleteCollectionAction,
    handleUpdateMockCollectionAction,
  });

  const isFeatureLimiterOn = useFeatureIsOn("show_feature_limit_banner");
  const isFeatureLimitbannerShown = isFeatureLimiterOn && user?.isLimitReached;

  return (
    <ContentListTable
      loading={isLoading}
      id="mock-list-table"
      pagination={false}
      size="middle"
      rowKey="id"
      className="rq-mocks-list-table"
      customRowClassName={() => "rq-mocks-list-table-row"}
      scroll={{ y: `calc(100vh - ${isFeatureLimitbannerShown ? "(232px + 68px)" : "232px"})` }} // 68px is Feature limit banner height
      // @ts-ignore
      columns={columns}
      data={contentTableAdaptedMocks}
      locale={{
        emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No rule found" />,
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
    />
  );
};
