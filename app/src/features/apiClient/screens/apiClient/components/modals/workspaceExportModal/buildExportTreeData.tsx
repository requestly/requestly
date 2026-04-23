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

function buildRecordNode(record: RQAPI.ApiClientRecord, icons: BuildNodeIcons): TreeDataNode {
  if (record.type === RQAPI.RecordType.COLLECTION) {
    const collection = record as RQAPI.CollectionRecord;
    const children = (collection.data.children ?? []).map((child) => buildRecordNode(child, icons));
    return {
      key: collection.id,
      title: collectionLabel(collection),
      icon: icons.collection,
      children,
    };
  }

  if (record.type === RQAPI.RecordType.API) {
    const api = record as RQAPI.ApiRecord;
    const examples = (api.data as any)?.examples ?? [];
    const children: TreeDataNode[] = examples.map((ex: any) => ({
      key: ex.id,
      title: ex.name || "Example",
      icon: icons.example,
      isLeaf: true,
    }));
    return {
      key: api.id,
      title: requestLabel(api),
      icon: <RequestIcon record={api} />,
      children: children.length > 0 ? children : undefined,
      isLeaf: children.length === 0,
    };
  }

  return {
    key: record.id,
    title: (record as any).name || "Example",
    icon: icons.example,
    isLeaf: true,
  };
}

export function buildExportTreeData(rootRecords: RQAPI.ApiClientRecord[], icons: BuildNodeIcons): TreeDataNode[] {
  return rootRecords.map((record) => buildRecordNode(record, icons));
}
