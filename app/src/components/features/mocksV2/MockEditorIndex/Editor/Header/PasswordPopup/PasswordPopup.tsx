import { Button, Input, Row } from "antd";
import {
  trackMockPasswordDeleted,
  trackMockPasswordSaveError,
  trackMockPasswordSaved,
} from "modules/analytics/events/features/mocksV2";
import { useState } from "react";
import { toast } from "utils/Toast";

interface Props {
  setVisible: (visible: boolean) => void;
  password: string;
  setPassword: (password: string) => void;
}

const PasswordPopup = ({ setVisible, password, setPassword }: Props) => {
  const [inputPassword, setInputPassword] = useState(password);
  const [isValidPassword, setIsValidPassword] = useState(true);

  const validatePassword = () => {
    if (inputPassword.length >= 8 && inputPassword.match(/^[0-9a-z]+$/)) {
      return true;
    }
    return false;
  };

  const handleUpdatePassword = () => {
    if (validatePassword()) {
      trackMockPasswordSaved();
      setIsValidPassword(true);
      setPassword(inputPassword);
      toast.success("Mock Password Saved");
      setVisible(false);
    } else {
      trackMockPasswordSaveError();
      toast.error("Password should be >=8 characters and alphanumeric");
      setIsValidPassword(false);
    }
  };

  const handlePasswordDelete = () => {
    trackMockPasswordDeleted();
    setPassword("");
    toast.success("Mock Password Deleted");
    setVisible(false);
  };

  return (
    <div className="">
      <div className="text-gray editor-group-input-title">PASSWORD</div>
      <Input
        autoFocus
        status={isValidPassword ? null : "error"}
        value={inputPassword}
        onChange={(e) => setInputPassword(e.target.value)}
        onPressEnter={handleUpdatePassword}
        placeholder="Enter rule password"
        className="editor-group-dropdown-input"
      />

      <Row align="middle">
        <div className="ml-auto editor-group-dropdown-actions">
          <Button size="small" onClick={handlePasswordDelete} className="editor-group-dropdown-cancel-btn">
            Delete
          </Button>
          <Button
            ghost
            size="small"
            type="primary"
            onClick={handleUpdatePassword}
            disabled={inputPassword.length === 0}
          >
            Save
          </Button>
        </div>
      </Row>
    </div>
  );
};

export default PasswordPopup;
