import React, { useEffect, useState } from "react";
import { MockType, RQMockCollection, RQMockMetadataSchema } from "components/features/mocksV2/types";
import { useMocksModalsContext } from "features/mocks/contexts/modals";
import { UpdateMocksCollectionModal } from "./UpdateMocksCollectionModal";
import {
  isMock,
  isCollection,
} from "features/mocks/screens/mocksList/components/MocksList/components/MocksTable/utils";

export const UpdateMocksCollectionModalWrapper: React.FC<{
  forceRender: () => void;
  mocks: RQMockMetadataSchema[];
  mockType: MockType;
}> = ({ mocks, forceRender, mockType }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [mocksToBeUpdated, setMocksToBeUpdated] = useState<RQMockMetadataSchema[]>([]);
  const [onSuccess, setOnSuccess] = useState(() => () => {});

  const { setOpenUpdateMocksCollectionModalAction } = useMocksModalsContext();

  useEffect(() => {
    const openModal = (records: RQMockMetadataSchema[], onSuccess?: () => void) => {
      const mocks = records.filter(isMock);
      setMocksToBeUpdated(mocks);
      setOnSuccess(() => onSuccess);
      setIsVisible(true);
    };

    setOpenUpdateMocksCollectionModalAction(() => openModal);
  }, [setOpenUpdateMocksCollectionModalAction]);

  const onClose = () => {
    setIsVisible(false);
    setMocksToBeUpdated([]);
  };

  const collections = (mocks.filter((mock) => isCollection(mock)) as unknown) as RQMockCollection[];

  return isVisible ? (
    <UpdateMocksCollectionModal
      mocks={mocksToBeUpdated}
      collections={collections}
      visible={isVisible}
      toggleModalVisibility={onClose}
      mockType={mockType}
      onSuccess={() => {
        forceRender();
        onSuccess?.();
      }}
    />
  ) : null;
};
