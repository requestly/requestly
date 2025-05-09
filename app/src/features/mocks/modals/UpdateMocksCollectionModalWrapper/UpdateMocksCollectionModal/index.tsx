import React, { useEffect, useState } from "react";
import { MockType, RQMockCollection, RQMockMetadataSchema } from "components/features/mocksV2/types";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useSelector } from "react-redux";
import { RQModal } from "lib/design-system/components";
import { Button, Select, SelectProps, message } from "antd";
import { updateMocksCollection } from "backend/mocks/updateMocksCollection";
import { toast } from "utils/Toast";
import { createCollection } from "backend/mocks/createCollection";
import { trackMockCollectionCreated } from "modules/analytics/events/features/mocksV2";
import "./updateMocksCollectionModal.scss";
import { getActiveWorkspace, getActiveWorkspaceId } from "store/slices/workspaces/selectors";

interface Props {
  visible: boolean;
  mocks: RQMockMetadataSchema[];
  collections?: RQMockCollection[];
  toggleModalVisibility: (visible: boolean) => void;
  onSuccess?: () => void;
  mockType: MockType;
}

type SelectOption = { label: string; value: string };

export const UpdateMocksCollectionModal: React.FC<Props> = ({
  mocks,
  visible,
  collections,
  toggleModalVisibility,
  onSuccess,
  mockType,
}) => {
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);
  const activeWorkspace = useSelector(getActiveWorkspace);

  const [isLoading, setIsLoading] = useState(false);
  const [collectionId, setCollectionId] = useState("");
  const [collectionName, setCollectionName] = useState("");
  const [collectionPath, setCollectionPath] = useState("");
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    if (mocks.length === 1) {
      setCollectionId(mocks[0]?.collectionId);
    }
  }, [mocks]);

  const handleMoveMocks = async (collectionId: string, collectionName: string) => {
    setIsLoading(true);
    const mockIds = mocks?.map((mock) => mock.id);

    return updateMocksCollection(uid, mockIds, collectionId, collectionPath, activeWorkspaceId)
      .then(() => {
        // TODO: add analytic event
        onSuccess?.();
        toast.success(`Moved to "${collectionName}"`);
        toggleModalVisibility(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleCancel = () => {
    toggleModalVisibility(false);
  };

  const handleChangeCollection: SelectProps<string, SelectOption>["onChange"] = (collectionId, option) => {
    setCollectionId(collectionId);
    setCollectionName((option as SelectOption).label);
    // @ts-ignore
    setCollectionPath(option.path ?? "");
  };

  const handleSearchCollection: SelectProps<string, SelectOption>["filterOption"] = (searchValue, option) => {
    return (option?.label ?? "").toLowerCase().includes(searchValue.toLowerCase());
  };

  const handleCreateNewCollectionClick = async () => {
    if (searchValue.length === 0) {
      message.error("Collection name cannot be empty!");
      return;
    }

    const collectionData = {
      desc: "",
      path: "",
      name: searchValue,
      type: mockType,
    };

    setIsLoading(true);
    createCollection(uid, collectionData, activeWorkspaceId)
      .then((collection) => {
        trackMockCollectionCreated(
          "mocksTable",
          activeWorkspace?.id,
          activeWorkspace?.name,
          activeWorkspace?.accessCount
        );
        return handleMoveMocks(collection.id, collection.name);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const options = collections?.map(({ id, name, path }) => ({ label: name, value: id, path }));

  return (
    <RQModal
      width={400}
      open={visible}
      destroyOnClose={true}
      onCancel={handleCancel}
      className="move-mock-into-collection-modal"
    >
      <div className="header">Move to another collection</div>

      <label className="collection-select-label">
        <span>Select collection</span>
        <Select
          showSearch
          options={options}
          value={collectionId || null}
          optionFilterProp="children"
          placeholder="Search and select a collection"
          onChange={handleChangeCollection}
          filterOption={handleSearchCollection}
          className="collection-select"
          onSearch={(value) => setSearchValue(value)}
          notFoundContent={
            <div className="collection-not-found-container">
              {searchValue ? (
                <Button
                  type="text"
                  loading={isLoading}
                  onClick={handleCreateNewCollectionClick}
                  className="create-new-collection-btn"
                >
                  Create "{searchValue}"
                </Button>
              ) : (
                <span>Search to create new collection</span>
              )}
            </div>
          }
        />
      </label>

      <div className="actions">
        <Button type="default" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          type="primary"
          loading={isLoading}
          onClick={() => handleMoveMocks(collectionId, collectionName)}
          disabled={mocks?.length === 1 && mocks?.[0]?.collectionId === collectionId}
        >
          Move
        </Button>
      </div>
    </RQModal>
  );
};
