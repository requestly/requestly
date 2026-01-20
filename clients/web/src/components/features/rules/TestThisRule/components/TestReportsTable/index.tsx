import React, { useMemo } from "react";
import { getCurrentlySelectedRuleData } from "store/selectors";
import { useSelector } from "react-redux";
import { Col, Popconfirm, Row, Spin, Table } from "antd";
import { TestReport } from "../../types";
import { getFormattedTimestamp } from "utils/DateTimeUtils";
import { MdOutlineCheckCircle } from "@react-icons/all-files/md/MdOutlineCheckCircle";
import { IoMdCloseCircleOutline } from "@react-icons/all-files/io/IoMdCloseCircleOutline";
import { RiDeleteBin6Line } from "@react-icons/all-files/ri/RiDeleteBin6Line";
import { MdOndemandVideo } from "@react-icons/all-files/md/MdOndemandVideo";
import { RQButton } from "lib/design-system/components";
import { redirectToUrl } from "utils/RedirectionUtils";
import { LoadingOutlined } from "@ant-design/icons";
import { trackTestRuleResultClicked } from "../../analytics";
import "./index.scss";

interface TestReportsTableProps {
  testReports: TestReport[];
  deleteReport: (reportId: string) => void;
}

export const TestReportsTable: React.FC<TestReportsTableProps> = ({ testReports, deleteReport }) => {
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);

  const columns = useMemo(
    () => [
      {
        title: "URL",
        key: "url",
        width: 220,
        ellipsis: true,
        render: (_: any, record: TestReport) => (
          <div className="text-white test-report-url">
            <span>{record.url}</span>
          </div>
        ),
      },
      {
        title: "Tested on",
        key: "timestamp",
        width: 150,
        render: (_: any, record: TestReport) => <div>{getFormattedTimestamp(record.timestamp)}</div>,
      },
      {
        title: "Status",
        key: "status",
        width: 140,
        render: (_: any, record: TestReport) => (
          <div className="test-report-status">
            {record.appliedStatus ? (
              <>
                <MdOutlineCheckCircle className="test-report-status-success" />
                <span className="test-report-status-success-text">RULE EXECUTED</span>
              </>
            ) : (
              <>
                <IoMdCloseCircleOutline className="test-report-status-fail" />
                <span className="test-report-status-fail-text">FAILED</span>
              </>
            )}
          </div>
        ),
      },
      {
        title: "",
        key: "actions",
        width: 175,
        render: (_: any, record: TestReport) => {
          if (record?.isSessionSaving) {
            return (
              <Row gutter={8} align="middle" justify="end" className="saving-test-session-status">
                <Col>
                  <Spin indicator={<LoadingOutlined className="saving-test-session-spinner" spin />} />
                </Col>
                <Col>Creating session..</Col>
              </Row>
            );
          }
          return (
            <div className="test-report-action-buttons-container">
              {record.sessionLink && (
                <RQButton
                  size="small"
                  className="watch-test-session-btn"
                  type="default"
                  icon={<MdOndemandVideo />}
                  onClick={() => {
                    trackTestRuleResultClicked(currentlySelectedRuleData.ruleType, record.sessionLink ?? null);
                    redirectToUrl(record?.sessionLink, true);
                  }}
                >
                  Watch session
                </RQButton>
              )}

              <Popconfirm
                title="Are you sure to delete this test?"
                okText="Yes"
                cancelText="No"
                overlayClassName="test-report-delete-popconfirm"
                onConfirm={() => deleteReport(record.id)}
                showArrow={false}
              >
                <RQButton className="test-report-delete-btn" iconOnly icon={<RiDeleteBin6Line />} />
              </Popconfirm>
            </div>
          );
        },
      },
    ],
    [deleteReport, currentlySelectedRuleData.ruleType]
  );

  return (
    <Table
      columns={columns}
      dataSource={testReports}
      className="test-reports-table"
      pagination={false}
      scroll={{ y: "auto" }}
    />
  );
};
