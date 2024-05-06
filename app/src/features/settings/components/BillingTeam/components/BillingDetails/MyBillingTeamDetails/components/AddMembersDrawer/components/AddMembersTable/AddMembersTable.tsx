import React, { useMemo } from "react";
import { OrgMembersTable } from "features/settings/components/OrgMembers/components/OrgMembersTable/OrgMembersTable";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { OrgTableActions } from "./components/AddMembersTableActions/OrgTableActions";
import { useFetchOrgMembers } from "features/settings/components/OrgMembers/hooks/useFetchOrganizationMembers";

interface AddMembersTableProps {
  searchValue: string;
  setSearchValue: (value: string) => void;
}

export const AddMembersTable: React.FC<AddMembersTableProps> = ({ searchValue, setSearchValue }) => {
  const user = useSelector(getUserAuthDetails);
  const { isLoading, organizationMembers } = useFetchOrgMembers();

  const searchedMembers = useMemo(() => {
    if (!organizationMembers?.users) return [];
    return organizationMembers?.users?.filter((member: any) => {
      return member?.email?.includes(searchValue) && member?.email !== user?.details?.profile?.email;
    });
  }, [organizationMembers?.users, searchValue, user?.details?.profile?.email]);

  return (
    <OrgMembersTable
      isLoading={isLoading}
      searchValue={searchValue}
      setSearchValue={setSearchValue}
      members={searchedMembers}
      actions={(record) => <OrgTableActions record={record} />}
    />
  );
};
