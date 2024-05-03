import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button, Input, Row, Tooltip } from "antd";
import { MockType } from "components/features/mocksV2/types";
import { RQModal } from "lib/design-system/components";
import { createCollection } from "backend/mocks/createCollection";
import { getUserAuthDetails } from "store/selectors";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { updateCollections } from "backend/mocks/updateCollections";
import { RiInformationLine } from "@react-icons/all-files/ri/RiInformationLine";
import { trackMockCollectionCreated, trackMockCollectionUpdated } from "modules/analytics/events/features/mocksV2";
import { toast } from "utils/Toast";
import "./createOrUpdateCollectionModal.scss";

interface Props {
  id?: string;
  name?: string;
  description?: string;
  path?: string;
  mockType: MockType;
  visible: boolean;
  toggleModalVisibility: (visible: boolean) => void;
  onSuccess?: () => void;
}

export const CreateOrUpdateCollectionModal: React.FC<Props> = ({
  id,
  name = "",
  description = "",
  path = "",
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
  const [collectionPath, setCollectionPath] = useState("");

  console.log({ collectionPath });

  useEffect(() => {
    setCollectionName(name ?? "");
    setCollectionDescription(description ?? "");
    setCollectionPath(path ?? "");

    return () => {
      setCollectionName("");
      setCollectionDescription("");
      setCollectionPath("");
    };
  }, [name, description, visible]);

  const getCorrectedCollectionPath = (path: string = "") => {
    if (path === "" || path === "/") {
      return path;
    }

    try {
      const baseUrl = "https://requestly.com/";
      const url = baseUrl + path;
      const parsedUrl = new URL(url); // Handles all the path cases

      return parsedUrl.pathname;
    } catch (error) {
      return;
    }
  };

  const handleSaveClick = async () => {
    if (collectionName.length === 0) {
      toast.error("Collection name cannot be empty!");
      return;
    }

    const correctedCollectionPath = getCorrectedCollectionPath(collectionPath);

    if (correctedCollectionPath === undefined) {
      toast.error("Please enter valid path!");
      return;
    }

    if (id) {
      const collectionData = [
        {
          id,
          name: collectionName,
          desc: collectionDescription,
          path: correctedCollectionPath,
        },
      ];

      setIsLoading(true);
      updateCollections(uid, collectionData)
        .then(() => {
          trackMockCollectionUpdated("mocksTable", workspace?.id, workspace?.name, workspace?.membersCount);
          toast.success("Collection updated!");
          toggleModalVisibility(false);
          onSuccess?.();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      const collectionData = {
        type: mockType,
        name: collectionName,
        desc: collectionDescription,
        path: correctedCollectionPath,
      };

      setIsLoading(true);
      createCollection(uid, collectionData, teamId)
        .then((mockCollection) => {
          trackMockCollectionCreated("mocksTable", workspace?.id, workspace?.name, workspace?.membersCount);
          toast.success("Collection created!");
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
    <RQModal destroyOnClose open={visible} footer={null} onCancel={handleCancel} className="mock-collection-modal">
      <div className="collection-modal-header">{name ? "Update Collection" : "New collection"}</div>
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

        <label className="collection-name-label">
          <Row justify="space-between">
            <div>
              <span>Collection path</span>
              <span className="optional">(Optional)</span>
            </div>

            <Tooltip
              showArrow={false}
              title={
                <div>
                  Add prefix path for all your mocks in this collection.
                  <br />
                  e.g: /api/v1 + /your-mock-endpoint
                </div>
              }
            >
              <div className="know-more">
                <RiInformationLine /> Know more
              </div>
            </Tooltip>
          </Row>
          <Input
            autoFocus
            value={collectionPath}
            placeholder="e.g. /apis/v1"
            onChange={(e) => {
              setCollectionPath(e.target.value);
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
        <Button type="primary" loading={isLoading} onClick={handleSaveClick} disabled={!collectionName}>
          Save
        </Button>
      </div>
    </RQModal>
  );
};
