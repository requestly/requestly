import React, { useCallback, useMemo, useState } from "react";
import { RQAPI } from "features/apiClient/types";
import { InlineInput } from "componentsV2/InlineInput/InlineInput";
import { Input, Tabs } from "antd";
import { useApiClientContext } from "features/apiClient/contexts";
import { useDebounce } from "hooks/useDebounce";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { useOutsideClick } from "hooks";
import { toast } from "utils/Toast";
import { useRBAC } from "features/rbac";
import { useGenericState } from "hooks/useGenericState";
import "./collectionOverview.scss";

interface CollectionOverviewProps {
  collection: RQAPI.CollectionRecord;
}

const COLLECTION_DETAILS_PLACEHOLDER = "Collection description";

export const CollectionOverview: React.FC<CollectionOverviewProps> = ({ collection }) => {
  const { onSaveRecord, apiClientRecordsRepository, forceRefreshApiClientRecords } = useApiClientContext();
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_collection", "create");
  const { setTitle, close } = useGenericState();

  const [collectionName, setCollectionName] = useState(collection?.name || "");
  const [collectionDescription, setCollectionDescription] = useState(collection?.description || "");
  const [showEditor, setShowEditor] = useState(false);

  const { ref: collectionDescriptionRef } = useOutsideClick<HTMLDivElement>(() => setShowEditor(false));

  const handleDescriptionChange = useCallback(
    async (value: string) => {
      const newDescription = value;

      return apiClientRecordsRepository
        .updateCollectionDescription(collection.id, newDescription)
        .then((result) => {
          const updatedCollection = {
            ...collection,
            description: result.data,
          };
          onSaveRecord(updatedCollection, "open");
        })
        .catch((error) => {
          toast.error("Error updating collection description");
        });
    },
    [collection, onSaveRecord, apiClientRecordsRepository]
  );

  const debouncedDescriptionChange = useDebounce(handleDescriptionChange, 1500);

  const handleCollectionNameChange = async () => {
    const updatedCollectionName = collectionName || "Untitled Collection";
    const updatedCollection = {
      ...collection,
      name: updatedCollectionName,
    };

    if (collectionName === "") {
      setCollectionName(updatedCollectionName);
    }

    const result = await apiClientRecordsRepository.renameCollection(updatedCollection.id, collectionName);
    if (result.success) {
      onSaveRecord(result.data, "open");
      setTitle(updatedCollectionName);
    }

    const wasForceRefreshed = await forceRefreshApiClientRecords();
    if (wasForceRefreshed) {
      close();
    }
  };

  const markdown = useMemo(() => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        children={collectionDescription || COLLECTION_DETAILS_PLACEHOLDER}
        components={{
          a(props) {
            return (
              <a
                {...props}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                children={props.children}
              />
            );
          },
        }}
      />
    );
  }, [collectionDescription]);

  return (
    <div className="collection-overview-wrapper">
      <div className="collection-overview-container">
        <InlineInput
          disabled={!isValidPermission}
          value={collectionName}
          onChange={(value) => {
            setCollectionName(value);
          }}
          onBlur={handleCollectionNameChange}
          placeholder="Collection name"
        />
        <div ref={collectionDescriptionRef} className="collection-overview-description">
          {showEditor ? (
            <>
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
                          setCollectionDescription(e.target.value);
                          debouncedDescriptionChange(e.target.value);
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
            </>
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
