import React, { useCallback } from "react";
import { RQInput } from "lib/design-system/components";
import { Input } from "antd";
import { BottomSheetLayout, BottomSheetPlacement, BottomSheetProvider } from "componentsV2/BottomSheet";
import SessionViewerBottomSheet from "features/sessionBook/components/SessionViewerBottomSheet/SessionViewerBottomSheet";
import { useDispatch, useSelector } from "react-redux";
import { getSessionRecordingMetaData } from "store/features/session-recording/selectors";
import { sessionRecordingActions } from "store/features/session-recording/slice";
import { useDebounce } from "hooks/useDebounce";
import { trackDraftSessionNamed, trackSessionRecordingDescriptionUpdated } from "features/sessionBook/analytics";
import { isAppOpenedInIframe } from "utils/AppUtils";
import { SheetLayout } from "componentsV2/BottomSheet/types";
import "./draftSessionDetailsPanel.scss";

interface DraftSessionDetailsPanelProps {
  isReadOnly?: boolean;
  playerTimeOffset: number;
}

const DraftSessionDetailsPanel: React.FC<DraftSessionDetailsPanelProps> = ({ isReadOnly, playerTimeOffset }) => {
  const dispatch = useDispatch();
  const metadata = useSelector(getSessionRecordingMetaData);

  const isOpenedInIframe = isAppOpenedInIframe();

  const debouncedTrackDescriptionUpdated = useDebounce(trackSessionRecordingDescriptionUpdated, 1000);

  const desbouncedTrackNameUpdated = useDebounce(trackDraftSessionNamed, 1000);

  const handleSessionNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(sessionRecordingActions.setName(e.target.value));
      debouncedTrackDescriptionUpdated();
    },
    [dispatch, debouncedTrackDescriptionUpdated]
  );

  const handleSessionDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      dispatch(sessionRecordingActions.setDescription(e.target.value));
      desbouncedTrackNameUpdated();
    },
    [dispatch, desbouncedTrackNameUpdated]
  );

  return (
    <BottomSheetProvider context="rules">
      <div className="session-details-panel-wrapper">
        <BottomSheetLayout
          layout={SheetLayout.DRAWER}
          hideBottomSheet={isOpenedInIframe}
          initialOffset={-390}
          bottomSheet={<SessionViewerBottomSheet playerTimeOffset={playerTimeOffset} disableDocking />}
        >
          <div className="session-details-panel-container">
            <div>
              <label className="session-details-label">Name</label>
              <RQInput
                disabled={isReadOnly}
                className="session-details-input"
                value={metadata?.name || ""}
                placeholder="Enter session name"
                onChange={handleSessionNameChange}
              />
            </div>
            <div className="mt-16">
              <label className="session-details-label">Description</label>
              <Input.TextArea
                disabled={isReadOnly}
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
