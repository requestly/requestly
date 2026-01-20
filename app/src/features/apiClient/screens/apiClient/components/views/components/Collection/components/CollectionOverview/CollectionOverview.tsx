import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { InlineInput } from "componentsV2/InlineInput/InlineInput";
import { Input, notification, Tabs } from "antd";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { useOutsideClick } from "hooks";
import { useRBAC } from "features/rbac";
import "./collectionOverview.scss";
import { useEntity } from "features/apiClient/slices/entities/hooks";
import { useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import { useApiClientRepository } from "features/apiClient/slices";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";

interface CollectionOverviewProps {
  collectionId: string;
}

const COLLECTION_DETAILS_PLACEHOLDER = "Collection description";

export const CollectionOverview: React.FC<CollectionOverviewProps> = ({ collectionId }) => {
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_collection", "create");
  const repositories = useApiClientRepository();

  const [showEditor, setShowEditor] = useState(false);
  //collection entity hook
  const entity = useEntity({
    id: collectionId,
    type: ApiClientEntityType.COLLECTION_RECORD,
  });
  const collectionName = useApiClientSelector((s) => entity.getName(s));
  const collectionDescription = useApiClientSelector((s) => entity.getDescription(s));

  const { ref: collectionDescriptionRef } = useOutsideClick<HTMLDivElement>(() => {
    if (showEditor) {
      setShowEditor(false);
    }
  });

  const handleCollectionNameChange = useCallback(
    async (value: string) => {
      try {
        const updatedCollectionName = value || "Untitled Collection";
        const result = await repositories.apiClientRecordsRepository.renameCollection(
          collectionId,
          updatedCollectionName
        );
        if (!result.success) {
          notification.error({
            message: `Could not update collection Name.`,
            description: result?.message,
            placement: "bottomRight",
          });
          return;
        }

        entity.setName(updatedCollectionName);
      } catch (error) {
        notification.error({
          message: `Failed to update collection name.`,
          description: error instanceof Error ? error.message : "Unknown error",
          placement: "bottomRight",
        });
      }
    },
    [entity, collectionId, repositories.apiClientRecordsRepository]
  );

  const handleDescriptionChange = useCallback(
    async (value: string) => {
      try {
        const result = await repositories.apiClientRecordsRepository.updateCollectionDescription(collectionId, value);

        if (!result.success) {
          notification.error({
            message: `Could not update collection description.`,
            description: result?.message,
            placement: "bottomRight",
          });
          return;
        }

        entity.setDescription(value);
      } catch (error) {
        notification.error({
          message: `Failed to update collection description.`,
          description: error instanceof Error ? error.message : "Unknown error",
          placement: "bottomRight",
        });
      }
    },
    [entity, collectionId, repositories.apiClientRecordsRepository]
  );

  const markdown = useMemo(() => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          a(props) {
            return (
              <a {...props} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                {props.children}
              </a>
            );
          },
        }}
      >
        {collectionDescription || COLLECTION_DETAILS_PLACEHOLDER}
      </ReactMarkdown>
    );
  }, [collectionDescription]);

  return (
    <div className="collection-overview-wrapper">
      <div className="collection-overview-container">
        <InlineInput
          disabled={!isValidPermission}
          value={collectionName}
          onChange={handleCollectionNameChange}
          // onBlur={handleSaveName}
          placeholder="Collection name"
        />
        <div ref={collectionDescriptionRef} className="collection-overview-description">
          {showEditor ? (
            <Tabs
              size="small"
              defaultActiveKey="markdown"
              items={[
                {
                  key: "markdown",
                  label: "Markdown",
                  children: (
                    <Input.TextArea
                      autoFocus
                      value={collectionDescription}
                      placeholder={COLLECTION_DETAILS_PLACEHOLDER}
                      className="collection-overview-description-textarea"
                      autoSize={{ minRows: 15 }}
                      onChange={(e) => {
                        handleDescriptionChange(e.target.value);
                      }}
                    />
                  ),
                },
                {
                  key: "preview",
                  label: "Preview",
                  children: <div className="collection-overview-description-markdown-preview">{markdown}</div>,
                },
              ]}
            />
          ) : (
            <div
              className="collection-overview-description-markdown"
              onClick={() => {
                if (!isValidPermission) {
                  return;
                }

                setShowEditor(true);
              }}
            >
              {markdown}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
