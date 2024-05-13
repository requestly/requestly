import React, { useState } from "react";
import { RQModal } from "lib/design-system/components";
import { RQMockCollection } from "components/features/mocksV2/types";
import { Button } from "antd";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { updateCollections } from "backend/mocks/updateCollections";
import deleteIcon from "../../assets/delete.svg";
import { updateMocksCollectionId } from "backend/mocks/updateMocksCollectionId";
import { DEFAULT_COLLECTION_ID } from "features/mocks/constants";
import { deleteMocks } from "backend/mocks/deleteMocks";
import { trackMockCollectionDeleted } from "modules/analytics/events/features/mocksV2";
import { toast } from "utils/Toast";
import "./deleteCollectionModal.scss";

interface DeleteCollectionModalProps {
  visible: boolean;
  collection: RQMockCollection;
  toggleModalVisibility: (visible: boolean) => void;
  onSuccess?: () => void;
}

export const DeleteCollectionModal: React.FC<DeleteCollectionModalProps> = ({
  visible,
  collection,
  toggleModalVisibility,
  onSuccess,
}) => {
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const teamId = workspace?.id;

  const [isDeletingOnlyCollection, setIsDeletingOnlyCollection] = useState(false);
  const [isDeletingCollectionAndMocks, setIsDeletingCollectionAndMocks] = useState(false);

  const handleDeleteOnlyCollection = async () => {
    try {
      setIsDeletingOnlyCollection(true);
      const mockIds = collection.children?.map((mock) => mock.id);

      // FIXME: This might break when multiple people working in workspace
      //        since we are using UI as a source for mockIds
      await updateMocksCollectionId(uid, mockIds, DEFAULT_COLLECTION_ID);
      await updateCollections(uid, [{ id: collection.id, deleted: true }]);

      trackMockCollectionDeleted("mocksTable", mockIds?.length, "delete_only_collection");

      toast.success("Collection deleted!");
      toggleModalVisibility(false);
    } catch (error) {
      // do nothing
    } finally {
      // FIXME: Instead of force rerender, update the local state
      onSuccess?.();
      setIsDeletingOnlyCollection(false);
    }
  };

  const handleDeleteCollectionAndMocks = async () => {
    try {
      setIsDeletingCollectionAndMocks(true);
      const mockIds = collection.children?.map((mock) => mock.id);

      await deleteMocks(uid, mockIds, teamId);
      await updateCollections(uid, [{ id: collection.id, deleted: true }]);

      trackMockCollectionDeleted("mocksTable", mockIds?.length, "delete_mocks_and_collection");

      toast.success("Collection and mocks deleted!");
      toggleModalVisibility(false);
    } catch (error) {
      // do nothing
    } finally {
      onSuccess?.();
      setIsDeletingCollectionAndMocks(false);
    }
  };

  const handleCancel = () => {
    toggleModalVisibility(false);
  };

  return (
    <RQModal
      width={320}
      open={visible}
      destroyOnClose={true}
      onCancel={handleCancel}
      className="delete-collection-modal"
    >
      <img width={32} height={32} src={deleteIcon} alt="Delete collection" className="icon" />
      <div className="header">Delete this collection?</div>
      <div className="description">
        This will permanently delete this collection. <br />
        Are you sure you want to delete?
      </div>

      <div className="actions">
        {collection?.children?.length === 0 ? null : (
          <Button
            block
            type="default"
            onClick={handleDeleteOnlyCollection}
            loading={isDeletingOnlyCollection}
            disabled={isDeletingCollectionAndMocks}
          >
            Keep the mocks
          </Button>
        )}
        <Button
          block
          danger
          type="primary"
          onClick={handleDeleteCollectionAndMocks}
          loading={isDeletingCollectionAndMocks}
          disabled={isDeletingOnlyCollection}
        >
          Delete
        </Button>
      </div>
    </RQModal>
  );
};
