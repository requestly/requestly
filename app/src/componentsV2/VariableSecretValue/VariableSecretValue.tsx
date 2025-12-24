import React, { useState } from "react";
import { RQButton } from "lib/design-system-v2/components";
import { RiEyeLine } from "@react-icons/all-files/ri/RiEyeLine";
import { RiEyeOffLine } from "@react-icons/all-files/ri/RiEyeOffLine";
import { RBAC, RoleBasedComponent } from "features/rbac";
import "./VariableSecretValue.scss";

interface VariableSecretValueProps {
  value: string | boolean;
  roleResource: RBAC.Resource;
}

export const VariableSecretValue: React.FC<VariableSecretValueProps> = ({ value, roleResource }) => {
  const [revealed, setRevealed] = useState(false);
  const toggleVisibility = () => setRevealed((prev) => !prev);
  return (
    <div className="variable-secret-value">
      <span className="value-content">
        {revealed ? (
          <span className="secret-revealed">{String(value)}</span>
        ) : (
          <span className="secret-masked">{"•".repeat(Math.min(String(value).length, 15))}</span>
        )}
      </span>
      <RoleBasedComponent resource={roleResource} permission="update">
        <div className="eye-toggle-button">
          <RQButton
            type="transparent"
            size="small"
            icon={revealed ? <RiEyeLine /> : <RiEyeOffLine />}
            onClick={toggleVisibility}
          />
        </div>
      </RoleBasedComponent>
    </div>
  );
};
