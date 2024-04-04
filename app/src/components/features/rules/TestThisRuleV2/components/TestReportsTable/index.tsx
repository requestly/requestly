import React, { useMemo } from "react";
import { Col, Row, Spin, Table } from "antd";

import { TestReport } from "../../types";
import { EmptyTestResultScreen } from "../EmptyTestResultScreen";
import { getFormattedTimestamp } from "utils/DateTimeUtils";
import { MdOutlineCheckCircle } from "@react-icons/all-files/md/MdOutlineCheckCircle";
import { IoMdCloseCircleOutline } from "@react-icons/all-files/io/IoMdCloseCircleOutline";
import { RiDeleteBin6Line } from "@react-icons/all-files/ri/RiDeleteBin6Line";
import { MdOndemandVideo } from "@react-icons/all-files/md/MdOndemandVideo";
import { RQButton } from "lib/design-system/components";
import { redirectToUrl } from "utils/RedirectionUtils";
import { useBottomSheetContext } from "componentsV2/BottomSheet";
import { LoadingOutlined } from "@ant-design/icons";
import "./index.scss";

interface TestReportsTableProps {
  testReports: TestReport[];
  newReportId: string;
  isSessionSaving: boolean;
}

export const TestReportsTable: React.FC<TestReportsTableProps> = ({ testReports, newReportId, isSessionSaving }) => {
  const { viewAsPanel } = useBottomSheetContext();

  const columns = useMemo(
    () => [
      {
        title: "URL",
        key: "url",
        width: viewAsPanel ? 200 : 240,
        ellipsis: true,
        render: (_: any, record: TestReport) => <div className="text-white">{record.url}</div>,
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
        render: (_: any, record: TestReport) => (
          <>
            {record?.sessionLink && (
              <div className="test-report-action-buttons-container">
                <RQButton
                  size="small"
                  className="watch-test-session-btn"
                  type="default"
                  icon={<MdOndemandVideo />}
                  onClick={() => redirectToUrl(record?.sessionLink, true)}
                >
                  Watch session
                </RQButton>
                <RQButton className="test-report-delete-btn" iconOnly icon={<RiDeleteBin6Line />} />
              </div>
            )}
            {isSessionSaving && record.id === newReportId && (
              <Row gutter={8} align="middle" className="saving-test-session-status">
                <Col>
                  <Spin indicator={<LoadingOutlined className="saving-test-session-spinner" spin />} />
                </Col>
                <Col>Creating session..</Col>
              </Row>
            )}
          </>
        ),
      },
    ],
    [viewAsPanel, isSessionSaving, newReportId]
  );

  if (!testReports) {
    return <EmptyTestResultScreen />;
  }

  return (
    <Table
      columns={columns}
      dataSource={testReports}
      className="test-reports-table"
      pagination={false}
      scroll={{ y: viewAsPanel ? `calc(100vh - 380px)` : 150 }}
    />
  );
};
