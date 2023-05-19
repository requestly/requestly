import { Input, Button, Row, Space } from "antd";
import { RQModal } from "lib/design-system/components";
import { Har } from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/harLogs/types";
// import { saveRecording } from "./actions"; // takes har and name
import React, { useCallback, useState } from "react";
import { toast } from "utils/Toast";
import { saveNetworkSession } from "./actions";
import {
  trackNetworkSessionSaveCanceled,
  trackNetworkSessionSaved,
} from "modules/analytics/events/features/sessionRecording/networkSessions";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "store";
import { getIsNetworkTooptipShown } from "store/selectors";

interface Props {
  har: Har;
  isVisible: boolean;
  closeModal: () => void;
  onSave?: (id: string) => void;
}

const SessionSaveModal: React.FC<Props> = ({ har, isVisible, closeModal, onSave }) => {
  const dispatch = useDispatch();

  const networkSessionTooptipShown = useSelector(getIsNetworkTooptipShown);

  const [name, setName] = useState<string>("");

  const handleSaveRecording = useCallback(async () => {
    const id = await saveNetworkSession(name, har);
    if (onSave) {
      onSave(id);
    } else {
      toast.success("Network session successfully saved!");
    }
    setName("");
    if (!networkSessionTooptipShown) {
      dispatch(actions.updateNetworkSessionSaveInProgress(true));
      dispatch(actions.updateNetworkSessionTooltipShown());
      setTimeout(() => {
        dispatch(actions.updateNetworkSessionSaveInProgress(false));
      }, 2500);
    }
    trackNetworkSessionSaved();
    closeModal();
  }, [closeModal, dispatch, har, name, networkSessionTooptipShown, onSave]);

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
