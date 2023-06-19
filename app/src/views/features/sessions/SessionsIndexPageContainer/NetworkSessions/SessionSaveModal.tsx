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
import { actions } from "store";
import { getIsNetworkTooltipShown } from "store/selectors";

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
                redirectToNetworkSession(navigate, id);
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
      dispatch(actions.updateNetworkSessionSaveInProgress(true));
      dispatch(actions.updateNetworkSessionTooltipShown());
      setTimeout(() => {
        dispatch(actions.updateNetworkSessionSaveInProgress(false));
      }, 2500);
    }
    trackNetworkSessionSaved();
    closeModal();
  }, [closeModal, dispatch, navigate, har, name, networkSessionTooltipShown, onSave]);

  return (
    <RQModal
      open={isVisible}
      onCancel={() => {
        trackNetworkSessionSaveCanceled();
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
