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
import { useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import { createExampleRequest, useApiClientFeatureContext } from "features/apiClient/slices";
import { RQAPI } from "features/apiClient/types";
import { useTabActions } from "componentsV2/Tabs/slice";
import { ExampleViewTabSource } from "../ExampleRequestView/exampleViewTabSource";
import "./saveRequestButton.scss";
import { toast } from "utils/Toast";

interface Props {
  hidden?: boolean;
  disabled?: boolean;
  loading?: boolean;
  enableHotkey?: boolean;
  onClick: () => void;
  entity: BufferedHttpRecordEntity | BufferedGraphQLRecordEntity;
}

export const SaveRequestButton: React.FC<Props> = ({ hidden, disabled, loading, enableHotkey, onClick, entity }) => {
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_request", "create");
  const requestRecord = useApiClientSelector((s) => entity.getEntityFromState(s));
  const context = useApiClientFeatureContext();
  const { openBufferedTab } = useTabActions();

  const [isSavingAsExample, setIsSavingAsExample] = useState(false);

  const handleSaveAsExample = useCallback(async () => {
    try {
      setIsSavingAsExample(true);
      const exampleRecordToCreate: RQAPI.ExampleApiRecord = {
        ...requestRecord,
        parentRequestId: entity.meta.referenceId,
        type: RQAPI.RecordType.EXAMPLE_API,
      };
      exampleRecordToCreate.collectionId = null;

      const { exampleRecord } = await context.store
        .dispatch(
          createExampleRequest({
            parentRequestId: entity.meta.referenceId,
            example: exampleRecordToCreate,
            repository: context.repositories.apiClientRecordsRepository,
          }) as any
        )
        .unwrap();

      openBufferedTab({
        preview: false,
        source: new ExampleViewTabSource({
          id: exampleRecord.id,
          title: exampleRecord.name || "Example",
          apiEntryDetails: exampleRecord,
          context: { id: context.workspaceId },
        }),
      });
    } catch (error) {
      toast.error("Failed to create example.");
    } finally {
      setIsSavingAsExample(false);
    }
  }, [
    requestRecord,
    entity.meta.referenceId,
    context.store,
    context.repositories.apiClientRecordsRepository,
    context.workspaceId,
    openBufferedTab,
  ]);

  const saveMenuItems: MenuProps["items"] = useMemo(
    () => [
      {
        key: "save_as_example",
        icon: <MdOutlineDashboardCustomize />,
        label: "Save as example",
        disabled: !isValidPermission,
        onClick: handleSaveAsExample,
      },
    ],
    [handleSaveAsExample, isValidPermission]
  );

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
        <span className="api-client-save-request-button-container">
          <RQButton
            onClick={onClick}
            disabled={disabled || !isValidPermission}
            hotKey={KEYBOARD_SHORTCUTS.API_CLIENT.SAVE_REQUEST!.hotKey}
            loading={loading || isSavingAsExample}
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
            <RQButton className="api-client-save-request-dropdown-button" loading={isSavingAsExample}>
              <MdOutlineKeyboardArrowDown />
            </RQButton>
          </Dropdown>
        </span>
      </Tooltip>
    </Conditional>
  );
};
