import React, { useEffect, useState } from "react";
import { RQMockCollection, RQMockMetadataSchema } from "components/features/mocksV2/types";
import { getUserAuthDetails } from "store/selectors";
import { useSelector } from "react-redux";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { RQModal } from "lib/design-system/components";
import { Button, Select, SelectProps, message } from "antd";
import { updateMock } from "backend/mocks/updateMock";
import "./updateMockCollectionModal.scss";

interface Props {
  visible: boolean;
  mock: RQMockMetadataSchema;
  collections?: RQMockCollection[];
  toggleModalVisibility: (visible: boolean) => void;
  onSuccess: () => void;
}

type SelectOption = { label: string; value: string };

export const UpdateMockCollectionModal: React.FC<Props> = ({
  mock,
  visible,
  collections,
  toggleModalVisibility,
  onSuccess,
}) => {
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const teamId = workspace?.id;

  const [isLoading, setIsLoading] = useState(false);
  const [collectionId, setCollectionId] = useState("");
  const [collectionName, setCollectionName] = useState("");

  useEffect(() => {
    setCollectionId(mock?.collectionId);
  }, [mock?.collectionId]);

  const handleMoveCollection = () => {
    setIsLoading(true);
    // @ts-ignore
    updateMock(uid, mock.id, { ...mock, collectionId }, teamId)
      .then(() => {
        onSuccess?.();
        message.success(`Moved to "${collectionName}"`);
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
  };

  const handleSearchCollection: SelectProps<string, SelectOption>["filterOption"] = (searchValue, option) => {
    return (option?.label ?? "").toLowerCase().includes(searchValue.toLowerCase());
  };

  const options = collections?.map(({ id, name }) => ({ label: name, value: id }));

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
        />
      </label>

      <div className="actions">
        <Button type="default" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          type="primary"
          loading={isLoading}
          onClick={handleMoveCollection}
          disabled={mock?.collectionId === collectionId}
        >
          Move
        </Button>
      </div>
    </RQModal>
  );
};
