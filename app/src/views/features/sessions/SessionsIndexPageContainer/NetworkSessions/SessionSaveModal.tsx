import { Modal, Input, Button } from "antd";
import { Har } from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/harLogs/types";
// import { saveRecording } from "./actions"; // takes har and name
import React, { useCallback, useState } from "react";
import { toast } from "utils/Toast";
import { saveRecording } from "./actions";
import {
  trackNetworkSessionSaveCanceled,
  trackNetworkSessionSaved,
} from "modules/analytics/events/features/sessionRecording/networkSessions";

interface Props {
  har: Har;
  isVisible: boolean;
  closeModal: () => void;
  onSave: (id: string) => void;
}

const SessionSaveModal: React.FC<Props> = ({ har, isVisible, closeModal, onSave }) => {
  const [name, setName] = useState<string>("");

  const handleSaveRecording = useCallback(async () => {
    const id = await saveRecording(name, har);
    toast.success("Network logs successfully saved!");
    trackNetworkSessionSaved();
    onSave(id);
  }, [onSave, name, har]);

  return (
    <Modal
      open={isVisible}
      onCancel={() => {
        trackNetworkSessionSaveCanceled();
        closeModal();
      }}
      footer={[
        <Button key="cancel" onClick={closeModal}>
          Cancel
        </Button>,
        <Button key="save" type="primary" disabled={!name} onClick={handleSaveRecording}>
          Save
        </Button>,
      ]}
    >
      {/* todo: add label before input */}
      <Input
        placeholder="Enter a name for the recording"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
    </Modal>
  );
};

export default SessionSaveModal;
