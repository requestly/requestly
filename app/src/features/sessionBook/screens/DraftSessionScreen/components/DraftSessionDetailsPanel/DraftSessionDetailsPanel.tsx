import React, { useCallback } from "react";
import { RQInput } from "lib/design-system/components";
import { Input } from "antd";
import { BottomSheetLayout, BottomSheetPlacement, BottomSheetProvider } from "componentsV2/BottomSheet";
import SessionViewerBottomSheet from "features/sessionBook/screens/SavedSessionScreen/components/SessionViewerBottomSheet/SessionViewerBottomSheet";
import { useDispatch, useSelector } from "react-redux";
import { getSessionRecordingMetaData } from "store/features/session-recording/selectors";
import { sessionRecordingActions } from "store/features/session-recording/slice";
import "./draftSessionDetailsPanel.scss";

interface DraftSessionDetailsPanelProps {
  playerTimeOffset: number;
}

const DraftSessionDetailsPanel: React.FC<DraftSessionDetailsPanelProps> = ({ playerTimeOffset }) => {
  const dispatch = useDispatch();
  const metadata = useSelector(getSessionRecordingMetaData);

  const handleSessionNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(sessionRecordingActions.setName(e.target.value));
    },
    [dispatch]
  );

  const handleSessionDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      dispatch(sessionRecordingActions.setDescription(e.target.value));
    },
    [dispatch]
  );

  return (
    <BottomSheetProvider defaultPlacement={BottomSheetPlacement.BOTTOM}>
      <div className="session-details-panel-wrapper">
        <BottomSheetLayout
          bottomSheet={<SessionViewerBottomSheet playerTimeOffset={playerTimeOffset} disableDocking />}
        >
          <div className="session-details-panel-container">
            <div>
              <label className="session-details-label">Name</label>
              <RQInput
                className="session-details-input"
                value={metadata?.name || ""}
                placeholder="Enter session name"
                onChange={handleSessionNameChange}
              />
            </div>
            <div className="mt-16">
              <label className="session-details-label">Description</label>
              <Input.TextArea
                className="session-details-textarea"
                rows={4}
                value={metadata?.description || ""}
                placeholder="Enter session description"
                onChange={handleSessionDescriptionChange}
              />
            </div>
          </div>
        </BottomSheetLayout>
      </div>
    </BottomSheetProvider>
  );
};

export default React.memo(DraftSessionDetailsPanel);
