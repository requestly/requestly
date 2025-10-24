import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FilePicker } from "components/common/FilePicker";
import { RQModal } from "lib/design-system/components";
import { EXPORTED_SESSION_FILE_EXTENSION, SESSION_EXPORT_TYPE } from "views/features/sessions/SessionViewer/constants";
import { sessionRecordingActions } from "store/features/session-recording/slice";
import { decompressEvents } from "views/features/sessions/SessionViewer/sessionEventsUtils";
import { trackSessionRecordingUpload } from "modules/analytics/events/features/sessionRecording";
import PATHS from "config/constants/sub/paths";

interface ImportSessionModalProps {
  isOpen: boolean;
  toggleModal: () => void;
}

export const ImportSessionModal: React.FC<ImportSessionModalProps> = ({ isOpen, toggleModal }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [processingDataToImport, setProcessingDataToImport] = useState(false);

  const onSessionRecordingFileDrop = useCallback(
    async (acceptedFiles: any) => {
      //Ignore other uploaded files
      const file = acceptedFiles[0];
      const reader = new FileReader();

      reader.onabort = () => toggleModal();
      reader.onerror = () => toggleModal();
      reader.onload = () => {
        try {
          setProcessingDataToImport(true);
          //   @ts-ignore
          const parsedData = JSON.parse(reader.result);

          const splittedFileName = file?.name?.split(".") ?? [];
          const fileExtension = splittedFileName[splittedFileName.length - 1];

          if (
            fileExtension !== EXPORTED_SESSION_FILE_EXTENSION ||
            parsedData?.type !== SESSION_EXPORT_TYPE ||
            !parsedData?.data
          ) {
            throw new Error("Invalid file format!");
          }

          dispatch(sessionRecordingActions.setSessionRecordingMetadata({ ...parsedData.data.metadata }));

          const recordedSessionEvents = decompressEvents(parsedData.data.events);
          dispatch(sessionRecordingActions.setEvents(recordedSessionEvents));
          dispatch(
            sessionRecordingActions.setTrimmedSessiondata({
              duration: parsedData.data.metadata.sessionAttributes.duration,
              events: recordedSessionEvents,
            })
          );

          toggleModal();
          trackSessionRecordingUpload("success");
          navigate(`/${PATHS.SESSIONS.DRAFT.RELATIVE}/imported`);
        } catch (error) {
          trackSessionRecordingUpload("failed");
          alert("Imported file doesn't match Requestly format. Please choose another file.");
        } finally {
          setProcessingDataToImport(false);
        }
      };
      reader.readAsText(file);
    },
    [navigate, toggleModal, dispatch]
  );

  return (
    <RQModal open={isOpen} onCancel={toggleModal}>
      <div className="rq-modal-content">
        <div className="header mb-16 text-center">Upload & view downloaded session</div>

        <FilePicker
          onFilesDrop={onSessionRecordingFileDrop}
          isProcessing={processingDataToImport}
          loaderMessage="Importing session..."
          title="Drag and drop your downloaded SessionBook file"
        />
      </div>
    </RQModal>
  );
};
