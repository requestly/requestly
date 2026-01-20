import React, { useMemo } from "react";
import { OrgMembersTable } from "features/settings/components/OrgMembers/components/OrgMembersTable/OrgMembersTable";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { OrgMember } from "features/settings/components/OrgMembers/types";
import { EmptyMembersTableView } from "./components/EmptyMembersTableView/EmptyMembersTableView";
import { RQButton } from "lib/design-system/components";
import { MdOutlinePersonAdd } from "@react-icons/all-files/md/MdOutlinePersonAdd";
import { AddMembersTableActions } from "./components/AddMembersTableActions/AddMembersTableActions";
import { trackBillingTeamInviteMemberClicked } from "features/settings/analytics";
import "./addMembersTable.scss";

interface AddMembersTableProps {
  searchValue: string;
  isLoading: boolean;
  members: OrgMember[];
  setSearchValue: (value: string) => void;
  toggleInviteFormVisibility: () => void;
}

export const AddMembersTable: React.FC<AddMembersTableProps> = ({
  searchValue,
  setSearchValue,
  members,
  isLoading,
  toggleInviteFormVisibility,
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
        memberActions={(member) => [<AddMembersTableActions member={member} />]}
        tableActions={[
          <RQButton
            type="default"
            className="invite-people-btn"
            icon={<MdOutlinePersonAdd />}
            onClick={() => {
              toggleInviteFormVisibility();
              trackBillingTeamInviteMemberClicked("header");
            }}
          >
            Invite & assign license
          </RQButton>,
        ]}
        emptyView={
          <EmptyMembersTableView searchValue={searchValue} toggleInviteFormVisibility={toggleInviteFormVisibility} />
        }
      />
    </div>
  );
};
