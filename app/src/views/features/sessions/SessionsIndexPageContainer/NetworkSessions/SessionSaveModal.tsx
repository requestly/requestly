import { Modal, Input, Button } from "antd";
import { Har } from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/harLogs/types";
// import { saveRecording } from "./actions"; // takes har and name
import React, { useCallback, useState } from "react";
import { toast } from "utils/Toast";
import { saveRecording } from "./actions";

interface Props {
  har: Har;
  isVisible: boolean;
  closeModal: () => void;
  onSave: (id: string) => void;
}

const SessionSaveModal: React.FC<Props> = ({ har, isVisible, closeModal, onSave }) => {
  const [name, setName] = useState<string>("");

  const handleSaveRecording = async () => {
    const id = await saveRecording(name, har);
    toast.success("Network logs successfully saved!");
    onSave(id);
  };

  const stableSaveRecording = useCallback(handleSaveRecording, [onSave, name, har]);

  return (
    <Modal
      open={isVisible}
      onCancel={closeModal}
      footer={[
        <Button key="cancel" onClick={closeModal}>
          Cancel
        </Button>,
        <Button key="save" type="primary" disabled={!name} onClick={stableSaveRecording}>
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
