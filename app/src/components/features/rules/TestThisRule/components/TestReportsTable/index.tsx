import React, { useCallback, useMemo, useState } from "react";
import { getAppMode, getCurrentlySelectedRuleData } from "store/selectors";
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
import { deleteTestReport } from "../../helpers";
import { useBottomSheetContext } from "componentsV2/BottomSheet";
import { LoadingOutlined } from "@ant-design/icons";
import Logger from "lib/logger";
import { toast } from "utils/Toast";
import "./index.scss";
import { trackTestRuleReportDeleted, trackTestRuleResultClicked } from "../../analytics";

interface TestReportsTableProps {
  testReports: TestReport[];
  newReportId: string;
  isSessionSaving: boolean;
  refreshTestReports: () => void;
}

export const TestReportsTable: React.FC<TestReportsTableProps> = ({
  testReports,
  newReportId,
  isSessionSaving,
  refreshTestReports,
}) => {
  const appMode = useSelector(getAppMode);
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const [reportIdBeingDeleted, setReportIdBeingDeleted] = useState(null);

  const { viewAsSidePanel } = useBottomSheetContext();

  const handleTestReportDelete = useCallback(
    (reportId: string) => {
      setReportIdBeingDeleted(reportId);
      deleteTestReport(appMode, reportId)
        .then(() => {
          toast.success("Test deleted successfully");
          trackTestRuleReportDeleted(currentlySelectedRuleData.ruleType);
          refreshTestReports();
        })
        .catch((error) => {
          Logger.log(error);
        })
        .finally(() => {
          setReportIdBeingDeleted(null);
        });
    },
    [appMode, refreshTestReports, currentlySelectedRuleData.ruleType]
  );

  const columns = useMemo(
    () => [
      {
        title: "URL",
        key: "url",
        width: viewAsSidePanel ? 200 : 240,
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
        render: (_: any, record: TestReport) => {
          if (isSessionSaving && record.id === newReportId) {
            return (
              <Row gutter={8} align="middle" className="saving-test-session-status">
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
                    trackTestRuleResultClicked(currentlySelectedRuleData.ruleType, record.sessionLink);
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
                onConfirm={() => handleTestReportDelete(record.id)}
                showArrow={false}
              >
                <RQButton
                  loading={reportIdBeingDeleted === record.id}
                  className="test-report-delete-btn"
                  iconOnly
                  icon={<RiDeleteBin6Line />}
                />
              </Popconfirm>
            </div>
          );
        },
      },
    ],
    [
      viewAsSidePanel,
      isSessionSaving,
      newReportId,
      handleTestReportDelete,
      reportIdBeingDeleted,
      currentlySelectedRuleData.ruleType,
    ]
  );

  return (
    <Table
      columns={columns}
      dataSource={testReports}
      className="test-reports-table"
      pagination={false}
      scroll={{ y: viewAsSidePanel ? `calc(100vh - 380px)` : 150 }}
    />
  );
};
