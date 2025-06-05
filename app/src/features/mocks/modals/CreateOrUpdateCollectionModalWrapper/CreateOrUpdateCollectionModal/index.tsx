import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button, Input, Row, Tooltip } from "antd";
import { MockType, RQMockMetadataSchema } from "components/features/mocksV2/types";
import { RQModal } from "lib/design-system/components";
import { createCollection } from "backend/mocks/createCollection";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { updateCollections } from "backend/mocks/updateCollections";
import { RiInformationLine } from "@react-icons/all-files/ri/RiInformationLine";
import { trackMockCollectionCreated, trackMockCollectionUpdated } from "modules/analytics/events/features/mocksV2";
import { updateMocksCollection } from "backend/mocks/updateMocksCollection";
import { cleanupEndpoint, validateEndpoint } from "components/features/mocksV2/MockEditorIndex/utils";
import { toast } from "utils/Toast";
import "./createOrUpdateCollectionModal.scss";
import { getActiveWorkspace, getActiveWorkspaceId } from "store/slices/workspaces/selectors";

interface Props {
  id?: string;
  name?: string;
  description?: string;
  mocks?: RQMockMetadataSchema[];
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
  path: oldPath = "",
  mocks = [],
  mockType,
  visible,
  toggleModalVisibility,
  onSuccess,
}) => {
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);
  const activeWorkspace = useSelector(getActiveWorkspace);

  const [isLoading, setIsLoading] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [collectionPath, setCollectionPath] = useState("");
  const [isCollectionPathValid, setIsCollectionPathValid] = useState(true);

  useEffect(() => {
    setCollectionName(name ?? "");
    setCollectionDescription(description ?? "");
    setCollectionPath(oldPath ?? "");

    return () => {
      setCollectionName("");
      setCollectionDescription("");
      setCollectionPath("");
    };
  }, [name, description, oldPath, visible]);

  const handleSaveClick = async () => {
    try {
      setIsCollectionPathValid(true);
      setIsLoading(true);

      if (collectionName.length === 0) {
        toast.error("Collection name cannot be empty!");
        return;
      }

      if (collectionPath) {
        const error = validateEndpoint(collectionPath, "Collection path");

        if (error) {
          toast.error(error);
          setIsCollectionPathValid(false);
          return;
        }
      }

      const cleanedUpPath = cleanupEndpoint(collectionPath);

      if (id) {
        const collectionsData = [
          {
            id,
            name: collectionName,
            desc: collectionDescription,
            path: cleanedUpPath,
          },
        ];

        const isPathUpdated = oldPath !== cleanedUpPath;

        if (isPathUpdated) {
          const mockIds = mocks?.map((mock) => mock.id);

          // TODO: Improve this as it will make one more call to update the collection id
          await updateMocksCollection(uid, mockIds, id, collectionPath, activeWorkspaceId);
        }

        await updateCollections(uid, collectionsData);

        trackMockCollectionUpdated(
          "mocksTable",
          activeWorkspace?.id,
          activeWorkspace?.name,
          activeWorkspace?.accessCount,
          !!cleanedUpPath
        );
        toast.success("Collection updated!");
        toggleModalVisibility(false);
        onSuccess?.();
      } else {
        const collectionsData = {
          type: mockType,
          name: collectionName,
          desc: collectionDescription,
          path: cleanedUpPath,
        };

        await createCollection(uid, collectionsData, activeWorkspaceId);

        trackMockCollectionCreated(
          "mocksTable",
          activeWorkspace?.id,
          activeWorkspace?.name,
          activeWorkspace?.accessCount,
          !!cleanedUpPath
        );
        toast.success("Collection created!");
        toggleModalVisibility(false);
        onSuccess?.();
      }
    } catch (error) {
      // do nothing
    } finally {
      setIsLoading(false);
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
            required
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
                  e.g: api/v1 + /your-mock-endpoint
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
            status={!isCollectionPathValid ? "error" : ""}
            value={collectionPath}
            placeholder="e.g. apis/v1"
            onChange={(e) => {
              setIsCollectionPathValid(true);
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
