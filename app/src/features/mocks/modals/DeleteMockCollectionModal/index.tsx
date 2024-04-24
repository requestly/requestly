import React, { useState } from "react";
import { RQModal } from "lib/design-system/components";
import { RQMockCollection } from "components/features/mocksV2/types";
import { Button, message } from "antd";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { updateMockCollection } from "backend/mocks/updateMockCollection";
import deleteIcon from "../assets/delete.svg";
import { updateMocksCollectionId } from "backend/mocks/updateMocksCollectionId";
import { DEFAULT_COLLECTION_ID } from "features/mocks/constants";
import { deleteMocks } from "backend/mocks/deleteMocks";
import "./deleteMockCollectionModal.scss";

interface DeleteMockCollectionModalProps {
  visible: boolean;
  collection: RQMockCollection;
  toggleModalVisibility: () => void;
  callbackOnSuccess?: () => void;
}

export const DeleteMockCollectionModal: React.FC<DeleteMockCollectionModalProps> = ({
  visible,
  collection,
  toggleModalVisibility,
}) => {
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const teamId = workspace?.id;

  const [isDeletingOnlyCollection, setIsDeletingOnlyCollection] = useState(false);
  const [isDeletingCollectionAndMocks, setIsDeletingCollectionAndMocks] = useState(false);

  // console.log({ collection });

  const handleDeleteOnlyCollection = async () => {
    setIsDeletingOnlyCollection(true);
    const mockIds = collection.children?.map((mock) => mock.id);

    const updatedMocks = collection.children?.map((mock) => ({ ...mock, collectionId: "" }));
    // update state

    await updateMocksCollectionId(uid, mockIds, DEFAULT_COLLECTION_ID);
    await updateMockCollection(uid, collection.id, { deleted: true });

    console.log("Collection deleted!");

    message.success("Collection deleted!");
    setIsDeletingOnlyCollection(false);
    toggleModalVisibility();
    // force re-render
  };

  const handleDeleteCollectionAndMocks = async () => {
    setIsDeletingCollectionAndMocks(true);
    const mockIds = collection.children?.map((mock) => mock.id);

    await deleteMocks(uid, mockIds, teamId);
    await updateMockCollection(uid, collection.id, { deleted: true });

    message.success("Collection and mocks deleted!");
    setIsDeletingOnlyCollection(false);
    toggleModalVisibility();
  };

  return (
    <RQModal
      width={320}
      open={visible}
      destroyOnClose={true}
      onCancel={toggleModalVisibility}
      className="delete-collection-modal"
    >
      <img width={32} height={32} src={deleteIcon} alt="Delete collection" className="icon" />
      <div className="header">Delete this collection?</div>
      <div className="description">
        This will permanently delete this collection. <br />
        Are you sure you want to delete?
      </div>

      <div className="actions">
        <Button
          block
          type="default"
          onClick={handleDeleteOnlyCollection}
          loading={isDeletingOnlyCollection}
          disabled={isDeletingCollectionAndMocks}
        >
          Keep the mocks
        </Button>
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
