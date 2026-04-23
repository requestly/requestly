import React from "react";
import { TreeDataNode } from "antd";
import { RQAPI } from "features/apiClient/types";
import { RequestIcon } from "../../sidebar/components/collectionsList/requestRow/RequestRow";

interface BuildNodeIcons {
  collection: React.ReactNode;
  example: React.ReactNode;
}

function requestLabel(record: RQAPI.ApiRecord): string {
  return record.name || (record.data as any)?.request?.url || "Untitled request";
}

function collectionLabel(record: RQAPI.CollectionRecord): string {
  return record.name || "Untitled collection";
}

// Matches the sidebar's RequestRow pattern: icon + name rendered as flex siblings
// inside one container that owns alignment.
function NodeLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="workspace-export-modal__tree-label">
      <span className="workspace-export-modal__tree-label-icon">{icon}</span>
      <span className="workspace-export-modal__tree-label-text">{text}</span>
    </span>
  );
}

function buildRecordNode(record: RQAPI.ApiClientRecord, icons: BuildNodeIcons): TreeDataNode {
  if (record.type === RQAPI.RecordType.COLLECTION) {
    const collection = record as RQAPI.CollectionRecord;
    const children = (collection.data.children ?? []).map((child) => buildRecordNode(child, icons));
    return {
      key: collection.id,
      title: <NodeLabel icon={icons.collection} text={collectionLabel(collection)} />,
      children,
    };
  }

  if (record.type === RQAPI.RecordType.API) {
    const api = record as RQAPI.ApiRecord;
    const examples = (api.data as any)?.examples ?? [];
    const children: TreeDataNode[] = examples.map((ex: any) => ({
      key: ex.id,
      title: <NodeLabel icon={icons.example} text={ex.name || "Example"} />,
      isLeaf: true,
    }));
    return {
      key: api.id,
      title: <NodeLabel icon={<RequestIcon record={api} />} text={requestLabel(api)} />,
      children: children.length > 0 ? children : undefined,
      isLeaf: children.length === 0,
    };
  }

  return {
    key: record.id,
    title: <NodeLabel icon={icons.example} text={(record as any).name || "Example"} />,
    isLeaf: true,
  };
}

export function buildExportTreeData(rootRecords: RQAPI.ApiClientRecord[], icons: BuildNodeIcons): TreeDataNode[] {
  return rootRecords.map((record) => buildRecordNode(record, icons));
}
