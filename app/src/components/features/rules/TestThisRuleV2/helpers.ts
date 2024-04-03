import { StorageService } from "init";
import { TestReport } from "./types";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

const getAllTestReports = async (appMode: string): Promise<Record<string, TestReport>> => {
  const allTestReports = await StorageService(appMode).getRecord(GLOBAL_CONSTANTS.STORAGE_KEYS.TEST_REPORTS);
  return allTestReports ?? {};
};

export const getTestReportsByRuleId = async (appMode: string, ruleId: string): Promise<TestReport[]> => {
  const allTestReports = await getAllTestReports(appMode);

  const currentRuleReports = Object.values<TestReport>(allTestReports)
    .filter((report: TestReport) => report.ruleId === ruleId)
    .sort((report1: TestReport, report2: TestReport) => report2.timestamp - report1.timestamp);

  return currentRuleReports || [];
};

export const getTestReportById = async (appMode: string, testReportId: string) => {
  const allTestReports = await getAllTestReports(appMode);

  return allTestReports[testReportId];
};

export const saveTestReport = async (appMode: string, testReportId: string, data: TestReport): Promise<void> => {
  const allTestReports = await getAllTestReports(appMode);
  allTestReports[testReportId] = data;

  StorageService(appMode).saveRecord({ [GLOBAL_CONSTANTS.STORAGE_KEYS.TEST_REPORTS]: allTestReports });
};

export const deleteTestReportByRuleId = async (appMode: string, ruleIdsToDelete: string[]): Promise<void> => {
  const allTestReports = await getAllTestReports(appMode);
  for (const test in allTestReports) {
    if (ruleIdsToDelete?.includes(allTestReports[test].ruleId)) {
      delete allTestReports[test];
    }
  }

  StorageService(appMode).saveRecord({ [GLOBAL_CONSTANTS.STORAGE_KEYS.TEST_REPORTS]: allTestReports });
};
