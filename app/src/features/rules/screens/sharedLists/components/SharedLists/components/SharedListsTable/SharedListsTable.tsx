import React, { useState } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { Empty } from "antd";
import { ContentListTable } from "componentsV2/ContentList";
import DeleteSharedListModal from "../../modals/DeleteSharedListModal";
import { useSharedListsTableColumns } from "./hooks/useSharedListsTableColumns";
import { SharedList } from "../../types";
import { trackSharedListDeleteClicked } from "../../analytics";
import "./sharedListsTable.scss";

interface SharedListsTableProps {
  sharedLists: SharedList[];
}

export const SharedListsTable: React.FC<SharedListsTableProps> = ({ sharedLists }) => {
  const user = useSelector(getUserAuthDetails);
  const [isDeleteSharedListModalVisible, setIsDeleteSharedListModalVisible] = useState(false);
  const [sharedListIdsToDelete, setSharedListIdsToDelete] = useState([]);

  const handleDeleteSharedListClick = (sharedListId: string) => {
    trackSharedListDeleteClicked(sharedListId);
    setSharedListIdsToDelete([sharedListId]);
    setIsDeleteSharedListModalVisible(true);
  };

  const tableColumns = useSharedListsTableColumns({
    handleDeleteSharedListClick,
  });

  return (
    <>
      <div className="sharedlists-table-container">
        <ContentListTable
          id="sharedlists-table"
          size="small"
          columns={tableColumns}
          data={sharedLists}
          locale={{
            emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Shared list found" />,
          }}
          scroll={{ y: `calc(100vh - 232px)` }}
        />
      </div>
      {isDeleteSharedListModalVisible && (
        <DeleteSharedListModal
          isOpen={isDeleteSharedListModalVisible}
          toggle={() => {
            setIsDeleteSharedListModalVisible(false);
          }}
          userId={user.details?.profile?.uid}
          sharedListIdsToDelete={sharedListIdsToDelete}
        />
      )}
    </>
  );
};
