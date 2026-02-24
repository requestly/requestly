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
  createExampleRequest,
  updateExampleRequest,
  useApiClientFeatureContext,
} from "features/apiClient/slices";
import { RQAPI } from "features/apiClient/types";
import { useTabActions } from "componentsV2/Tabs/slice";
import { ExampleViewTabSource } from "../ExampleRequestView/exampleViewTabSource";
import { toast } from "utils/Toast";
import "./saveRequestButton.scss";

interface Props {
  hidden?: boolean;
  disabled?: boolean;
  loading?: boolean;
  enableHotkey?: boolean;
  onClick: () => void;
  entity: BufferedHttpRecordEntity | BufferedGraphQLRecordEntity;
  isExample: boolean;
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
}) => {
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_request", "create");
  const context = useApiClientFeatureContext();
  const { openBufferedTab } = useTabActions();

  const [isSavingAsExample, setIsSavingAsExample] = useState(false);

  const handleUpdateExample = useCallback(async () => {
    try {
      setIsSavingAsExample(true);
      const record = getRecord(entity, context.store);
      await context.store
        .dispatch(
          updateExampleRequest({
            example: record,
            repository: context.repositories.apiClientRecordsRepository,
          }) as any
        )
        .unwrap();
      toast.success("Example updated successfully.");
    } catch (error) {
      toast.error("Something went wrong while updating the example.");
    } finally {
      setIsSavingAsExample(false);
    }
  }, [entity, context.store, context.repositories.apiClientRecordsRepository]);

  const handleSaveAsExample = useCallback(async () => {
    try {
      setIsSavingAsExample(true);
      const requestRecord = getRecord(entity, context.store);
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
      toast.success("Example created successfully.");
    } catch (error) {
      toast.error("Something went wrong while creating the example.");
    } finally {
      setIsSavingAsExample(false);
    }
  }, [entity, context.store, context.repositories.apiClientRecordsRepository, context.workspaceId, openBufferedTab]);

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
        {isExample ? (
          <RQButton
            onClick={handleUpdateExample}
            disabled={disabled || !isValidPermission}
            loading={isSavingAsExample}
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
        )}
      </Tooltip>
    </Conditional>
  );
};
