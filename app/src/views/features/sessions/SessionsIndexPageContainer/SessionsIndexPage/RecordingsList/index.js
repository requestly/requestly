import React, { useCallback } from "react";
import { DeleteOutlined, ExclamationCircleOutlined, ShareAltOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import ProCard from "@ant-design/pro-card";
import ProTable from "@ant-design/pro-table";
import { Modal, Space, Tag, Tooltip, Typography } from "antd";
import ReactHoverObserver from "react-hover-observer";
import Text from "antd/lib/typography/Text";
import { epochToDateAndTimeString, msToHoursMinutesAndSeconds } from "utils/DateTimeUtils";
import { Link } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import { getPrettyVisibilityName, renderHeroIcon } from "../../../ShareRecordingModal";
import { deleteRecording } from "../../../api";
import TutorialButton from "../TutorialButton";
import { useSelector } from "react-redux";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import { UserIcon } from "components/common/UserIcon";
import Favicon from "components/misc/Favicon";

const confirmDeleteAction = (id, eventsFilePath, callback) => {
  Modal.confirm({
    title: "Confirm",
    icon: <ExclamationCircleOutlined />,
    content: (
      <div>
        <p>
          Are you sure to delete this recording?
          <br />
          <br />
          Users having the shared link will not be able to access it anymore.
        </p>
      </div>
    ),
    okText: "Delete",
    cancelText: "Cancel",
    onOk: async () => {
      await deleteRecording(id, eventsFilePath);
      callback();
    },
  });
};

const RecordingsList = ({
  isTableLoading,
  filteredRecordings,
  setSharingRecordId,
  setSelectedRowVisibility,
  setIsShareModalVisible,
  ConfigureButton,
  callbackOnDeleteSuccess,
  TableFooter,
  _renderTableFooter,
}) => {
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);

  const getColumns = () => {
    let columns = [
      {
        title: "Name",
        dataIndex: "name",
        width: "30%",
        render: (name, record) => {
          return (
            <Link to={PATHS.SESSIONS.SAVED.ABSOLUTE + "/" + record.id} state={{ fromApp: true }}>
              {name}
            </Link>
          );
        },
      },
      {
        title: "Host",
        dataIndex: "url",
        width: "20%",
        render: (url) => {
          return (
            <>
              <Favicon url={url} />
              <Tooltip title={url}>{` ${new URL(url).hostname}`}</Tooltip>
            </>
          );
        },
      },
      {
        title: "Recorded At",
        dataIndex: "startTime",
        width: "15%",
        render: (ts) => {
          return epochToDateAndTimeString(ts);
        },
      },
      {
        title: "Duration",
        dataIndex: "duration",
        width: "10%",
        render: (ms) => {
          return msToHoursMinutesAndSeconds(ms);
        },
      },
      {
        title: "Created by",
        width: "10%",
        responsive: ["lg"],
        className: "text-gray mock-table-user-icon",
        dataIndex: "createdBy",
        textAlign: "center",
        render: (creatorUserID) => {
          return <UserIcon uid={creatorUserID} />;
        },
      },
      {
        title: "Visibility",
        dataIndex: "visibility",
        align: "center",
        width: "10%",
        render: (visibility) => (
          <Tooltip title={getPrettyVisibilityName(visibility, isWorkspaceMode)}>
            {renderHeroIcon(visibility, "1em")}
          </Tooltip>
        ),
      },

      {
        title: "",
        width: "15%",
        dataIndex: "id",
        render: (id, record) => {
          return (
            <>
              <div className="rule-action-buttons">
                <ReactHoverObserver>
                  {({ isHovering }) => (
                    <Space>
                      <Text
                        type={isHovering ? "primary" : "secondary"}
                        style={{
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setSharingRecordId(id);
                          setSelectedRowVisibility(record.visibility);
                          setIsShareModalVisible(true);
                        }}
                      >
                        <Tooltip title="Share with your Teammates">
                          <Tag>
                            <ShareAltOutlined />
                          </Tag>
                        </Tooltip>
                      </Text>

                      <Text type={isHovering ? "primary" : "secondary"} style={{ cursor: "pointer" }}>
                        <Tooltip title="Delete" placement="bottom">
                          <Tag onClick={() => confirmDeleteAction(id, record.eventsFilePath, callbackOnDeleteSuccess)}>
                            <DeleteOutlined
                              style={{
                                padding: "5px 0px",
                                fontSize: "12px",
                                cursor: "pointer",
                              }}
                            />
                          </Tag>
                        </Tooltip>
                      </Text>
                    </Space>
                  )}
                </ReactHoverObserver>
              </div>
            </>
          );
        },
      },
    ];

    if (!isWorkspaceMode) {
      columns = columns.filter((colObj) => {
        return colObj.title !== "Created by";
      });
    }

    return columns;
  };

  const getStableColumns = useCallback(getColumns, [
    isWorkspaceMode,
    callbackOnDeleteSuccess,
    setIsShareModalVisible,
    setSelectedRowVisibility,
    setSharingRecordId,
  ]);

  return (
    <ProCard className="primary-card github-like-border rules-table-container" title={null}>
      <ProTable
        className="records-table"
        loading={isTableLoading}
        dataSource={filteredRecordings}
        scroll={{ x: 700 }}
        columns={getStableColumns()}
        rowKey="id"
        search={false}
        pagination={false}
        options={false}
        toolBarRender={() => [<ConfigureButton />]}
        headerTitle={
          <>
            <Typography.Title level={4} style={{ marginBottom: 0 }}>
              Session Recordings
            </Typography.Title>
            <TutorialButton type="link" style={{ padding: 10 }}>
              <Tooltip title="See how the feature works" placement="right">
                <QuestionCircleOutlined />
              </Tooltip>
            </TutorialButton>
          </>
        }
        footer={_renderTableFooter ? () => <TableFooter /> : null}
      />
    </ProCard>
  );
};

export default RecordingsList;
