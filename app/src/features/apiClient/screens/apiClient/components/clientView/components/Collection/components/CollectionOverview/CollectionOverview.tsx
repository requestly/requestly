import React, { useCallback, useMemo, useState } from "react";
import { RQAPI } from "features/apiClient/types";
import { InlineInput } from "componentsV2/InlineInput/InlineInput";
import { Input, Tabs } from "antd";
import { upsertApiRecord } from "backend/apiClient";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { useApiClientContext } from "features/apiClient/contexts";
import { useDebounce } from "hooks/useDebounce";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { useOutsideClick } from "hooks";
import "./collectionOverview.scss";
import { useCheckLocalSyncSupport } from "features/apiClient/helpers/modules/sync/useCheckLocalSyncSupport";
import { useTabsLayoutContext } from "layouts/TabsLayout";

interface CollectionOverviewProps {
  collection: RQAPI.CollectionRecord;
}

const COLLECTION_DETAILS_PLACEHOLDER = "Collection description";

export const CollectionOverview: React.FC<CollectionOverviewProps> = ({ collection }) => {
  const user = useSelector(getUserAuthDetails);
  const team = useSelector(getCurrentlyActiveWorkspace);
  const { onSaveRecord, apiClientRecordsRepository, forceRefreshApiClientRecords } = useApiClientContext();
  const { closeTab } = useTabsLayoutContext();

  const [collectionName, setCollectionName] = useState(collection?.name || "");
  const [collectionDescription, setCollectionDescription] = useState(collection?.description || "");
  const [showEditor, setShowEditor] = useState(false);
  const isLocalSyncEnabled = useCheckLocalSyncSupport();

  const { ref: collectionDescriptionRef } = useOutsideClick<HTMLDivElement>(() => setShowEditor(false));

  const handleDescriptionChange = useCallback(
    async (value: string) => {
      const newDescription = value;
      const updatedCollection = {
        ...collection,
        description: newDescription,
      };
      return upsertApiRecord(user.details?.profile?.uid, updatedCollection, team?.id).then((result) => {
        onSaveRecord(result.data);
      });
    },
    [collection, onSaveRecord, user.details?.profile?.uid, team?.id]
  );

  const debouncedDescriptionChange = useDebounce(handleDescriptionChange, 1500);

  const handleCollectionNameChange = async () => {
    const updatedCollection = {
      ...collection,
      name: collectionName || "Untitled Collection",
    };

    if (collectionName === "") {
      setCollectionName("Untitled Collection");
    }

    const result = await apiClientRecordsRepository.renameCollection(updatedCollection.id, collectionName);
    if (result.success) {
      onSaveRecord(result.data);
    }
    const wasForceRefreshed = await forceRefreshApiClientRecords();
    if (wasForceRefreshed) {
      closeTab(collection.id);
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
          value={collectionName}
          onChange={(value) => {
            setCollectionName(value);
          }}
          onBlur={handleCollectionNameChange}
          placeholder="Collection name"
        />
        {!isLocalSyncEnabled && (
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
              <div className="collection-overview-description-markdown" onClick={() => setShowEditor(true)}>
                {markdown}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
