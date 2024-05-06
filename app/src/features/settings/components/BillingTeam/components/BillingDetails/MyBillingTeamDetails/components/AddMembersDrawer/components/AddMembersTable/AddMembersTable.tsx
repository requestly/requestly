import React, { useMemo } from "react";
import { OrgMembersTable } from "features/settings/components/OrgMembers/components/OrgMembersTable/OrgMembersTable";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { OrgTableActions } from "./components/AddMembersTableActions/OrgTableActions";
import { OrgMember } from "features/settings/components/OrgMembers/types";
import { EmptyMembersTableView } from "./components/EmptyMembersTableView/EmptyMembersTableView";
import "./addMembersTable.scss";

interface AddMembersTableProps {
  searchValue: string;
  setSearchValue: (value: string) => void;
  isLoading: boolean;
  members: OrgMember[];
}

export const AddMembersTable: React.FC<AddMembersTableProps> = ({
  searchValue,
  setSearchValue,
  members,
  isLoading,
}) => {
  const user = useSelector(getUserAuthDetails);

  const searchedMembers = useMemo(() => {
    if (!members) return [];
    return members?.filter((member: any) => {
      return member?.email?.includes(searchValue) && member?.email !== user?.details?.profile?.email;
    });
  }, [members, searchValue, user?.details?.profile?.email]);

  return (
    <div className="add-members-table-wrapper">
      <OrgMembersTable
        isLoading={isLoading}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        members={searchedMembers}
        memberActions={(record) => <OrgTableActions record={record} />}
        emptyView={<EmptyMembersTableView searchValue={searchValue} />}
      />
    </div>
  );
};
