import { Input, Button, Row, Space } from "antd";
import { RQModal } from "lib/design-system/components";
import { Har } from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/harLogs/types";
// import { saveRecording } from "./actions"; // takes har and name
import React, { useCallback, useState } from "react";
import { toast } from "utils/Toast";
import { saveRecording } from "./actions";
import {
  trackNetworkSessionSaveCanceled,
  trackNetworkSessionSaved,
} from "modules/analytics/events/features/sessionRecording/networkSessions";
import { useDispatch } from "react-redux";
import { actions } from "store";

interface Props {
  har: Har;
  isVisible: boolean;
  closeModal: () => void;
  onSave: (id: string) => void;
}

const SessionSaveModal: React.FC<Props> = ({ har, isVisible, closeModal }) => {
  const dispatch = useDispatch();

  const [name, setName] = useState<string>("");

  const handleSaveRecording = useCallback(async () => {
    await saveRecording(name, har);
    toast.success("Network logs successfully saved!");
    setName("");
    dispatch(actions.updateIsSavingNetworkSession(true));
    setTimeout(() => {
      dispatch(actions.updateIsSavingNetworkSession(false));
    }, 3000);
    trackNetworkSessionSaved();
    closeModal();
  }, [name, har, dispatch, closeModal]);

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
