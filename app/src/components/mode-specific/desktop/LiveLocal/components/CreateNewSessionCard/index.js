import { useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Input, Typography } from "antd";
import { actions } from "store";
import { IoMdAdd } from "@react-icons/all-files/io/IoMdAdd";
import "./index.scss";

const MAX_SESSIONS = 2;
export const CreateNewSessionCard = ({ sessions, createNewSesionCallback }) => {
  const dispatch = useDispatch();
  const [isNewSessionCreationStarted, setIsNewSessionCreationStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [port, setPort] = useState("");

  const handlePortValidation = (port) => {
    if (isNaN(port)) {
      setHasError(true);
      return false;
    }
    if (port < 1024 || port > 65535) {
      setHasError(true);
      return false;
    }
    setHasError(false);
  };

  return (
    <div className="create-new-session-card">
      {isNewSessionCreationStarted ? (
        <div className="add-new-port-card">
          <div className="display-flex items-center" style={{ gap: "8px" }}>
            <label htmlFor="port-number" className="add-new-port-card-label">
              Enter port:{" "}
            </label>
            <Input
              value={port}
              autoFocus
              id="port-number"
              size="large"
              status={hasError ? "error" : ""}
              placeholder="Enter a new port"
              className="add-new-port-card-input"
              onChange={(e) => {
                setPort(e.target.value);
                handlePortValidation(e.target.value);
              }}
            />
          </div>
          <div className="add-new-port-action-btns">
            <Button type="default" onClick={() => setIsNewSessionCreationStarted(false)}>
              Cancel
            </Button>
            <Button
              loading={isLoading}
              type="primary"
              disabled={hasError || !port}
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => {
                  createNewSesionCallback(parseInt(port));
                  setIsNewSessionCreationStarted(false);
                  setIsLoading(false);
                }, 3000);
              }}
            >
              Create
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="create-new-session-action-area"
          onClick={() => {
            if (sessions.length >= MAX_SESSIONS) {
              dispatch(
                actions.toggleActiveModal({
                  modalName: "pricingModal",
                  newValue: true,
                  newProps: { selectedPlan: null, source: "live-local" },
                })
              );
            } else {
              setIsNewSessionCreationStarted(true);
              setPort("");
            }
          }}
        >
          <IoMdAdd fontSize={35} />
          <Typography.Title level={5}>Create a new session</Typography.Title>
        </div>
      )}
    </div>
  );
};
