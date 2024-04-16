import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  DeleteOutlined,
  EditOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { RQButton } from "lib/design-system/components";
import { Tooltip, Space, Table, Typography, Empty } from "antd";
import APP_CONSTANTS from "config/constants";
import moment from "moment";
import { HiOutlineBookOpen } from "@react-icons/all-files/hi/HiOutlineBookOpen";
import { IoMdLink } from "@react-icons/all-files/io/IoMdLink";
import { UserIcon } from "components/common/UserIcon";
import { getUserAuthDetails } from "store/selectors";
import CopyButton from "components/misc/CopyButton";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import { getCurrentlyActiveWorkspace, getIsWorkspaceMode } from "store/features/teams/selectors";
import { MockType, RQMockMetadataSchema } from "features/mocks/types";
import { fileTypeColorMap, generateFinalUrl } from "components/features/mocksV2/utils";
import REQUEST_METHOD_COLORS from "components/features/mocksV2/MockList/MocksTable/constants/requestMethodColors";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { ContentListTable, ContentListTableProps } from "componentsV2/ContentList";
import "./mocksTable.scss";

interface Props {
  isLoading?: boolean;
  mocks: RQMockMetadataSchema[];
  mockType?: string;
  handleCreateNew: () => void;
  handleNameClick: (mockId: string, isOldMock: boolean) => void;
  handleItemSelect: (mockId: string, url: string, isOldMock: boolean) => void;
  handleDeleteAction?: (mock: RQMockMetadataSchema) => void;

  // actions
  handleEditAction?: (mockId: string, isOldMock: boolean) => void;
  handleSelectAction?: (url: string) => void;
  handleUploadAction?: () => void;
}

export const MocksTable: React.FC<Props> = ({
  mocks,
  mockType,
  isLoading = false,
  handleNameClick,
  handleItemSelect,
  handleEditAction,
  handleSelectAction,
  handleDeleteAction,
}) => {
  const user = useSelector(getUserAuthDetails);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const teamId = workspace?.id;

  useEffect(() => {
    if (!isWorkspaceMode) {
      if (mockType === "FILE") {
        submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_FILES, mocks?.length);
      } else {
        submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_MOCKS, mocks?.length);
      }
    }
  }, [mockType, mocks?.length, isWorkspaceMode]);

  const columns: ContentListTableProps<RQMockMetadataSchema>["columns"] = [
    {
      ...Table.SELECTION_COLUMN,
      width: 0,
    },
    {
      title: (
        <div className="rq-col-title">
          <HiOutlineBookOpen />
          Name
        </div>
      ),
      dataIndex: "name",
      ellipsis: true,
      width: 140,
      render: (_: any, record: RQMockMetadataSchema) => {
        return (
          <Typography.Text
            ellipsis={true}
            className="primary-cell"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleNameClick(record.id, record.isOldMock);
            }}
          >
            {record.name}
          </Typography.Text>
        );
      },
    },
    {
      title: (
        <div className="rq-col-title">
          <AppstoreOutlined />
          {mockType ? (mockType === MockType.FILE ? "Type" : "Method") : "Method/Type"}
        </div>
      ),
      dataIndex: "method",
      width: 80,
      render: (_: any, record: RQMockMetadataSchema) => {
        return (
          <>
            <span
              style={{
                color:
                  record?.type === MockType.API
                    ? REQUEST_METHOD_COLORS[record.method]
                    : fileTypeColorMap[record.fileType],
              }}
              className="mock-tag"
            >
              {record?.type === MockType.API ? record.method : record.fileType}
            </span>
          </>
        );
      },
    },
    {
      title: (
        <div className="rq-col-title">
          <IoMdLink />
          Endpoint
        </div>
      ),
      dataIndex: "endpoint",
      width: 140,
      className: "text-gray",
      ellipsis: true,
      render: (_: any, record: RQMockMetadataSchema) => {
        return (
          <Typography.Text className="text-gray" ellipsis={true}>
            {"/" + record.endpoint}
          </Typography.Text>
        );
      },
    },
    {
      title: <div className="rq-col-title">Created by</div>,
      width: 70,
      responsive: ["lg"],
      className: "text-gray mock-table-user-icon",
      render: (_: any, record: RQMockMetadataSchema) => {
        return <UserIcon uid={record.createdBy} />;
      },
    },
    {
      title: (
        <div className="rq-col-title">
          <CalendarOutlined />
          Last Modified
        </div>
      ),
      width: 120,
      responsive: ["lg"],
      className: "text-gray",
      render: (_: any, record: RQMockMetadataSchema) => {
        return (
          <>
            {moment(record.updatedTs).format("MMM DD, YYYY") + (record.isOldMock ? "." : "")}{" "}
            {isWorkspaceMode && (
              <>
                by <UserIcon uid={record.lastUpdatedBy ?? record.createdBy} />
              </>
            )}
          </>
        );
      },
    },
    {
      title: (
        <div className="rq-col-title">
          <InfoCircleOutlined />
          Actions
        </div>
      ),
      width: 130,
      render: (_: any, record: RQMockMetadataSchema) => {
        return (
          <Space className="mock-actions-container">
            {handleEditAction ? (
              <Tooltip title="Edit">
                <RQButton
                  type="text"
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditAction(record.id, record.isOldMock);
                  }}
                ></RQButton>
              </Tooltip>
            ) : null}
            {handleDeleteAction ? (
              <Tooltip title="Delete">
                <RQButton
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAction(record);
                  }}
                ></RQButton>
              </Tooltip>
            ) : null}

            {mockType && (
              <CopyButton
                title="Copy Link"
                copyText={
                  record.isOldMock
                    ? record.url
                    : generateFinalUrl(
                        record.endpoint,
                        user?.details?.profile?.uid,
                        user?.details?.username,
                        teamId,
                        record?.password
                      )
                }
                disableTooltip={true}
                showIcon={false}
                type="primary"
              />
            )}

            {handleSelectAction ? (
              <RQButton
                size="small"
                type="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  let url = "";
                  if (record.isOldMock) {
                    url = record.url;
                  } else {
                    // Not sending username as it might change
                    url = generateFinalUrl(
                      record.endpoint,
                      user?.details?.profile?.uid,
                      null,
                      teamId,
                      record?.password
                    );
                  }
                  handleSelectAction(url);
                }}
              >
                Select
              </RQButton>
            ) : null}
          </Space>
        );
      },
    },
  ];

  if (!isWorkspaceMode) {
    //remove created by column from mock table in private workspace
    columns.splice(4, 1);
  }

  const isFeatureLimiterOn = useFeatureIsOn("show_feature_limit_banner");
  const isFeatureLimitbannerShown = isFeatureLimiterOn && user?.isLimitReached;

  return (
    <ContentListTable
      loading={isLoading}
      id="mock-list-table"
      pagination={false}
      size="middle"
      scroll={{ y: `calc(100vh - ${isFeatureLimitbannerShown ? "(277px + 68px)" : "277px"})` }} // 68px is Feature limit banner height
      // @ts-ignore
      columns={columns}
      data={mocks}
      locale={{
        emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No rule found" />,
      }}
      onHeaderRow={() => {
        return {
          className: "rq-table-header",
        };
      }}
      onRow={(record) => {
        return {
          onClick: (e) => {
            e.preventDefault();
            const url = record.isOldMock ? record.url : generateFinalUrl(record.endpoint, user?.details?.profile?.uid);
            handleItemSelect(record.id, url, record.isOldMock);
          },
        };
      }}
    />
  );
};
