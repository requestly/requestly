import React, { useCallback, useState } from "react";
import { NetworkEventData, RQSessionEvents } from "@requestly/web-sdk";
import {
  Har,
  HarRequest,
  HarRequestQueryString,
  HarResponse,
  HarEntry,
} from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/harLogs/types";

import SessionSaveModal from "views/features/sessions/SessionsIndexPageContainer/NetworkSessions/SessionSaveModal";
import {
  trackWebSessionImportButtonClicked,
  trackWebSessionImportCanceled,
  trackWebSessionImportCompleted,
  trackNetworkSessionSaved,
} from "modules/analytics/events/features/sessionRecording/networkSessions";
import { RQButton, RQModal } from "lib/design-system/components";
import { FilePicker } from "components/common/FilePicker";
import { saveNetworkSession } from "views/features/sessions/SessionsIndexPageContainer/NetworkSessions/actions";
import { toast } from "utils/Toast";
import { trackRQDesktopLastActivity } from "utils/AnalyticsUtils";
import { SESSION_RECORDING } from "modules/analytics/events/features/constants";
import { decompressEvents } from "../../SessionViewer/sessionEventsUtils";

interface Props {
  onSaved: (sessionId: string) => void;
  btnText?: string;
}

function webSessionEventsToHar(webSessionEvents: RQSessionEvents): Har {
  const harEntries = webSessionEvents.network.map((event) => {
    return createHarEntry(event as NetworkEventData);
  });
  const result: Har = {
    log: {
      version: "1.2",
      creator: {},
      browser: {},
      pages: [],
      entries: harEntries,
    },
  };

  return result;

  function createHarEntry(event: NetworkEventData): HarEntry {
    const harRequest: HarRequest = {
      bodySize: -1,
      headersSize: -1,
      httpVersion: "HTTP/1.1", // informed guess
      cookies: [],
      method: event.method,
      queryString: createHarQueryString(event.url),
      url: event.url,
      postData: {
        text: event.requestData ? (event.requestData as string) : "",
      },
      headers: [], // not recorded
    };
    const harResponse: HarResponse = {
      status: event.status,
      httpVersion: "HTTP/1.1", // informed guess
      cookies: [],
      content: {
        size: 0,
        compression: 0,
        text: event.response ? (event.response as string) : "",
        mimeType: event.contentType ?? "", // not always present
      },
      headers: [], // not recorded
    };

    const entry: HarEntry = {
      startedDateTime: new Date(event.timestamp).toISOString(),
      request: harRequest,
      response: harResponse,
      cache: {},
      timings: {},

      /* NOT PRESENT IN RRWEB SESSIONS */
      // _RQDetails: {
      //     id: log.id,
      //     actions: log.actions,
      //     requestShellCurl: log.requestShellCurl,
      //     consoleLogs: log.consoleLogs,
      //     requestState: log.requestState,
      // },
    };

    return entry;

    function createHarQueryString(url: string) {
      const urlObj = new URL(url);
      const queryString = urlObj.searchParams;
      const queryStringArray: HarRequestQueryString[] = [];
      queryString.forEach((value, key) => {
        queryStringArray.push({ name: key, value });
      });
      return queryStringArray;
    }
  }
}

export const ImportFromWebSessionsButton: React.FC<Props> = ({ onSaved, btnText }) => {
  const [importedHar, setImportedHar] = useState<Har>();
  const [isDropZoneVisible, setIsDropZoneVisible] = useState(false);
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [processingUploadedData, setProcessingUploadedData] = useState(false);

  const closeDropZone = useCallback(() => {
    setIsDropZoneVisible(false);
  }, []);

  const openDropZone = useCallback(() => {
    setIsDropZoneVisible(true);
  }, []);

  const closeSaveModal = useCallback(() => {
    setIsSaveModalVisible(false);
    closeDropZone();
  }, [closeDropZone]);

  const openSaveModal = useCallback(() => {
    closeDropZone();
    setIsSaveModalVisible(true);
  }, [closeDropZone]);

  const handleImportedData = useCallback(
    async (data: Har, name: string) => {
      setImportedHar(data);
      trackWebSessionImportCompleted();
      trackRQDesktopLastActivity(SESSION_RECORDING.network.import.web_sessions.completed);
      if (name) {
        // just in case the file reader is unable to read the name
        const id = await saveNetworkSession(name, data);
        toast.success("Network session successfully saved!");
        trackNetworkSessionSaved();
        setProcessingUploadedData(false);
        onSaved(id);
      } else {
        openSaveModal();
      }
    },
    [onSaved, openSaveModal]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      //Ignore other uploaded files, just choosing the first one
      const file = acceptedFiles[0];
      const name = file.name;

      const reader = new FileReader();

      reader.onabort = () => closeDropZone();
      reader.onerror = () => closeDropZone();
      reader.onload = () => {
        //Render the loader
        setProcessingUploadedData(true);
        try {
          const parsedFileContents = JSON.parse(reader.result as string);
          const webSessionEvents = decompressEvents(parsedFileContents.data.events);
          const har = webSessionEventsToHar(webSessionEvents);

          handleImportedData(har, name);
        } catch (error) {
          setProcessingUploadedData(false);
          alert("Imported RQLY file seems corrupted. Please choose another file or contact our support.");
          closeDropZone();
        }
      };
      reader.readAsText(file);
    },
    [closeDropZone, handleImportedData]
  );

  return (
    <React.Fragment>
      <RQButton
        onClick={() => {
          trackWebSessionImportButtonClicked();
          trackRQDesktopLastActivity(SESSION_RECORDING.network.import.web_sessions.btn_clicked);
          openDropZone();
        }}
        className="mt-8"
      >
        {btnText ? btnText : "Import Log File"}
      </RQButton>
      <RQModal
        width="50%"
        open={isDropZoneVisible}
        maskClosable={false}
        onCancel={() => {
          trackWebSessionImportCanceled();
          trackRQDesktopLastActivity(SESSION_RECORDING.network.import.web_sessions.canceled);
          closeDropZone();
        }}
      >
        <div className="rq-modal-content">
          <div className="header text-center mb-16">Import Saved Session</div>
          <FilePicker
            onFilesDrop={onDrop}
            loaderMessage="Processing data..."
            isProcessing={processingUploadedData}
            title="Drag and drop your exported sessions file"
          />
        </div>
      </RQModal>

      {/* NO LONGER VISIBLE, still here for some extreme edge case */}
      <SessionSaveModal isVisible={isSaveModalVisible} closeModal={closeSaveModal} har={importedHar} onSave={onSaved} />
    </React.Fragment>
  );
};
