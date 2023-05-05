import ReactHoverObserver from "react-hover-observer";
import ProCard from "@ant-design/pro-card";
import ProTable from "@ant-design/pro-table";
import PATHS from "config/constants/sub/paths";
import { Link, useNavigate } from "react-router-dom";
import { epochToDateAndTimeString } from "utils/DateTimeUtils";
import { Modal, Space, Tag, Tooltip, Typography } from "antd";
import { DeleteOutlined, DownloadOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { deleteRecording, getRecording } from "./actions";
import { downloadHar } from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/harLogs/utils";
import ImportandSaveNetworkHarModalButton from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/HarImportModal";
import { toast } from "utils/Toast";
import { redirectToNetworkSession } from "utils/RedirectionUtils";
import { useCallback } from "react";
import {
  ActionSource,
  trackDeleteNetworkSessionCanceled,
  trackDeleteNetworkSessionClicked,
  trackDeleteNetworkSessionConfirmed,
  trackDownloadNetworkSessionClicked,
} from "modules/analytics/events/features/sessionRecording/networkSessions";

const { Text } = Typography;

export const confirmAndDeleteRecording = (id, callback) => {
  Modal.confirm({
    title: "Confirm",
    icon: <ExclamationCircleOutlined />,
    content: (
      <div>
        <p>Are you sure you want to delete this recording?</p>
      </div>
    ),
    okText: "Delete",
    cancelText: "Cancel",
    onCancel: trackDeleteNetworkSessionCanceled,
    onOk: () => {
      deleteRecording(id);
      trackDeleteNetworkSessionConfirmed();
      callback();
    },
  });
};

const NetworkSessionsList = ({ networkSessionsMetadata }) => {
  const navigate = useNavigate();
  const stableOnSuccessfulHarImport = useCallback(
    (sessionId) => {
      toast.success("Successfully imported Har");
      redirectToNetworkSession(navigate, sessionId);
    },
    [navigate]
  );

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      width: "40%",
      render: (name, record) => {
        return (
          <Link to={PATHS.SESSIONS.NETWORK.ABSOLUTE + "/" + record.id} state={{ fromApp: true }}>
            {name}
          </Link>
        );
      },
    },
    {
      title: "Recorded At",
      dataIndex: "ts",
      width: "20%",
      render: (ts) => {
        return epochToDateAndTimeString(ts);
      },
    },
    {
      title: "",
      dataIndex: "id",
      width: "30%",
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
                      onClick={async () => {
                        const sessionRecord = await getRecording(id);
                        downloadHar(sessionRecord.har || {}, record.name);
                        trackDownloadNetworkSessionClicked(ActionSource.List);
                      }}
                    >
                      <Tooltip title="Download Recording">
                        <Tag>
                          <DownloadOutlined />
                        </Tag>
                      </Tooltip>
                    </Text>

                    <Text type={isHovering ? "primary" : "secondary"} style={{ cursor: "pointer" }}>
                      <Tooltip title="Delete">
                        <Tag
                          onClick={() => {
                            confirmAndDeleteRecording(id, () => {
                              console.log(`${id} deleted`);
                            });
                            trackDeleteNetworkSessionClicked(ActionSource.List);
                          }}
                        >
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

  return (
    <ProCard className="primary-card github-like-border network-session-table-container" title={null}>
      <ProTable
        dataSource={networkSessionsMetadata}
        scroll={{ x: 700 }}
        columns={columns}
        rowKey="id"
        pagination={false}
        options={false}
        search={false}
        headerTitle={
          <Space align="center" className="network-session-list-header">
            <Typography.Title level={4} className="network-session-list-heading">
              Network Session Recordings
            </Typography.Title>
            <ImportandSaveNetworkHarModalButton onSaved={stableOnSuccessfulHarImport} btnText="Import External Har" />
          </Space>
        }
      />
    </ProCard>
  );
};

export default NetworkSessionsList;
