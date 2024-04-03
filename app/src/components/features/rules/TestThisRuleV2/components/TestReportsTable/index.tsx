import { useEffect, useState } from "react";
import { TestReport } from "../../types";
import { EmptyTestResultScreen } from "../EmptyTestResultScreen";
import { getAppMode, getCurrentlySelectedRuleData } from "store/selectors";
import { useSelector } from "react-redux";
import { getTestReportsByRuleId } from "../../helpers";
import Logger from "lib/logger";
import "./index.scss";

export const TestReportsTable = () => {
  const appMode = useSelector(getAppMode);
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const [testReports, setTestReports] = useState<TestReport[]>(null);
  const [refreshTestReports, setRefreshTestReports] = useState(true);
  const [newReportId] = useState(null);

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
    <div>
      <h1>TestReportsTable</h1>
    </div>
  );
};
