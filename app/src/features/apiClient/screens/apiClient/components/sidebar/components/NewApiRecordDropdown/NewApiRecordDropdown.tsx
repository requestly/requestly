import { ButtonProps, Dropdown, DropDownProps } from "antd";
import React, { useMemo } from "react";
import { BsCollection } from "@react-icons/all-files/bs/BsCollection";
import { GrGraphQl } from "@react-icons/all-files/gr/GrGraphQl";
import { MdOutlineSyncAlt } from "@react-icons/all-files/md/MdOutlineSyncAlt";
import { RQAPI } from "features/apiClient/types";

type OnSelectParams =
  | { recordType: RQAPI.RecordType.API; entryType: RQAPI.ApiEntryType }
  | { recordType: RQAPI.RecordType.COLLECTION | RQAPI.RecordType.ENVIRONMENT; entryType?: never };

type DropdownProps =
  | { onSelect: (params: OnSelectParams) => void; dropdownType: "button"; buttonProps?: ButtonProps }
  | { onSelect: (params: OnSelectParams) => void; dropdownType: "wrapper"; children: React.ReactNode };

enum DropdownItemType {
  HTTP = "http",
  GRAPHQL = "graphql",
  COLLECTION = "collection",
}

export const NewApiRecordDropdown: React.FC<DropdownProps> = (props) => {
  const { onSelect, dropdownType } = props;

  const dropdownItems: DropDownProps["menu"]["items"] = useMemo(() => {
    return [
      {
        key: DropdownItemType.COLLECTION,
        label: "New Collection",
        icon: <BsCollection />,
        onClick: () => {
          onSelect({ recordType: RQAPI.RecordType.COLLECTION });
        },
      },
      {
        key: DropdownItemType.HTTP,
        label: "New HTTP request",
        icon: <MdOutlineSyncAlt />,
        onClick: () => {
          onSelect({ recordType: RQAPI.RecordType.API, entryType: RQAPI.ApiEntryType.HTTP });
        },
      },
      {
        key: DropdownItemType.GRAPHQL,
        label: "New GraphQL request",
        icon: <GrGraphQl />,
        onClick: () => {
          onSelect({ recordType: RQAPI.RecordType.API, entryType: RQAPI.ApiEntryType.GRAPHQL });
        },
      },
    ];
  }, [onSelect]);

  if (dropdownType === "button") {
    return (
      <Dropdown.Button
        {...props.buttonProps}
        onClick={(e) => {
          e.stopPropagation();
          onSelect({ recordType: RQAPI.RecordType.API, entryType: RQAPI.ApiEntryType.HTTP });
        }}
        menu={{ items: dropdownItems }}
      >
        New Request
      </Dropdown.Button>
    );
  }

  return (
    <Dropdown menu={{ items: dropdownItems }} trigger={["click"]}>
      {props.children}
    </Dropdown>
  );
};
