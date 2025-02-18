import React, { useCallback, useMemo, useState } from "react";
import { RQAPI } from "features/apiClient/types";
import { InlineInput } from "componentsV2/InlineInput/InlineInput";
import { Input, Tabs } from "antd";
import { upsertApiRecord } from "backend/apiClient";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useApiClientContext } from "features/apiClient/contexts";
import { useDebounce } from "hooks/useDebounce";
import { useTabsLayoutContext } from "layouts/TabsLayout";
import PATHS from "config/constants/sub/paths";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { useOutsideClick } from "hooks";
import "./collectionOverview.scss";
import { getActiveWorkspaceId } from "features/workspaces/utils";
import { getActiveWorkspaceIds } from "store/slices/workspaces/selectors";

interface CollectionOverviewProps {
  collection: RQAPI.CollectionRecord;
}

const COLLECTION_DETAILS_PLACEHOLDER = "Collection description";

export const CollectionOverview: React.FC<CollectionOverviewProps> = ({ collection }) => {
  const user = useSelector(getUserAuthDetails);
  const activeWorkspaceId = getActiveWorkspaceId(useSelector(getActiveWorkspaceIds));
  const { onSaveRecord } = useApiClientContext();
  const { replaceTab } = useTabsLayoutContext();

  const [collectionName, setCollectionName] = useState(collection?.name || "");
  const [collectionDescription, setCollectionDescription] = useState(collection?.description || "");
  const [showEditor, setShowEditor] = useState(false);

  const { ref: collectionDescriptionRef } = useOutsideClick<HTMLDivElement>(() => setShowEditor(false));

  const handleDescriptionChange = useCallback(
    async (value: string) => {
      const newDescription = value;
      const updatedCollection = {
        ...collection,
        description: newDescription,
      };
      return upsertApiRecord(user.details?.profile?.uid, updatedCollection, activeWorkspaceId).then((result) => {
        onSaveRecord(result.data);
      });
    },
    [collection, onSaveRecord, user.details?.profile?.uid, activeWorkspaceId]
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

    return upsertApiRecord(user.details?.profile?.uid, updatedCollection, activeWorkspaceId).then((result) => {
      onSaveRecord(result.data);
      replaceTab(result.data.id, {
        id: result.data.id,
        title: result.data.name,
        url: `${PATHS.API_CLIENT.ABSOLUTE}/collection/${result.data.id}`,
      });
    });
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
      </div>
    </div>
  );
};
