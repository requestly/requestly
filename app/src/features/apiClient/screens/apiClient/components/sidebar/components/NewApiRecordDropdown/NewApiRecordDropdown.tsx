import { Dropdown, DropDownProps } from "antd";
import React, { useMemo } from "react";
import { BsCollection } from "@react-icons/all-files/bs/BsCollection";
import { GrGraphQl } from "@react-icons/all-files/gr/GrGraphQl";
import { MdOutlineSyncAlt } from "@react-icons/all-files/md/MdOutlineSyncAlt";
import { RQAPI } from "features/apiClient/types";
import { MdOutlineKeyboardArrowDown } from "@react-icons/all-files/md/MdOutlineKeyboardArrowDown";
import { MdHorizontalSplit } from "@react-icons/all-files/md/MdHorizontalSplit";
import "./newApiRecordDropdown.scss";
import { DropdownButtonProps } from "antd/lib/dropdown";

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
  const { onSelect, buttonProps, children, disabled, invalidActions } = props;

  const allDropdownItems: DropDownProps["menu"]["items"] = useMemo(() => {
    return [
      {
        key: NewRecordDropdownItemType.HTTP,
        label: "New HTTP request",
        icon: <MdOutlineSyncAlt />,
        onClick: () => {
          onSelect({ recordType: RQAPI.RecordType.API, entryType: RQAPI.ApiEntryType.HTTP });
        },
      },
      {
        key: NewRecordDropdownItemType.GRAPHQL,
        label: "New GraphQL request",
        icon: <GrGraphQl />,
        onClick: () => {
          onSelect({ recordType: RQAPI.RecordType.API, entryType: RQAPI.ApiEntryType.GRAPHQL });
        },
      },
      {
        key: NewRecordDropdownItemType.COLLECTION,
        label: "New Collection",
        icon: <BsCollection />,
        onClick: () => {
          onSelect({ recordType: RQAPI.RecordType.COLLECTION });
        },
      },
      {
        key: NewRecordDropdownItemType.ENVIRONMENT,
        label: "New Environment",
        icon: <MdHorizontalSplit />,
        onClick: () => {
          onSelect({ recordType: RQAPI.RecordType.ENVIRONMENT });
        },
      },
    ];
  }, [onSelect]);

  const dropdownItems = useMemo(() => {
    if (!invalidActions) {
      return allDropdownItems;
    }
    return allDropdownItems.filter((item) => !invalidActions.includes(item.key as NewRecordDropdownItemType));
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
      onClick={(e) => {
        e.stopPropagation();
        onSelect({ recordType: RQAPI.RecordType.API, entryType: RQAPI.ApiEntryType.HTTP });
      }}
      menu={{ items: dropdownItems }}
    >
      {buttonProps?.children || "New Request"}
    </Dropdown.Button>
  );
};
