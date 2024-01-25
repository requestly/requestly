import APP_CONSTANTS from "config/constants";

/* Syncing */
export const SYNC_CONSTANTS = {
  SYNC_REMOVE_RECORDS: "sync_remove_records",
  SYNC_UPDATE_RECORDS: "sync_update_records",
  SYNC_ALL_RECORDS_TO_FIREBASE: "sync_all_records_to_firebase",
  SYNC_ALL_RECORDS_TO_LOCAL: "sync_all_records_to_local",
  MERGE_AND_SYNC_TO_FIREBASE: "merge_and_sync_to_firebase",
  MERGE_AND_SYNC_TO_FIREBASE_LTS_EXCEEDS_FTS: "merge_and_sync_to_firebase_lts_exceeds_fts",
  MERGE_AND_SYNC_TO_FIREBASE_LTS_EQUALS_FTS: "merge_and_sync_to_firebase_lts_equals_fts",
  SESSION_PAGE_CONFIG: "session_page_config",
  SYNC_TYPES: {
    UPDATE_RECORDS: "update_records",
    REMOVE_RECORDS: "remove_records",
    SESSION_RECORDING_PAGE_CONFIG: "session_recording_page_config",
  },
  // TODO: @nsr - also add any constants used in the session config flow
  SYNC_KEYS_IN_LOCAL_STORAGE: [
    APP_CONSTANTS.LAST_SYNC_TARGET,
    APP_CONSTANTS.LAST_SYNCED_TS,
    APP_CONSTANTS.LAST_UPDATED_TS,
  ],
};
