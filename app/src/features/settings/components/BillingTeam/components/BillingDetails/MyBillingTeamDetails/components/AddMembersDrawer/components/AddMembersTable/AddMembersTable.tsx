import React, { useMemo } from "react";
import { OrgMembersTable } from "features/settings/components/OrgMembers/components/OrgMembersTable/OrgMembersTable";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { AddMembersTableActions } from "./components/AddMembersTableActions/AddMembersTableActions";
import { useFetchOrgMembers } from "features/settings/components/OrgMembers/hooks/useFetchOrganizationMembers";

interface AddMembersTableProps {
  searchValue: string;
  setSearchValue: (value: string) => void;
}

export const AddMembersTable: React.FC<AddMembersTableProps> = ({ searchValue, setSearchValue }) => {
  const user = useSelector(getUserAuthDetails);
  const { isLoading, organizationMembers } = useFetchOrgMembers();

  const searchedMembers = useMemo(() => {
    if (!organizationMembers) return [];
    return organizationMembers?.filter((member: any) => {
      return member?.email?.includes(searchValue) && member?.email !== user?.details?.profile?.email;
    });
  }, [organizationMembers, searchValue, user?.details?.profile?.email]);

  return (
    <OrgMembersTable
      isLoading={isLoading}
      searchValue={searchValue}
      setSearchValue={setSearchValue}
      members={searchedMembers}
      actions={(member) => <AddMembersTableActions member={member} />}
    />
  );
};
