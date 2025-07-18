// TODO: Move all shared list types here, see app/src/components/common/SharingModal/types.ts
export type SharedList = {
  creationDate: number;
  importCount: number;
  listName: string;
  shareId: string;
  createdBy?: string;
  notifyOnImport: boolean;
};
