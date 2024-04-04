import { useEffect, useMemo, useState } from "react";
import { Table } from "antd";

import { TestReport } from "../../types";
import { EmptyTestResultScreen } from "../EmptyTestResultScreen";
import { getAppMode, getCurrentlySelectedRuleData } from "store/selectors";
import { useSelector } from "react-redux";
import { getTestReportsByRuleId } from "../../helpers";
import Logger from "lib/logger";
import { getFormattedTimestamp } from "utils/DateTimeUtils";
import { MdOutlineCheckCircle } from "@react-icons/all-files/md/MdOutlineCheckCircle";
import { IoMdCloseCircleOutline } from "@react-icons/all-files/io/IoMdCloseCircleOutline";
import { RiDeleteBin6Line } from "@react-icons/all-files/ri/RiDeleteBin6Line";
import { MdOndemandVideo } from "@react-icons/all-files/md/MdOndemandVideo";
import "./index.scss";

import { RQButton } from "lib/design-system/components";
import { redirectToUrl } from "utils/RedirectionUtils";
import { useBottomSheetContext } from "componentsV2/BottomSheet";

export const TestReportsTable = () => {
  const appMode = useSelector(getAppMode);
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const [testReports, setTestReports] = useState<TestReport[]>(null);
  const [refreshTestReports, setRefreshTestReports] = useState(true);
  const [newReportId] = useState(null);
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
        render: (_: any, record: TestReport) =>
          record?.sessionLink && (
            <div className="test-report-action-buttons-container">
              <RQButton
                size="small"
                className="watch-test-session-btn"
                type="default"
                icon={<MdOndemandVideo />}
                onClick={() => redirectToUrl(record.sessionLink, true)}
              >
                Watch session
              </RQButton>
              <RQButton className="test-report-delete-btn" iconOnly icon={<RiDeleteBin6Line />} />
            </div>
          ),
      },
    ],
    [viewAsPanel]
  );

  useEffect(() => {
    if (refreshTestReports) {
      getTestReportsByRuleId(appMode, currentlySelectedRuleData.id)
        .then((testReports: TestReport[]) => {
          if (testReports.length) {
            setTestReports(testReports);

            const newTestReport = testReports.find((report: TestReport) => report.id === newReportId);
            if (newTestReport) {
              //  trackTestRuleReportGenerated(currentlySelectedRuleData.ruleType, newTestReport.appliedStatus);
            }
          }
        })
        .catch((error) => {
          Logger.log(error);
        })
        .finally(() => {
          setRefreshTestReports(false);
          //  highlightReport();
        });
    }
  }, [appMode, currentlySelectedRuleData.id, refreshTestReports, newReportId]);

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
