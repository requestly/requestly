import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button, Input, message } from "antd";
import { MockType } from "components/features/mocksV2/types";
import { RQModal } from "lib/design-system/components";
import { createCollection } from "backend/mocks/createCollection";
import { getUserAuthDetails } from "store/selectors";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { updateCollections } from "backend/mocks/updateCollections";
import { trackMockCollectionCreated, trackMockCollectionUpdated } from "modules/analytics/events/features/mocksV2";
import "./createCollectionModal.scss";

interface Props {
  id?: string;
  name?: string;
  description?: string;
  mockType: MockType;
  visible: boolean;
  toggleModalVisibility: (visible: boolean) => void;
  onSuccess?: () => void;
}

export const CreateCollectionModal: React.FC<Props> = ({
  id,
  name = "",
  description = "",
  mockType,
  visible,
  toggleModalVisibility,
  onSuccess,
}) => {
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const teamId = workspace?.id;

  const [isLoading, setIsLoading] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");

  useEffect(() => {
    setCollectionName(name ?? "");
    setCollectionDescription(description ?? "");

    return () => {
      setCollectionName("");
      setCollectionDescription("");
    };
  }, [name, description, visible]);

  const handleSaveClick = async () => {
    if (collectionName.length === 0) {
      message.error("Collection name cannot be empty!");
      return;
    }

    if (id) {
      const collectionData = [
        {
          id,
          name: collectionName,
          desc: collectionDescription,
        },
      ];

      setIsLoading(true);
      updateCollections(uid, collectionData)
        .then(() => {
          trackMockCollectionUpdated("mocksTable", workspace?.id, workspace?.name, workspace?.membersCount);
          message.success("Collection updated!");
          toggleModalVisibility(false);
          onSuccess?.();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      const collectionData = {
        name: collectionName,
        desc: collectionDescription,
        type: mockType,
      };

      setIsLoading(true);
      createCollection(uid, collectionData, teamId)
        .then((mockCollection) => {
          trackMockCollectionCreated("mocksTable", workspace?.id, workspace?.name, workspace?.membersCount);
          message.success("Collection created!");
          toggleModalVisibility(false);
          onSuccess?.();
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  const handleCancel = () => {
    toggleModalVisibility(false);
  };

  return (
    <RQModal open={visible} footer={null} onCancel={handleCancel} className="mock-collection-modal">
      <div className="collection-modal-header">New collection</div>
      <div className="collection-modal-content">
        <label className="collection-name-label">
          <span>Collection name</span>
          <Input
            autoFocus
            value={collectionName}
            placeholder="E.g. APIs V1"
            onChange={(e) => {
              setCollectionName(e.target.value);
            }}
          />
        </label>

        <label className="collection-description-label">
          <div>
            <span>Description</span>
            <span className="optional">(Optional)</span>
          </div>
          <Input
            value={collectionDescription}
            placeholder="Write some description"
            onChange={(e) => {
              setCollectionDescription(e.target.value);
            }}
          />
        </label>
      </div>
      <div className="collection-modal-actions">
        <Button onClick={handleCancel}>Cancel</Button>
        <Button loading={isLoading} onClick={handleSaveClick} disabled={!collectionName}>
          Save
        </Button>
      </div>
    </RQModal>
  );
};
