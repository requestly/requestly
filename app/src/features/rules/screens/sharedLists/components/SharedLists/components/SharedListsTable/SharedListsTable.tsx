import React, { useState } from "react";
import { useSelector } from "react-redux";
import { getIsAppBannerVisible } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { Empty } from "antd";
import { ContentListTable } from "componentsV2/ContentList";
import DeleteSharedListModal from "../../modals/DeleteSharedListModal";
import { useSharedListsTableColumns } from "./hooks/useSharedListsTableColumns";
import { SharedList } from "../../types";
import { trackSharedListDeleteClicked } from "../../analytics";
import "./sharedListsTable.scss";

interface SharedListsTableProps {
  sharedLists: SharedList[];
  forceRender: () => void;
}

export const SharedListsTable: React.FC<SharedListsTableProps> = ({ sharedLists, forceRender }) => {
  const user = useSelector(getUserAuthDetails);
  const isAppBannerVisible = useSelector(getIsAppBannerVisible);
  const [isDeleteSharedListModalVisible, setIsDeleteSharedListModalVisible] = useState(false);
  const [sharedListIdsToDelete, setSharedListIdsToDelete] = useState([]);

  const handleDeleteSharedListClick = (sharedListId: string) => {
    trackSharedListDeleteClicked(sharedListId);
    setSharedListIdsToDelete([sharedListId]);
    setIsDeleteSharedListModalVisible(true);
  };

  const tableColumns = useSharedListsTableColumns({
    forceRender,
    handleDeleteSharedListClick,
  });

  // todo: add createdBy
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
          scroll={isAppBannerVisible ? { y: "calc(100vh - 232px - 48px)" } : undefined}
          // 232px is the height of the content header + top header + footer, 48px is the height of the app banner
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
