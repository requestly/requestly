import { Dropdown, MenuProps } from "antd";
import React, { useMemo } from "react";
import { BsCollection } from "@react-icons/all-files/bs/BsCollection";
import { GrGraphQl } from "@react-icons/all-files/gr/GrGraphQl";
import { MdOutlineSyncAlt } from "@react-icons/all-files/md/MdOutlineSyncAlt";
import { RQAPI } from "features/apiClient/types";
import { MdOutlineKeyboardArrowDown } from "@react-icons/all-files/md/MdOutlineKeyboardArrowDown";
import { MdHorizontalSplit } from "@react-icons/all-files/md/MdHorizontalSplit";
import "./newApiRecordDropdown.scss";
import { DropdownButtonProps } from "antd/lib/dropdown";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";

type OnSelectParams =
  | { recordType: RQAPI.RecordType.API; entryType: RQAPI.ApiEntryType }
  | { recordType: RQAPI.RecordType.COLLECTION | RQAPI.RecordType.ENVIRONMENT; entryType?: never };

export enum NewRecordDropdownItemType {
  HTTP = "http",
  GRAPHQL = "graphql",
  COLLECTION = "collection",
  ENVIRONMENT = "environment",
}

type NewRecordDropdownProps = {
  onSelect: (params: OnSelectParams) => void;
  disabled?: boolean;
  className?: string;
  overlayClassName?: string;
  invalidActions?: NewRecordDropdownItemType[];
} & (
  | {
      buttonProps?: DropdownButtonProps;
      children?: never;
    }
  | {
      buttonProps?: never;
      children: React.ReactNode;
    }
);

export const NewApiRecordDropdown: React.FC<NewRecordDropdownProps> = (props) => {
  const isGraphQLSupportEnabled = useFeatureIsOn("graphql-support");

  const { onSelect, buttonProps, children, disabled, invalidActions } = props;

  const allDropdownItems: MenuProps["items"] = useMemo(() => {
    return [
      {
        key: NewRecordDropdownItemType.HTTP,
        label: "HTTP request",
        icon: <MdOutlineSyncAlt />,
        onClick: ({ domEvent: e }) => {
          e.stopPropagation();
          onSelect({ recordType: RQAPI.RecordType.API, entryType: RQAPI.ApiEntryType.HTTP });
        },
      },
      {
        key: NewRecordDropdownItemType.GRAPHQL,
        label: "GraphQL request",
        icon: <GrGraphQl />,
        hidden: !isGraphQLSupportEnabled || !isFeatureCompatible(FEATURES.GRAPHQL_SUPPORT),
        onClick: ({ domEvent: e }) => {
          e.stopPropagation();
          onSelect({ recordType: RQAPI.RecordType.API, entryType: RQAPI.ApiEntryType.GRAPHQL });
        },
      },
      {
        key: NewRecordDropdownItemType.COLLECTION,
        label: "Collection",
        icon: <BsCollection />,
        onClick: ({ domEvent: e }) => {
          e.stopPropagation();
          onSelect({ recordType: RQAPI.RecordType.COLLECTION });
        },
      },
      {
        key: NewRecordDropdownItemType.ENVIRONMENT,
        label: "Environment",
        icon: <MdHorizontalSplit />,
        onClick: () => {
          onSelect({ recordType: RQAPI.RecordType.ENVIRONMENT });
        },
      },
    ];
  }, [onSelect, isGraphQLSupportEnabled]);

  const dropdownItems = useMemo(() => {
    if (!invalidActions) {
      return allDropdownItems;
    }
    return (
      allDropdownItems?.filter((item) => item && !invalidActions.includes(item.key as NewRecordDropdownItemType)) || []
    );
  }, [allDropdownItems, invalidActions]);

  if (children) {
    return (
      <Dropdown
        className="new-api-record-dropdown"
        overlayClassName="new-api-record-dropdown-overlay"
        menu={{ items: dropdownItems }}
        trigger={["click"]}
      >
        {children}
      </Dropdown>
    );
  }

  return (
    <Dropdown.Button
      trigger={["click"]}
      className="new-api-record-dropdown"
      overlayClassName="new-api-record-dropdown-overlay"
      icon={<MdOutlineKeyboardArrowDown />}
      disabled={disabled}
      {...buttonProps}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        onSelect({ recordType: RQAPI.RecordType.API, entryType: RQAPI.ApiEntryType.HTTP });
      }}
      menu={{ items: dropdownItems }}
    >
      {buttonProps?.children || "New Request"}
    </Dropdown.Button>
  );
};
