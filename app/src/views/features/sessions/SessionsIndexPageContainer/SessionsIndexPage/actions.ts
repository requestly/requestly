import { StorageService } from "init";
import APP_CONSTANTS from "config/constants";
import { Visibility } from "../../SessionViewer/types";

export const fetchDraftRecordings = async () => {
  return StorageService()
    .getRecord(APP_CONSTANTS.DRAFT_SESSIONS)
    .then((drafts) => {
      if (drafts) {
        const formattedRecords = Object.keys(drafts).map((key) => {
          const recordData = drafts[key];
          return {
            id: key,
            isDraft: true,
            name: recordData.metadata.name,
            duration: recordData.metadata.duration,
            startTime: recordData.metadata.startTime,
            url: recordData.metadata.url,
            visibility: Visibility.ONLY_ME,
          };
        });
        return formattedRecords;
      } else return [];
    })
    .catch((e) => {
      console.log(e);
      return [];
    });
};
