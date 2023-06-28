import {
  CloudUploadOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { RQButton, RQInput } from "lib/design-system/components";
import { Tooltip, Space, Row, Col, Table, Typography } from "antd";
import APP_CONSTANTS from "config/constants";
import { AUTH } from "modules/analytics/events/common/constants";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { HiOutlineBookOpen } from "react-icons/hi";
import { IoMdLink } from "react-icons/io";
import { UserIcon } from "components/common/UserIcon";
import REQUEST_METHOD_COLORS from "constants/requestMethodColors";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { MockType, RQMockMetadataSchema } from "../../types";
import { generateFinalUrl, fileTypeColorMap } from "../../utils";
import CopyButton from "components/misc/CopyButton";
import { AuthConfirmationPopover } from "components/hoc/auth/AuthConfirmationPopover";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import { getCurrentlyActiveWorkspace, getIsWorkspaceMode } from "store/features/teams/selectors";
import "../../../../../styles/custom/RQTable.css";
import "./index.css";

interface Props {
  mocks: RQMockMetadataSchema[];
  mockType: string;
  handleCreateNew: () => void;
  handleNameClick: (mockId: string, isOldMock: boolean) => void;
  handleItemSelect: (mockId: string, url: string, isOldMock: boolean) => void;
  handleDeleteAction?: (mock: RQMockMetadataSchema) => void;

  // actions
  handleEditAction?: (mockId: string, isOldMock: boolean) => void;
  handleSelectAction?: (url: string) => void;
  handleUploadAction?: () => void;
}

const MocksTable: React.FC<Props> = ({
  mocks,
  mockType,
  handleCreateNew,
  handleNameClick,
  handleItemSelect,
  handleEditAction,
  handleSelectAction,
  handleUploadAction,
  handleDeleteAction,
}) => {
  const user = useSelector(getUserAuthDetails);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const teamId = workspace?.id;

  const [filteredMocks, setFilteredMocks] = useState<RQMockMetadataSchema[]>(mocks);

  useEffect(() => {
    setFilteredMocks([...mocks]);
  }, [mocks]);

  useEffect(() => {
    if (!isWorkspaceMode) {
      if (mockType === "FILE") {
        submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_FILES, mocks?.length);
      } else {
        submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_MOCKS, mocks?.length);
      }
    }
  }, [mockType, mocks?.length, isWorkspaceMode]);

  const columns = [
    {
      title: (
        <div className="rq-col-title">
          <HiOutlineBookOpen />
          Name
        </div>
      ),
      dataIndex: "name",
      textWrap: "word-break",
      ellipsis: true,
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
      width: "auto",
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
      width: "auto",
      textWrap: "word-break",
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
      width: "auto",
      responsive: ["lg"],
      className: "text-gray mock-table-user-icon",
      textAlign: "center",
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
      width: "auto",
      responsive: ["lg"],
      className: "text-gray",
      valueType: "date",
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
      ellipsis: true,
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
                    : generateFinalUrl(record.endpoint, user?.details?.profile?.uid, user?.details?.username, teamId)
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
                    url = generateFinalUrl(record.endpoint, user?.details?.profile?.uid, null, teamId);
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
    columns.splice(3, 1);
  }

  const handleSearch = (searchQuery: string) => {
    if (searchQuery) {
      const searchedMocks = mocks.filter((mock: RQMockMetadataSchema) => {
        return mock.name.toLowerCase().includes(searchQuery.toLowerCase());
      });
      setFilteredMocks([...searchedMocks]);
    } else {
      setFilteredMocks([...mocks]);
    }
  };

  const renderMockTableTitle = () => {
    switch (mockType) {
      case MockType.API:
        return "Mocks";
      case MockType.FILE:
        return "Files";
      default:
        return "Mocks";
    }
  };

  return (
    <>
      <Col span={24} className="mock-table-container">
        <Row justify="space-between" align="middle" wrap={true} gutter={[0, 16]}>
          <Col xs={{ span: 24 }} sm={{ span: 3 }} className="mocks-header-left-section">
            {renderMockTableTitle()}
          </Col>
          <Col flex={1}>
            <Row justify="end" className="mock-table-header-actions">
              <>
                {mockType && (
                  <RQInput
                    allowClear={true}
                    className="mock-search-input"
                    size="small"
                    prefix={<SearchOutlined />}
                    placeholder={`Search by ${mockType === MockType.API ? "mock" : "file"} name`}
                    onChange={(e) => {
                      handleSearch(e.target.value);
                    }}
                  />
                )}
              </>
              <>{mockType && <div className="mock-header-divider"></div>}</>
              <AuthConfirmationPopover
                title="You need to sign up to create API mocks"
                disabled={mockType === MockType.FILE}
                callback={handleCreateNew}
                source={AUTH.SOURCE.CREATE_API_MOCK}
              >
                <RQButton
                  type="primary"
                  onClick={(user?.loggedIn || mockType === MockType.FILE) && handleCreateNew}
                  icon={<PlusOutlined />}
                >
                  Create New
                </RQButton>
              </AuthConfirmationPopover>
              <>
                {handleUploadAction ? (
                  <AuthConfirmationPopover
                    title="You need to sign up to upload mocks"
                    callback={handleUploadAction}
                    source={mockType === MockType.API ? AUTH.SOURCE.CREATE_API_MOCK : AUTH.SOURCE.CREATE_FILE_MOCK}
                  >
                    <RQButton
                      type="default"
                      onClick={() => user?.details?.isLoggedIn && handleUploadAction()}
                      icon={<CloudUploadOutlined />}
                    >
                      Upload {mockType === MockType.FILE ? "File" : "JSON"}
                    </RQButton>
                  </AuthConfirmationPopover>
                ) : null}
              </>
            </Row>
          </Col>
        </Row>
        <Table
          className="rq-table mocks-table"
          pagination={false}
          onRow={(record) => {
            return {
              onClick: (e) => {
                e.preventDefault();
                const url = record.isOldMock
                  ? record.url
                  : generateFinalUrl(record.endpoint, user?.details?.profile?.uid);
                handleItemSelect(record.id, url, record.isOldMock);
              },
            };
          }}
          onHeaderRow={() => {
            return {
              className: "rq-table-header",
            };
          }}
          rowClassName="rq-table-row mock-table-row"
          //@ts-ignore
          columns={columns}
          dataSource={filteredMocks}
        />
      </Col>
    </>
  );
};

export default MocksTable;
