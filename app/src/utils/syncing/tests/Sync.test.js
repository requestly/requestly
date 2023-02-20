import {
  getAllLocalRecords,
  getAllSyncedRecords,
  getSyncTimestamp,
  syncAllRulesAndGroupsToFirebase,
  mergeRecords,
  syncToLocalFromFirebase,
  saveRecords,
  getSyncedSessionRecordingPageConfig,
  syncSessionRecordingPageConfigToFirebase,
} from "../syncDataUtils";
import { isExtensionInstalled } from "../../../actions/ExtensionActions";
import { checkTimestampAndSync } from "../SyncUtils";
import { mockFirebaseRecords } from "./mockData/mockFirebaseRecords";
import { mockLocalRecords } from "./mockData/mockLocalRecords";
import mockSessionRecordingConfig from "./mockData/mockSessionRecordingConfig";
import * as mockTimestamp from "./mockData/mockTimestamp";
import mockUserData from "./mockData/mockUserData";

jest.mock("../../../init.js", () => () => false);
jest.mock("../syncDataUtils.js", () => ({
  getSyncTimestamp: jest.fn(),
  getAllLocalRecords: jest.fn(),
  getAllSyncedRecords: jest.fn(),
  syncAllRulesAndGroupsToFirebase: jest.fn(),
  mergeRecords: jest.fn(),
  syncToLocalFromFirebase: jest.fn(),
  saveRecords: jest.fn(),
  syncSessionRecordingPageConfigToFirebase: jest.fn(),
  getSyncedSessionRecordingPageConfig: jest.fn(),
  saveSessionRecordingPageConfig: jest.fn(),
  mergeAndSyncRecordingPageSources: jest.fn(),
}));
jest.mock("../../../actions/ExtensionActions.js", () => ({
  isExtensionInstalled: jest.fn(),
}));

describe("#checkTimestampAndSync", () => {
  beforeEach(() => {
    // if appMode is extesnion, (which is the case for all these tests)
    // sync is only active when extension is installed.
    isExtensionInstalled.mockImplementation(() => true);
  });
  it("should inovke syncAllRulesAndGroupsToFirebase when no firebase timestamp is present", async () => {
    getSyncTimestamp.mockImplementation(() => mockTimestamp.mockNullTimestamp);

    await checkTimestampAndSync(
      mockUserData.uid,
      mockUserData.appMode.EXTENSION
    );
    expect(syncAllRulesAndGroupsToFirebase).toHaveBeenCalled();
  });

  it("should invoke syncSessionRecordingPageConfigToFirebase when no firebase timestamp is present", async () => {
    getSyncTimestamp.mockImplementation(() => mockTimestamp.mockNullTimestamp);

    await checkTimestampAndSync(
      mockUserData.uid,
      mockUserData.appMode.EXTENSION
    );
    expect(syncSessionRecordingPageConfigToFirebase).toHaveBeenCalled();
  });

  it("should invoke mergeRecords when no local timestamp is present and >=1 rule is present in local and firebase sync node", async () => {
    getSyncTimestamp.mockImplementation(
      () => mockTimestamp.mockNullLocalTimestamp
    );
    getAllLocalRecords.mockImplementation(() => mockLocalRecords);
    getAllSyncedRecords.mockImplementation(() => mockFirebaseRecords);
    getSyncedSessionRecordingPageConfig.mockImplementation(
      () => mockSessionRecordingConfig
    );
    const originalModule = jest.requireActual("../syncDataUtils.js");
    mergeRecords.mockImplementation(() => originalModule.mergeRecords);

    await checkTimestampAndSync(
      mockUserData.uid,
      mockUserData.appMode.EXTENSION
    );
    expect(mergeRecords).toHaveBeenCalled();
    expect(saveRecords).toHaveBeenCalled();
  });

  it("should invoke syncToLocalFromFirebase when no localTimestamp is present and no record is present in local storage", async () => {
    getSyncTimestamp.mockImplementation(
      () => mockTimestamp.mockNullLocalTimestamp
    );
    getAllLocalRecords.mockImplementation(() => []);
    getAllSyncedRecords.mockImplementation(() => mockFirebaseRecords);
    getSyncedSessionRecordingPageConfig.mockImplementation(
      () => mockSessionRecordingConfig
    );

    await checkTimestampAndSync(
      mockUserData.uid,
      mockUserData.appMode.EXTENSION
    );
    expect(syncToLocalFromFirebase).toHaveBeenCalled();
  });

  it("should invoke mergeRecords when no localTimestamp is present and > 0 record is present in local storage and no record in firebase", async () => {
    getSyncTimestamp.mockImplementation(
      () => mockTimestamp.mockNullLocalTimestamp
    );
    getAllLocalRecords.mockImplementation(() => mockLocalRecords);
    getAllSyncedRecords.mockImplementation(() => []);
    getSyncedSessionRecordingPageConfig.mockImplementation(
      () => mockSessionRecordingConfig
    );

    const originalModule = jest.requireActual("../syncDataUtils.js");
    mergeRecords.mockImplementation(() => originalModule.mergeRecords);

    await checkTimestampAndSync(
      mockUserData.uid,
      mockUserData.appMode.EXTENSION
    );
    expect(mergeRecords).toHaveBeenCalled();
    expect(saveRecords).toHaveBeenCalled();
  });

  it("should invoke syncToLocalFromFirebase when localTimestamp equals firebaseTimestamp is present and no record is present in local storage", async () => {
    getSyncTimestamp.mockImplementation(
      () => mockTimestamp.mockLocalTSEqualsFirebaseTS
    );
    getAllLocalRecords.mockImplementation(() => mockLocalRecords);
    getAllSyncedRecords.mockImplementation(() => mockFirebaseRecords);
    getSyncedSessionRecordingPageConfig.mockImplementation(
      () => mockSessionRecordingConfig
    );
    const originalModule = jest.requireActual("../syncDataUtils.js");
    mergeRecords.mockImplementation(() => originalModule.mergeRecords);

    await checkTimestampAndSync(
      mockUserData.uid,
      mockUserData.appMode.EXTENSION
    );
    expect(mergeRecords).toHaveBeenCalled();
    expect(saveRecords).toHaveBeenCalled();
  });

  it("should invoke syncToLocalFromFirebase when localTimestamp < firebaseTimestamp and records are present in local as well as firebase node", async () => {
    getSyncTimestamp.mockImplementation(
      () => mockTimestamp.mockFirebaseTSExceedsLocalTS
    );
    getAllLocalRecords.mockImplementation(() => mockLocalRecords);
    getAllSyncedRecords.mockImplementation(() => mockFirebaseRecords);
    getSyncedSessionRecordingPageConfig.mockImplementation(
      () => mockSessionRecordingConfig
    );

    await checkTimestampAndSync(
      mockUserData.uid,
      mockUserData.appMode.EXTENSION
    );
    expect(syncToLocalFromFirebase).toHaveBeenCalled();
  });

  it("should invoke syncToLocalFromFirebase when localTimestamp < firebaseTimestamp and records are present in firebase node only", async () => {
    getSyncTimestamp.mockImplementation(
      () => mockTimestamp.mockFirebaseTSExceedsLocalTS
    );
    getAllLocalRecords.mockImplementation(() => []);
    getAllSyncedRecords.mockImplementation(() => mockFirebaseRecords);
    getSyncedSessionRecordingPageConfig.mockImplementation(
      () => mockSessionRecordingConfig
    );

    await checkTimestampAndSync(
      mockUserData.uid,
      mockUserData.appMode.EXTENSION
    );
    expect(syncToLocalFromFirebase).toHaveBeenCalled();
  });

  it("should invoke syncAllRulesAndGroupsToFirebase when localTimestamp > firebaseTimestamp", async () => {
    getSyncTimestamp.mockImplementation(
      () => mockTimestamp.mockLocalTSExceedsFirebaseTS
    );
    getAllLocalRecords.mockImplementation(() => mockLocalRecords);
    getAllSyncedRecords.mockImplementation(() => mockFirebaseRecords);
    getSyncedSessionRecordingPageConfig.mockImplementation(
      () => mockSessionRecordingConfig
    );
    const originalModule = jest.requireActual("../syncDataUtils.js");
    mergeRecords.mockImplementation(() => originalModule.mergeRecords);

    await checkTimestampAndSync(
      mockUserData.uid,
      mockUserData.appMode.EXTENSION
    );
    expect(mergeRecords).toHaveBeenCalled();
    expect(saveRecords).toHaveBeenCalled();
  });
});

describe("#mergeRecords", () => {
  it("should take two rules array and merge conflicting rules based on modification date", async () => {
    getAllLocalRecords.mockImplementation(() => mockLocalRecords);
    getAllSyncedRecords.mockImplementation(() => mockFirebaseRecords);

    const firebaseRecords = await getAllSyncedRecords();
    const localRecords = await getAllLocalRecords();

    const originalModule = jest.requireActual("../syncDataUtils.js");
    const mergedRecords = originalModule.mergeRecords(
      firebaseRecords,
      localRecords
    );
    const expectedMergedIds = new Set();
    firebaseRecords.forEach((record) => {
      expectedMergedIds.add(record.id);
    });
    localRecords.forEach((record) => {
      expectedMergedIds.add(record.id);
    });

    expect(mergedRecords).toHaveLength(expectedMergedIds.size);
  });
});
