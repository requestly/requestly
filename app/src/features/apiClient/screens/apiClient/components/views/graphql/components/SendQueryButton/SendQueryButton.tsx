import React, { useMemo } from "react";
import { RQButton } from "lib/design-system-v2/components";
import { KEYBOARD_SHORTCUTS } from "../../../../../../../../../constants/keyboardShortcuts";
import { Dropdown, MenuProps } from "antd";
import { MdOutlineKeyboardArrowDown } from "@react-icons/all-files/md/MdOutlineKeyboardArrowDown";
import { BufferedGraphQLRecordEntity } from "features/apiClient/slices/entities";
import { useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import { extractOperationNames } from "../../utils";

interface Props {
  entity: BufferedGraphQLRecordEntity;
  disabled?: boolean;
  loading?: boolean;
  onSendClick: (operationName?: string) => void;
}

export const SendQueryButton: React.FC<Props> = ({ entity, disabled, loading, onSendClick }) => {
  const operation = useApiClientSelector((s) => entity.getOperation(s) || "");
  const operationNames = useMemo(() => extractOperationNames(operation), [operation]);

  const operationItems: MenuProps["items"] = useMemo(() => {
    return operationNames.map((operationName) => ({
      key: operationName,
      label: operationName,
      onClick: () => onSendClick(operationName),
    }));
  }, [operationNames, onSendClick]);

  if (operationNames.length <= 1) {
    const operationName = operationNames[0];
    return (
      <RQButton
        type="primary"
        showHotKeyText
        onClick={() => onSendClick(operationName)}
        hotKey={KEYBOARD_SHORTCUTS.API_CLIENT.SEND_REQUEST!.hotKey}
        className="text-bold"
        disabled={disabled}
        loading={loading}
      >
        Send
      </RQButton>
    );
  } else {
    return (
      <Dropdown menu={{ items: operationItems }} placement="bottom">
        <RQButton className="gql-send-query-dropdown-button" type="primary">
          Send
          <MdOutlineKeyboardArrowDown />
        </RQButton>
      </Dropdown>
    );
  }
};
