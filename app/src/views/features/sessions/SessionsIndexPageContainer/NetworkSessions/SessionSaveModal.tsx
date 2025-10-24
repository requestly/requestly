import { Input, Button, Row, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { RQModal } from "lib/design-system/components";
import { Har } from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/harLogs/types";
// import { saveRecording } from "./actions"; // takes har and name
import React, { useCallback, useState } from "react";
import { toast } from "utils/Toast";
import { saveNetworkSession } from "./actions";
import { redirectToNetworkSession } from "utils/RedirectionUtils";
import {
  trackNetworkSessionSaveCanceled,
  trackNetworkSessionSaved,
} from "modules/analytics/events/features/sessionRecording/networkSessions";
import { useDispatch, useSelector } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import { getIsNetworkTooltipShown } from "store/selectors";
import { trackRQDesktopLastActivity } from "utils/AnalyticsUtils";
import { SESSION_RECORDING } from "modules/analytics/events/features/constants";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";

interface Props {
  har: Har;
  isVisible: boolean;
  closeModal: () => void;
  onSave?: (id: string) => void;
}

const SessionSaveModal: React.FC<Props> = ({ har, isVisible, closeModal, onSave }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const networkSessionTooltipShown = useSelector(getIsNetworkTooltipShown);
  const [name, setName] = useState<string>("");

  const isDesktopSessionsCompatible =
    useFeatureIsOn("desktop-sessions") && isFeatureCompatible(FEATURES.DESKTOP_SESSIONS);

  const handleSaveRecording = useCallback(async () => {
    const id = await saveNetworkSession(name, har);
    if (onSave) {
      onSave(id);
    } else {
      toast.success({
        key: "view_network_session",
        content: (
          <Space size={14}>
            <span>Network session saved successfully. </span>
            <span
              className="text-primary cursor-pointer"
              onClick={() => {
                redirectToNetworkSession(navigate, id, isDesktopSessionsCompatible);
                toast.hide("view_network_session");
              }}
            >
              View session
            </span>
          </Space>
        ),
      });
    }
    setName("");
    if (!networkSessionTooltipShown) {
      dispatch(globalActions.updateNetworkSessionSaveInProgress(true));
      dispatch(globalActions.updateNetworkSessionTooltipShown());
      setTimeout(() => {
        dispatch(globalActions.updateNetworkSessionSaveInProgress(false));
      }, 2500);
    }
    trackNetworkSessionSaved();
    trackRQDesktopLastActivity(SESSION_RECORDING.network.save.saved);
    closeModal();
  }, [name, har, onSave, networkSessionTooltipShown, closeModal, navigate, isDesktopSessionsCompatible, dispatch]);

  return (
    <RQModal
      open={isVisible}
      onCancel={() => {
        trackNetworkSessionSaveCanceled();
        trackRQDesktopLastActivity(SESSION_RECORDING.network.save.canceled);
        closeModal();
      }}
      wrapClassName="network-session-modal"
    >
      <div className="network-session-modal-content">
        <Row>
          <Input
            placeholder="Enter a name for this session"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Row>
        <Row className="network-session-modal-footer">
          <Space>
            <Button key="cancel" onClick={closeModal}>
              Cancel
            </Button>
            <Button key="save" type="primary" disabled={!name} onClick={handleSaveRecording}>
              Save
            </Button>
          </Space>
        </Row>
      </div>
    </RQModal>
  );
};

export default SessionSaveModal;
