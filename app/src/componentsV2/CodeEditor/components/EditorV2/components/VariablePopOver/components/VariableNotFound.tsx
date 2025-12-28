import React from "react";
import { Row } from "antd";
import { RQButton } from "lib/design-system-v2/components";
import { useRBAC } from "features/rbac";

interface VariableNotFoundProps {
  onCreateClick: () => void;
  onSwitchEnvironment: () => void;
  isNoopContext: boolean;
}

export const VariableNotFound: React.FC<VariableNotFoundProps> = ({
  onCreateClick,
  onSwitchEnvironment,
  isNoopContext,
}) => {
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_environment", "create");

  return (
    <div className="variable-not-found-info-container">
      <Row className="variable-info-header">Variable not found</Row>
      <Row className="add-new-variable-info-content">
        Add it as a new variable or switch to another environment where it exists.
      </Row>
      <div className="variable-not-found-actions">
        <RQButton
          type="primary"
          block
          onClick={onCreateClick}
          className="add-new-variable-btn"
          disabled={!isValidPermission}
        >
          Add as a new variable
        </RQButton>
        {!isNoopContext && (
          <RQButton block onClick={onSwitchEnvironment} className="switch-environment-btn">
            Switch environment
          </RQButton>
        )}
      </div>
    </div>
  );
};
