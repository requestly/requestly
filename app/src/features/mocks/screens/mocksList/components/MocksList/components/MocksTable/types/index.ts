import { RQMockMetadataSchema } from "components/features/mocksV2/types";

export type MockTableRecord = RQMockMetadataSchema & {
  children?: RQMockMetadataSchema[];
};
