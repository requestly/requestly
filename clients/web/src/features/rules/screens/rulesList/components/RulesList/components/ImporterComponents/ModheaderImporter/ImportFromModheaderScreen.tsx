import React from "react";
import { ImportFromModheader } from "./ModheaderImporter";
import { RBACEmptyState, RoleBasedComponent } from "features/rbac";

export const ImportFromModheaderWrapperView: React.FC = () => {
  return (
    <RoleBasedComponent
      resource="http_rule"
      permission="create"
      fallback={
        <RBACEmptyState
          title="You cannot import as a viewer"
          description="As a viewer, you will be able to view and test rules once someone from your team import them. You can contact your workspace admin to update your role."
        />
      }
    >
      <div className="importer-wrapper">
        <ImportFromModheader />
      </div>
    </RoleBasedComponent>
  );
};
