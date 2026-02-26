import React, { useCallback, useState } from "react";
import { Conditional } from "components/common/Conditional";
import { KEYBOARD_SHORTCUTS } from "../../../../../../../../constants/keyboardShortcuts";
import { Dropdown, MenuProps, Tooltip } from "antd";
import { useMemo } from "react";
import { RQButton } from "lib/design-system-v2/components";
import { MdOutlineKeyboardArrowDown } from "@react-icons/all-files/md/MdOutlineKeyboardArrowDown";
import { MdOutlineDashboardCustomize } from "@react-icons/all-files/md/MdOutlineDashboardCustomize";
import { useRBAC } from "features/rbac";
import { BufferedGraphQLRecordEntity, BufferedHttpRecordEntity } from "features/apiClient/slices/entities";
import {
  ApiClientStore,
  bufferActions,
  updateExampleRequest,
  useApiClientFeatureContext,
} from "features/apiClient/slices";
import { toast } from "utils/Toast";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import { useSaveAsExample } from "features/apiClient/hooks/useSaveAsExample";
import "./saveRequestButton.scss";
import { RQAPI } from "features/apiClient/types";

interface Props {
  hidden?: boolean;
  disabled?: boolean;
  loading?: boolean;
  enableHotkey?: boolean;
  onClick: () => void;
  entity: BufferedHttpRecordEntity | BufferedGraphQLRecordEntity;
  isExample: boolean;
  isDraft: boolean;
}

const getRecord = (entity: BufferedHttpRecordEntity | BufferedGraphQLRecordEntity, store: ApiClientStore) => {
  return entity.getEntityFromState(store.getState());
};

export const SaveRequestButton: React.FC<Props> = ({
  hidden,
  disabled,
  loading,
  enableHotkey,
  onClick,
  entity,
  isExample,
  isDraft,
}) => {
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_request", "create");
  const context = useApiClientFeatureContext();

  const [isUpdatingExample, setIsUpdatingExample] = useState(false);
  const { isSavingAsExample, handleSaveExample } = useSaveAsExample(entity);

  const handleUpdateExample = useCallback(async () => {
    try {
      const record = getRecord(entity, context.store);
      if (!record || record.type !== RQAPI.RecordType.EXAMPLE_API) return;

      setIsUpdatingExample(true);
      await context.store
        .dispatch(
          updateExampleRequest({
            example: record,
            repository: context.repositories.apiClientRecordsRepository,
          }) as any
        )
        .unwrap();
      context.store.dispatch(
        bufferActions.markSaved({
          id: entity.meta.id,
          savedData: record,
        })
      );
      toast.success("Example updated successfully.");
    } catch (error) {
      toast.error("Something went wrong while updating the example.");
    } finally {
      setIsUpdatingExample(false);
    }
  }, [entity, context.store, context.repositories.apiClientRecordsRepository]);

  const saveMenuItems: MenuProps["items"] = useMemo(
    () => [
      {
        key: "save_as_example",
        icon: <MdOutlineDashboardCustomize />,
        label: (
          <div className="save-as-example-label">
            Save as example{" "}
            <Tooltip
              showArrow={false}
              title="Save the current request as an example."
              color="#000"
              placement="bottomLeft"
            >
              <MdInfoOutline />
            </Tooltip>
          </div>
        ),
        disabled: !isValidPermission,
        onClick: handleSaveExample,
      },
    ],
    [handleSaveExample, isValidPermission]
  );

  if (hidden) return null;

  if (isDraft) {
    return (
      <RQButton
        onClick={onClick}
        disabled={disabled || !isValidPermission}
        hotKey={KEYBOARD_SHORTCUTS.API_CLIENT.SAVE_REQUEST!.hotKey}
        loading={loading}
        className="api-client-save-request-button"
        enableHotKey={enableHotkey}
      >
        Save
      </RQButton>
    );
  }

  return (
    <Conditional condition={!hidden}>
      <Tooltip
        title={
          !isValidPermission
            ? "Saving is not allowed in view-only mode. You can update and view changes but cannot save them."
            : undefined
        }
        placement="topLeft"
        color="#000"
      >
        {isExample ? (
          <RQButton
            onClick={handleUpdateExample}
            disabled={disabled || !isValidPermission}
            loading={isSavingAsExample || isUpdatingExample}
            className="api-client-save-request-button"
            enableHotKey={enableHotkey}
            hotKey={KEYBOARD_SHORTCUTS.API_CLIENT.SAVE_REQUEST!.hotKey}
          >
            Save
          </RQButton>
        ) : (
          <span className="api-client-save-request-button-container">
            <RQButton
              onClick={onClick}
              disabled={disabled || !isValidPermission}
              hotKey={KEYBOARD_SHORTCUTS.API_CLIENT.SAVE_REQUEST!.hotKey}
              loading={loading || isSavingAsExample || isUpdatingExample}
              className="api-client-save-request-button"
              enableHotKey={enableHotkey}
            >
              Save
            </RQButton>
            <Dropdown
              disabled={!isValidPermission}
              overlayClassName="api-client-save-request-dropdown"
              menu={{ items: saveMenuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <RQButton
                className="api-client-save-request-dropdown-button"
                loading={isSavingAsExample || isUpdatingExample}
              >
                <MdOutlineKeyboardArrowDown />
              </RQButton>
            </Dropdown>
          </span>
        )}
      </Tooltip>
    </Conditional>
  );
};
