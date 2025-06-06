import { useCallback, useEffect, useRef } from "react";
import sampleCollections from "../sampleCollections";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useApiClientContext } from "features/apiClient/contexts";
import useApiClientFileImporter, { ImporterType } from "features/apiClient/hooks/useApiClientFileImporter";
import { SAMPLE_COLLECTIONS_VERSION } from "../constants/samples";
import * as Sentry from "@sentry/react";

export const useImportSampleCollections = () => {
  const user = useSelector(getUserAuthDetails);
  const { apiClientRecords } = useApiClientContext();
  const { processFiles, handleImportData, resetImportData, processingStatus = "idle" } = useApiClientFileImporter(
    ImporterType.RQ
  );
  const uid = user?.details?.profile?.uid;
  const isRecordsEmpty = apiClientRecords.length === 0;

  const detailsFetchingRef = useRef(false);
  const importCollections = useCallback(() => {
    if (!uid) {
      return;
    }

    if (!isRecordsEmpty) {
      return;
    }

    if (processingStatus === "processing") {
      return;
    }

    if (detailsFetchingRef.current) {
      return;
    }

    detailsFetchingRef.current = true;

    sampleCollections
      .getImportDetails(uid)
      .then((details) => {
        if (details.imported) {
          return;
        }

        processFiles([sampleCollections.getSampleCollectionsFile()], true).then(() => {
          handleImportData(() => {
            sampleCollections.updateImportDetails(uid, { imported: true, version: SAMPLE_COLLECTIONS_VERSION });
            resetImportData();
          });
        });
      })
      .catch((error) => {
        Sentry.captureException(error);
      });
  }, [uid, isRecordsEmpty, processingStatus, processFiles, resetImportData, handleImportData]);

  useEffect(() => {
    importCollections();
  }, [importCollections]);
};
