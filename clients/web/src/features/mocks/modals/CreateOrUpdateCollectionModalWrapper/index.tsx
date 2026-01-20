import React, { useEffect, useState } from "react";
import { CreateOrUpdateCollectionModal } from "./CreateOrUpdateCollectionModal";
import { MockType, RQMockCollection } from "components/features/mocksV2/types";
import { useMocksModalsContext } from "features/mocks/contexts/modals";

export const CreateOrUpdateCollectionModalWrapper: React.FC<{ forceRender: () => void }> = ({ forceRender }) => {
  const [collection, setCollection] = useState<RQMockCollection>();
  const [mockType, setMockType] = useState<MockType>();
  const [isVisible, setIsVisible] = useState(false);

  const { setOpenCollectionModalAction } = useMocksModalsContext();

  useEffect(() => {
    const openModal = (mockType: MockType, record?: RQMockCollection) => {
      setIsVisible(true);
      setMockType(mockType);

      if (record) {
        setCollection((record as unknown) as RQMockCollection);
      }
    };

    setOpenCollectionModalAction(() => openModal);
  }, [setOpenCollectionModalAction]);

  const onClose = () => {
    setIsVisible(false);
    setCollection(undefined);
    setMockType(undefined);
  };

  return isVisible ? (
    <CreateOrUpdateCollectionModal
      id={collection?.id}
      name={collection?.name}
      description={collection?.desc}
      path={collection?.path}
      mocks={collection?.children ?? []}
      mockType={mockType}
      visible={isVisible}
      toggleModalVisibility={onClose}
      onSuccess={forceRender}
    />
  ) : null;
};
